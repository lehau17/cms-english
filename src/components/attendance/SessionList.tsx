import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { ClassroomSession, SessionStatus } from '@/interface/attendance.interface';
import SessionCard from './SessionCard';

interface SessionListProps {
  sessions: ClassroomSession[];
  selectedSession: ClassroomSession | null;
  onSelectSession: (session: ClassroomSession) => void;
  totalStudents: number;
}

type FilterType = 'all' | 'upcoming' | 'ongoing' | 'completed';

export const SessionList = ({
  sessions,
  selectedSession,
  onSelectSession,
  totalStudents,
}: SessionListProps) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter((s) => {
        const status = s.status.toLowerCase();
        switch (filter) {
          case 'upcoming':
            return status === 'scheduled';
          case 'ongoing':
            return status === 'ongoing';
          case 'completed':
            return status === 'completed';
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by startTime descending (newest first)
    result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return result;
  }, [sessions, filter, search]);

  // Count by status
  const statusCounts = useMemo(() => {
    return sessions.reduce(
      (acc, s) => {
        const status = s.status.toLowerCase();
        if (status === 'scheduled') acc.upcoming++;
        else if (status === 'ongoing') acc.ongoing++;
        else if (status === 'completed') acc.completed++;
        return acc;
      },
      { upcoming: 0, ongoing: 0, completed: 0 }
    );
  }, [sessions]);

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, newFilter: FilterType | null) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search */}
      <TextField
        size="small"
        placeholder="Tim buoi hoc..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Filter Tabs */}
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={handleFilterChange}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="all">
          Tat ca ({sessions.length})
        </ToggleButton>
        <ToggleButton value="ongoing" color="success">
          Dang dien ra ({statusCounts.ongoing})
        </ToggleButton>
        <ToggleButton value="completed" color="info">
          Da xong ({statusCounts.completed})
        </ToggleButton>
        <ToggleButton value="upcoming">
          Sap toi ({statusCounts.upcoming})
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Session List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {filteredSessions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {search ? 'Khong tim thay buoi hoc' : 'Chua co buoi hoc nao'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isSelected={selectedSession?.id === session.id}
                onSelect={onSelectSession}
                totalStudents={totalStudents}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default SessionList;
