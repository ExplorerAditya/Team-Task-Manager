import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="A few details and you're in.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            required
            autoFocus
            minLength={2}
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ada Lovelace"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="label">Role</label>
          <div className="grid grid-cols-2 gap-2">
            {['Member', 'Admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                  form.role === r
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper-card text-ink border-border hover:border-border-strong'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-muted mt-2 leading-relaxed">
            Admins can create projects and manage members. Members can be assigned tasks.
          </p>
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full mt-2">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-ink-muted mt-6 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-ink font-medium underline underline-offset-2 hover:text-accent">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
