import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../modules/auth";
import { APP_NAME, APP_PRIVATE_ROUTES, COMMON_MESSAGES } from "../../shared/sharedConstant";
import "./app-layout.css";

const AppLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="sw-layout min-vh-100">
      <nav className="navbar bg-white border-bottom">
        <div className="container">
          <Link className="navbar-brand fw-bold text-success" to={APP_PRIVATE_ROUTES.DASHBOARD}>
            {APP_NAME}
          </Link>
          <div className="d-flex align-items-center gap-3">
            <span className="text-secondary small d-none d-sm-inline text-truncate sw-layout-email">
              {currentUser?.email}
            </span>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logout}>
              {COMMON_MESSAGES.LOGOUT}
            </button>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
