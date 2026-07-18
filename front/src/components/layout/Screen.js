// Wraps every page in the shared phone-width shell and applies the
// light (cream) or dark (navy/mystical) theme used across the mockups.
export function Screen({ theme = 'light', children }) {
  return <div className={`screen screen--${theme}`}>{children}</div>;
}

export function ScreenBody({ children, style }) {
  return (
    <div className="screen-body" style={style}>
      {children}
    </div>
  );
}