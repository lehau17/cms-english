import PieChartWrapper from "@/components/charts/PieChartWrapper";
import { useCourseDistribution } from "@/hooks/useDashboard";
import { chartColors } from "@/styles/chartTheme";
import { DonutLarge, PieChart as PieChartIcon } from "@mui/icons-material";
import {
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

const PIE_CHART_COLORS = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
  chartColors.accent1,
  chartColors.accent2,
];

const CourseDistributionWidget: React.FC = () => {
  const { data, isLoading, isError } = useCourseDistribution();
  const theme = useTheme();

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      name: item.label,
      value: item.value,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] || chartColors.primary,
    }));
  }, [data]);

  const total = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={160} height={160} />
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
        </Stack>
      );
    }

    if (isError || !chartData || chartData.length === 0) {
      return (
        <Box
          sx={{
            py: 3,
            textAlign: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <DonutLarge sx={{ fontSize: 40, color: "text.disabled", mb: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            Chưa có dữ liệu phân bố
          </Typography>
        </Box>
      );
    }

    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ height: 160, width: 160, flexShrink: 0 }}>
          <PieChartWrapper data={chartData} height={160} outerRadius={70} />
        </Box>
        {/* Legend */}
        <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
          {chartData.slice(0, 4).map((item) => (
            <Stack
              key={item.name}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" noWrap sx={{ maxWidth: 100 }}>
                  {item.name}
                </Typography>
              </Stack>
              <Typography variant="caption" fontWeight={600}>
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    );
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Phân bố khóa học
            </Typography>
            {!isLoading && total > 0 && (
              <Chip
                label={`${total}`}
                size="small"
                color="info"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
          </Stack>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              width: 28,
              height: 28,
            }}
          >
            <PieChartIcon sx={{ fontSize: 16, color: "info.main" }} />
          </Avatar>
        </Stack>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default CourseDistributionWidget;
