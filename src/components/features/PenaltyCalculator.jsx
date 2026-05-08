import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { PENALTY_RULES } from '../../utils/penaltyRules';

export default function PenaltyCalculator({ licenseType, daysLeft }) {
  const rule = PENALTY_RULES[licenseType];
  if (!rule) return null;

  const daysOverdue = daysLeft !== null && daysLeft < 0 ? Math.abs(daysLeft) : 0;
  const isOverdue = daysOverdue > 0;

  const getCurrentSlab = (days) => {
    if (days <= 0) return null;
    let slab = rule.slabs[0];
    for (const s of rule.slabs) {
      if (days >= s.days_overdue) slab = s;
    }
    return slab;
  };

  const currentSlab = getCurrentSlab(daysOverdue);
  const maxFine = rule.slabs[rule.slabs.length - 1].fine;
  const totalSlabs = rule.slabs.length;

  return (
    <div className="space-y-6">
      {/* Current Penalty */}
      {isOverdue && currentSlab && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-5"
        >
          <div className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-1">Current Penalty</div>
          <div className="text-4xl font-black text-red-700">{formatCurrency(currentSlab.fine)}</div>
          <div className="text-sm text-red-600 mt-2 font-medium">{currentSlab.consequence}</div>
        </motion.div>
      )}

      {!isOverdue && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="text-sm font-semibold text-amber-700 mb-1">Renew on time to avoid these penalties</div>
          <div className="text-2xl font-bold text-amber-700">Renew before expiry → ₹0 penalty</div>
        </div>
      )}

      {/* Timeline Bar */}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Penalty Escalation Timeline</div>
        <div className="relative">
          {/* Track */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            {rule.slabs.map((slab, i) => (
              <div
                key={i}
                className="h-full flex-1 border-r border-white last:border-0"
                style={{
                  background: i === 0 ? '#FCA5A5' : i === 1 ? '#F87171' : i === 2 ? '#EF4444' : i === 3 ? '#DC2626' : '#991B1B'
                }}
              />
            ))}
          </div>

          {/* Position marker if overdue */}
          {isOverdue && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                left: `${Math.min((daysOverdue / rule.slabs[rule.slabs.length - 1].days_overdue) * 100, 95)}%`
              }}
            >
              <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-lg pulse-urgent" />
            </motion.div>
          )}
        </div>

        {/* Slab labels */}
        <div className="flex justify-between mt-3">
          {rule.slabs.map((slab, i) => (
            <div key={i} className="flex flex-col items-center text-center" style={{ width: `${100 / rule.slabs.length}%` }}>
              <span className="text-xs font-bold text-gray-800">{formatCurrency(slab.fine)}</span>
              <span className="text-[10px] text-gray-400">{slab.days_overdue}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projection Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[7, 30, 90].map((days) => {
          const slab = getCurrentSlab(Math.max(daysOverdue, days));
          return (
            <div key={days} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="text-xs text-gray-500 font-medium mb-1">In {days} days</div>
              <div className="text-base font-black text-red-600">{slab ? formatCurrency(slab.fine) : '₹0'}</div>
            </div>
          );
        })}
      </div>

      {isOverdue && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Every day costs approximately <span className="font-bold text-red-600">
            {formatCurrency(rule.slabs[0].fine / rule.slabs[0].days_overdue)}/day
          </span> more
        </div>
      )}

      {/* Legal Reference */}
      <div className="text-xs text-gray-400 border-t pt-3">
        Legal ref: {rule.legal_reference}
      </div>
    </div>
  );
}
