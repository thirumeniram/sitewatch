import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/app-layout/AppLayout";
import DashboardWrapper from "../pages/dashboard/DashboardWrapper";
import WebsiteDetailsWrapper from "../pages/website-details/WebsiteDetailsWrapper";
import { APP_PRIVATE_ROUTES, APP_PUBLIC_ROUTES } from "../shared/sharedConstant";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path={APP_PUBLIC_ROUTES.AUTH}
          element={<Navigate to={APP_PRIVATE_ROUTES.DASHBOARD} />}
        />
        <Route path={APP_PRIVATE_ROUTES.DASHBOARD} element={<DashboardWrapper />} />
        <Route path={APP_PRIVATE_ROUTES.WEBSITE_DETAILS} element={<WebsiteDetailsWrapper />} />
        <Route path="*" element={<Navigate to={APP_PRIVATE_ROUTES.DASHBOARD} />} />
      </Route>
    </Routes>
  );
};

export { PrivateRoutes };
