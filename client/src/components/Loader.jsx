export default function Loader({ fullscreen = false, label = 'Loading' }) {
  const wrapper = fullscreen
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-12';
  return (
    <div className={wrapper}>
      <div className="flex items-center gap-3 text-ink-muted">
        <div className="w-4 h-4 border-2 border-ink-muted/30 border-t-ink rounded-full animate-spin" />
        <span className="text-sm font-medium">{label}…</span>
      </div>
    </div>
  );
}
