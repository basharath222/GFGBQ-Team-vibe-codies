
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  const data = [
    { name: 'Trust', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s >= 80) return '#22d3ee'; // Cyan
    if (s >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const mainColor = getColor(score);

  return (
    <div className="relative w-full aspect-square max-w-[200px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            startAngle={90}
            endAngle={450}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={mainColor} />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-1">Trust Score</span>
      </div>
    </div>
  );
};

export default ScoreChart;
