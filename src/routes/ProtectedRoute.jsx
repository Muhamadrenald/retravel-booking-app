import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");

  console.log(
    `ProtectedRoute checked, path: ${location.pathname}, isAuthenticated: ${isAuthenticated}`
  ); // Debug log

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
