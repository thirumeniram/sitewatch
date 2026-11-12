import { FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { AuthPage, useAuth } from "../modules/auth";
import { App } from "../App";
import StatusPageWrapper from "../pages/status-page/StatusPageWrapper";
import { APP_PRIVATE_ROUTES, APP_PUBLIC_ROUTES } from "../shared/sharedConstant";

const AppRoutes: FC = () => {
  const { auth } = useAuth();

  return (
    <Routes>
      <Route element={<App />}>
        <Route path={APP_PUBLIC_ROUTES.STATUS_PAGE} element={<StatusPageWrapper />} />
        {auth ? (
          <>
            <Route path={APP_PUBLIC_ROUTES.HOME} element={<PrivateRoutes />} />
            <Route index element={<Navigate to={APP_PRIVATE_ROUTES.DASHBOARD} />} />
          </>
        ) : (
          <>
            <Route path={APP_PUBLIC_ROUTES.AUTH} element={<AuthPage />} />
            <Route path="*" element={<Navigate to={APP_PUBLIC_ROUTES.AUTH_LOGIN} replace />} />
          </>
        )}
      </Route>
    </Routes>
  );
};

export { AppRoutes };
