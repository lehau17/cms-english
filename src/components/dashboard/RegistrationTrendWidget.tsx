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
      return <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />;
    }

    if (isError || !data || data.length === 0) {
      return (
        <Box
          sx={{
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.grey[500], 0.05),
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Chưa có dữ liệu
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: 120 }}>
        <LineChartWrapper
          data={data}
          xAxisDataKey="date"
          lines={[{ dataKey: "count", name: "Đăng ký", color: chartColors.secondary }]}
        />
      </Box>
    );
  };

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Đăng ký mới
            </Typography>
            {!isLoading && totalRegistrations > 0 && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="h5" fontWeight={700} color="secondary.main">
                  {totalRegistrations}
                </Typography>
                <Chip
                  icon={<TrendingUp sx={{ fontSize: 12 }} />}
                  label="7 ngày"
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.65rem" }}
                />
              </Stack>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              width: 32,
              height: 32,
            }}
          >
            <PersonAdd sx={{ fontSize: 18, color: "secondary.main" }} />
          </Avatar>
        </Stack>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RegistrationTrendWidget;
