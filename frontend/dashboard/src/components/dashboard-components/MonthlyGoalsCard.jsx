import React from 'react';
import { motion } from 'framer-motion';

const MonthlyGoalsCard = ({ revenue, totalOrders }) => {
  // Tính toán % thực tế dựa trên mục tiêu giả định (Revenue target: 60k, Orders target: 200)
  const revPercentage = Math.min(Math.round((revenue / 60000) * 100), 100) || 0;
  const orderPercentage = Math.min(Math.round((totalOrders / 200) * 100), 100) || 0;

  const goals = [
    { title: 'Monthly Revenue', target: '$60,000', current: `$${revenue.toLocaleString()}`, percentage: revPercentage, color: 'bg-orange-500' },
    { title: 'Active Orders Target', target: '200', current: totalOrders, percentage: orderPercentage, color: 'bg-[#77cd3af2]' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-2">Monthly Goals</h3>
      <p className="text-xs text-gray-400 mb-6">Track progress toward store targets</p>
      <div className="space-y-6">
        {goals.map((goal, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-700">{goal.title}</p>
              <p className="text-xs font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-md">{goal.percentage}%</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${goal.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`${goal.color} h-2.5 rounded-full`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] mt-2 font-medium text-gray-400">
              <span className="text-gray-600 font-bold">{goal.current}</span>
              <span>Target: {goal.target}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MonthlyGoalsCard;