import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../pages/Header/Header";
import Footer from "../pages/Footer/Footer";
import { Toaster } from "react-hot-toast";
import { LoginGateProvider } from "../context/LoginGateContext";
import useResumePendingAction from "../hooks/useResumePendingAction";

const MainLayoutInner = () => {
  useResumePendingAction();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    if (
      (location?.pathname?.includes("description") &&
        location?.state?.from !== "/") ||
      (location?.pathname?.includes("reviews") && location?.state?.from !== "/")
    ) {
      // ignore scroll to top in dynamic product page details navigation
    } else {
      document.documentElement.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [location]);

  // The timed login nudge lives in LoginGateProvider so it also covers the
  // product page, which is a separate root route with its own provider.

  return (
    <div className="w-full">
      <Header />
      <Outlet />
      <Footer />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-bold py-8",
          style: {
            fontFamily: "var(--poppins)",
            padding: "15px 20px",
            maxWidth: "max-content",
          },
        }}
      />
    </div>
  );
};

const MainLayout = () => (
  <LoginGateProvider>
    <MainLayoutInner />
  </LoginGateProvider>
);

export default MainLayout;
