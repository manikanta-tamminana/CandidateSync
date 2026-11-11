
import { useEffect, useState } from "react";
import { X, History } from "lucide-react";

import { getCandidateHistory } from "../services/api";
import { useAuth } from "../context/useAuth";

const STATUS_CLASS = {
  Applied: "applied",
  "Under Review": "under-review",
  Shortlisted: "shortlisted",
  "Interview Scheduled": "interview",
  Selected: "selected",
  Rejected: "rejected"
};

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit"
  });
}

const CandidateHistoryModal = ({ candidate, onClose }) => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      try {
        const data = await getCandidateHistory(token, candidate._id);
        if (active) setHistory(data.history || []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load history.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHistory();
    return () => { active = false; };
  }, [token, candidate._id]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="history-modal" role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
        <header className="history-modal-header">
          <div>
            <span className="modal-eyebrow">CANDIDATE ACTIVITY</span>
            <h2 id="history-modal-title">Application history</h2>
            <p>{candidate.name} · {candidate.email}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close history">
            <X size={18} />
          </button>
        </header>

        <div className="history-modal-content">
          {loading && <div className="dashboard-state"><div className="loading-spinner" /><p>Loading status history...</p></div>}
          {!loading && error && <div className="dashboard-state error-state"><p>{error}</p></div>}
          {!loading && !error && history.length === 0 && (
            <div className="dashboard-state">
              <History size={30} /><h3>No status updates yet</h3>
              <p>Updates to this application will appear here.</p>
            </div>
          )}
          {!loading && !error && history.length > 0 && (
            <div className="history-timeline">
              {history.map((item) => (
                <article className="timeline-item" key={item._id}>
                  <div className="timeline-marker" />
                  <div className="timeline-entry">
                    <div className="timeline-entry-top">
                      <span className={`status-badge ${STATUS_CLASS[item.newStatus] || ""}`}>
                        <span className="status-dot" />{item.newStatus}
                      </span>
                      <time>{formatDate(item.createdAt)}</time>
                    </div>
                    <p className="timeline-transition">{item.previousStatus}<span>→</span>{item.newStatus}</p>
                    <div className="timeline-remarks">{item.remarks || "No remarks provided."}</div>
                    <p className="timeline-author">Updated by {item.updatedBy?.name || "Unknown"}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="history-modal-footer">
          <button className="secondary-button" onClick={onClose}>Close</button>
        </footer>
      </section>
    </div>
  );
};

export default CandidateHistoryModal;
