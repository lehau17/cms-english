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
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Skeleton variant="circular" width={200} height={200} />
        </Box>
      );
    }

    if (isError || !chartData || chartData.length === 0) {
      return (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <DonutLarge sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chưa có dữ liệu phân bố
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ height: 220 }}>
          <PieChartWrapper data={chartData} />
        </Box>
        {/* Legend */}
        <Stack spacing={1} sx={{ mt: 2 }}>
          {chartData.slice(0, 4).map((item) => (
            <Stack
              key={item.name}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: item.color,
                  }}
                />
                <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                  {item.name}
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600}>
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </>
    );
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Phân bố khóa học
          </Typography>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              width: 32,
              height: 32,
            }}
          >
            <PieChartIcon sx={{ fontSize: 18, color: "info.main" }} />
          </Avatar>
        </Stack>
        {!isLoading && total > 0 && (
          <Chip
            label={`Tổng: ${total} khóa học`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default CourseDistributionWidget;
