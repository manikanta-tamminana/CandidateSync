
import { useCallback, useState } from "react";
import { LayoutDashboard, Users, LogOut } from "lucide-react";

import { useAuth } from "./context/useAuth";
import Login from "./components/Login";
import SocketListener from "./components/SocketListener";
import CandidateHistory from "./components/CandidateHistory";
import AdminDashboard from "./components/AdminDashboard";
import BrandLogo from "./components/BrandLogo";
import "./App.css";

function App() {
  const {
    isAuthenticated,
    user,
    token,
    logout,
    updateUserStatus,
  } = useAuth();

  const [activeSection, setActiveSection] = useState("overview");

  const handleStatusUpdate = useCallback(
    (data) => updateUserStatus(data.newStatus),
    [updateUserStatus]
  );

  if (!isAuthenticated) return <Login />;

  const isAdmin = user?.role === "admin";
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className={`app-shell ${isAdmin ? "admin-theme" : "candidate-theme"}`}>
      <SocketListener token={token} onStatusUpdate={handleStatusUpdate} />

      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandLogo />
          <span className="sidebar-brand-caption">RECRUITMENT PLATFORM</span>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <button
            type="button"
            className={`nav-item ${activeSection === "overview" ? "nav-item-active" : ""}`}
            onClick={() => setActiveSection("overview")}
            aria-current={activeSection === "overview" ? "page" : undefined}
          >
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className={`nav-item ${activeSection === "candidates" ? "nav-item-active" : ""}`}
              onClick={() => setActiveSection("candidates")}
              aria-current={activeSection === "candidates" ? "page" : undefined}
            >
              <Users size={19} />
              <span>Candidates</span>
            </button>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-meta">
              <strong title={user?.name}>{user?.name || "User"}</strong>
              <span>{isAdmin ? "Administrator" : "Candidate"}</span>
            </div>
          </div>

          <button type="button" className="sidebar-logout" onClick={logout}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-heading">
            <span className="topbar-eyebrow">CANDIDATESYNC WORKSPACE</span>
            <div className="topbar-title">
              {isAdmin ? "Recruitment management" : "Candidate portal"}
            </div>
          </div>

          <div className="topbar-right">
            <div className="connection-indicator">
              <span />
              Live workspace
            </div>
            <div className="topbar-user-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="app-content">
          <div className="page-heading">
            <div>
              <div className="page-eyebrow">
                {isAdmin
                  ? activeSection === "overview"
                    ? "ADMINISTRATION"
                    : "CANDIDATE MANAGEMENT"
                  : "APPLICATION TRACKING"}
              </div>

              <h1>
                {isAdmin
                  ? activeSection === "overview"
                    ? `Welcome back, ${user?.name?.split(" ")[0] || "Admin"}`
                    : "Candidates"
                  : `Hello, ${firstName}`}
              </h1>

              <p>
                {isAdmin
                  ? activeSection === "overview"
                    ? "Your recruitment workspace at a glance."
                    : "Search, review and manage candidate applications."
                  : "Stay informed about your application progress."}
              </p>
            </div>
          </div>

          {isAdmin ? (
            <AdminDashboard view={activeSection} />
          ) : (
            <CandidateHistory />
          )}
        </main>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} CandidateSync</span>
          <span>Recruitment, connected.</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
