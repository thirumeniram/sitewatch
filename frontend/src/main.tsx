import { createRoot } from "react-dom/client";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { AppRoutes } from "./app/routing/AppRoutes";
import { AuthProvider, setupAxios } from "./app/modules/auth";

setupAxios(axios);
Chart.register(...registerables);

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>,
  );
}
