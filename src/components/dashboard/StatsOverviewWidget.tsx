import { useExtendedDashboardStats } from '@/hooks/useDashboard';
import {
  AccountBalance,
  Class,
  Groups,
  People,
  School,
  TrendingUp,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";

interface StatItemProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  isLoading?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  isLoading,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Skeleton variant="circular" width={48} height={48} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={36} />
              <Skeleton variant="text" width="50%" height={16} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48,
            }}
          >
            <Icon />
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              noWrap
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ my: 0.5, lineHeight: 1.2 }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <TrendingUp
                  sx={{
                    fontSize: 14,
                    color: trend.value >= 0 ? "success.main" : "error.main",
                  }}
                />
                <Typography
                  variant="caption"
                  color={trend.value >= 0 ? "success.main" : "error.main"}
                  fontWeight={600}
                >
                  {trend.value >= 0 ? "+" : ""}{trend.value}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {trend.label}
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return amount.toLocaleString("vi-VN");
};

const StatsOverviewWidget: React.FC = () => {
  const { data, isLoading } = useExtendedDashboardStats();
  const theme = useTheme();

  const stats: StatItemProps[] = [
    {
      title: "Tổng học viên",
      value: data?.totalStudents ?? 0,
      icon: People,
      color: theme.palette.primary.main,
      trend: { value: 12, label: "vs tháng trước" },
    },
    {
      title: "Giáo viên",
      value: data?.totalTeachers ?? 0,
      icon: School,
      color: "#8b5cf6",
    },
    {
      title: "Khóa học",
      value: data?.totalCourses ?? 0,
      icon: Class,
      color: theme.palette.success.main,
    },
    {
      title: "Lớp đang hoạt động",
      value: `${data?.activeClassrooms ?? 0}`,
      icon: Groups,
      color: theme.palette.warning.main,
      subtitle: `/ ${data?.totalClassrooms ?? 0} tổng lớp`,
    },
    {
      title: "Tổng doanh thu",
      value: `${formatCurrency(data?.totalRevenue ?? 0)}đ`,
      icon: AccountBalance,
      color: "#059669",
      trend: { value: 8.5, label: "vs tháng trước" },
    },
    {
      title: "Doanh thu tháng này",
      value: `${formatCurrency(data?.revenueThisMonth ?? 0)}đ`,
      icon: TrendingUp,
      color: "#0891b2",
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={stat.title}>
          <StatItem {...stat} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsOverviewWidget;
