import CourseDistributionWidget from "@/components/dashboard/CourseDistributionWidget";
import NotificationsWidget from "@/components/dashboard/NotificationsWidget";
import RecentStudentsWidget from "@/components/dashboard/RecentStudentsWidget";
import RegistrationTrendWidget from "@/components/dashboard/RegistrationTrendWidget";
import StatsCardsWidget from "@/components/dashboard/StatsCardsWidget";
import UpcomingClassesWidget from "@/components/dashboard/UpcomingClassesWidget";
import { Box, Container, Grid, Typography } from "@mui/material";
import * as React from "react";

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Tổng quan hoạt động
        </Typography>
      </Box>

      {/* Main Grid Layout */}
      <Grid container spacing={3}>
        {/* Row 1: Stat Cards */}
        <Grid item xs={12}>
          <StatsCardsWidget />
        </Grid>

        {/* Row 2: Charts */}
        <Grid item xs={12} lg={8}>
          <RegistrationTrendWidget />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CourseDistributionWidget />
        </Grid>

        {/* Row 3: Notifications */}
        <Grid item xs={12}>
            <NotificationsWidget />
        </Grid>

        {/* Row 4: Tables / Lists */}
        <Grid item xs={12} lg={7}>
          <UpcomingClassesWidget />
        </Grid>
        <Grid item xs={12} lg={5}>
          <RecentStudentsWidget />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;