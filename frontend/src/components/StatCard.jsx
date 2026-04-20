const StatCard = ({ title, value, subtext, accent = 'from-cyan-500 to-blue-600' }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      {subtext ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{subtext}</p> : null}
    </div>
  );
};

export default StatCard;
