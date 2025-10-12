import { useDashboardStats } from "@/hooks/useDashboard";
import { Book, LocalActivity, People, School } from "@mui/icons-material";
import { Alert, Avatar, Box, Card, CardContent, Grid, Skeleton, Typography } from "@mui/material";
import * as React from "react";

/* ====================== Types ====================== */
type StatCardData = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
};

/* ====================== Component ====================== */
const StatCard: React.FC<{ card: StatCardData }> = ({ card }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="subtitle2">
            {card.title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {card.value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: card.color, width: 56, height: 56 }}>
          <card.icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const StatsCardsWidget: React.FC = () => {
  const { data, isLoading, isError, error } = useDashboardStats();

  if (isError) {
    return <Alert severity="error">Không thể tải dữ liệu thống kê. {error?.message}</Alert>;
  }

  const statCards: StatCardData[] = [
    { title: "Tổng học viên", value: data?.totalStudents ?? 0, icon: People, color: "primary.main" },
    { title: "Tổng khóa học", value: data?.totalCourses ?? 0, icon: School, color: "secondary.main" },
    { title: "Tổng bài học", value: data?.totalLessons ?? 0, icon: Book, color: "success.main" },
    { title: "Tổng hoạt động", value: data?.totalActivities ?? 0, icon: LocalActivity, color: "warning.main" },
  ];

  return (
    <Grid container spacing={3}>
      {isLoading
        ? Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={80} height={48} />
                    </Box>
                    <Skeleton variant="circular" width={56} height={56} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        : statCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <StatCard card={card} />
            </Grid>
          ))}
    </Grid>
  );
};

export default StatsCardsWidget;