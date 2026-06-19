// Global variable to track the currently logged in user
let currentUser = null;

// --- SOA Authentication Guard ---
window.onload = () => {
    // 1. Check if the Auth Gateway sent us a session ticket in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('session');

    if (sessionToken) {
        try {
            const decodedUser = atob(sessionToken);
            localStorage.setItem('campusUser', decodedUser);
        } catch (err) {
            console.error('Error decoding session token:', err);
            alert("Invalid session token. Redirecting to Gateway...");
            window.location.href = 'http://localhost:3000';
            return;
        }
        
        // Clean up the URL
        window.history.replaceState({}, document.title, "/");
    }

    // 2. Read the secure token
    const userData = localStorage.getItem('campusUser');
    
    if (!userData) {
        alert("Unauthorized Access. Redirecting to Gateway...");
        window.location.href = 'http://localhost:3000';
    } else {
        try {
            currentUser = JSON.parse(userData);
            document.getElementById('navUserName').innerText = currentUser.name || 'User';
            
            // Load initial data
            fetchRemoteStreamArray(); 
            
            // 3. AUTO-REFRESH: Poll for new status changes every 5 seconds
            setInterval(fetchRemoteStreamArray, 5000); 

        } catch (err) {
            console.error('Error parsing user data:', err);
            localStorage.removeItem('campusUser');
            window.location.href = 'http://localhost:3000';
        }
    }
};

function returnToHub() {
    window.location.href = 'http://localhost:3000/dashboard.html';
}

// --- Network Layer: Query Array Fetch Operations ---
async function fetchRemoteStreamArray() {
    const targetUl = document.getElementById('streamRenderingTarget');
    try {
        const response = await fetch('/api/requests');
        if (!response.ok) throw new Error(`HTTP error code: ${response.status}`);
        
        const dataArray = await response.json();
        
        // Update Statistics
        document.getElementById('metricTotal').textContent = dataArray.length;
        const pendingCount = dataArray.filter(item => item.status === 'Pending').length;
        document.getElementById('metricPending').textContent = pendingCount;

        if (dataArray.length === 0) {
            targetUl.innerHTML = `<div class="text-center py-5"><p class="text-muted small">No requests found.</p></div>`;
            return;
        }

        // Render the list dynamically
        targetUl.innerHTML = dataArray.map(doc => {
            let statusElement = '';
            
            // DYNAMIC UI: Admin gets dropdowns, Students get colored badges
            if (currentUser && currentUser.role === 'admin') {
                statusElement = `
                    <select class="form-select form-select-sm" style="width: 130px; border-color: #ffc107;" onchange="updateRequestStatus('${escapeOutput(doc._id)}', this.value)">
                        <option value="Pending" ${doc.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${doc.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${doc.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Closed" ${doc.status === 'Closed' ? 'selected' : ''}>Closed</option>
                    </select>
                `;
            } else {
                // ADDED: Color coding for status so student sees the difference
                let colorClass = doc.status === 'Resolved' ? 'bg-success' : (doc.status === 'In Progress' ? 'bg-primary' : 'bg-warning');
                statusElement = `<span class="badge ${colorClass} text-white">${escapeOutput(doc.status || 'Pending')}</span>`;
            }

            return `
            <li class="list-group-item request-item d-flex justify-content-between align-items-center p-3 shadow-sm border-0 mb-2">
                <div>
                    <h6 class="mb-1 fw-bold text-dark">${escapeOutput(doc.title)}</h6>
                    <p class="mb-0 text-muted small">
                        <span class="me-2">Location: <strong>${escapeOutput(doc.location)}</strong></span>
                    </p>
                </div>
                <div>${statusElement}</div>
            </li>
            `;
        }).reverse().join('');

    } catch (err) {
        console.error("Error fetching requests:", err);
    }
}

// --- Network Layer: Create Request ---
async function dispatchRequestPost() {
    const titleElement = document.getElementById('titleInput');
    const locationElement = document.getElementById('locationInput');
    
    const titleValue = titleElement.value.trim();
    const locationValue = locationElement.value.trim();

    if (!titleValue || !locationValue) return alert("Validation Error: Both title and location are required.");

    try {
        const response = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleValue, location: locationValue })
        });

        if (response.ok) {
            titleElement.value = '';
            locationElement.value = '';
            await fetchRemoteStreamArray();
            alert("Request created!");
        }
    } catch (error) {
        alert("Failed to create request.");
    }
}

// --- Admin Action: Update Request Status ---
async function updateRequestStatus(id, newStatus) {
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
        const response = await fetch(`/api/requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            await fetchRemoteStreamArray(); // Refresh immediately after admin change
        }
    } catch (err) {
        console.error("Error updating status:", err);
    }
}

function escapeOutput(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}