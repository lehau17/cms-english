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
      <Grid container spacing={2.5}>
        {/* Section 1: Header & Quick Actions */}
        <Grid item xs={12}>
          <WelcomeWidget />
        </Grid>

        {/* Section 2: Key Metrics Overview */}
        <Grid item xs={12}>
          <StatsOverviewWidget />
        </Grid>

        {/* Section 3: Main Content Area - Balanced 3-column layout */}
        {/* Left Column: Primary Data & Charts (66% width) */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Revenue Chart */}
            <RevenueTrendWidget />

            {/* Registration Trend - Full Width */}
            <RegistrationTrendWidget />

            {/* Top Courses - Full Width */}
            <TopCoursesWidget />

            {/* Recent Students Table */}
            <RecentStudentsWidget />
          </Box>
        </Grid>

        {/* Right Column: Time-sensitive Info Only (33% width) */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <CourseDistributionWidget />
            <NotificationsWidget />
            <UpcomingClassesWidget />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
