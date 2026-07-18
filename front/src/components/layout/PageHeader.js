import { useNavigate } from 'react-router-dom';

export function PageHeader({ title, onBack, dark = false }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '18px 12px 6px',
      }}
    >
      <button
        type="button"
        className="tap-target"
        onClick={onBack || (() => navigate(-1))}
        aria-label="뒤로 가기"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: dark ? '#f7efd9' : '#3a2e52',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 4 L6.5 10 L12.5 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1
        className="title-display"
        style={{
          fontSize: 19,
          color: dark ? '#fffaf0' : '#2d2350',
          flex: 1,
          textAlign: 'center',
          marginRight: 36,
        }}
      >
        {title}
      </h1>
    </div>
  );
}