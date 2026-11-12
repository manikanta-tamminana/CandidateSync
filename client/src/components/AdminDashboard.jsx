
import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Clock3,
  UserCheck,
  Trophy,
  History,
  RefreshCw,
  Save,
} from "lucide-react";

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

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await updateCandidateStatus(
        token,
        candidate._id,
        newStatus,
        remarks
      );

      const updatedCandidate = {
        ...candidate,
        currentStatus: data.candidate.currentStatus,
      };

      setNewStatus(data.candidate.currentStatus);
      onStatusUpdated(updatedCandidate);

      setMessage("Application status updated successfully.");
      setRemarks("");
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const initials = (candidate.name || "C")
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
            <h3 title={candidate.name}>{candidate.name}</h3>
            <p title={candidate.email}>{candidate.email}</p>
          </div>
        </div>

        <div className="candidate-role">
          <span className="field-label">APPLIED POSITION</span>
          <strong>{candidate.jobRole || "Not specified"}</strong>
        </div>

        <div className="candidate-current-status">
          <span className="field-label">CURRENT STATUS</span>

          <span
            className={`status-badge ${
              STATUS_CLASS[candidate.currentStatus] || ""
            }`}
          >
            <span className="status-dot" />
            {candidate.currentStatus}
          </span>
        </div>
      </div>

      <div className="candidate-actions">
        <div className="status-control">
          <label htmlFor={`status-${candidate._id}`}>
            Update application status
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
          <label htmlFor={`remarks-${candidate._id}`}>
            Recruiter remarks
          </label>

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
          type="button"
          className="primary-button"
          onClick={handleUpdate}
          disabled={loading || newStatus === candidate.currentStatus}
        >
          <Save size={15} />
          {loading ? "Saving..." : "Save update"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowHistory(true)}
        >
          <History size={15} />
          History
        </button>
      </div>

      {error && (
        <p className="feedback-message error-message">{error}</p>
      )}

      {message && (
        <p className="feedback-message success-message">{message}</p>
      )}

      {showHistory && (
        <CandidateHistoryModal
          candidate={candidate}
          onClose={() => setShowHistory(false)}
        />
      )}
    </article>
  );
}

function AdminDashboard({ view = "overview" }) {
  const { token } = useAuth();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce candidate search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch candidates whenever filters or refresh state changes.
  useEffect(() => {
    if (!token) return;

    let active = true;

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCandidates(token, {
          search: debouncedSearch,
          status,
        });

        if (active) {
          setCandidates(data.candidates || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to fetch candidates.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCandidates();

    return () => {
      active = false;
    };
  }, [token, debouncedSearch, status, refreshKey]);

  // Update a candidate locally after a successful status update.
  const handleStatusUpdated = (updatedCandidate) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate._id === updatedCandidate._id
          ? updatedCandidate
          : candidate
      )
    );
  };

  const statusCount = (value) =>
    candidates.filter(
      (candidate) => candidate.currentStatus === value
    ).length;

  return (
    <section className="dashboard">
      {view === "overview" && (
        <>
          <div className="dashboard-toolbar">
            <div>
              <h2>Recruitment overview</h2>
              <p>
                Monitor applications and manage your candidate pipeline.
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setRefreshKey((value) => value + 1)}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <Users size={18} />
              </div>
              <span className="stat-label">Candidates shown</span>
              <strong>{candidates.length}</strong>
              <span className="stat-caption">
                Current search results
              </span>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-amber">
                <Clock3 size={18} />
              </div>
              <span className="stat-label">Under review</span>
              <strong>{statusCount("Under Review")}</strong>
              <span className="stat-caption">Being evaluated</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-cyan">
                <UserCheck size={18} />
              </div>
              <span className="stat-label">Shortlisted</span>
              <strong>{statusCount("Shortlisted")}</strong>
              <span className="stat-caption">Moving forward</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <Trophy size={18} />
              </div>
              <span className="stat-label">Selected</span>
              <strong>{statusCount("Selected")}</strong>
              <span className="stat-caption">
                Successful applications
              </span>
            </div>
          </div>

          <div className="candidate-panel">
            <div className="panel-heading">
              <div>
                <h2>Candidate snapshot</h2>
                <p>
                  Latest candidates in your recruitment workspace.
                </p>
              </div>

              <span className="candidate-count">
                {candidates.length} candidates
              </span>
            </div>

            {loading ? (
              <div className="dashboard-state">
                <div className="loading-spinner" />
                <p>Loading candidates...</p>
              </div>
            ) : error ? (
              <div className="dashboard-state error-state">
                <p>{error}</p>

                <button
                  className="secondary-button"
                  onClick={() => setRefreshKey((value) => value + 1)}
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              </div>
            ) : candidates.length === 0 ? (
              <div className="dashboard-state">
                <Users size={28} />
                <h3>No candidates yet</h3>
                <p>
                  Candidate applications will appear here when registered.
                </p>
              </div>
            ) : (
              <div className="candidate-list">
                {candidates.slice(0, 4).map((candidate) => (
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
        </>
      )}

      {view === "candidates" && (
        <div className="candidate-panel">
          <div className="panel-heading">
            <div>
              <h2>Candidate pipeline</h2>
              <p>
                Search, filter and manage individual applications.
              </p>
            </div>

            <span className="candidate-count">
              {candidates.length} candidates
            </span>
          </div>

          <div className="filter-toolbar">
            <div className="search-box">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search by candidate name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="filter-select-wrap">
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
                onClick={() => setRefreshKey((value) => value + 1)}
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div className="dashboard-state">
              <Users size={30} />
              <h3>No candidates found</h3>
              <p>
                {search || status
                  ? "Try changing your search or status filter."
                  : "Candidate applications will appear here when registered."}
              </p>
            </div>
          )}

          {!loading && !error && candidates.length > 0 && (
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
      )}
    </section>
  );
}

export default AdminDashboard;
