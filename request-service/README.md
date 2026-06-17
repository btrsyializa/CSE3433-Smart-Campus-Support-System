# Request Service - Smart Campus System

### Service-Oriented Architecture (SOA) Implementation

Welcome to the **Request Service** - the decentralized microservice responsible for tracking and managing campus facility anomalies and IT issues.

## Project Overview

**Service Purpose**
The Request Service is a standalone module that handles:
✅ Creating and tracking system anomalies (e.g., Broken AC, faulty projectors)
✅ Admin-level status updates (Pending -> In Progress -> Resolved)
✅ **Automated Service-to-Service Communication** with the Facility Service
✅ Role-Based UI rendering based on SSO tokens

**SOA Principles Applied**
* **Inter-Service Communication (HTTP/REST):** Acts as an HTTP client to automatically notify the downstream Facility Service when a room breaks, requiring no human intervention.
* **Database Isolation:** Uses its own isolated `requests` collection in MongoDB, adhering to the "Database-per-Service" pattern.
* **High Availability & Autonomy:** If the Facility Service goes offline, students can *still* report broken items here without the entire system crashing.

## Project Structure

```text
request-service/
├── config/
│   └── db.js                 # Isolated MongoDB connection
├── models/
│   └── Request.js            # Anomaly data schema (Mongoose)
├── public/
│   ├── index.html            # Dashboard HTML structure
│   ├── style.css             # Separated UI styling
│   └── script.js             # Separated logic (API fetching and SSO interception)
├── .env                      # Environment configuration
├── package.json              # Project dependencies
└── server.js                 # Main application entry point & SOA logic

```

**Folder Responsibilities**

| Folder/File | Purpose |
| --- | --- |
| `public/` | Adheres to Separation of Concerns (HTML/CSS/JS split). |
| `models/` | Data schemas (MongoDB/Mongoose). |
| `server.js` | Express server, REST API endpoints, and outbound SOA requests. |

## Setup & Installation

**Prerequisites**

* Node.js v14+ and npm
* MongoDB Atlas account and cluster
* Port 3001 available

**1. Clone/Navigate to Project**

```bash
cd request-service

```

**2. Install Dependencies**

```bash
npm install express mongoose cors dotenv node-fetch
npm install --save-dev nodemon

```

**3. Configure Environment Variables**
Create an `.env` file in the root directory:

```env
# Server Configuration
PORT=3001

# MongoDB Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusdb?retryWrites=true&w=majority

```

**4. Start the Service**

```bash
npm run dev

```

## API Endpoints

**Get All Requests**
`GET /requests`

* Returns a JSON array of all reported anomalies.

**Update Status (Admin Only)**
`PUT /requests/:id`
*Content-Type: application/json*

```json
{
  "status": "Resolved"
}

```

**Create Request & Trigger SOA Alert**
`POST /requests`
*Content-Type: application/json*

```json
{
  "title": "Broken Projector",
  "location": "Makmal Pengaturcaraan 1"
}

```

## SOA Inter-Service Integration (Port 3001 -> Port 3002)

To prove true **Service-Oriented Architecture**, this module is programmed to automatically communicate with the Facility Booking Service.

When a student submits a new anomaly via `POST /requests`, the `server.js` file executes an automated, server-to-server `fetch` request to Port 3002:

```javascript
// Example from server.js
const soaResponse = await fetch('http://localhost:3002/api/bookings/block', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        facilityName: location, 
        reason: "Under Maintenance (System Anomaly)" 
    })
});

```

This ensures that the moment a room is reported broken, the booking system locks it down network-wide.

## Troubleshooting

* **[SOA ERROR] Could not reach Facility Service:** This means you tried to submit an anomaly, but the Facility Service (Port 3002) is not currently running. Start Port 3002 in a separate terminal.
* **Unauthorized Redirect:** The `index.html` requires an active SSO token from Port 3000. You cannot navigate directly to `localhost:3001` in your browser; you must click the link from the Auth Gateway.