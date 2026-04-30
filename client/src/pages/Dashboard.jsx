import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  FolderKanban,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { StatusBadge, PriorityBadge } from '../components/badges';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullscreen />;

  const s = data?.stats || {};

  return (
    <>
      <PageHeader
        eyebrow={`Welcome, ${user?.name?.split(' ')[0]}`}
        title="Dashboard"
        subtitle="Your projects, tasks, and what needs attention — at a glance."
      />

      <div className="p-8 space-y-8">
        {/* Stat grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={FolderKanban} label="Projects" value={s.totalProjects} accent="text-ink" />
          <Stat icon={CheckSquare} label="Total tasks" value={s.totalTasks} accent="text-ink" />
          <Stat icon={Clock} label="In progress" value={s.inProgressCount} accent="text-amber-700" />
          <Stat icon={AlertTriangle} label="Overdue" value={s.overdueCount} accent="text-accent" highlight={s.overdueCount > 0} />
        </section>

        {/* Status breakdown */}
        <section className="card p-6">
          <h2 className="display text-xl font-semibold mb-4">Status breakdown</h2>
          <StatusBar todo={s.todoCount} inProgress={s.inProgressCount} done={s.doneCount} />
        </section>

        {/* Two columns */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* My tasks */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="display text-xl font-semibold">My tasks</h2>
              <span className="text-xs text-ink-muted">{data?.myTasks?.length || 0} assigned</span>
            </div>
            {data?.myTasks?.length ? (
              <ul className="divide-y divide-border">
                {data.myTasks.slice(0, 8).map((t) => (
                  <li key={t._id}>
                    <Link
                      to={`/projects/${t.project?._id || t.project}`}
                      className="block p-4 hover:bg-paper-soft/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{t.title}</div>
                          <div className="text-xs text-ink-muted mt-1 flex items-center gap-2">
                            <span>{t.project?.name || 'Project'}</span>
                            {t.dueDate && (
                              <>
                                <span>·</span>
                                <span className={t.isOverdue ? 'text-accent font-medium' : ''}>
                                  Due {new Date(t.dueDate).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon={Inbox} label="No tasks assigned to you yet." />
            )}
          </div>

          {/* Recent activity */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="display text-xl font-semibold">Recent tasks</h2>
              <Link to="/projects" className="btn-ghost text-xs">
                View projects <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {data?.recentTasks?.length ? (
              <ul className="divide-y divide-border">
                {data.recentTasks.map((t) => (
                  <li key={t._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{t.title}</div>
                        <div className="text-xs text-ink-muted mt-1 flex items-center gap-2">
                          <span>{t.project?.name}</span>
                          {t.assignee && (
                            <>
                              <span>·</span>
                              <span>{t.assignee.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon={Inbox} label="No tasks yet. Create a project to get started." />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, accent, highlight }) {
  return (
    <div className={`card p-5 ${highlight ? 'ring-1 ring-accent/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-ink-muted uppercase tracking-wider mb-1">{label}</div>
          <div className={`display text-3xl font-semibold ${accent}`}>{value ?? 0}</div>
        </div>
        <Icon className={`w-5 h-5 ${accent} opacity-60`} />
      </div>
    </div>
  );
}

function StatusBar({ todo = 0, inProgress = 0, done = 0 }) {
  const total = todo + inProgress + done;
  if (total === 0) {
    return <p className="text-sm text-ink-muted">No tasks yet.</p>;
  }
  const pct = (n) => `${Math.round((n / total) * 100)}%`;
  return (
    <div className="space-y-3">
      <div className="flex h-2 rounded-full overflow-hidden bg-paper-soft">
        {todo > 0 && <div style={{ width: pct(todo) }} className="bg-ink-muted" />}
        {inProgress > 0 && <div style={{ width: pct(inProgress) }} className="bg-amber-500" />}
        {done > 0 && <div style={{ width: pct(done) }} className="bg-emerald-500" />}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
        <Legend dot="bg-ink-muted" label="Todo" value={todo} pct={pct(todo)} />
        <Legend dot="bg-amber-500" label="In Progress" value={inProgress} pct={pct(inProgress)} />
        <Legend dot="bg-emerald-500" label="Done" value={done} pct={pct(done)} />
      </div>
    </div>
  );
}

function Legend({ dot, label, value, pct }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="font-medium">{label}</span>
      <span className="text-ink-muted">
        {value} · {pct}
      </span>
    </div>
  );
}

function Empty({ icon: Icon, label }) {
  return (
    <div className="p-12 text-center text-ink-muted">
      <Icon className="w-8 h-8 mx-auto mb-3 opacity-50" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
