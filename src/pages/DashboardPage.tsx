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
        <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
            {/* Page Header */}
            <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                    Tổng quan hoạt động
                </Typography>
            </Box>

            {/* Main Grid Layout */}
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
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
