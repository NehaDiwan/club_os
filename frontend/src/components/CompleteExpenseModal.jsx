import { useState } from 'react';
import Modal from './Modal';

const CompleteExpenseModal = ({ open, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(file);
    setFile(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload Final Bill and Complete">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-cyan-500 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-1 file:text-white focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          required
        />
        <button type="submit" className="w-full rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700">
          Complete Expense
        </button>
      </form>
    </Modal>
  );
};

export default CompleteExpenseModal;
