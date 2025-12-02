import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, CssBaseline, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import * as React from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 78;

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const [mobileOpen, setMobileOpen] = React.useState(false);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const contentPaddingLeft = isMobile ? 0 : (collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />
      <Toaster position="top-center" reverseOrder={false} />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      <AppBar
        elevation={0}
        position="fixed"
        sx={{
          ml: { xs: 0, md: `${contentPaddingLeft}px` },
          zIndex: (t) => t.zIndex.drawer + 1,
          width: { xs: "100%", md: `calc(100% - ${contentPaddingLeft}px)` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }} noWrap>
              Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 }, flexShrink: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: { xs: "none", sm: "block" },
                maxWidth: { xs: "100px", md: "none" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
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
          px: { xs: 2, sm: 3 },
          pt: { xs: 9, sm: 10 }, // chừa AppBar
          // pb: 3,
          minWidth: 0, // Allow content to shrink
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
