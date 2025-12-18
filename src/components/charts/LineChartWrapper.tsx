import { chartColors, chartStyle } from "@/styles/chartTheme";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((line, index) => (
            <linearGradient key={`gradient-${line.dataKey}`} id={`color-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis
          dataKey={xAxisDataKey}
          tick={chartStyle.axis.tick}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tick={chartStyle.axis.tick}
          axisLine={false}
          tickLine={false}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartColors.grid, strokeWidth: 1 }} />
        <Legend wrapperStyle={chartStyle.legend.textStyle} iconType="circle" />
        {lines.map((line) => (
          <Area
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={3}
            fill={`url(#color-${line.dataKey})`}
            fillOpacity={1}
            activeDot={{ r: 6, strokeWidth: 0 }}
            dot={{ r: 0, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LineChartWrapper;