import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Receipt, ShieldCheck, Zap } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex xl:min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_#dff7ff,_#eef2ff_55%,_#fdf4ff)] dark:bg-[radial-gradient(ellipse_at_top,_#082f49,_#0f172a_55%,_#020617)] font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-white/50 bg-white/70 backdrop-blur dark:border-slate-800/50 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-sm font-bold text-white shadow-md">
              CO
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">Club OS</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="hidden items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-700 hover:shadow-cyan-600/40 sm:inline-flex"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm font-semibold text-slate-700 transition-colors hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400 sm:block"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-700 hover:shadow-cyan-600/40"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-32">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
            Manage Club Expenses with <span className="bg-gradient-to-r from-cyan-600 to-emerald-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-emerald-400">Zero Friction</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
            The all-in-one financial operating system for student clubs. Track budgets, automate reimbursements, and get real-time analytics in one beautiful dashboard.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-cyan-600/20 transition-all hover:scale-105 hover:shadow-cyan-600/40"
              >
                Enter Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-cyan-600/20 transition-all hover:scale-105 hover:shadow-cyan-600/40"
                >
                  Start Free <ArrowRight size={20} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white/50 px-8 py-3.5 text-base font-semibold text-slate-900 transition-all hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:hover:bg-slate-900 sm:hidden"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 border-y border-slate-200/50 bg-white/40 py-16 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/40 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Everything you need to run your club</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">No more lost receipts or delayed reimbursements.</p>
            </div>
            
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400">
                  <Receipt size={24} />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Smart Receipts</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Upload bills directly. Support for both prepaid requests and postpaid reimbursements with automated tracking.</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <BarChart3 size={24} />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Real-time Analytics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Visualize spending instantly. See event budgets, pending amounts, and total committed spending at a glance.</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Role-based Access</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Secure admin controls paired with a simplified student view ensures the right people see the right data.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/50 bg-white/50 py-8 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Club OS</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} Club Expense OS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;