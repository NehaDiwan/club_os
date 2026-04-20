import { Check, CircleCheckBig, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ExpenseTable = ({
  expenses,
  isAdmin,
  onApprove,
  onReject,
  onComplete,
  onCompleteWithBill,
  onStudentCompletePrepaid,
}) => {
  if (!expenses.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        No expenses found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-200">User</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-200">Event</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-200">Type</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-200">Amount</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-200">Description</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-200">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-200">Bill</th>
              {isAdmin || onStudentCompletePrepaid ? (
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-200">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-100">{expense.userId?.name || 'You'}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-100">{expense.eventId?.name || '-'}</td>
                <td className="px-4 py-3 capitalize text-slate-700 dark:text-slate-100">{expense.type}</td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">₹{expense.amount.toFixed(2)}</td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-600 dark:text-slate-300">{expense.description}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={expense.status} />
                </td>
                <td className="px-4 py-3">
                  {expense.billImage ? (
                    <a
                      href={expense.billImage}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-600 hover:underline dark:text-cyan-300"
                    >
                      View Bill
                    </a>
                  ) : (
                    <span className="text-slate-400">Not uploaded</span>
                  )}
                </td>
                {isAdmin || onStudentCompletePrepaid ? (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {expense.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(expense._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(expense._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                          >
                            <X size={14} /> Reject
                          </button>
                        </>
                      ) : null}
                      {expense.status === 'approved' ? (
                        expense.type === 'prepaid' ? (
                          <button
                            type="button"
                            onClick={() =>
                              isAdmin
                                ? onCompleteWithBill(expense._id)
                                : onStudentCompletePrepaid(expense._id)
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-2 py-1 text-xs font-semibold text-white hover:bg-cyan-600"
                          >
                            <CircleCheckBig size={14} /> Complete + Bill
                          </button>
                        ) : (
                          isAdmin ? <button
                            type="button"
                            onClick={() => onComplete(expense._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-2 py-1 text-xs font-semibold text-white hover:bg-cyan-600"
                          >
                            <CircleCheckBig size={14} /> Complete
                          </button> : null
                        )
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;
