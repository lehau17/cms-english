import CustomTooltip from '@/components/charts/CustomTooltip';
import { chartColors, chartStyle } from '@/styles/chartTheme';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, ShowChart, Timeline } from '@mui/icons-material';
import { alpha, Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LineConfig {
  dataKey: string;
  color: string;
  strokeWidth?: number;
}

interface BarConfig {
  dataKey: string;
  color: string;
}

interface AreaConfig {
  dataKey: string;
  color: string;
  fillOpacity?: number;
}

interface ChartConfig {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'radar' | 'scatter';
  title: string;
  data: any[];
  config: {
    xLabel?: string;
    yLabel?: string;
    xAxisKey?: string;
    colors?: string[];
    responsive?: boolean;
    legend?: boolean;
    lines?: LineConfig[];
    bars?: BarConfig[];
    areas?: AreaConfig[];
  };
}

interface ChartRendererProps {
  chart: ChartConfig;
}

// Generate premium colors from the theme
const PREMIUM_COLORS = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
  chartColors.accent1,
  chartColors.accent2,
];

const getDataKeys = (data: any[]): string[] => {
  if (!data || data.length === 0) return ['value'];
  const firstItem = data[0];
  return Object.keys(firstItem).filter(key => key !== 'name' && typeof firstItem[key] === 'number');
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({ chart }) => {
  const { chartType, title, data, config } = chart;
  const colors = config.colors || PREMIUM_COLORS;
  const xAxisKey = config.xAxisKey || 'name';
  const theme = useTheme();

  // Helper to render gradients for Area/Line charts
  const renderGradients = (keys: string[]) => (
    <defs>
      {keys.map((key, index) => {
        const color = colors[index % colors.length];
        return (
          <linearGradient key={`gradient-${key}`} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        );
      })}
    </defs>
  );

  const getIcon = () => {
    switch (chartType) {
      case 'bar': return <BarChartIcon sx={{ color: chartColors.primary }} />;
      case 'pie': return <PieChartIcon sx={{ color: chartColors.secondary }} />;
      case 'radar': return <Timeline sx={{ color: chartColors.accent1 }} />;
      default: return <ShowChart sx={{ color: chartColors.tertiary }} />;
    }
  };

  const renderChart = () => {
    const commonGrid = <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />;

    // Custom X-Axis with premium styling
    const renderXAxis = () => (
      <XAxis
        dataKey={xAxisKey}
        tick={chartStyle.axis.tick}
        axisLine={false}
        tickLine={false}
        dy={10}
        label={config.xLabel ? { value: config.xLabel, position: 'insideBottom', offset: -5, ...chartStyle.axis.label } : undefined}
      />
    );

    // Custom Y-Axis with premium styling
    const renderYAxis = () => (
      <YAxis
        tick={chartStyle.axis.tick}
        axisLine={false}
        tickLine={false}
        dx={-10}
        label={config.yLabel ? { value: config.yLabel, angle: -90, position: 'insideLeft', ...chartStyle.axis.label } : undefined}
      />
    );

    switch (chartType) {
      case 'bar': {
        const bars = config.bars || getDataKeys(data).map((key, i) => ({
          dataKey: key,
          color: colors[i % colors.length],
        }));

        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              {commonGrid}
              {renderXAxis()}
              {renderYAxis()}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(chartColors.grid, 0.3) }} />
              <Legend wrapperStyle={chartStyle.legend.textStyle} />
              {bars.map((bar, index) => (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  fill={bar.color || colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'line':
      case 'area': {
        // We use AreaChart for both to get gradients. 
        // If it's strictly 'line' user asked for, we can lower opacity or keep it consistent.
        // Let's unify on AreaChart with gradients as per plan.
        const keys = config.lines?.map(l => l.dataKey) || config.areas?.map(a => a.dataKey) || getDataKeys(data);
        const activeConfig = config.lines || config.areas || keys.map((key, i) => ({
          dataKey: key,
          color: colors[i % colors.length]
        }));

        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              {renderGradients(keys)}
              {commonGrid}
              {renderXAxis()}
              {renderYAxis()}
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartColors.grid, strokeWidth: 1 }} />
              <Legend wrapperStyle={chartStyle.legend.textStyle} iconType="circle" />
              {activeConfig.map((item: any, index: number) => (
                <Area
                  key={item.dataKey}
                  type="monotone"
                  dataKey={item.dataKey}
                  stroke={item.color || colors[index % colors.length]}
                  fill={`url(#color-${item.dataKey})`}
                  strokeWidth={3}
                  fillOpacity={1}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  dot={{ r: 0 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80} // Donut style
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={chartStyle.legend.textStyle} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke={chartColors.grid} />
              <PolarAngleAxis dataKey="name" tick={{ ...chartStyle.axis.tick, fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar
                name={title}
                dataKey="value"
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={chartStyle.legend.textStyle} />
            </RadarChart>
          </ResponsiveContainer >
        );

      default:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height={320}>
            <Typography color="error">Unsupported chart type: {chartType}</Typography>
          </Box>
        );
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: alpha(chartColors.grid, 0.6),
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: alpha(chartColors.grid, 0.6),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: alpha(chartColors.primary, 0.02)
        }}
      >
        {getIcon()}
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ p: 3 }}>
        {renderChart()}
      </CardContent>
      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: alpha(chartColors.grid, 0.3),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {chartType.toUpperCase()} CHART • {data.length} DATA POINTS
        </Typography>
      </Box>
    </Card>
  );
};
