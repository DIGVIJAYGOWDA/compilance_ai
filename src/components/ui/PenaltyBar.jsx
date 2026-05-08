import { motion } from 'framer-motion';

export default function PenaltyBar({ currentFine, projections }) {
  // Combine current with projections for rendering the timeline
  // Assuming projections is sorted [7d, 30d, 90d]
  const stages = [
    { label: 'Current', fine: currentFine, active: true },
    { label: '7 Days', fine: projections?.[0]?.fine || 0, active: false },
    { label: '30 Days', fine: projections?.[1]?.fine || 0, active: false },
    { label: '90 Days', fine: projections?.[2]?.fine || 0, active: false },
  ];

  return (
    <div className="w-full mt-4">
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden flex">
        {/* Render segmented bar based on active stage */}
        <motion.div 
          className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '25%' }} // Assuming we show the first segment active always if overdue
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium px-1">
        {stages.map((stage, idx) => (
          <div key={idx} className={`flex flex-col items-center ${stage.active ? 'text-red-600 font-bold' : ''}`}>
            <span>{stage.label}</span>
            <span>₹{stage.fine.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
