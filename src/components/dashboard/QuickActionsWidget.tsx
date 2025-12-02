import {
  Add,
  Campaign,
  Class,
  Groups,
  Person,
  School,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Tạo khóa học",
    icon: Add,
    path: "/courses/create",
    color: "#3b82f6",
  },
  {
    label: "Tạo lớp học",
    icon: Groups,
    path: "/classrooms?action=create",
    color: "#8b5cf6",
  },
  {
    label: "Thêm học viên",
    icon: Person,
    path: "/students?action=create",
    color: "#10b981",
  },
  {
    label: "Thêm giáo viên",
    icon: School,
    path: "/teachers?action=create",
    color: "#f59e0b",
  },
  {
    label: "Gửi thông báo",
    icon: Campaign,
    path: "/notifications/create",
    color: "#ef4444",
  },
  {
    label: "Xem lớp học",
    icon: Class,
    path: "/classrooms",
    color: "#6366f1",
  },
];

const QuickActionsWidget: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thao tác nhanh
        </Typography>
        <Grid container spacing={1.5}>
          {quickActions.map((action) => (
            <Grid item xs={6} sm={4} key={action.label}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<action.icon />}
                onClick={() => navigate(action.path)}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  py: 1.5,
                  borderColor: "divider",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: action.color,
                    bgcolor: `${action.color}10`,
                  },
                  "& .MuiButton-startIcon": {
                    color: action.color,
                  },
                }}
              >
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="body2" fontWeight={500}>
                    {action.label}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActionsWidget;
