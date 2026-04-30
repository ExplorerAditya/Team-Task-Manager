import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Users,
  KanbanSquare,
  ArrowLeft,
  UserPlus,
  Pencil,
  Calendar,
  X,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { StatusBadge, PriorityBadge, RoleBadge } from '../components/badges';

const STATUSES = ['Todo', 'In Progress', 'Done'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');

  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [memberModal, setMemberModal] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const isAdmin = useMemo(() => {
    if (!project || !user) return false;
    if (user.role === 'Admin') return true;
    const m = project.members.find((m) => m.user?._id === user._id);
    return m?.role === 'Admin';
  }, [project, user]);

  const load = async () => {
    try {
      const [p, t] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ]);
      setProject(p.data);
      setTasks(t.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load project');
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateTaskStatus = async (task, status) => {
    try {
      const r = await api.put(`/tasks/project/${id}/${task._id}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? r.data : t)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const deleteTask = async (task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/project/${id}/${task._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const deleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Loader fullscreen />;
  if (!project) return null;

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow={
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> All projects
          </button>
        }
        title={project.name}
        subtitle={project.description || 'No description'}
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button onClick={() => setMemberModal(true)} className="btn-secondary">
                  <UserPlus className="w-4 h-4" />
                  Add member
                </button>
                <button
                  onClick={() => setTaskModal({ open: true, task: null })}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  New task
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="px-8 border-b border-border bg-paper-soft/30">
        <div className="flex gap-1">
          <Tab active={tab === 'tasks'} onClick={() => setTab('tasks')} icon={KanbanSquare}>
            Tasks ({tasks.length})
          </Tab>
          <Tab active={tab === 'members'} onClick={() => setTab('members')} icon={Users}>
            Members ({project.members.length})
          </Tab>
        </div>
      </div>

      <div className="p-8">
        {tab === 'tasks' ? (
          <Board
            grouped={grouped}
            isAdmin={isAdmin}
            currentUserId={user?._id}
            onEdit={(task) => isAdmin && setTaskModal({ open: true, task })}
            onDelete={deleteTask}
            onChangeStatus={updateTaskStatus}
          />
        ) : (
          <MembersPanel
            project={project}
            isAdmin={isAdmin}
            onChange={load}
          />
        )}
      </div>

      {isAdmin && tab === 'members' && (
        <div className="px-8 pb-12">
          <button onClick={() => setConfirmDel(true)} className="btn-ghost text-accent hover:bg-accent/5">
            <Trash2 className="w-4 h-4" />
            Delete project
          </button>
        </div>
      )}

      {/* Task modal */}
      <TaskModal
        open={taskModal.open}
        task={taskModal.task}
        project={project}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSaved={(saved, isNew) => {
          if (isNew) setTasks((prev) => [saved, ...prev]);
          else setTasks((prev) => prev.map((t) => (t._id === saved._id ? saved : t)));
        }}
      />

      {/* Add member modal */}
      <AddMemberModal
        open={memberModal}
        projectId={id}
        onClose={() => setMemberModal(false)}
        onSaved={(p) => setProject(p)}
      />

      {/* Confirm delete */}
      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title="Delete project?">
        <p className="text-sm text-ink-muted mb-5">
          This will permanently delete <strong className="text-ink">{project.name}</strong> and all
          its tasks. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setConfirmDel(false)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={deleteProject} className="btn-danger flex-1">
            Delete project
          </button>
        </div>
      </Modal>
    </>
  );
}

function Tab({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-ink text-ink'
          : 'border-transparent text-ink-muted hover:text-ink'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function Board({ grouped, isAdmin, currentUserId, onEdit, onDelete, onChangeStatus }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {STATUSES.map((status) => (
        <div key={status} className="bg-paper-soft/40 rounded-lg p-3 border border-border min-h-[200px]">
          <div className="flex items-center justify-between px-2 py-2 mb-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={status} />
              <span className="text-xs text-ink-muted">{grouped[status].length}</span>
            </div>
          </div>
          <div className="space-y-2">
            {grouped[status].length === 0 && (
              <div className="text-center py-8 text-xs text-ink-muted/60">No tasks</div>
            )}
            {grouped[status].map((t) => (
              <TaskCard
                key={t._id}
                task={t}
                isAdmin={isAdmin}
                isMine={t.assignee?._id === currentUserId}
                onEdit={() => onEdit(t)}
                onDelete={() => onDelete(t)}
                onChangeStatus={(s) => onChangeStatus(t, s)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task, isAdmin, isMine, onEdit, onDelete, onChangeStatus }) {
  const canEditStatus = isAdmin || isMine;
  return (
    <div className="bg-paper-card border border-border rounded-md p-3 shadow-soft hover:shadow-card transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm leading-snug flex-1">{task.title}</h4>
        {isAdmin && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1 text-ink-muted hover:text-ink hover:bg-paper-soft rounded"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-ink-muted hover:text-accent hover:bg-paper-soft rounded"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      {task.description && (
        <p className="text-xs text-ink-muted mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${
              task.isOverdue ? 'text-accent font-medium' : 'text-ink-muted'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 min-w-0">
          {task.assignee ? (
            <>
              <div className="w-5 h-5 rounded-full bg-ink text-paper text-[10px] grid place-items-center font-semibold shrink-0">
                {task.assignee.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-xs text-ink-muted truncate">{task.assignee.name}</span>
            </>
          ) : (
            <span className="text-xs text-ink-muted/60 italic">Unassigned</span>
          )}
        </div>
        {canEditStatus && (
          <StatusSelect value={task.status} onChange={onChangeStatus} />
        )}
      </div>
    </div>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none text-xs bg-paper-soft border border-border rounded pl-2 pr-6 py-1 font-medium hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-ink/20 cursor-pointer"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted" />
    </div>
  );
}

function MembersPanel({ project, isAdmin, onChange }) {
  const removeMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${project._id}/members/${userId}`);
      toast.success('Member removed');
      onChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed');
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/projects/${project._id}/members/${userId}`, { role });
      toast.success('Role updated');
      onChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="card overflow-hidden">
      <ul className="divide-y divide-border">
        {project.members.map((m) => {
          const u = m.user;
          if (!u) return null;
          const isOwner = project.owner?._id === u._id;
          return (
            <li key={u._id} className="p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-ink text-paper grid place-items-center text-sm font-semibold shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{u.name}</span>
                  {isOwner && (
                    <span className="badge bg-accent/10 text-accent border border-accent/20">
                      Owner
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-muted truncate">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && !isOwner ? (
                  <select
                    value={m.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    className="input py-1.5 text-xs w-28"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  <RoleBadge role={m.role} />
                )}
                {isAdmin && !isOwner && (
                  <button
                    onClick={() => removeMember(u._id)}
                    className="p-2 text-ink-muted hover:text-accent rounded-md hover:bg-paper-soft"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TaskModal({ open, task, project, onClose, onSaved }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignee: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: task?.title || '',
        description: task?.description || '',
        assignee: task?.assignee?._id || '',
        status: task?.status || 'Todo',
        priority: task?.priority || 'Medium',
        dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [open, task]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
      };
      let r;
      if (isEdit) {
        r = await api.put(`/tasks/project/${project._id}/${task._id}`, payload);
      } else {
        r = await api.post(`/tasks/project/${project._id}`, payload);
      }
      toast.success(isEdit ? 'Task updated' : 'Task created');
      onSaved(r.data, !isEdit);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit task' : 'New task'} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input
            required
            autoFocus
            maxLength={200}
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What needs to be done?"
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            rows={3}
            maxLength={2000}
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add detail (optional)"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Assignee</label>
            <select
              className="input"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            >
              <option value="">Unassigned</option>
              {project.members.map((m) => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Due date</label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddMemberModal({ open, projectId, onClose, onSaved }) {
  const [form, setForm] = useState({ email: '', role: 'Member' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setForm({ email: '', role: 'Member' });
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post(`/projects/${projectId}/members`, form);
      toast.success('Member added');
      onSaved(r.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add member">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            autoFocus
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="member@company.com"
          />
          <p className="text-xs text-ink-muted mt-1.5">
            They must already have a Tessera account.
          </p>
        </div>
        <div>
          <label className="label">Role in this project</label>
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="Member">Member — can view & update assigned tasks</option>
            <option value="Admin">Admin — can manage tasks & members</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy ? 'Adding…' : 'Add member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
