import React from "react";
import { NavLink } from "react-router-dom";

const SideBar = () => {
  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/parking", label: "Parking" },
    { path: "/admin/payment", label: "Payment" },
  ];
  return (
    <div>
      SideBar
      {navLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          style={({ isActive }) => ({
            display: "block",
            color: isActive ? "red" : "blue",
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
};

export default SideBar;
