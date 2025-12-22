import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectRoute = ({ children, user, redirect = "/login", loader }) => {
  // Don't redirect while auth is still loading - prevents redirect on page reload
  if (loader) {
    return null;
  }
  
  if (!user) {
    return <Navigate to={redirect} />;
  }

  return children ? children : <Outlet />;
};

export default ProtectRoute;
