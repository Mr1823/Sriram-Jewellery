import React from "react";
import { NavLink, useParams } from "react-router-dom";

const ProductPageNavigation = () => {
  const { id } = useParams();
  
  const baseClass = "px-6 py-4 font-label-caps text-[11px] uppercase tracking-[0.2em] transition-ui relative";
  const inactiveClass = "text-on-surface-variant hover:text-primary";
  const activeClass = "text-primary font-bold";

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-center gap-4 py-2">
      <NavLink
        to={`/products/${id}/description`}
        className={({ isActive }) => 
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        {({ isActive }) => (
          <>
            Description
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary mx-4"></div>
            )}
          </>
        )}
      </NavLink>

      <NavLink
        to={`/products/${id}/reviews`}
        className={({ isActive }) => 
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        {({ isActive }) => (
          <>
            Client Reviews
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary mx-4"></div>
            )}
          </>
        )}
      </NavLink>
    </div>
  );
};

export default ProductPageNavigation;
