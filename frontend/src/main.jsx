import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./AdminLayout.jsx";

// USER
import Home from "./pages/user/Home.jsx";
import Register from "./pages/user/Register.jsx";
import Login from "./pages/user/Login.jsx";

// ADMIN
import Dashboard from "./pages/admin/dashboard_components/Dashboard.jsx";
import ParkingManagement from "./pages/admin/parking_management_components/ParkingManagement.jsx";
import NotFound from "./pages/NotFound.jsx";
import Payment from "./pages/admin/payment_components/Payment.jsx";
import UserLayout from "./UserLayout.jsx";

// CONTEXT
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
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
      },
      {
        path: "/admin/payment",
        element: <Payment />,
      },
    ],
  },
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/",
        element: <Navigate to="/home" replace />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  </StrictMode>
);
