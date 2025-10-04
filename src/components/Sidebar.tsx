import { CalendarMonth, Class, FamilyRestroom, Person, RoomOutlined, School } from "@mui/icons-material";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List, ListItemButton, ListItemIcon, ListItemText,
  Stack,
  Toolbar,
  Tooltip, Typography
} from "@mui/material";
import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/interface/enum.interface";

type NavItem = { to: string; label: string; icon: React.ReactNode; roles?: UserRole[] };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <HomeOutlinedIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsOutlinedIcon /> },
  { to: "/students", label: "Student", icon: <Person />, roles: [UserRole.ADMIN] },
  { to: "/teachers", label: "Teacher", icon: <Person />, roles: [UserRole.ADMIN] },
  { to: "/parents", label: "Parents", icon: <FamilyRestroom />, roles: [UserRole.ADMIN] },
  { to: "/classrooms", label: "Class", icon: <Class />, roles: [UserRole.ADMIN] },
  { to: "/courses", label: "Course", icon: <School />, roles: [UserRole.ADMIN] },
  { to: "/assignments", label: "Assignments", icon: <AssignmentOutlinedIcon />, roles: [UserRole.ADMIN] },
  { to: "/schedule", label: "Schedule", icon: <CalendarMonth />, roles: [UserRole.ADMIN] },
  { to: "/teacher-schedule", label: "My Schedule", icon: <CalendarMonth />, roles: [UserRole.TEACHER] },
  { to: "/rooms", label: "Room", icon: <RoomOutlined />, roles: [UserRole.ADMIN] },
  { to: "/api-report", label: "API Report", icon: <AssessmentOutlinedIcon />, roles: [UserRole.ADMIN] },
];

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 78;

export function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem("cms_sidebar") === "collapsed";
  });

  const toggle = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem("cms_sidebar", next ? "collapsed" : "expanded");
      // Notify layout to recalc widths
      try { window.dispatchEvent(new Event("cms:sidebar-toggle")); } catch { }
      return next;
    });
  };

  return (
    // Sidebar (light)
    <Drawer
      variant="permanent"
      PaperProps={{
        sx: {
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          overflowX: "hidden",
          transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          bgcolor: "background.paper",           // ⬅️ light
          color: "text.primary",                 // ⬅️ light
          borderRight: (t) => `1px solid ${t.palette.divider}`, // ⬅️ light
        },
      }}
      sx={{
        width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": { boxSizing: "border-box" },
      }}
    >
      <Toolbar
        sx={{
          px: 1.5,
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
        }}
      >
        {!collapsed && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 8, height: 8, borderRadius: "50%",
                bgcolor: "#facc15", boxShadow: "0 0 8px rgba(250,204,21,.6)"
              }}
            />
            <Typography fontWeight={800} color="text.primary">Dashboard</Typography>
          </Stack>
        )}
        <Tooltip title={collapsed ? "Expand" : "Collapse"}>
          <IconButton
            size="small"
            onClick={toggle}
            sx={{ color: "text.secondary" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Divider />

      <List sx={{ py: 1 }}>
        {NAV.map((item) => {
          // Filter navigation items based on user role
          if (item.roles && user?.role && !item.roles.includes(user.role)) {
            return null;
          }
          
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1.5,
                color: active ? "primary.contrastText" : "text.primary",
                bgcolor: active ? "primary.main" : "transparent",
                "&:hover": { bgcolor: active ? "primary.light" : "action.hover" },
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 2,
              }}
            >
              <ListItemIcon
                sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: "inherit" }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 1.5, opacity: 0.7, display: "grid", placeItems: collapsed ? "center" : "start" }}>
        {!collapsed && <Typography variant="caption" color="text.secondary">v1.0.0</Typography>}
      </Box>
    </Drawer>

  );
}
