
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness, CheckCircle2, Clock3,
  FileText, History, RefreshCw
} from "lucide-react";

import { getMyHistory } from "../services/api";
import { useAuth } from "../context/useAuth";

const STATUS_CLASS = {
  Applied: "applied",
  "Under Review": "under-review",
  Shortlisted: "shortlisted",
  "Interview Scheduled": "interview",
  Selected: "selected",
  Rejected: "rejected"
};

const STATUS_ORDER = [
  "Applied", "Under Review", "Shortlisted",
  "Interview Scheduled", "Selected"
];

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit"
  });
}

const CandidateHistory = () => {
  const { token, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyHistory(token);
        if (active) setHistory(data.history || []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load application history.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (token) fetchHistory();
    return () => { active = false; };
  }, [token, refreshKey]);

  const currentStatus = user?.currentStatus || "Applied";
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isRejected = currentStatus === "Rejected";

  return (
    <section className="candidate-page">
      <div className="candidate-welcome-card">
        <div>
          <span className="page-eyebrow">YOUR CANDIDATE PORTAL</span>
          <h2>Your career journey, in sync.</h2>
          <p>Follow your recruitment progress and stay informed as your application moves forward.</p>
        </div>
        <div className="candidate-welcome-icon"><BriefcaseBusiness size={28} /></div>
      </div>

      <div className="candidate-summary-grid">
        <div className="candidate-summary-card">
          <div className="summary-card-icon"><FileText size={19} /></div>
          <span>APPLICATION STATUS</span>
          <strong className="summary-status-text">{currentStatus}</strong>
        </div>
        <div className="candidate-summary-card">
          <div className="summary-card-icon"><History size={19} /></div>
          <span>STATUS UPDATES</span>
          <strong>{history.length}</strong>
        </div>
        <div className="candidate-summary-card">
          <div className="summary-card-icon"><Clock3 size={19} /></div>
          <span>APPLICATION POSITION</span>
          <strong>{user?.jobRole || "Candidate"}</strong>
        </div>
      </div>

      <div className="application-status-card">
        <div>
          <span className="field-label">CURRENT APPLICATION STATUS</span>
          <h2>{currentStatus}</h2>
          <p>
            {isRejected
              ? "Your application process has been updated by the recruitment team. Please review the activity below."
              : currentStatus === "Selected"
                ? "Congratulations! Your application has reached the selected stage."
                : "Your application progress is being tracked here. Check this page for updates from the recruitment team."}
          </p>
        </div>
        <span className={`status-badge ${STATUS_CLASS[currentStatus] || "applied"}`}>
          <span className="status-dot" />{currentStatus}
        </span>
      </div>

      <div className="candidate-progress-panel">
        <div className="panel-heading">
          <div><h2>Recruitment journey</h2><p>Track the stages of your application.</p></div>
        </div>
        <div className="progress-steps">
          {STATUS_ORDER.map((step, index) => {
            const completed = !isRejected && currentIndex >= index;
            const active = !isRejected && currentIndex === index;
            return (
              <div className={`progress-step ${completed ? "progress-completed" : ""} ${active ? "progress-active" : ""}`} key={step}>
                <div className="progress-step-marker">
                  {completed ? <CheckCircle2 size={18} /> : <span>{index + 1}</span>}
                </div>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
        {isRejected && <p className="progress-note">Your latest status is Rejected. The timeline below contains the latest update.</p>}
      </div>

      <div className="candidate-history-panel">
        <div className="panel-heading">
          <div><h2>Application activity</h2><p>A chronological record of updates to your application.</p></div>
          <button className="secondary-button" onClick={() => setRefreshKey((v) => v + 1)} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading && <div className="dashboard-state"><div className="loading-spinner" /><p>Loading your application history...</p></div>}
        {!loading && error && (
          <div className="dashboard-state error-state">
            <p>{error}</p>
            <button className="secondary-button" onClick={() => setRefreshKey((v) => v + 1)}>Try again</button>
          </div>
        )}
        {!loading && !error && history.length === 0 && (
          <div className="dashboard-state">
            <History size={30} />
            <h3>No updates yet</h3>
            <p>Your application has been received. Future status changes and recruiter remarks will appear here.</p>
          </div>
        )}
        {!loading && !error && history.length > 0 && (
          <div className="candidate-timeline">
            {history.map((item) => (
              <article className="candidate-timeline-item" key={item._id}>
                <div className="candidate-timeline-marker" />
                <div className="candidate-timeline-content">
                  <div className="candidate-timeline-heading">
                    <div>
                      <span className={`status-badge ${STATUS_CLASS[item.newStatus] || ""}`}>
                        <span className="status-dot" />{item.newStatus}
                      </span>
                      <p className="candidate-transition">{item.previousStatus}<span>→</span>{item.newStatus}</p>
                    </div>
                    <time>{formatDate(item.createdAt)}</time>
                  </div>
                  <div className="candidate-remarks">{item.remarks || "No additional remarks were provided."}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CandidateHistory;
