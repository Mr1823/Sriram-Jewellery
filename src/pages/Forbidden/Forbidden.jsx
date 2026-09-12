import React from "react";
import StatusScreen from "../../components/StatusScreen/StatusScreen";
import useAuthContext from "../../hooks/useAuthContext";

/**
 * 403 — signed in, but not permitted.
 *
 * Replaces a silent `navigate("/")` from AdminRoute, which left a customer who
 * followed an admin link sitting on the homepage with no idea why. The
 * distinction that matters to the visitor is whether signing in as someone
 * else would help, so the copy answers that directly.
 */
const Forbidden = () => {
  const { user } = useAuthContext();

  return (
    <StatusScreen
      code="403"
      tone="error"
      eyebrow="Access denied"
      title="This area is for staff"
      message={
        user
          ? "Your account doesn't have permission to view this page. If you believe it should, ask an administrator to update your role."
          : "You need to sign in with an administrator account to view this page."
      }
      detail={user?.email ? `Signed in as ${user.email}` : undefined}
      primaryLabel={user ? "Back to shop" : "Administrator sign-in"}
      primaryTo={user ? "/shop" : "/admin-login"}
      secondaryLabel="Go to my account"
      secondaryTo="/dashboard"
      helmetTitle="Access Denied"
    />
  );
};

export default Forbidden;
