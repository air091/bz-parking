import { Outlet } from "react-router-dom";
import SideBar from "./components/SideBar";

const Layout = () => {
  const layoutStyle = {
    display: "flex",
    columnGap: "2rem",
  };

  return (
    <div style={layoutStyle}>
      <SideBar />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
