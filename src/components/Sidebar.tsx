import { useAuth } from "@/hooks/useAuth";
import { usePendingRescheduleRequestCount } from "@/hooks/useRescheduleRequest";
import { usePendingTypeChangeRequestCount } from "@/hooks/useSessionTypeChangeRequest";
import { UserRole } from "@/interface/enum.interface";
import { CalendarMonth, CardMembership, ChangeCircle, Class, FamilyRestroom, MenuBook, Notifications, Person, Podcasts, ReceiptLong, Schedule, School, VideoLibrary } from "@mui/icons-material";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  Badge,
  Box,
  Collapse,
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

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  children?: NavItem[];
};

type NavGroup = {
  label: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  children: NavItem[];
};

const NAV_ITEMS: (NavItem | NavGroup)[] = [
  { to: "/dashboard", label: "Dashboard", icon: <HomeOutlinedIcon />, roles: [UserRole.ADMIN] },
  { to: "/teacher-dashboard", label: "Dashboard", icon: <HomeOutlinedIcon />, roles: [UserRole.TEACHER] },
  { to: "/settings", label: "Settings", icon: <SettingsOutlinedIcon /> },
  {
    label: "User Management",
    icon: <Person />,
    roles: [UserRole.ADMIN],
    children: [
      { to: "/students", label: "Student", icon: <Person />, roles: [UserRole.ADMIN] },
      { to: "/teachers", label: "Teacher", icon: <Person />, roles: [UserRole.ADMIN] },
      { to: "/parents", label: "Parents", icon: <FamilyRestroom />, roles: [UserRole.ADMIN] },
    ],
  },
  {
    label: "Learning Management",
    icon: <School />,
    children: [
      { to: "/classrooms", label: "Class", icon: <Class /> },
      { to: "/courses", label: "Course", icon: <School />, roles: [UserRole.ADMIN] },
    ],
  },
  {
    label: "Resource Management",
    icon: <VideoLibrary />,
    roles: [UserRole.ADMIN],
    children: [
      { to: "/assignments", label: "Assignments", icon: <AssignmentOutlinedIcon />, roles: [UserRole.ADMIN] },
      { to: "/media", label: "Media Library", icon: <VideoLibrary />, roles: [UserRole.ADMIN, UserRole.CONTENT_CREATOR, UserRole.TEACHER] },
      { to: "/notifications", label: "Notifications", icon: <Notifications />, roles: [UserRole.ADMIN] },
      { to: "/payments", label: "Payments", icon: <ReceiptLong />, roles: [UserRole.ADMIN] },
      { to: "/certificates", label: "Certificates", icon: <CardMembership />, roles: [UserRole.ADMIN] },
    ],
  },
  {
    label: "Study Management",
    icon: <MenuBook />,
    roles: [UserRole.ADMIN],
    children: [
      { to: "/podcasts", label: "Podcasts", icon: <Podcasts />, roles: [UserRole.ADMIN] },
      { to: "/vocabulary", label: "Vocabulary", icon: <MenuBook />, roles: [UserRole.ADMIN] },
    ],
  },
  { to: "/schedule", label: "Schedule", icon: <CalendarMonth />, roles: [UserRole.ADMIN] },
  { to: "/teacher-schedule", label: "My Schedule", icon: <CalendarMonth />, roles: [UserRole.TEACHER] },
  { to: "/reschedule-requests", label: "Reschedule Requests", icon: <Schedule />, roles: [UserRole.ADMIN] },
  { to: "/type-change-requests", label: "Type Change Requests", icon: <ChangeCircle />, roles: [UserRole.ADMIN] },
  { to: "/api-report", label: "API Report", icon: <AssessmentOutlinedIcon />, roles: [UserRole.ADMIN] },
];

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 78;

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { data: pendingCount = 0 } = usePendingRescheduleRequestCount();
  const { data: pendingTypeChangeCount = 0 } = usePendingTypeChangeRequestCount();
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem("cms_sidebar") === "collapsed";
  });
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    // Auto-expand groups that contain active items
    const expanded: Record<string, boolean> = {};
    NAV_ITEMS.forEach((item, index) => {
      if ('children' in item && item.children) {
        const hasActiveChild = item.children.some(child =>
          pathname === child.to || pathname.startsWith(child.to + "/")
        );
        if (hasActiveChild) {
          expanded[`group-${index}`] = true;
        }
      }
    });
    return expanded;
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

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          px: 1.5,
          minHeight: { xs: 56, sm: 64 },
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
            sx={{ color: "text.secondary", display: { xs: "none", md: "flex" } }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Divider />

      <List sx={{ py: 1 }}>
        {NAV_ITEMS.map((item, index) => {
          // Check if it's a group
          if ('children' in item && item.children) {
            // Calculate visible children based on current user role
            const visibleChildren = item.children.filter(child =>
              !child.roles || (user?.role && child.roles.includes(user.role))
            );

            // Hide group if no children are accessible to current user
            if (visibleChildren.length === 0) {
              return null;
            }

            const groupKey = `group-${index}`;
            const isGroupOpen = openGroups[groupKey] || false;
            const hasActiveChild = item.children.some(child => {
              if (child.roles && user?.role && !child.roles.includes(user.role)) {
                return false;
              }
              return pathname === child.to || pathname.startsWith(child.to + "/");
            });

            const handleToggleGroup = () => {
              setOpenGroups(prev => ({
                ...prev,
                [groupKey]: !prev[groupKey],
              }));
            };

            // Show group icon in collapsed mode with tooltip
            if (collapsed) {
              return (
                <Tooltip key={groupKey} title={item.label} placement="right">
                  <ListItemButton
                    onClick={handleToggleGroup}
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 1.5,
                      color: hasActiveChild ? "primary.main" : "text.primary",
                      bgcolor: "transparent",
                      "&:hover": { bgcolor: "action.hover" },
                      justifyContent: "center",
                      px: 1,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              );
            }

            return (
              <React.Fragment key={groupKey}>
                <ListItemButton
                  onClick={handleToggleGroup}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 1.5,
                    color: hasActiveChild ? "primary.main" : "text.primary",
                    bgcolor: "transparent",
                    "&:hover": { bgcolor: "action.hover" },
                    justifyContent: "flex-start",
                    px: 2,
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 0, mr: 1.5, color: "inherit" }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  />
                  {isGroupOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={isGroupOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => {
                      // Filter child items based on user role
                      if (child.roles && user?.role && !child.roles.includes(user.role)) {
                        return null;
                      }

                      const active = pathname === child.to || pathname.startsWith(child.to + "/");
                      const showBadge = (child.to === "/reschedule-requests" && isAdmin && pendingCount > 0) ||
                                        (child.to === "/type-change-requests" && isAdmin && pendingTypeChangeCount > 0);
                      const badgeCount = child.to === "/reschedule-requests" ? pendingCount : pendingTypeChangeCount;
                      return (
                        <ListItemButton
                          key={child.to}
                          component={RouterLink}
                          to={child.to}
                          onClick={onMobileClose}
                          sx={{
                            mx: 1,
                            mb: 0.5,
                            ml: 4,
                            borderRadius: 1.5,
                            color: active ? "primary.contrastText" : "text.primary",
                            bgcolor: active ? "primary.main" : "transparent",
                            "&:hover": { bgcolor: active ? "primary.light" : "action.hover" },
                            justifyContent: "flex-start",
                            px: 2,
                          }}
                        >
                          <ListItemIcon
                            sx={{ minWidth: 0, mr: 1.5, color: "inherit" }}
                          >
                            {showBadge ? (
                              <Badge badgeContent={badgeCount} color="error" max={99}>
                                {child.icon}
                              </Badge>
                            ) : (
                              child.icon
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{ fontWeight: 600, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

          // Regular nav item
          if ('to' in item) {
            // Filter navigation items based on user role
            if (item.roles && user?.role && !item.roles.includes(user.role)) {
              return null;
            }

            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const showBadge = (item.to === "/reschedule-requests" && isAdmin && pendingCount > 0) ||
                              (item.to === "/type-change-requests" && isAdmin && pendingTypeChangeCount > 0);
            const itemBadgeCount = item.to === "/reschedule-requests" ? pendingCount : pendingTypeChangeCount;
            return (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                onClick={onMobileClose}
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
                  {showBadge ? (
                    <Badge badgeContent={itemBadgeCount} color="error" max={99}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  />
                )}
              </ListItemButton>
            );
          }

          return null;
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 1.5, opacity: 0.7, display: "grid", placeItems: collapsed ? "center" : "start" }}>
        {!collapsed && <Typography variant="caption" color="text.secondary">v1.0.0</Typography>}
      </Box>
    </>
  );

  return (
    <Box component="nav">
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            bgcolor: "background.paper",
            color: "text.primary",
            borderRight: (t) => `1px solid ${t.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            overflowX: "hidden",
            transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
            bgcolor: "background.paper",
            color: "text.primary",
            borderRight: (t) => `1px solid ${t.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
