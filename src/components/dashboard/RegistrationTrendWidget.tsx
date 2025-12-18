import LineChartWrapper from "@/components/charts/LineChartWrapper";
import { useRegistrationTrend } from "@/hooks/useDashboard";
import { chartColors } from "@/styles/chartTheme";
import { PersonAdd, TrendingUp } from "@mui/icons-material";
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

const RegistrationTrendWidget: React.FC = () => {
  const { data, isLoading, isError } = useRegistrationTrend();
  const theme = useTheme();

  const totalRegistrations = React.useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton variant="rectangular" width="100%" height={320} sx={{ borderRadius: 1 }} />;
    }

    if (isError || !data || data.length === 0) {
      return (
        <Box
          sx={{
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Chưa có dữ liệu
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: 320 }}>
        <LineChartWrapper
          data={data}
          xAxisDataKey="date"
          lines={[{ dataKey: "count", name: "Đăng ký", color: chartColors.secondary }]}
          height={320}
        />
      </Box>
    );
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Đăng ký mới
            </Typography>
            {!isLoading && totalRegistrations > 0 && (
              <Chip
                icon={<TrendingUp sx={{ fontSize: 10 }} />}
                label={`${totalRegistrations} (7 ngày)`}
                size="small"
                color="secondary"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
          </Stack>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              width: 28,
              height: 28,
            }}
          >
            <PersonAdd sx={{ fontSize: 16, color: "secondary.main" }} />
          </Avatar>
        </Stack>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RegistrationTrendWidget;
