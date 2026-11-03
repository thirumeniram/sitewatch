import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthInit } from "./modules/auth";

const App = () => {
  return (
    <AuthInit>
      <Outlet />
      <ToastContainer />
    </AuthInit>
  );
};

export { App };
