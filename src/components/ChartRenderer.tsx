import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Helper to extract dataKeys from data
const getDataKeys = (data: any[]): string[] => {
  if (!data || data.length === 0) return ['value'];
  const firstItem = data[0];
  return Object.keys(firstItem).filter(key => key !== 'name' && typeof firstItem[key] === 'number');
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({ chart }) => {
  const { chartType, title, data, config } = chart;
  const colors = config.colors || COLORS;
  const xAxisKey = config.xAxisKey || 'name';

  // Common chart props
  const commonProps = {
    width: 500,
    height: 300,
    data,
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar': {
        // Use config.bars if provided, otherwise auto-detect from data
        const bars = config.bars || getDataKeys(data).map((key, i) => ({
          dataKey: key,
          color: colors[i % colors.length],
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} label={{ value: config.xLabel, position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: config.yLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {bars.map((bar, index) => (
                <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.color || colors[index % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'line': {
        // Use config.lines if provided, otherwise auto-detect from data
        const lines = config.lines || getDataKeys(data).map((key, i) => ({
          dataKey: key,
          color: colors[i % colors.length],
          strokeWidth: 2,
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} label={{ value: config.xLabel, position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: config.yLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {lines.map((line, index) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color || colors[index % colors.length]}
                  strokeWidth={line.strokeWidth || 2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      }

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area': {
        // Use config.areas if provided, otherwise auto-detect from data
        const areas = config.areas || getDataKeys(data).map((key, i) => ({
          dataKey: key,
          color: colors[i % colors.length],
          fillOpacity: 0.6,
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} label={{ value: config.xLabel, position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: config.yLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {areas.map((area, index) => (
                <Area
                  key={area.dataKey}
                  type="monotone"
                  dataKey={area.dataKey}
                  stroke={area.color || colors[index % colors.length]}
                  fill={area.color || colors[index % colors.length]}
                  fillOpacity={area.fillOpacity || 0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart {...commonProps}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar name="Value" dataKey="value" stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-red-500">Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-sm border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {title}
      </h3>
      <div className="bg-white rounded-lg p-4">
        {renderChart()}
      </div>
      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span className="capitalize">{chartType} chart - {data.length} data points</span>
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Interactive</span>
      </div>
    </div>
  );
};
