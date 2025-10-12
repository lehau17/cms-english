import { chartColors } from "@/styles/chartTheme";
import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import CustomTooltip from "./CustomTooltip";

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
}

const PieChartWrapper: React.FC<PieChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill={chartColors.primary}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartWrapper;