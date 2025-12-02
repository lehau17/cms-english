import { CheckCircle, Clock, MessageSquare, Settings, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

import { AgentStats } from '../../types';
import { Card, CardHeader } from '../ui';

// ===================== STATS PANEL (Quick Overview) =====================
interface StatsPanelProps {
  stats: AgentStats;
  language: string;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, language }) => {
  return (
    <Card>
      <CardHeader title="Quick Stats" icon={<TrendingUp className="h-5 w-5" />} />

      <div className="space-y-3">
        <StatRow label="Total Chats" value={stats.totalChats.toString()} />
        <StatRow
          label="Avg Confidence"
          value={`${stats.totalChats > 0 ? Math.round(stats.avgConfidence * 100) : 0}%`}
        />
        <StatRow label="Language" value={language.toUpperCase()} />
      </div>
    </Card>
  );
};

const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

// ===================== TOOLS ANALYTICS =====================
interface ToolsAnalyticsProps {
  stats: AgentStats;
}

export const ToolsAnalytics: React.FC<ToolsAnalyticsProps> = ({ stats }) => {
  const tools = Object.entries(stats.toolsUsed);

  return (
    <Card>
      <CardHeader
        title="Tool Usage Analytics"
        subtitle="Track which AI tools are being used"
        icon={<Settings className="h-5 w-5" />}
      />

      {tools.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {tools.map(([tool, count]) => (
            <div key={tool} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tool}</p>
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Settings className="h-12 w-12" />}
          title="No tool usage data yet"
          subtitle="Start chatting to see tool analytics"
        />
      )}
    </Card>
  );
};

// ===================== PERFORMANCE ANALYTICS =====================
interface PerformanceAnalyticsProps {
  stats: AgentStats;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ stats }) => {
  const avgResponseTime =
    stats.totalChats > 0 ? Math.round(stats.totalProcessingTime / stats.totalChats) : 0;

  return (
    <Card>
      <CardHeader
        title="Performance Metrics"
        subtitle="Monitor AI response quality"
        icon={<TrendingUp className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Chats"
          value={stats.totalChats.toString()}
          icon={<MessageSquare className="h-8 w-8 text-blue-200" />}
          gradient="from-blue-500 to-blue-600"
          labelColor="text-blue-100"
        />
        <MetricCard
          label="Avg Confidence"
          value={`${Math.round(stats.avgConfidence * 100)}%`}
          icon={<CheckCircle className="h-8 w-8 text-green-200" />}
          gradient="from-green-500 to-green-600"
          labelColor="text-green-100"
        />
        <MetricCard
          label="Avg Response Time"
          value={`${avgResponseTime}ms`}
          icon={<Clock className="h-8 w-8 text-purple-200" />}
          gradient="from-purple-500 to-purple-600"
          labelColor="text-purple-100"
        />
      </div>
    </Card>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  labelColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, gradient, labelColor }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-lg p-4 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={labelColor}>{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

// ===================== EMPTY STATE =====================
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <div className="text-center text-gray-500 py-8">
    <div className="text-gray-300 flex justify-center mb-4">{icon}</div>
    <p className="font-medium">{title}</p>
    <p className="text-sm">{subtitle}</p>
  </div>
);
