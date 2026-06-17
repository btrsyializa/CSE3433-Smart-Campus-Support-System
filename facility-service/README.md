# Facility Booking Service - Smart Campus System

### Service-Oriented Architecture (SOA) Implementation

Welcome to the **Facility Booking Service** - the decentralized microservice responsible for managing campus room reservations and handling global facility locks.

## Project Overview

**Service Purpose**
The Facility Service is an autonomous ledger that handles:
✅ Time-slot reservations for students and staff
✅ Anti-collision logic (preventing double-bookings for the same room and time)
✅ Real-time UI ledger updates
✅ **Receiving automated SOA network alerts** to instantly lock down broken rooms

**SOA Principles Applied**
* **Domain-Driven Design:** This service strictly handles logic related to physical spaces and time scheduling. It knows nothing about User Authentication or Maintenance tracking.
* **Standardized API Contracts:** Exposes a clear `PUT /api/bookings/block` contract specifically designed to be consumed by other internal microservices.
* **Decentralization:** Runs entirely on its own isolated server (Port 3002) with its own isolated database collection.

## Project Structure

```text
facility-service/
├── config/
│   └── db.js                 # Isolated MongoDB connection
├── controllers/
│   └── facilityController.js # Core booking and anti-collision business logic
├── models/
│   └── Booking.js            # Ledger data schema (Mongoose)
├── routes/
│   └── facilityRoutes.js     # API routing layer
├── public/
│   └── index.html            # Booking UI with Live Ledger
├── .env                      # Environment configuration
├── package.json              # Project dependencies
└── server.js                 # Main application entry point

```

## Setup & Installation

**Prerequisites**

* Node.js v14+ and npm
* MongoDB Atlas account and cluster
* Port 3002 available

**1. Clone/Navigate to Project**

```bash
cd facility-service

```

**2. Install Dependencies**

```bash
npm install express mongoose cors dotenv
npm install --save-dev nodemon

```

**3. Configure Environment Variables**
Create an `.env` file in the root directory:

```env
# Server Configuration
PORT=3002

# MongoDB Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusdb?retryWrites=true&w=majority

```

**4. Start the Service**

```bash
npm run dev

```

## API Endpoints

**Get All Active Bookings**
`GET /api/bookings`

* Returns the active ledger of all room reservations.

**Create New Booking**
`POST /api/bookings`
*Content-Type: application/json*

```json
{
  "facilityName": "Makmal Pengaturcaraan 1",
  "date": "2026-06-15",
  "timeSlot": "08:00 AM - 10:00 AM",
  "studentName": "Ahmad Abu",
  "matricNo": "S12345"
}

```

**Block Facility (Internal SOA Endpoint)**
`PUT /api/bookings/block`
*Content-Type: application/json*

```json
{
  "facilityName": "Makmal Pengaturcaraan 1",
  "reason": "Under Maintenance (System Anomaly)"
}

```

*Note: This is an internal architectural endpoint. It is designed to be triggered automatically over the network by the Request Service (Port 3001). It bypasses the human UI entirely.*

## Security & Access

Just like the Request Service, this module's frontend UI relies on the **Single Sign-On (SSO)** token provided by the central Auth Gateway.

If a user attempts to access `http://localhost:3002` directly without a valid encrypted token from Port 3000, they will be automatically rejected and redirected to the login gateway.

## Troubleshooting

* **Server fails to start:** Ensure Port 3002 is not being used by another application.
* **Bookings not saving:** Check the terminal for MongoDB connection errors. Ensure your IP is whitelisted in Atlas.
* **SOA Blocking not triggering:** Ensure the `facilityName` parameter sent by the Request Service perfectly matches the naming convention used in the Facility database.