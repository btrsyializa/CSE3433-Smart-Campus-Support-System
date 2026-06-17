# Auth Service & API Gateway - Smart Campus System

### Service-Oriented Architecture (SOA) Implementation

Welcome to the **Auth Service** - the centralized authentication gateway, Single Sign-On (SSO) router, and primary entry point for the Smart Campus System.

##  Project Overview

**Service Purpose**
The Auth Service is responsible for:
✅ Global user authentication and registration
✅ Role-Based Access Control (RBAC) initialization (Student vs. Admin)
✅ Single Sign-On (SSO) session token generation
✅ Centralized dashboard routing to downstream microservices
✅ Cross-Origin Resource Sharing (CORS) gateway management

**SOA Principles Applied**
* **API Gateway Pattern:** Acts as the single entry point for users before routing them to domain-specific services.
* **Stateless Tokens:** Uses secure URL-based session passing to authenticate users across independent ports without sharing local memory.
* **Loose Coupling:** Maintains complete independence from the Request and Facility services.

##  Project Structure

```text
auth-service/
├── public/
│   ├── index.html            # Login & Registration UI
│   ├── dashboard.html        # Central routing hub (Role-Based UI)
│   └── style.css             # Global glassmorphism stylesheet
├── models/
│   └── User.js               # User data model (Mongoose schema)
├── .env                      # Environment configuration
├── package.json              # Project dependencies
├── README.md                 # This file
└── server.js                 # Main application entry point & API routes

```

**Folder Responsibilities**

| Folder/File | Purpose |
| --- | --- |
| `public/` | Frontend presentation layer and SSO routing logic |
| `models/` | Data schemas (MongoDB/Mongoose) |
| `server.js` | Express server, database connection, and endpoint definitions |
| `.env` | Sensitive configuration and database URI |

##  Setup & Installation

**Prerequisites**

* Node.js v14+ and npm
* MongoDB Atlas account and cluster
* Port 3000 available

**1. Clone/Navigate to Project**

```bash
cd auth-service

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
PORT=3000

# MongoDB Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusdb?retryWrites=true&w=majority

```

**4. Start the Service**

```bash
# Development (with auto-reload)
npm run dev

```

**Expected output:**

```text
✅ Auth Service Connected to MongoDB Atlas
[Architecture] Auth Gateway running on port 3000

```

##  API Endpoints

**Register User**
`POST /api/register`
*Content-Type: application/json*

```json
{
  "name": "Ahmad Abu",
  "email": "s12345@ocean.umt.edu.my",
  "matricNo": "S12345",
  "password": "SecurePassword123"
}

```

**Login User**
`POST /api/login`
*Content-Type: application/json*

```json
{
  "email": "s12345@ocean.umt.edu.my",
  "password": "SecurePassword123"
}

```

*Response:*

```json
{
  "message": "Login successful",
  "user": {
    "name": "Ahmad Abu",
    "matricNo": "S12345",
    "role": "student"
  }
}

```

## 🔐 Single Sign-On (SSO) & Authorization

**Session Routing Mechanism**
To maintain SOA decoupling, this service implements a lightweight Single Sign-On mechanism. When navigating to a downstream service (e.g., Facility Booking), the Auth Service generates a Base64 encoded token containing the user's identity and role.

**Token Structure:**

```javascript
// Generated in dashboard.html
const token = btoa(JSON.stringify({
    name: "Ahmad Abu",
    matricNo: "S12345",
    role: "student"
}));

```

**Cross-Service Redirection:**
`http://localhost:3002/?session=<encoded_token>`

**User Roles**

| Role | Permissions |
| --- | --- |
| `student` | Can report anomalies and book facilities. |
| `admin` | Triggers the Admin Override Panel. Can update anomaly statuses across the network. |

## Database Schema

**User Collection (`students`)**

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  matricNo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' } // Enables RBAC
}

```

## Best Practices Implemented

* **No Shared Databases:** Controls its own user database separately from business logic services.
* **Role-Based Access Control (RBAC):** Dynamically renders different UI panels based on the user's database role.
* **Separation of Concerns:** Frontend styling and logic are decoupled from the backend server logic.

## Troubleshooting

* **MongoDB Connection Error:** Verify that your current IP address is whitelisted in MongoDB Atlas Network Access.
* **Cannot route to other services:** Ensure that `request-service` (Port 3001) and `facility-service` (Port 3002) are actively running in separate terminal windows.