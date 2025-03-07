import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user || (!user.isActive && !user.isAdmin)) return <Navigate to="/login" />;

  return <Outlet />;
}
