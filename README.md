# CandidateSync

**A real-time recruitment application tracking platform.**

CandidateSync helps HR teams manage candidate applications and enables candidates to follow their recruitment progress through a centralized dashboard.

## Live Application

- **Frontend:** [https://candidate-sync.vercel.app](https://candidate-sync.vercel.app)
- **Backend health check:** [https://candidate-sync-api.onrender.com/api/health](https://candidate-sync-api.onrender.com/api/health)
- **GitHub repository:** [https://github.com/manikanta-tamminana/CandidateSync](https://github.com/manikanta-tamminana/CandidateSync)

The backend is an API service. Its root URL is not a webpage; use the health-check endpoint above to verify API availability.

## 1. Features

### Admin / HR

- Secure administrator authentication.
- View and manage candidate applications.
- Search candidates by name or email.
- Filter candidates by application status.
- Update application statuses and add optional remarks.
- View an individual candidate's status history.

### Candidate

- Candidate self-registration and secure authentication from the login screen.
- View personal application status.
- Track recruitment progress.
- View application status history.
- Receive status-change notifications in real time.

### Application statuses

1. Applied
2. Under Review
3. Shortlisted
4. Interview Scheduled
5. Selected
6. Rejected


## Candidate Registration and Demo Access

- New candidates can select **Create an account** from the login screen.
- Registration collects the candidate's name, email, password and applied job role.
- Public registration always creates a candidate account; it does not provide an administrator registration option.
- A successfully registered candidate is signed in and enters the Candidate Portal with the initial application status **Applied**.
- Administrator accounts are provisioned separately through the backend admin-seeding process.
- Demo administrator and candidate credentials should be shared privately with evaluators rather than published in this public repository.

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database / ODM | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Real-time communication | Socket.IO |
| API communication | REST API |
| Version control | Git, GitHub |
| Deployment | Vercel (frontend), Render (backend) |

## 3. Feature Architecture

CandidateSync separates the user interface, API layer, authentication middleware, business logic, data models and real-time communication.

### 3.1 Frontend component structure

| Component / Module | Responsibility |
|---|---|
| `App.jsx` | Main application layout, role-based rendering and navigation |
| `AuthContext.jsx` | Shared authentication state, login, logout and user status |
| `Login.jsx` | Login interface |
| `AdminDashboard.jsx` | Admin overview, candidate list, search, filters and status management |
| `CandidateHistory.jsx` | Candidate portal, current status, progress and personal history |
| `CandidateHistoryModal.jsx` | Candidate history view opened by an administrator |
| `SocketListener.jsx` | Listens for real-time status update events |
| `services/api.js` | Centralized REST API requests |
| `utils/socket.js` | Creates authenticated Socket.IO client connections |

### 3.2 Backend module structure

| Module | Responsibility |
|---|---|
| `server.js` | Express setup, middleware, API routes, database connection and HTTP/Socket.IO startup |
| `routes/authRoutes.js` | Registration, login and authenticated profile routes |
| `routes/candidateRoutes.js` | Candidate listing, status updates and history routes |
| `controllers/authController.js` | Registration, password verification and JWT generation |
| `controllers/candidateController.js` | Candidate retrieval, status updates and history operations |
| `middleware/authMiddleware.js` | Verifies JWT bearer tokens |
| `middleware/roleMiddleware.js` | Enforces role-based access |
| `models/Candidate.js` | Candidate and administrator account schema |
| `models/StatusHistory.js` | Application status history schema |
| `config/db.js` | MongoDB connection |
| `config/socket.js` | Socket.IO setup, JWT authentication and room management |
| `constants/applicationStatus.js` | Central list of permitted application statuses |

### 3.3 High-level system flow

```text
                 React + Vite Frontend
                          |
             +------------+------------+
             |                         |
        Admin Dashboard          Candidate Portal
             |                         |
             +------------+------------+
                          |
                  Frontend Services
                    /          \
                   /            \
              REST API         Socket.IO
                   \            /
                    \          /
                 Node.js + Express
                          |
               JWT Authentication
              + Role Authorization
                          |
                     Controllers
                          |
                    Mongoose ODM
                          |
                    MongoDB Atlas
                    /          \
               Candidate   StatusHistory
```

- REST APIs handle registration, login, candidate retrieval, status updates and history retrieval.
- JWT middleware authenticates protected requests; role middleware restricts admin and candidate operations.
- Socket.IO provides authenticated, targeted candidate status notifications.

## 4. Database Schema

CandidateSync uses MongoDB with Mongoose. Candidate account and current application details are stored in the `Candidate` collection. Status transitions are stored separately in `StatusHistory`.

### 4.1 Candidate collection

| Field | Type | Description / Constraint |
|---|---|---|
| `_id` | ObjectId | Unique document identifier |
| `name` | String | Required; trimmed |
| `email` | String | Required, unique, lowercase and trimmed |
| `passwordHash` | String | Required; bcrypt hash; excluded from normal queries |
| `role` | String | Required; enum: `admin`, `candidate` |
| `jobRole` | String | Required for candidate accounts |
| `currentStatus` | String | Required; enum of application statuses; defaults to `Applied` |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

**Indexes:** unique email constraint and an index on `currentStatus`.

### 4.2 StatusHistory collection

| Field | Type | Description / Constraint |
|---|---|---|
| `_id` | ObjectId | Unique history record identifier |
| `candidateId` | ObjectId | Required reference to `Candidate` |
| `previousStatus` | String | Required; valid application status |
| `newStatus` | String | Required; valid application status |
| `updatedBy` | ObjectId | Required reference to the admin account in `Candidate` |
| `remarks` | String | Optional; trimmed; maximum 500 characters |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

**Index:** compound index on `{ candidateId: 1, createdAt: -1 }` to support recent history queries for a candidate.

### 4.3 Relationship

```text
Candidate
---------
_id
name
email
role
jobRole
currentStatus
     |
     | One candidate can have many status-history records
     |
     v
StatusHistory
-------------
_id
candidateId  -> Candidate._id
previousStatus
newStatus
updatedBy    -> Candidate._id (admin)
remarks
createdAt
```

A separate history collection provides an audit trail of status transitions and supports retrieval without continuously expanding the candidate document.

## 5. API Design

All endpoints use `/api` as their base path.

### 5.1 Authentication endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a candidate |
| POST | `/api/auth/login` | Public | Authenticate a user and return a JWT |
| GET | `/api/auth/me` | Authenticated | Retrieve the current user's profile |

### 5.2 Candidate endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/candidates` | Admin | Retrieve candidates; supports search, status filter and pagination parameters |
| PATCH | `/api/candidates/:id/status` | Admin | Update a candidate's status and create a history record |
| GET | `/api/candidates/:id/history` | Admin | Retrieve a candidate's status history |
| GET | `/api/candidates/me/history` | Candidate | Retrieve the authenticated candidate's own history |

### 5.3 Health endpoint

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Check API availability |

Protected endpoints require an `Authorization: Bearer <token>` header.

## 6. Status Update and Real-Time Workflow

When an administrator changes a candidate's application status:

1. The admin selects a new status and optionally enters remarks.
2. The frontend sends a `PATCH /api/candidates/:id/status` request.
3. Authentication middleware verifies the JWT; role middleware checks admin access.
4. The controller validates the candidate ID, requested status and remarks.
5. A MongoDB transaction reads the candidate, updates `currentStatus` and inserts a matching `StatusHistory` record.
6. Both database operations commit together.
7. After the transaction commits, Socket.IO emits a `candidate:status-updated` event to the candidate-specific room.
8. The candidate's connected frontend receives the event and updates the displayed current status.

If the status update or history insertion fails, the transaction prevents a partial database update. Socket notification errors are handled separately and do not undo a committed database change.

### Socket.IO connection and rooms

- Socket connections provide the JWT in the handshake authentication payload.
- The server verifies the token before accepting the connection.
- Candidate connections join `candidate:<candidateId>`.
- Admin connections join the `admins` room.
- The current status-update controller emits the status event to the affected candidate room.

## 7. Implementation Example

The following excerpt is from `server/controllers/candidateController.js`. It demonstrates the transaction that keeps the candidate's current status and history record consistent.

```javascript
session = await mongoose.startSession();

let updatedCandidate;
let historyRecord;

await session.withTransaction(async () => {
  const candidate = await Candidate.findOne({
    _id: id,
    role: "candidate",
  }).session(session);

  if (!candidate) {
    const error = new Error("Candidate not found");
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = candidate.currentStatus;

  if (previousStatus === status) {
    const error = new Error("Candidate already has this status");
    error.statusCode = 409;
    throw error;
  }

  candidate.currentStatus = status;
  updatedCandidate = await candidate.save({ session });

  const records = await StatusHistory.create(
    [{
      candidateId: candidate._id,
      previousStatus,
      newStatus: status,
      updatedBy: req.user.id,
      remarks: remarks.trim(),
    }],
    { session }
  );

  historyRecord = records[0];
});
```

After the transaction commits, the controller emits the event:

```javascript
const room = `candidate:${updatedCandidate._id}`;

getIO().to(room).emit("candidate:status-updated", {
  candidateId: updatedCandidate._id,
  previousStatus: historyRecord.previousStatus,
  newStatus: historyRecord.newStatus,
  remarks: historyRecord.remarks,
  updatedAt: historyRecord.createdAt,
});
```

The full controller also validates input, returns HTTP error responses, catches database errors and ends the session in a `finally` block.

## 8. Error Handling and Security

- **Password security:** Passwords are hashed with bcryptjs; the password hash is not returned in normal candidate queries.
- **Authentication:** JWT bearer tokens protect authenticated routes.
- **Authorization:** Role middleware restricts administrator and candidate operations.
- **Input validation:** Registration fields, password length, status values, candidate IDs and remarks are validated.
- **Duplicate registration:** Existing email addresses are rejected; duplicate-key errors are handled.
- **HTTP error responses:** The API returns appropriate client and server errors for invalid input, authentication failures, forbidden operations, missing candidates, duplicate status updates and unexpected failures.
- **Database consistency:** A transaction updates current status and history together.
- **Socket isolation:** Socket notification failures are logged separately from database transaction results.
- **Configuration security:** Database credentials and JWT secrets are kept in environment variables. Real environment files must not be committed.

## 9. Local Setup

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 9.1 Clone the repository

```bash
git clone https://github.com/manikanta-tamminana/CandidateSync.git
cd CandidateSync
```

### 9.2 Configure and start the backend

```bash
cd server
npm install
```

Create `server/.env` using `.env.example` as a reference:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=CandidateSync Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_strong_admin_password
```

Use your own values. Never commit real secrets.

Seed the admin account and start the backend:

```bash
npm run seed:admin
npm run dev
```

The backend runs locally at `http://localhost:5001`. Its health endpoint is `http://localhost:5001/api/health`.

### 9.3 Configure and start the frontend

Open a second terminal:

```bash
cd client
npm install
```

Optionally create `client/.env`:

```env
VITE_API_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

Vite prints the local frontend URL in the terminal.

**Database note:** Status updates use MongoDB transactions. Run the application against a MongoDB deployment configured as a replica set, such as MongoDB Atlas.

## 10. Production Deployment and Validation

| Layer | Platform | Production URL |
|---|---|---|
| Frontend | Vercel | [candidate-sync.vercel.app](https://candidate-sync.vercel.app) |
| Backend | Render | [candidate-sync-api.onrender.com](https://candidate-sync-api.onrender.com) |
| Backend health | Render | [API health check](https://candidate-sync-api.onrender.com/api/health) |
| Database | MongoDB Atlas | Managed database |

The production application was manually checked for:

- Admin and candidate authentication.
- Admin dashboard and candidate listing.
- Candidate status changes and recruiter remarks.
- Status history retrieval.
- Real-time updates to the candidate's current status.
- Backend health and database connectivity.

The frontend production build and ESLint checks completed successfully during development.

## 11. Future Improvements

Potential next steps for a larger recruitment workflow include:

- Automated unit, integration and end-to-end tests.
- Pagination controls and more advanced candidate filters.
- Rate limiting and improved session/refresh-token management.
- Centralized monitoring and structured logs.
- Redis Socket.IO adapter when running multiple backend instances.
- Additional notification channels and reporting features.

## Author

**Manikanta Tamminana**  
B.Tech, Computer Science and Engineering  
National Institute of Technology Agartala

- **GitHub:** [manikanta-tamminana/CandidateSync](https://github.com/manikanta-tamminana/CandidateSync)
- **Live application:** [CandidateSync](https://candidate-sync.vercel.app)
