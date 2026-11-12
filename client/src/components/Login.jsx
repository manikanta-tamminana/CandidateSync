import { useState } from "react";
import { useAuth } from "../context/useAuth";
import BrandLogo from "./BrandLogo";

function Login() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [jobRole, setJobRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegistering = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (isRegistering && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        await register({
          name,
          email,
          password,
          jobRole,
        });
      } else {
        await login(email.trim().toLowerCase(), password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  const stages = ["Applied", "Review", "Interview", "Decision"];

  return (
    <main className="login-page">
      <section className="login-form-panel">
        <div className="login-brand">
          <BrandLogo />
        </div>

        <div className="login-form-wrapper">
          <div className="login-form-heading">
            <span className="login-form-eyebrow">
              {isRegistering ? "JOIN CANDIDATESYNC" : "WELCOME BACK"}
            </span>

            <h1>
              {isRegistering ? "Create your account" : "Welcome back"}
            </h1>

            <p>
              {isRegistering
                ? "Create your candidate account to track your recruitment journey."
                : "Enter your email and password to access your account."}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="login-field">
                <label htmlFor="register-name">Full name</label>
                <input
                  id="register-name"
                  className="login-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                className="login-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {isRegistering && (
              <div className="login-field">
                <label htmlFor="register-job-role">Applied job role</label>
                <input
                  id="register-job-role"
                  className="login-input"
                  type="text"
                  placeholder="e.g. Software Developer"
                  value={jobRole}
                  onChange={(event) => setJobRole(event.target.value)}
                  maxLength={100}
                  required
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-password">Password</label>

              <div className="login-password-wrap">
                <input
                  id="login-password"
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isRegistering
                      ? "Create a password (minimum 8 characters)"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    isRegistering ? "new-password" : "current-password"
                  }
                  minLength={isRegistering ? 8 : undefined}
                  required
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? isRegistering
                  ? "Creating account..."
                  : "Signing in..."
                : isRegistering
                  ? "Create account"
                  : "Sign in"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="login-mode-switch">
            {isRegistering
              ? "Already have an account?"
              : "New candidate?"}

            <button
              type="button"
              className="login-mode-link"
              onClick={() => switchMode(isRegistering ? "login" : "register")}
            >
              {isRegistering ? "Sign in" : "Create an account"}
            </button>
          </div>

          <div className="login-security-note">
            <span aria-hidden="true">◇</span>
            Your account is protected with secure authentication.
          </div>
        </div>

        <footer className="login-panel-footer">
          <span>© {new Date().getFullYear()} CandidateSync</span>
          <span>Privacy-conscious recruitment workspace</span>
        </footer>
      </section>

      <aside className="login-visual">
        <div className="login-visual-pattern" />

        <div className="login-visual-content">
          <span className="login-eyebrow">RECRUITMENT, CONNECTED</span>

          <h2>
            Every candidate.
            <br />
            <span>Every step, in sync.</span>
          </h2>

          <p>
            Keep candidates informed and give hiring teams a clearer view
            of every application, every update and every next step.
          </p>

          <div className="login-preview">
            <div className="preview-header">
              <div>
                <span>APPLICATION OVERVIEW</span>
                <h3>Recruitment progress</h3>
              </div>
              <span className="preview-live">● LIVE</span>
            </div>

            <div className="preview-stages">
              {stages.map((stage, index) => (
                <div
                  className={\`preview-stage \${
                    index < 2
                      ? "completed"
                      : index === 2
                        ? "active"
                        : "upcoming"
                  }\`}
                  key={stage}
                >
                  <span>{index < 2 ? "✓" : index + 1}</span>
                  <small>{stage}</small>
                </div>
              ))}
            </div>

            <div className="preview-footer">
              <div className="preview-footer-icon">↗</div>
              <div>
                <strong>Stay in sync</strong>
                <p>Application updates, in real time.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-visual-footer">
          <span>Built for better hiring experiences.</span>
          <span>CandidateSync</span>
        </div>
      </aside>
    </main>
  );
}

export default Login;
