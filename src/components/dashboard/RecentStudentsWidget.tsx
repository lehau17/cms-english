import { useRecentStudents } from "@/hooks/useDashboard";
import { Alert, Avatar, Card, CardContent, Divider, List, ListItem, ListItemAvatar, ListItemText, Skeleton, Typography } from "@mui/material";
import * as React from "react";

const RecentStudentsWidget: React.FC = () => {
  const { data: recentStudents, isLoading, isError, error } = useRecentStudents();

  const renderContent = () => {
    if (isLoading) {
      return (
        <List>
          {Array.from(new Array(3)).map((_, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemAvatar>
                  <Skeleton variant="circular">
                    <Avatar />
                  </Skeleton>
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="text" width="80%" />}
                  secondary={<Skeleton variant="text" width="50%" />}
                />
              </ListItem>
              {index < 2 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      );
    }

    if (isError) {
        return <Alert severity="error" sx={{ mt: 2 }}>Không thể tải danh sách học viên. {error?.message}</Alert>;
    }

    if (!recentStudents || recentStudents.length === 0) {
        return (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
                Chưa có học viên mới nào.
            </Typography>
        )
    }

    return (
      <List>
        {recentStudents.map((student, index) => (
          <React.Fragment key={student.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.main" }}>{student.firstName.charAt(0)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${student.firstName} ${student.lastName}`}
                secondary={student.email}
              />
            </ListItem>
            {index < recentStudents.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Học viên mới
        </Typography>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RecentStudentsWidget;