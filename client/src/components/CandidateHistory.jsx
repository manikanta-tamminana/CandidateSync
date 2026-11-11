
import { useEffect, useState } from "react";
import { getMyHistory } from "../services/api";
import { useAuth } from "../context/useAuth";

const STATUS_CLASS = {
  Applied: "applied",
  "Under Review": "under-review",
  Shortlisted: "shortlisted",
  "Interview Scheduled": "interview",
  Selected: "selected",
  Rejected: "rejected",
};

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const CandidateHistory = () => {
  const { token, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyHistory(token);

        if (active) setHistory(data.history || []);
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load application history.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (token) fetchHistory();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="candidate-page">
      <div className="application-status-card">
        <div>
          <span className="field-label">YOUR CURRENT APPLICATION STATUS</span>
          <h2>
            {user.currentStatus || "Application received"}
          </h2>
          <p>
            Your application progress is shown here. Check back for updates
            from the recruitment team.
          </p>
        </div>

        <span
          className={`status-badge ${STATUS_CLASS[user.currentStatus] || "applied"}`}
        >
          <span className="status-dot" />
          {user.currentStatus || "Applied"}
        </span>
      </div>

      <div className="candidate-history-panel">
        <div className="panel-heading">
          <div>
            <h2>Application activity</h2>
            <p>A record of updates made to your application.</p>
          </div>
          <span className="candidate-count">
            {history.length} updates
          </span>
        </div>

        {loading && (
          <div className="dashboard-state">
            <div className="loading-spinner" />
            <p>Loading your application history...</p>
          </div>
        )}

        {!loading && error && (
          <div className="dashboard-state error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="dashboard-state">
            <div className="empty-icon">↗</div>
            <h3>No updates yet</h3>
            <p>
              Your application has been received. Any future status changes
              will appear here.
            </p>
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
                      <span
                        className={`status-badge ${STATUS_CLASS[item.newStatus] || ""}`}
                      >
                        <span className="status-dot" />
                        {item.newStatus}
                      </span>
                      <p className="candidate-transition">
                        {item.previousStatus} <span>→</span> {item.newStatus}
                      </p>
                    </div>

                    <time>{formatDate(item.createdAt)}</time>
                  </div>

                  <div className="candidate-remarks">
                    {item.remarks || "No additional remarks were provided."}
                  </div>
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
