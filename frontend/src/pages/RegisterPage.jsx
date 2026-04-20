import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authService.register(form);
      login(data);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_bottom_right,_#d9f99d_0%,_#f0fdf4_30%,_#ecfeff_100%)] p-6 dark:bg-[radial-gradient(circle_at_bottom_right,_#14532d_0%,_#020617_60%,_#111827_100%)]">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/85 p-7 shadow-xl shadow-lime-900/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Join your club finance workspace in minutes.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
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
            minLength={6}
          />
          <select
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
