import { Navigate, Route, Routes } from "react-router-dom";
import { Registration } from "./components/Registration";
import { Login } from "./components/Login";
import { AuthLayout } from "./AuthLayout";
import { APP_PUBLIC_ROUTES, AUTH_CHILD_ROUTES } from "../../shared/sharedConstant";

const AuthPage = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path={AUTH_CHILD_ROUTES.LOGIN} element={<Login />} />
      <Route path={AUTH_CHILD_ROUTES.REGISTER} element={<Registration />} />
      <Route path="*" element={<Navigate to={APP_PUBLIC_ROUTES.AUTH_LOGIN} />} />
    </Route>
  </Routes>
);

export { AuthPage };
