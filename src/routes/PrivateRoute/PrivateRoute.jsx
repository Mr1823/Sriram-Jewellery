import React from "react";
import useAuthContext from "../../hooks/useAuthContext";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, isAuthLoading, sessionExpired } = useAuthContext();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (user) {
    return children;
  }

  // Being signed out and being *timed* out look identical from here unless we
  // say otherwise. Someone who never signed in needs no explanation; someone
  // whose session died deserves one, or the redirect reads as the site losing
  // their place at random.
  return (
    <Navigate
      to={sessionExpired ? "/login?reason=session-expired" : "/login"}
      state={{ from: location }}
      replace
    />
  );
};

export default PrivateRoute;
