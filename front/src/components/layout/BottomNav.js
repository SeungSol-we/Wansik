import { NavLink } from 'react-router-dom';

const TABS = [
  {
    to: '/',
    label: '홈',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11.5 L12 4 L20 11.5"
          stroke={active ? '#8879c4' : '#b6aad6'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 10 V19 A1 1 0 0 0 7.5 20 H16.5 A1 1 0 0 0 17.5 19 V10"
          stroke={active ? '#8879c4' : '#b6aad6'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/report',
    label: '주간 운세',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 4 A8 8 0 1 0 15 20 A9.5 9.5 0 0 1 15 4 Z"
          fill={active ? '#8879c4' : 'none'}
          stroke={active ? '#8879c4' : '#b6aad6'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M19 3 L19.8 5 L22 5.8 L19.8 6.6 L19 8.6 L18.2 6.6 L16 5.8 L18.2 5 Z" fill={active ? '#8879c4' : '#b6aad6'} />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: '건강 프로필',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="3.6" stroke={active ? '#8879c4' : '#b6aad6'} strokeWidth="2.2" />
        <path
          d="M5 20 C5 15.5 8 13.5 12 13.5 C16 13.5 19 15.5 19 20"
          stroke={active ? '#8879c4' : '#b6aad6'}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  return (
    <nav
      style={{
        // .screen's children don't stretch by default, so on short pages
        // (e.g. the weekly-report empty state) this nav would otherwise sit
        // right after the content instead of pinned to the viewport bottom.
        // marginTop: auto pushes it down when there's slack; sticky still
        // keeps it pinned once the page is tall enough to scroll.
        marginTop: 'auto',
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        background: 'rgba(253, 248, 236, 0.94)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e4d3a7',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        zIndex: 20,
      }}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '10px 4px 8px',
            textDecoration: 'none',
          }}
        >
          {({ isActive }) => (
            <>
              {tab.icon(isActive)}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#5b4e8c' : '#a99cc9',
                }}
              >
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}