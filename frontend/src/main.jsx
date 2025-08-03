import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./pages/user/Home.jsx";
import Dashboard from "./pages/admin/dashboard_components/Dashboard.jsx";
import ParkingManagement from "./pages/admin/parking_management_components/ParkingManagement.jsx";
import NotFound from "./pages/NotFound.jsx";
import Card from "./pages/admin/parking_management_components/Card.jsx";

const router = createBrowserRouter([
  {
    path: "/admin",
    element: <Layout />,
    children: [
      {
        path: "/admin",
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "/admin/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/admin/parking",
        element: <ParkingManagement />,
        // children: [
        //   {
        //     path: "/admin/parking/:slotId",
        //     element: <Card />,
        //   },
        // ],
      },
    ],
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);
