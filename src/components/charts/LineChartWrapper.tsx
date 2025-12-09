import { chartColors, chartStyle } from "@/styles/chartTheme";
import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTooltip from "./CustomTooltip";

interface LineChartProps {
  data: any[];
  lines: { dataKey: string; name: string; color: string }[];
  xAxisDataKey: string;
  height?: number;
}

const LineChartWrapper: React.FC<LineChartProps> = ({ data, lines, xAxisDataKey, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis dataKey={xAxisDataKey} tick={chartStyle.axis.tick} />
        <YAxis tick={chartStyle.axis.tick} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={chartStyle.legend.textStyle} />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartWrapper;