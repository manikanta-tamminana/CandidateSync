# CandidateSync

**A real-time recruitment application tracking platform.**

CandidateSync helps HR teams manage candidate applications and enables candidates to track their recruitment progress through a centralized dashboard.

## Live Application

- **Frontend:** [https://candidate-sync.vercel.app](https://candidate-sync.vercel.app)
- **Backend API:** [https://candidate-sync-api.onrender.com](https://candidate-sync-api.onrender.com)
- **Backend health check:** [https://candidate-sync-api.onrender.com/api/health](https://candidate-sync-api.onrender.com/api/health)

## Features

### Admin / HR
- Secure admin authentication.
- View and manage candidate applications.
- Search candidates and filter by application status.
- Update candidate application statuses.
- Add remarks when updating application status.
- View individual candidate status history.
- Receive application updates through real-time communication.

### Candidate
- Secure candidate authentication.
- View personal application status.
- Track recruitment progress.
- View application status history.
- Receive real-time status updates.

## Application Statuses

CandidateSync supports the following application statuses:

1. Applied
2. Under Review
3. Shortlisted
4. Interview Scheduled
5. Selected
6. Rejected

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-time communication | Socket.IO |
| API communication | REST API |
| Version control | Git, GitHub |

## Project Structure

```text
CandidateSync/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── services/
│       ├── utils/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   └── .env.example
│
├── docs/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/manikanta-tamminana/CandidateSync.git
cd CandidateSync
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory using `.env.example` as a reference.

Configure the following environment variables:

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

Use your own MongoDB connection string and strong secret values. Never commit `.env` to GitHub.

### 3. Seed the admin account

```bash
npm run seed:admin
```

### 4. Start the backend

```bash
npm run dev
```

The backend runs at:

`http://localhost:5001`

Health check:

`http://localhost:5001/api/health`

### 5. Configure the frontend

Open a new terminal:

```bash
cd client
npm install
```

Optionally create a `.env` file inside `client`:

```env
VITE_API_URL=http://localhost:5001
```

### 6. Start the frontend

```bash
npm run dev
```

Vite will display the local frontend URL in your terminal.

## API Endpoints

Base URL: `/api`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a candidate |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Get authenticated user |

### Candidates

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/candidates` | Admin | Retrieve candidates |
| PATCH | `/candidates/:id/status` | Admin | Update application status |
| GET | `/candidates/:id/history` | Admin | View candidate history |
| GET | `/candidates/me/history` | Candidate | View own application history |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API availability |

The health endpoint is available at `/api/health` on the deployed backend.

All protected endpoints require a valid JWT bearer token.

## Real-Time Updates

CandidateSync uses Socket.IO for real-time application updates.

- Authenticated candidates join their own candidate-specific room.
- Admin users join the admin room.
- Socket connections are authenticated using JWT.

## Security

- Password hashing with bcryptjs.
- JWT-based authentication.
- Role-based access control.
- Protected candidate and admin routes.
- Environment variables for sensitive configuration.
- CORS configuration for frontend communication.

## Production Deployment

The application is deployed using:

- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** [Render](https://render.com/)
- **Database:** MongoDB Atlas

Production environment variables connect the deployed frontend and backend. Keep credentials and secrets private; never commit environment files containing real values.

## Author

**Manikanta Tamminana**

B.Tech Computer Science and Engineering  
National Institute of Technology Agartala
