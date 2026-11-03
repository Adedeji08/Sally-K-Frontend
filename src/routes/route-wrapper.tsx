import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Routes from "./index";

// React Router keeps the scroll position between pages; start each new page
// at the top (query-only changes like filter tabs keep their position).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const RoutesWrapper: React.FC = () => {

  return (
    <div>
      <ScrollToTop />
      <Routes />
    </div>
  );
};

export default RoutesWrapper;
