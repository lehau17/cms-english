import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { AppBar, Box, CssBaseline, IconButton, Toolbar, Typography } from "@mui/material";
import * as React from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 78;

export function DashboardLayout() {
  const { user, logout } = useAuth();

  // đọc trạng thái thu gọn từ localStorage (được Sidebar lưu)
  const getCollapsed = React.useCallback(
    () => (typeof window !== "undefined" && localStorage.getItem("cms_sidebar") === "collapsed"),
    []
  );

  const [collapsed, setCollapsed] = React.useState<boolean>(getCollapsed);

  React.useEffect(() => {
    const onToggle = () => setCollapsed(getCollapsed());
    window.addEventListener("cms:sidebar-toggle", onToggle);
    window.addEventListener("storage", onToggle);
    return () => {
      window.removeEventListener("cms:sidebar-toggle", onToggle);
      window.removeEventListener("storage", onToggle);
    };
  }, [getCollapsed]);

  const contentPaddingLeft = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />
      <Toaster position="top-center" reverseOrder={false} />
      <Sidebar />

      <AppBar
        elevation={0}
        position="fixed"
        sx={{
          ml: `${contentPaddingLeft}px`,
          zIndex: (t) => 1,
          width: `calc(100% - ${contentPaddingLeft}px)`,
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar sx={{ minHeight: 56, display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight={700}>Dashboard</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {user?.displayName ?? "Unknown"}
            </Typography>
            <IconButton size="small" onClick={logout} aria-label="Logout">
              <LogoutOutlinedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: 3,
          pr: 3,
          pt: 10, // chừa AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
