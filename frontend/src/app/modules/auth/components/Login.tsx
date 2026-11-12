import { useState } from "react";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../core/Auth";
import { getUserByToken, login } from "../core/_requests";
import { AUTH_LABELS, loginInitialValues, loginSchema } from "../core/_models";
import { APP_PUBLIC_ROUTES } from "../../../shared/sharedConstant";

export function Login() {
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser } = useAuth();

  const formik = useFormik({
    initialValues: loginInitialValues,
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await login(values.email.trim(), values.password);
        const accessToken = response?.data?.success?.access_token;
        if (accessToken) {
          saveAuth(accessToken);
          const userResponse = await getUserByToken();
          setCurrentUser(userResponse?.data?.success);
        }
      } catch (error) {
        saveAuth(undefined);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <h2 className="h4 mb-4">{AUTH_LABELS.LOGIN_TITLE}</h2>
      <div className="mb-3">
        <label htmlFor="login-email" className="form-label">
          {AUTH_LABELS.EMAIL}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          {...formik.getFieldProps("email")}
          className={clsx("form-control", {
            "is-invalid": formik.touched.email && formik.errors.email,
          })}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="invalid-feedback">{formik.errors.email}</div>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="login-password" className="form-label">
          {AUTH_LABELS.PASSWORD}
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          {...formik.getFieldProps("password")}
          className={clsx("form-control", {
            "is-invalid": formik.touched.password && formik.errors.password,
          })}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="invalid-feedback">{formik.errors.password}</div>
        )}
      </div>
      <button type="submit" className="btn btn-success w-100" disabled={loading}>
        {loading ? AUTH_LABELS.PLEASE_WAIT : AUTH_LABELS.SIGN_IN}
      </button>
      <p className="text-center text-secondary mt-3 mb-0">
        {AUTH_LABELS.NO_ACCOUNT}{" "}
        <Link to={APP_PUBLIC_ROUTES.AUTH_REGISTER}>{AUTH_LABELS.SIGN_UP}</Link>
      </p>
    </form>
  );
}
