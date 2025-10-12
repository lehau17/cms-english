import LineChartWrapper from "@/components/charts/LineChartWrapper";
import { useRegistrationTrend } from "@/hooks/useDashboard";
import { chartColors } from "@/styles/chartTheme";
import { MoreVert } from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from "@mui/material";
import * as React from "react";

const RegistrationTrendWidget: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { data, isLoading, isError, error } = useRegistrationTrend();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton variant="rectangular" width="100%" height={300} />;
    }

    if (isError) {
      return <Alert severity="error">Không thể tải dữ liệu biểu đồ. {error?.message}</Alert>;
    }

    if (!data || data.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
          Chưa có dữ liệu đăng ký gần đây.
        </Typography>
      );
    }

    return (
      <LineChartWrapper
        data={data}
        xAxisDataKey="date"
        lines={[{ dataKey: "count", name: "Số học viên", color: chartColors.secondary }]}
      />
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Học viên đăng ký (7 ngày)</Typography>
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClose}>Xuất báo cáo</MenuItem>
            <MenuItem onClick={handleMenuClose}>Xem chi tiết</MenuItem>
          </Menu>
        </Box>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RegistrationTrendWidget;