import { useState } from 'react';
import Modal from './Modal';

const ExpenseFormModal = ({ open, onClose, onSubmit, events }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'postpaid',
    eventId: '',
    amount: '',
    description: '',
    billImage: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === 'type' && value === 'prepaid') {
        return { ...prev, type: value, billImage: null };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleFile = (e) => {
    setForm((prev) => ({ ...prev, billImage: e.target.files?.[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(form);
      setForm({
        type: 'postpaid',
        eventId: '',
        amount: '',
        description: '',
        billImage: null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Expense">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="postpaid">Postpaid</option>
              <option value="prepaid">Prepaid</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Event</label>
            <select
              name="eventId"
              value={form.eventId}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            >
              <option value="">Select event</option>
              {(events || []).map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Bill Upload</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFile}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-1 file:text-white focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required={form.type === 'postpaid'}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </Modal>
  );
};

export default ExpenseFormModal;
