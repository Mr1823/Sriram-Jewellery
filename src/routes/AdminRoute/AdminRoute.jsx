import React from "react";
import useAuthContext from "../../hooks/useAuthContext";
import useUserInfo from "../../hooks/useUserInfo";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user, isAuthLoading } = useAuthContext();
  const [userFromDB, isUserLoading] = useUserInfo();

  if (isAuthLoading || isUserLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-neutral"></span>
      </div>
    );
  }

  // Check admin from JWT user or DB user.
  // NOTE: `userFromDB?.admin` is dead — the User schema has no `admin` field
  // (it is `role`), so that clause is always undefined. It fails closed, so
  // nothing is exposed, but it should be deleted rather than trusted.
  if (user && (user.role === "ADMIN" || userFromDB?.admin || userFromDB?.role === "ADMIN")) {
    return children;
  }

  // Was a silent redirect to "/", which dropped anyone following an admin link
  // onto the homepage with no explanation of what happened.
  return <Navigate to="/403" replace />;
};

export default AdminRoute;
