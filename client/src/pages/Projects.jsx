import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowRight, FolderKanban } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [busy, setBusy] = useState(false);

  const canCreate = user?.role === 'Admin';

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/projects');
      setProjects(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created');
      setOpen(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        subtitle="Each project has its own team, tasks, and access controls."
        actions={
          canCreate && (
            <button onClick={() => setOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              New project
            </button>
          )
        }
      />

      <div className="p-8">
        {loading ? (
          <Loader />
        ) : projects.length === 0 ? (
          <div className="card p-16 text-center">
            <FolderKanban className="w-10 h-10 mx-auto mb-4 text-ink-muted opacity-50" />
            <h3 className="display text-2xl font-semibold mb-2">No projects yet</h3>
            <p className="text-sm text-ink-muted max-w-sm mx-auto mb-6">
              {canCreate
                ? 'Create your first project to start organizing tasks and inviting your team.'
                : 'Ask an Admin to add you to a project.'}
            </p>
            {canCreate && (
              <button onClick={() => setOpen(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create project
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link
                key={p._id}
                to={`/projects/${p._id}`}
                className="card p-6 hover:shadow-card hover:border-border-strong transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-md bg-ink text-paper grid place-items-center font-display text-lg font-semibold">
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="display text-lg font-semibold mb-1 line-clamp-1">{p.name}</h3>
                <p className="text-sm text-ink-muted line-clamp-2 mb-4 min-h-[2.5rem]">
                  {p.description || 'No description'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {p.members.length} member{p.members.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">
                    {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New project">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Project name</label>
            <input
              required
              autoFocus
              maxLength={100}
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Q4 Launch"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              maxLength={1000}
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this project about?"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
