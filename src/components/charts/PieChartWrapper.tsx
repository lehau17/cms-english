import { chartColors } from "@/styles/chartTheme";
import * as React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import CustomTooltip from "./CustomTooltip";

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  outerRadius?: number;
}

const PieChartWrapper: React.FC<PieChartProps> = ({ data, height = 300, outerRadius = 100 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={outerRadius * 0.6} // Donut style
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || chartColors.primary} />
          ))}
        </Pie>
        {/* Optional: Add simplified legend if needed, though widgets usually have their own */}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartWrapper;