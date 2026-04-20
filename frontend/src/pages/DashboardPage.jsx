import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarPlus2, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, Pencil, ReceiptText, Trash2, Users, X } from 'lucide-react';

import useAuth from '../hooks/useAuth';
import { authService, eventService, expenseService } from '../services/api';
import StatCard from '../components/StatCard';
import ExpenseTable from '../components/ExpenseTable';
import ThemeToggle from '../components/ThemeToggle';
import ExpenseFormModal from '../components/ExpenseFormModal';
import EventFormModal from '../components/EventFormModal';
import CompleteExpenseModal from '../components/CompleteExpenseModal';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [filters, setFilters] = useState({ eventId: '', status: '', type: '', search: '' });

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [expenseToComplete, setExpenseToComplete] = useState(null);
  const [adminView, setAdminView] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);

  const [loading, setLoading] = useState(false);

  const fetchCoreData = async () => {
    try {
      setLoading(true);
      const [{ data: eventData }, { data: expenseData }] = await Promise.all([
        eventService.getEvents(),
        isAdmin ? expenseService.getAllExpenses(filters) : expenseService.getMyExpenses(),
      ]);

      setEvents(eventData);
      setExpenses(expenseData);

      if (isAdmin) {
        const { data } = await authService.getUsers();
        setStudents(data.filter((person) => person.role === 'student'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchCoreData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.eventId, filters.search, filters.status, filters.type]);

  const visibleExpenses = useMemo(() => {
    if (isAdmin) return expenses;

    return expenses.filter((expense) => {
      const eventMatch = filters.eventId ? expense.eventId?._id === filters.eventId : true;
      const statusMatch = filters.status ? expense.status === filters.status : true;
      const typeMatch = filters.type ? expense.type === filters.type : true;
      const searchMatch = filters.search
        ? expense.description.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      return eventMatch && statusMatch && typeMatch && searchMatch;
    });
  }, [expenses, filters.eventId, filters.search, filters.status, filters.type, isAdmin]);

  const totals = useMemo(() => {
    const totalSpent = visibleExpenses
      .filter((expense) => ['approved', 'completed'].includes(expense.status))
      .reduce((sum, expense) => sum + expense.amount, 0);

    const pendingAmount = visibleExpenses
      .filter((expense) => expense.status === 'pending')
      .reduce((sum, expense) => sum + expense.amount, 0);

    const completedAmount = visibleExpenses
      .filter((expense) => expense.status === 'completed')
      .reduce((sum, expense) => sum + expense.amount, 0);

    return { totalSpent, pendingAmount, completedAmount };
  }, [visibleExpenses]);

  const studentExpenseGroups = useMemo(() => {
    if (!isAdmin) return [];

    const groups = new Map();

    students.forEach((student) => {
      groups.set(student._id, {
        student,
        expenses: [],
      });
    });

    visibleExpenses.forEach((expense) => {
      const studentId = expense.userId?._id;
      if (!studentId) return;

      if (!groups.has(studentId)) {
        groups.set(studentId, {
          student: {
            _id: studentId,
            name: expense.userId?.name || 'Unknown Student',
            email: expense.userId?.email || '',
          },
          expenses: [],
        });
      }

      groups.get(studentId).expenses.push(expense);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        totalAmount: group.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [isAdmin, students, visibleExpenses]);

  const handleSaveEvent = async (payload) => {
    try {
      if (eventToEdit) {
        await eventService.updateEvent(eventToEdit._id, payload);
        toast.success('Event updated');
      } else {
        await eventService.createEvent(payload);
        toast.success('Event created');
      }

      setEventToEdit(null);
      fetchCoreData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save event');
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm('Delete this event? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted');
      if (filters.eventId === eventId) {
        setFilters((prev) => ({ ...prev, eventId: '' }));
      }
      fetchCoreData();
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to delete event';

      if (message === 'Cannot delete event with existing expenses') {
        const forceConfirmed = window.confirm(
          'This event has existing expenses. Force delete will permanently remove the event and all linked expenses. Continue?'
        );

        if (!forceConfirmed) return;

        try {
          const { data } = await eventService.deleteEvent(eventId, { force: true });
          toast.success(data?.message || 'Event and linked expenses deleted');
          if (filters.eventId === eventId) {
            setFilters((prev) => ({ ...prev, eventId: '' }));
          }
          fetchCoreData();
        } catch (forceError) {
          toast.error(forceError.response?.data?.message || 'Unable to force delete event');
        }

        return;
      }

      toast.error(message);
    }
  };

  const openCreateEventModal = () => {
    setEventToEdit(null);
    setEventModalOpen(true);
    setDrawerOpen(false);
  };

  const openEditEventModal = (event) => {
    setEventToEdit(event);
    setEventModalOpen(true);
    setDrawerOpen(false);
  };

  const handleCreateExpense = async (payload) => {
    if (isAdmin) {
      toast.error('Admins cannot submit expenses');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('eventId', payload.eventId);
      formData.append('amount', payload.amount);
      formData.append('description', payload.description);
      if (payload.billImage) {
        formData.append('billImage', payload.billImage);
      }

      if (payload.type === 'prepaid') {
        await expenseService.createPrepaid(formData);
      } else {
        await expenseService.createPostpaid(formData);
      }

      toast.success('Expense submitted');
      fetchCoreData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit expense');
      throw error;
    }
  };

  const handleApprove = async (id) => {
    try {
      await expenseService.approve(id);
      toast.success('Expense approved');
      fetchCoreData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await expenseService.reject(id);
      toast.success('Expense rejected');
      fetchCoreData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reject');
    }
  };

  const handleComplete = async (id) => {
    try {
      const formData = new FormData();
      await expenseService.complete(id, formData);
      toast.success('Expense completed');
      fetchCoreData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to complete expense');
    }
  };

  const openCompleteWithBill = (id) => {
    setExpenseToComplete(id);
    setCompleteModalOpen(true);
  };

  const handleCompleteWithBill = async (file) => {
    if (!expenseToComplete || !file) return;

    try {
      const formData = new FormData();
      formData.append('billImage', file);
      await expenseService.complete(expenseToComplete, formData);
      toast.success('Expense completed with bill');
      setCompleteModalOpen(false);
      setExpenseToComplete(null);
      fetchCoreData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to complete expense');
      throw error;
    }
  };

  const totalEventBudget = events.reduce((sum, event) => sum + Number(event.budget || 0), 0);
  const showDrawerLabels = drawerOpen || drawerExpanded;

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_#dff7ff,_#eef2ff_55%,_#fdf4ff)] dark:bg-[radial-gradient(ellipse_at_top,_#082f49,_#0f172a_55%,_#020617)]">
      {isAdmin && drawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu overlay"
        />
      ) : null}

      {isAdmin ? (
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/50 bg-white/70 backdrop-blur-sm transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-950/70 lg:static lg:z-10
            ${drawerExpanded ? 'w-64' : 'w-20'}
            ${drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-slate-200/50 px-4 dark:border-slate-800/50">
            {showDrawerLabels ? (
              <h2 className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-lg font-bold text-transparent dark:from-cyan-400 dark:to-emerald-400">Club OS</h2>
            ) : (
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-sm font-bold text-white shadow-md">
                CO
              </div>
            )}

            {showDrawerLabels && (
              <button
                type="button"
                onClick={() => setDrawerExpanded(false)}
                className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 lg:block"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {!showDrawerLabels && (
            <div className="hidden border-b border-slate-200/50 p-2 dark:border-slate-800/50 lg:flex lg:justify-center">
              <button
                type="button"
                onClick={() => setDrawerExpanded(true)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <nav className="flex-1 space-y-2 p-3">
            <button
              type="button"
              onClick={() => {
                setAdminView('dashboard');
                setDrawerOpen(false);
              }}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${showDrawerLabels ? 'gap-3' : 'justify-center'} ${adminView === 'dashboard' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' : 'text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/50'}`}
              title={!showDrawerLabels ? 'Dashboard' : undefined}
            >
              <LayoutDashboard size={showDrawerLabels ? 18 : 20} />
              {showDrawerLabels ? <span>Dashboard</span> : null}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminView('students');
                setDrawerOpen(false);
              }}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${showDrawerLabels ? 'gap-3' : 'justify-center'} ${adminView === 'students' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' : 'text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/50'}`}
              title={!showDrawerLabels ? 'Students' : undefined}
            >
              <Users size={showDrawerLabels ? 18 : 20} />
              {showDrawerLabels ? <span>Students</span> : null}
            </button>
          </nav>
        </aside>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/50 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-4">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setDrawerOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
                >
                  <Menu size={20} />
                </button>
              ) : null}
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Event Expense Management</h1>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {user?.name} • {isAdmin ? 'Admin' : 'Student'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-rose-500 dark:hover:text-rose-300"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 pb-10 sm:p-6">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Event Budget"
            value={`₹${totalEventBudget.toFixed(2)}`}
            subtext="Flexible budget policy enabled"
            accent="from-emerald-500 to-cyan-500"
          />
          <StatCard
            title="Approved + Completed"
            value={`₹${totals.totalSpent.toFixed(2)}`}
            subtext="Committed spending"
            accent="from-cyan-500 to-sky-600"
          />
          <StatCard
            title="Pending Requests"
            value={`₹${totals.pendingAmount.toFixed(2)}`}
            subtext={`Completed: ₹${totals.completedAmount.toFixed(2)}`}
            accent="from-amber-500 to-orange-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/85">
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && adminView === 'dashboard' ? (
              <button
                type="button"
                onClick={openCreateEventModal}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                <CalendarPlus2 size={16} /> Create Event
              </button>
            ) : null}
            {!isAdmin ? (
              <button
                type="button"
                onClick={() => setExpenseModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <ReceiptText size={16} /> Submit Expense
              </button>
            ) : null}

            <select
              value={filters.eventId}
              onChange={(e) => setFilters((prev) => ({ ...prev, eventId: e.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All Types</option>
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>

            <input
              placeholder="Search description"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="min-w-[220px] flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </section>

        {isAdmin && adminView === 'dashboard' ? (
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/85">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Manage Events</h2>
              <span className="text-sm text-slate-500 dark:text-slate-300">{events.length} total</span>
            </div>
            {!events.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">No events available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-300">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Budget</th>
                      <th className="px-3 py-2 font-medium">Members</th>
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{event.name}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">₹{Number(event.budget || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{event.members?.length || 0}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditEventModal(event)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event._id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {isAdmin && adminView === 'students' ? (
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/85">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Students & Expenses</h2>
              <span className="text-sm text-slate-500 dark:text-slate-300">
                {filters.eventId ? 'Showing filtered expenses by selected event' : 'Showing all events'}
              </span>
            </div>

            {!studentExpenseGroups.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">No students available.</p>
            ) : (
              <div className="space-y-4">
                {studentExpenseGroups.map((group) => (
                  <article
                    key={group.student._id}
                    className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{group.student.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">{group.student.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-300">{group.expenses.length} expense(s)</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">₹{group.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    {!group.expenses.length ? (
                      <p className="text-sm text-slate-500 dark:text-slate-300">No expenses found for current filters.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/70">
                            <tr>
                              <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-200">Event</th>
                              <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-200">Type</th>
                              <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-200">Amount</th>
                              <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-200">Status</th>
                              <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-200">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.expenses.map((expense) => (
                              <tr key={expense._id} className="border-t border-slate-100 dark:border-slate-800">
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-100">{expense.eventId?.name || '-'}</td>
                                <td className="px-3 py-2 capitalize text-slate-700 dark:text-slate-100">{expense.type}</td>
                                <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">₹{Number(expense.amount || 0).toFixed(2)}</td>
                                <td className="px-3 py-2 capitalize text-slate-700 dark:text-slate-100">{expense.status}</td>
                                <td className="max-w-[260px] truncate px-3 py-2 text-slate-700 dark:text-slate-100">{expense.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {adminView !== 'students' ? (
          loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            Loading dashboard...
          </div>
        ) : (
          <ExpenseTable
            expenses={visibleExpenses}
            isAdmin={isAdmin}
            onApprove={handleApprove}
            onReject={handleReject}
            onComplete={handleComplete}
            onCompleteWithBill={openCompleteWithBill}
          />
          )
        ) : null}

        </main>
      </div>

      {!isAdmin ? (
        <ExpenseFormModal
          open={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          onSubmit={handleCreateExpense}
          events={events}
        />
      ) : null}

      <EventFormModal
        open={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false);
          setEventToEdit(null);
        }}
        onSubmit={handleSaveEvent}
        students={students}
        initialEvent={eventToEdit}
      />

      <CompleteExpenseModal
        open={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setExpenseToComplete(null);
        }}
        onSubmit={handleCompleteWithBill}
      />
    </div>
  );
};

export default DashboardPage;
