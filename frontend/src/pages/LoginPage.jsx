import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authService.login(form);
      login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,_#8be9ff_0%,_#f0f9ff_35%,_#fff7ed_100%)] p-6 dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_#020617_65%,_#111827_100%)]">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/85 p-7 shadow-xl shadow-cyan-900/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Club Expense OS</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Sign in to manage event budgets and reimbursements.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          No account?{' '}
          <Link to="/register" className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
