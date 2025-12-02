import CourseDistributionWidget from "@/components/dashboard/CourseDistributionWidget";
import NotificationsWidget from "@/components/dashboard/NotificationsWidget";
import RecentStudentsWidget from "@/components/dashboard/RecentStudentsWidget";
import RegistrationTrendWidget from "@/components/dashboard/RegistrationTrendWidget";
import RevenueTrendWidget from "@/components/dashboard/RevenueTrendWidget";
import StatsOverviewWidget from "@/components/dashboard/StatsOverviewWidget";
import TopCoursesWidget from "@/components/dashboard/TopCoursesWidget";
import UpcomingClassesWidget from "@/components/dashboard/UpcomingClassesWidget";
import WelcomeWidget from "@/components/dashboard/WelcomeWidget";
import { Box, Container, Grid } from "@mui/material";
import * as React from "react";

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3}>
        {/* Row 1: Welcome Banner + Notifications */}
        <Grid item xs={12} lg={8}>
          <WelcomeWidget />
        </Grid>
        <Grid item xs={12} lg={4}>
          <NotificationsWidget />
        </Grid>

        {/* Row 2: Key Stats Cards (6 main metrics) */}
        <Grid item xs={12}>
          <StatsOverviewWidget />
        </Grid>

        {/* Row 3: Charts - Revenue & Course Distribution */}
        <Grid item xs={12} lg={8}>
          <RevenueTrendWidget />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CourseDistributionWidget />
        </Grid>

        {/* Row 4: Lists - Top Courses, Recent Students, Upcoming Classes */}
        <Grid item xs={12} md={6} lg={4}>
          <TopCoursesWidget />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <RecentStudentsWidget />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <UpcomingClassesWidget />
            <RegistrationTrendWidget />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
