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
import Dashboard from "./pages/admin/Dashboard.jsx";
import Employee from "./pages/admin/Employee.jsx";

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
        path: "/admin/employee",
        element: <Employee />,
      },
    ],
  },
  {
    path: "/",
    element: <Home />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);
