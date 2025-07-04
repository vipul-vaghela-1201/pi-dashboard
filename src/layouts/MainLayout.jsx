import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TopBar from "../components/Topbar_main";

const MainLayout = () => {
  return (
    <Box sx={{       display: "flex",       flexDirection: "column", height: "100vh",       width: "100vw"     }}>
      <TopBar />
      <Box sx={{
        flexGrow: 1,
        overflow: "auto",
        p: 2,
        width: "100%",
        maxWidth: "100%",
        margin: 0
      }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;