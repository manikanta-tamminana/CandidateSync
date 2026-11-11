import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getCandidates, updateCandidateStatus } from "../services/api";
import CandidateHistoryModal from "./CandidateHistoryModal";

const STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Rejected",
];

const STATUS_CLASS = {
  Applied: "applied",
  "Under Review": "under-review",
  Shortlisted: "shortlisted",
  "Interview Scheduled": "interview",
  Selected: "selected",
  Rejected: "rejected",
};

function CandidateCard({ candidate, token, onStatusUpdated }) {
  const [newStatus, setNewStatus] = useState(candidate.currentStatus);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setNewStatus(candidate.currentStatus);
  }, [candidate.currentStatus]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await updateCandidateStatus(
        token,
        candidate._id,
        newStatus,
        remarks,
      );

      onStatusUpdated({
        ...candidate,
        currentStatus: data.candidate.currentStatus,
      });
      setMessage("Application status updated successfully.");
      setRemarks("");
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const initials = candidate.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="candidate-card">
      <div className="candidate-main">
        <div className="candidate-identity">
          <div className="candidate-avatar">{initials}</div>
          <div className="candidate-details">
            <h3>{candidate.name}</h3>
            <p>{candidate.email}</p>
          </div>
        </div>

        <div className="candidate-role">
          <span className="field-label">APPLIED POSITION</span>
          <strong>{candidate.jobRole || "Not specified"}</strong>
        </div>

        <div className="candidate-current-status">
          <span className="field-label">CURRENT STATUS</span>
          <span
            className={`status-badge ${STATUS_CLASS[candidate.currentStatus] || ""}`}
          >
            <span className="status-dot" />
            {candidate.currentStatus}
          </span>
        </div>
      </div>

      <div className="candidate-actions">
        <div className="status-control">
          <label htmlFor={`status-${candidate._id}`}>
            Change application status
          </label>
          <select
            id={`status-${candidate._id}`}
            value={newStatus}
            onChange={(event) => setNewStatus(event.target.value)}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="remarks-control">
          <label htmlFor={`remarks-${candidate._id}`}>Internal remarks</label>
          <input
            id={`remarks-${candidate._id}`}
            type="text"
            placeholder="Add an optional note..."
            value={remarks}
            maxLength={500}
            onChange={(event) => setRemarks(event.target.value)}
          />
        </div>

        <button
          className="primary-button update-button"
          onClick={handleUpdate}
          disabled={loading || newStatus === candidate.currentStatus}
        >
          {loading ? "Saving..." : "Save update"}
        </button>

        <button
          className="secondary-button history-button"
          onClick={() => setShowHistory(true)}
        >
          View history
        </button>
      </div>

      {error && <p className="feedback-message error-message">{error}</p>}
      {message && <p className="feedback-message success-message">{message}</p>}

      {showHistory && (
        <CandidateHistoryModal
          candidate={candidate}
          onClose={() => setShowHistory(false)}
        />
      )}
    </article>
  );
}

function AdminDashboard() {
  const { token } = useAuth();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!token) return;

    let isActive = true;

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCandidates(token, {
          search: debouncedSearch,
          status,
        });

        if (isActive) {
          setCandidates(data.candidates || []);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || "Failed to fetch candidates.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchCandidates();

    return () => {
      isActive = false;
    };
  }, [token, debouncedSearch, status]);

  const handleStatusUpdated = (updatedCandidate) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate._id === updatedCandidate._id ? updatedCandidate : candidate,
      ),
    );
  };

  const statusCount = (value) =>
    candidates.filter((candidate) => candidate.currentStatus === value).length;

  return (
    <section className="dashboard">
      <div className="dashboard-toolbar">
        <div>
          <h2>Candidate pipeline</h2>
          <p>Review applications and manage candidate progress.</p>
        </div>
        <span className="candidate-count">{candidates.length} shown</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Candidates shown</span>
          <strong>{candidates.length}</strong>
          <span className="stat-caption">Current results</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Under review</span>
          <strong>{statusCount("Under Review")}</strong>
          <span className="stat-caption">Being evaluated</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Shortlisted</span>
          <strong>{statusCount("Shortlisted")}</strong>
          <span className="stat-caption">Moving forward</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Selected</span>
          <strong>{statusCount("Selected")}</strong>
          <span className="stat-caption">Successful applications</span>
        </div>
      </div>

      <div className="candidate-panel">
        <div className="panel-heading">
          <div>
            <h2>All candidates</h2>
            <p>Search, filter, and update application statuses.</p>
          </div>
        </div>

        <div className="filter-toolbar">
          <div className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="filter-select"
            aria-label="Filter candidates by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="dashboard-state">
            <div className="loading-spinner" />
            <p>Loading candidates...</p>
          </div>
        )}

        {!loading && error && (
          <div className="dashboard-state error-state">
            <p>{error}</p>
            <button
              className="secondary-button"
              onClick={() => setDebouncedSearch(`${search} `)}
            >
              Retry search
            </button>
          </div>
        )}

        {!loading && !error && candidates.length === 0 && (
          <div className="dashboard-state">
            <div className="empty-icon">⌕</div>
            <h3>No candidates found</h3>
            <p>Try changing your search term or status filter.</p>
          </div>
        )}

        {!error && candidates.length > 0 && (
          <div className="candidate-list">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                token={token}
                onStatusUpdated={handleStatusUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminDashboard;
