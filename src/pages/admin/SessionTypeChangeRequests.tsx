import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import { useAllTypeChangeRequests } from '@/hooks/useSessionTypeChangeRequest';
import SessionTypeChangeRequestList from '@/components/schedule/SessionTypeChangeRequestList';

const SessionTypeChangeRequestsPage: React.FC = () => {
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

  const { data, isLoading, refetch } = useAllTypeChangeRequests();

  const filteredRequests =
    tab === 'pending' ? data?.data?.filter((r) => r.status === 'pending') : data?.data;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Session Type Change Requests
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Pending" value="pending" />
        <Tab label="All Requests" value="all" />
      </Tabs>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <SessionTypeChangeRequestList
          requests={filteredRequests || []}
          onReviewComplete={refetch}
        />
      )}
    </Box>
  );
};

export default SessionTypeChangeRequestsPage;
