import { useExtendedDashboardStats } from "@/hooks/useDashboard";
import {
  AccountBalance,
  Assignment,
  CalendarMonth,
  CheckCircle,
  Class,
  Groups,
  People,
  School,
  SupervisorAccount,
  TrendingUp,
} from "@mui/icons-material";
import { Alert, Avatar, Box, Card, CardContent, Grid, Skeleton, Typography } from "@mui/material";
import * as React from "react";

type StatCardData = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
};

const StatCard: React.FC<{ card: StatCardData; isLoading?: boolean }> = ({ card, isLoading }) => {
  if (isLoading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton variant="text" width={60} height={32} sx={{ mt: 0.5 }} />
              <Skeleton variant="text" width={100} height={14} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton variant="circular" width={44} height={44} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              color="textSecondary"
              variant="caption"
              sx={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              {card.title}
            </Typography>
            <Typography
              variant="h5"
              component="div"
              sx={{ mt: 0.5, fontWeight: 600, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
            >
              {card.value}
            </Typography>
            {card.subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.7rem" }}>
                {card.subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: card.color, width: 44, height: 44, flexShrink: 0 }}>
            <card.icon sx={{ fontSize: "1.25rem" }} />
          </Avatar>
        </Box>
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
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString("vi-VN");
};

const ExtendedStatsWidget: React.FC = () => {
  const { data, isLoading, isError, error } = useExtendedDashboardStats();

  if (isError) {
    return <Alert severity="error">Không thể tải dữ liệu thống kê. {error?.message}</Alert>;
  }

  const statCards: StatCardData[] = [
    {
      title: "Tổng học viên",
      value: data?.totalStudents ?? 0,
      icon: People,
      color: "#3b82f6",
    },
    {
      title: "Giáo viên",
      value: data?.totalTeachers ?? 0,
      icon: School,
      color: "#8b5cf6",
    },
    {
      title: "Phụ huynh",
      value: data?.totalParents ?? 0,
      icon: SupervisorAccount,
      color: "#ec4899",
    },
    {
      title: "Khóa học",
      value: data?.totalCourses ?? 0,
      icon: Class,
      color: "#10b981",
    },
    {
      title: "Lớp học",
      value: `${data?.activeClassrooms ?? 0}/${data?.totalClassrooms ?? 0}`,
      icon: Groups,
      color: "#f59e0b",
      subtitle: "Đang hoạt động / Tổng",
    },
    {
      title: "Tổng doanh thu",
      value: formatCurrency(data?.totalRevenue ?? 0),
      icon: AccountBalance,
      color: "#059669",
      subtitle: "VND",
    },
    {
      title: "Doanh thu tháng",
      value: formatCurrency(data?.revenueThisMonth ?? 0),
      icon: CalendarMonth,
      color: "#0891b2",
      subtitle: "Tháng này",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: `${(data?.averageCourseCompletionRate ?? 0).toFixed(1)}%`,
      icon: CheckCircle,
      color: "#22c55e",
      subtitle: "Khóa học TB",
    },
    {
      title: "Bài học",
      value: data?.totalLessons ?? 0,
      icon: TrendingUp,
      color: "#6366f1",
    },
    {
      title: "Hoạt động",
      value: data?.totalActivities ?? 0,
      icon: Assignment,
      color: "#f97316",
    },
    {
      title: "Chờ chấm bài",
      value: data?.pendingSubmissions ?? 0,
      icon: Assignment,
      color: data?.pendingSubmissions && data.pendingSubmissions > 10 ? "#ef4444" : "#64748b",
      subtitle: data?.pendingSubmissions && data.pendingSubmissions > 10 ? "Cần xử lý!" : undefined,
    },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map((card, index) => (
        <Grid item xs={6} sm={4} md={3} lg={2.4} key={card.title}>
          <StatCard card={card} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ExtendedStatsWidget;
