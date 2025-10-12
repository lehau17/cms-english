import { useUpcomingClasses } from "@/hooks/useDashboard";
import { Schedule } from "@mui/icons-material";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import moment from "moment";
import * as React from "react";

const UpcomingClassesWidget: React.FC = () => {
  const { data: upcomingClasses, isLoading, isError, error } = useUpcomingClasses();

  const renderContent = () => {
    if (isLoading) {
      return (
        <TableBody>
          {Array.from(new Array(3)).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell align="right"><Skeleton variant="text" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (isError) {
      return (
        <TableBody>
            <TableRow>
                <TableCell colSpan={5}>
                    <Alert severity="error" sx={{width: '100%'}}>Không thể tải danh sách lớp học. {error?.message}</Alert>
                </TableCell>
            </TableRow>
        </TableBody>
      );
    }

    if (!upcomingClasses || upcomingClasses.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} align="center">
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2, mb: 2 }}>
                Không có lớp học nào trong vài giờ tới.
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {upcomingClasses.map((cls) => (
          <TableRow key={cls.id}>
            <TableCell>
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight={600}>
                  {cls.classroomName}
                </Typography>
                {cls.courseTitle && (
                  <Typography variant="caption" color="textSecondary">
                    {cls.courseTitle}
                  </Typography>
                )}
              </Stack>
            </TableCell>
            <TableCell>{cls.teacherName}</TableCell>
            <TableCell>
              <Chip
                icon={<Schedule />}
                label={`${moment(cls.startTime).format("HH:mm")} - ${moment(cls.endTime).format("HH:mm")}`}
                size="small"
                variant="outlined"
              />
            </TableCell>
            <TableCell>{cls.roomName ?? "Chưa phân phòng"}</TableCell>
            <TableCell align="right">
              {cls.activeStudents}
              {typeof cls.maxStudents === "number" && cls.maxStudents > 0
                ? `/${cls.maxStudents}`
                : ""}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Lớp học hôm nay
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lớp học</TableCell>
                <TableCell>Giáo viên</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell align="right">Sĩ số</TableCell>
              </TableRow>
            </TableHead>
            {renderContent()}
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default UpcomingClassesWidget;