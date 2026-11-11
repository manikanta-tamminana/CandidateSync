
import { useCallback } from "react";
import { useAuth } from "./context/useAuth";
import Login from "./components/Login";
import SocketListener from "./components/SocketListener";
import CandidateHistory from "./components/CandidateHistory";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

function App() {
  const {
    isAuthenticated,
    user,
    token,
    logout,
    updateUserStatus,
  } = useAuth();

  const handleStatusUpdate = useCallback(
    (data) => {
      updateUserStatus(data.newStatus);
    },
    [updateUserStatus]
  );

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <SocketListener
        token={token}
        onStatusUpdate={handleStatusUpdate}
      />

      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">C</div>
          CandidateSync
        </div>

        <div className="header-user">
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>

          <button className="logout-button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="app-content">
        {user.role === "admin" && (
          <>
            <div className="page-heading">
              <h1>Recruitment overview</h1>
              <p>
                Manage candidates and track their application progress.
              </p>
            </div>

            <AdminDashboard />
          </>
        )}

        {user.role === "candidate" && (
          <>
            <div className="page-heading">
              <h1>My application</h1>
              <p>
                Track your application status and stay informed about
                updates.
              </p>
            </div>

            <CandidateHistory />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
