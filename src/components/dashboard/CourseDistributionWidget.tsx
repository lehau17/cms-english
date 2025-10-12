import PieChartWrapper from "@/components/charts/PieChartWrapper";
import { useCourseDistribution } from "@/hooks/useDashboard";
import { chartColors } from "@/styles/chartTheme";
import { Alert, Card, CardContent, Skeleton, Typography } from "@mui/material";
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
  const { data, isLoading, isError, error } = useCourseDistribution();

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      name: item.label,
      value: item.value,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
    }));
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton variant="rectangular" width="100%" height={300} />;
    }

    if (isError) {
      return <Alert severity="error">Không thể tải dữ liệu biểu đồ. {error?.message}</Alert>;
    }

    if (!chartData || chartData.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
          Chưa có dữ liệu phân bố khóa học.
        </Typography>
      );
    }

    return <PieChartWrapper data={chartData} />;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Phân bố khóa học
        </Typography>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default CourseDistributionWidget;