let currentUser = null;

// --- SOA Identity Validation Guard ---
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('session');

    if (sessionToken) {
        try {
            const decodedUser = atob(sessionToken);
            localStorage.setItem('campusUser', decodedUser);
        } catch (err) {
            window.location.href = 'http://localhost:3000?error=auth_failed';
            return;
        }
        window.history.replaceState({}, document.title, "/admin.html");
    }

    const userData = localStorage.getItem('campusUser');
    
    if (!userData) {
        window.location.href = 'http://localhost:3000';
    } else {
        try {
            currentUser = JSON.parse(userData);
            
            // ARCHITECTURAL PROTECTION FIREWALL:
            // Reject any identity ticket that does not carry the verified 'admin' authority context
            if (currentUser.role !== 'admin') {
                alert("ACCESS REJECTED: Identity context does not possess Administrative clearance.");
                localStorage.removeItem('campusUser');
                window.location.href = 'http://localhost:3000';
                return;
            }

            document.getElementById('navUserName').innerText = currentUser.name;
            fetchRemoteStreamArray(); 
        } catch (err) {
            localStorage.removeItem('campusUser');
            window.location.href = 'http://localhost:3000';
        }
    }
};

function returnToHub() {
    localStorage.removeItem('campusUser');
    window.location.href = 'http://localhost:3000';
}

// Fetch all reported requests from data layer cluster
async function fetchRemoteStreamArray() {
    const targetUl = document.getElementById('streamRenderingTarget');
    try {
        const response = await fetch('/api/requests');
        if (!response.ok) throw new Error(`HTTP error code: ${response.status}`);
        
        const dataArray = await response.json();
        
        document.getElementById('metricTotal').textContent = dataArray.length;
        document.getElementById('metricPending').textContent = dataArray.filter(item => item.status === 'Pending').length;

        if (dataArray.length === 0) {
            targetUl.innerHTML = `<div class="text-center py-5"><p class="text-muted small">No campus documents queued.</p></div>`;
            return;
        }

        // Render strictly as actionable input components for state-machine transition
        targetUl.innerHTML = dataArray.map(doc => {
            return `
            <li class="list-group-item request-item d-flex justify-content-between align-items-center p-3 shadow-sm border-0">
                <div>
                    <h6 class="mb-1 fw-bold text-dark">${escapeOutput(doc.title)}</h6>
                    <p class="mb-0 text-muted small">
                        <span class="me-2">Core Location: <strong>${escapeOutput(doc.location)}</strong></span>
                        <span class="text-xs">ID: ${escapeOutput(doc._id)}</span>
                    </p>
                </div>
                <div>
                    <select class="form-select form-select-sm" style="width: 140px; border-color: #ff758c; border-radius:10px;" onchange="updateRequestStatus('${escapeOutput(doc._id)}', this.value)">
                        <option value="Pending" ${doc.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${doc.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${doc.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Closed" ${doc.status === 'Closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </div>
            </li>
            `;
        }).reverse().join('');

    } catch (err) {
        targetUl.innerHTML = `<div class="alert alert-danger p-3 small">Polling compilation error: ${escapeOutput(err.message)}</div>`;
    }
}

// State Machine Update Trigger Execution
async function updateRequestStatus(id, newStatus) {
    try {
        const response = await fetch(`/api/requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            console.log(`[STATE TRANSITION] Request ${id} mutated to state: ${newStatus}`);
            await fetchRemoteStreamArray();
        } else {
            const error = await response.json();
            alert(`State transition error: ${escapeOutput(error.error)}`);
        }
    } catch (err) {
        alert(`Network transmission failure: ${escapeOutput(err.message)}`);
    }
}

function escapeOutput(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}