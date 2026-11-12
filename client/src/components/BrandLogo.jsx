
const BrandLogo = ({ size = "normal", showText = true }) => {
  const compact = size === "small";

  return (
    <div className={`brand-logo ${compact ? "brand-logo-small" : ""}`}>
      <div className="brand-logo-icon" aria-hidden="true">
        <svg
          viewBox="0 0 44 44"
          width={compact ? 34 : 42}
          height={compact ? 34 : 42}
          fill="none"
        >
          <rect x="4" y="4" width="36" height="36" rx="12" fill="currentColor" opacity=".1" />
          <circle cx="22" cy="22" r="19" stroke="currentColor" strokeWidth="2" />
          <path
            d="M13 22.5 19 28l12-13"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className="brand-wordmark">
          Candidate<span>Sync</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
