import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (user && user.isAdmin) {
    return <Outlet />;
  }
  return <Navigate to="/login" />;
}