// Global variable to track the currently logged in user
let currentUser = null;

// --- SOA Authentication Guard ---
window.onload = () => {
    // 1. Check if the Auth Gateway sent us a session ticket in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('session');

    if (sessionToken) {
        // Decode the ticket and save it to local storage
        try {
            const decodedUser = atob(sessionToken);
            localStorage.setItem('campusUser', decodedUser);
        } catch (err) {
            console.error('Error decoding session token:', err);
            alert("Invalid session token. Redirecting to Gateway...");
            window.location.href = 'http://localhost:3000';
            return;
        }
        
        // Clean up the URL so it looks nice and clean in the browser
        window.history.replaceState({}, document.title, "/");
    }

    // 2. Read the secure token from local storage
    const userData = localStorage.getItem('campusUser');
    
    if (!userData) {
        // If no token is found, kick them back to Port 3000 immediately
        alert("Unauthorized Access. Redirecting to Gateway...");
        window.location.href = 'http://localhost:3000';
    } else {
        try {
            // Parse identity and personalize the dashboard
            currentUser = JSON.parse(userData);
            document.getElementById('navUserName').innerText = currentUser.name || 'User';
            
            // Load data only after confirming identity
            fetchRemoteStreamArray(); 
        } catch (err) {
            console.error('Error parsing user data:', err);
            alert("Session data corrupted. Redirecting to login...");
            localStorage.removeItem('campusUser');
            window.location.href = 'http://localhost:3000';
        }
    }
};

function returnToHub() {
    // Sends the user back to the central port 3000 dashboard
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
            targetUl.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted small">No requests found in the system.</p>
                </div>`;
            return;
        }

        // Render the list dynamically based on Role
        targetUl.innerHTML = dataArray.map(doc => {
            // DYNAMIC UI: Admin gets dropdowns, Students get static badges
            let statusElement = '';
            
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
                statusElement = `<span class="badge badge-warning">${escapeOutput(doc.status || 'Pending')}</span>`;
            }

            return `
            <li class="list-group-item request-item d-flex justify-content-between align-items-center p-3 shadow-sm border-0">
                <div>
                    <h6 class="mb-1 fw-bold text-dark">${escapeOutput(doc.title)}</h6>
                    <p class="mb-0 text-muted small">
                        <span class="me-2">Location: <strong>${escapeOutput(doc.location)}</strong></span>
                        <span class="text-xs">ID: ${escapeOutput(doc._id)}</span>
                    </p>
                </div>
                <div>
                    ${statusElement}
                </div>
            </li>
            `;
        }).reverse().join('');

    } catch (err) {
        console.error("Error fetching requests:", err);
        targetUl.innerHTML = `<div class="alert alert-danger p-3 small">Failed to load requests: ${escapeOutput(err.message)}</div>`;
    }
}

// --- Network Layer: Create Request (Triggers SOA) ---
async function dispatchRequestPost() {
    const titleElement = document.getElementById('titleInput');
    const locationElement = document.getElementById('locationInput');
    
    const titleValue = titleElement.value.trim();
    const locationValue = locationElement.value.trim();

    if (!titleValue || !locationValue) {
        alert("Validation Error: Both title and location are required.");
        return;
    }

    try {
        const response = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleValue, location: locationValue })
        });

        if (!response.ok) {
            const rawErrorResponse = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(rawErrorResponse.error || `Server error: ${response.status}`);
        }

        titleElement.value = '';
        locationElement.value = '';
        
        await fetchRemoteStreamArray();
        alert("Request created successfully!");

    } catch (error) {
        console.error("Error creating request:", error);
        alert(`Failed to create request: ${escapeOutput(error.message)}`);
    }
}

// --- Admin Action: Update Request Status ---
async function updateRequestStatus(id, newStatus) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert("Only admins can update request status.");
        return;
    }

    try {
        const response = await fetch(`/api/requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            console.log(`Request ${id} updated to ${newStatus}`);
            await fetchRemoteStreamArray();
        } else {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            alert(`Failed to update status: ${escapeOutput(error.error)}`);
        }
    } catch (err) {
        console.error("Error updating status:", err);
        alert(`Error updating status: ${escapeOutput(err.message)}`);
    }
}

// Helper string encoder to avoid cross-site scripting (XSS)
function escapeOutput(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}