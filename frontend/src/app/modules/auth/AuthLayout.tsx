import { Outlet } from "react-router-dom";
import { AUTH_LABELS } from "./core/_models";
import { APP_NAME } from "../../shared/sharedConstant";
import "./auth.css";

const AuthLayout = () => {
  return (
    <div className="sw-auth-page d-flex flex-column justify-content-center align-items-center min-vh-100 px-3 py-5">
      <div className="text-center mb-4">
        <h1 className="h2 fw-bold text-success mb-1">{APP_NAME}</h1>
        <p className="text-secondary mb-0">{AUTH_LABELS.TAGLINE}</p>
      </div>
      <div className="sw-auth-card card shadow-sm border-0 w-100">
        <div className="card-body p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export { AuthLayout };
