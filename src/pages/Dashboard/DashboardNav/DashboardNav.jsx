import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthContext from "../../../hooks/useAuthContext";

const DashboardNav = () => {
  const { user, logOut } = useAuthContext();

  const navigate = useNavigate();

  const handleLogOut = () => {
    logOut()
      .then(() => {
        navigate("/login");
      })
      .catch((err) => console.error(err));
  };

  const activeClassName = "text-primary font-bold bg-surface-container-highest/50 border-r-2 border-primary font-label-caps text-label-caps flex items-center gap-3 py-4 px-8 transition-ui";
  const inactiveClassName = "text-on-surface-variant font-label-caps text-label-caps flex items-center gap-3 py-4 px-8 hover:bg-surface-container-high transition-ui";

  console.log("DashboardNav rendered. Path:", window.location.pathname);

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="px-8 mb-10 hidden md:block">
        <div className="w-16 h-16 rounded-full overflow-hidden border border-outline-variant/30 mb-4 bg-surface-variant flex items-center justify-center text-primary text-2xl font-headline-sm uppercase">
          {user?.displayName ? user.displayName.charAt(0) : "U"}
        </div>
        <h3 className="font-headline-sm text-headline-sm text-primary truncate">{user?.displayName || "User"}</h3>
        <p className="font-label-caps text-label-caps text-on-surface-variant opacity-70">Elite Member</p>
      </div>

      <nav className="flex flex-col space-y-1">
        <NavLink
          to="/dashboard/myDashboard"
          className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
        >
          <span className="material-symbols-outlined">dashboard</span> Dashboard
        </NavLink>
        
        <NavLink
          to="/dashboard/myOrders"
          className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
        >
          <span className="material-symbols-outlined">package</span> My Orders
        </NavLink>
        
        <NavLink
          to="/dashboard/billing"
          className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
        >
          <span className="material-symbols-outlined">receipt_long</span> Billing
        </NavLink>

        <NavLink
          to="/dashboard/wishlist"
          className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
        >
          <span className="material-symbols-outlined">favorite</span> Wishlist
        </NavLink>
        
        <NavLink
          to="/dashboard/myAddress"
          className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
        >
          <span className="material-symbols-outlined">location_on</span> Address Book
        </NavLink>

        <NavLink
          to="/dashboard/accountDetails"
          className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
        >
          <span className="material-symbols-outlined">person</span> Account Details
        </NavLink>

        <div className="mt-8 pt-4 border-t border-outline-variant/10">
          <button 
            onClick={handleLogOut}
            className="w-full text-on-surface-variant font-label-caps text-label-caps flex items-center gap-3 py-4 px-8 hover:bg-surface-container-high hover:text-error transition-ui"
          >
            <span className="material-symbols-outlined">logout</span> Sign Out
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default DashboardNav;
