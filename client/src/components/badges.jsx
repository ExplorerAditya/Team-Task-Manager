export function StatusBadge({ status }) {
  const styles = {
    Todo: 'bg-paper-soft text-ink-muted border border-border',
    'In Progress': 'bg-amber-50 text-amber-800 border border-amber-200',
    Done: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  };
  return <span className={`badge ${styles[status] || styles.Todo}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const styles = {
    Low: 'text-ink-muted',
    Medium: 'text-amber-700',
    High: 'text-accent',
  };
  const dots = { Low: 1, Medium: 2, High: 3 };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${styles[priority]}`}>
      <span className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-1 h-3 rounded-sm ${
              i <= dots[priority] ? 'bg-current' : 'bg-current/20'
            }`}
          />
        ))}
      </span>
      {priority}
    </span>
  );
}

export function RoleBadge({ role }) {
  if (role === 'Admin') {
    return (
      <span className="badge bg-ink text-paper">Admin</span>
    );
  }
  return <span className="badge bg-paper-soft text-ink-muted border border-border">Member</span>;
}
