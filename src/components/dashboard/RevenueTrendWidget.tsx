import LineChartWrapper from "@/components/charts/LineChartWrapper";
import { useRevenueTrend } from "@/hooks/useDashboard";
import { chartColors } from "@/styles/chartTheme";
import { AccountBalance, TrendingDown, TrendingUp } from "@mui/icons-material";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";

const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return amount.toLocaleString("vi-VN");
};

const RevenueTrendWidget: React.FC = () => {
  const { data, isLoading, isError, error } = useRevenueTrend();
  const theme = useTheme();

  const totalRevenue = React.useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

  const trend = React.useMemo(() => {
    if (!data || data.length < 2) return 0;
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((s, i) => s + i.amount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, i) => s + i.amount, 0) / secondHalf.length;
    if (firstAvg === 0) return secondAvg > 0 ? 100 : 0;
    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  }, [data]);

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      amount: item.amount,
    }));
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 1 }} />;
    }

    if (isError) {
      return <Alert severity="error">Không thể tải dữ liệu doanh thu. {error?.message}</Alert>;
    }

    if (!data || data.length === 0 || totalRevenue === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 280,
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <AccountBalance sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chưa có dữ liệu doanh thu trong 7 ngày qua
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: 280 }}>
        <LineChartWrapper
          data={chartData}
          xAxisDataKey="date"
          lines={[{ dataKey: "amount", name: "Doanh thu (VND)", color: chartColors.primary }]}
        />
      </Box>
    );
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Doanh thu 7 ngày qua
            </Typography>
            {!isLoading && (
              <Stack direction="row" spacing={2} alignItems="baseline">
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {formatCurrency(totalRevenue)} VND
                </Typography>
                {trend !== 0 && (
                  <Chip
                    icon={trend > 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                    label={`${trend > 0 ? "+" : ""}${trend}%`}
                    size="small"
                    color={trend > 0 ? "success" : "error"}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          >
            <AccountBalance />
          </Avatar>
        </Stack>

        {/* Chart */}
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RevenueTrendWidget;
