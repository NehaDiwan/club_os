import { useEffect, useState } from 'react';
import Modal from './Modal';

const EventFormModal = ({ open, onClose, onSubmit, students, initialEvent = null }) => {
  const [form, setForm] = useState({ name: '', date: '', budget: '' });
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (!open) return;

    if (initialEvent) {
      const formattedDate = initialEvent.date
        ? new Date(initialEvent.date).toISOString().slice(0, 10)
        : '';

      setForm({
        name: initialEvent.name || '',
        date: formattedDate,
        budget: String(initialEvent.budget ?? ''),
      });
      setSelectedMembers((initialEvent.members || []).map((member) => member._id));
      return;
    }

    setForm({ name: '', date: '', budget: '' });
    setSelectedMembers([]);
  }, [initialEvent, open]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMemberToggle = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((memberId) => memberId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      budget: Number(form.budget),
      memberIds: selectedMembers,
    });
    setForm({ name: '', date: '', budget: '' });
    setSelectedMembers([]);
    onClose();
  };

  const isEditing = Boolean(initialEvent);

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Event' : 'Create Event'}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Event Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Budget</label>
            <input
              type="number"
              min="0"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Add Students</p>
          <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            {!students.length ? (
              <p className="text-sm text-slate-500">No student users available yet.</p>
            ) : (
              students.map((student) => (
                <label key={student._id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(student._id)}
                    onChange={() => handleMemberToggle(student._id)}
                  />
                  {student.name} ({student.email})
                </label>
              ))
            )}
          </div>
        </div>
        <button type="submit" className="w-full rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700">
          {isEditing ? 'Update Event' : 'Create Event'}
        </button>
      </form>
    </Modal>
  );
};

export default EventFormModal;
