// --- SOA Service Registry Endpoints ---
const AUTH_URL = 'https://cse3433-smart-campus-support-system-1.onrender.com';
const FACILITY_URL = 'https://cse3433-smart-campus-support-system.onrender.com';
const REQUEST_URL = 'https://cse3433-smart-campus-support-system-yejt.onrender.com';

let currentUser = null;

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('session');

    if (sessionToken) {
        try {
            const decodedUser = atob(sessionToken);
            localStorage.setItem('campusUser', decodedUser);
        } catch (err) {
            window.location.href = AUTH_URL;
            return;
        }
        window.history.replaceState({}, document.title, "/dashboard.html");
    }

    const userData = localStorage.getItem('campusUser');
    if (!userData) {
        window.location.href = AUTH_URL;
    } else {
        currentUser = JSON.parse(userData);
        document.getElementById('navUserName').innerText = currentUser.name || 'User';
        fetchRemoteStreamArray();
        setInterval(fetchRemoteStreamArray, 5000);
    }
};

function returnToHub() {
    window.location.href = `${AUTH_URL}/dashboard.html`;
}

async function fetchRemoteStreamArray() {
    const targetUl = document.getElementById('streamRenderingTarget');
    try {
        // Now using REQUEST_URL constant
        const response = await fetch(`${REQUEST_URL}/api/requests`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const dataArray = await response.json();
        
        document.getElementById('metricTotal').textContent = dataArray.length;
        document.getElementById('metricPending').textContent = dataArray.filter(i => i.status === 'Pending').length;

        if (dataArray.length === 0) {
            targetUl.innerHTML = `<div class="text-center py-5">No requests.</div>`;
            return;
        }

        targetUl.innerHTML = dataArray.map(doc => `
            <li class="list-group-item mb-2 shadow-sm border-0">
                <div class="d-flex justify-content-between">
                    <div><h6 class="fw-bold">${escapeOutput(doc.title)}</h6><small>${escapeOutput(doc.location)}</small></div>
                    <span class="badge ${doc.status === 'Resolved' ? 'bg-success' : 'bg-warning'}">${doc.status}</span>
                </div>
            </li>
        `).reverse().join('');
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

async function dispatchRequestPost() {
    const titleValue = document.getElementById('titleInput').value.trim();
    const locationValue = document.getElementById('locationInput').value.trim();
    
    if (!titleValue || !locationValue) return alert("Required fields missing.");

    try {
        const response = await fetch(`${REQUEST_URL}/api/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleValue, location: locationValue })
        });
        if (response.ok) fetchRemoteStreamArray();
    } catch (error) {
        alert("Transmission failed.");
    }
}

function escapeOutput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}