import { useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { toast } from "react-toastify";
import { register } from "../core/_requests";
import {
  AUTH_LABELS,
  AUTH_MESSAGES,
  registrationInitialValues,
  registrationSchema,
} from "../core/_models";
import { APP_PUBLIC_ROUTES, TOAST_POSITION } from "../../../shared/sharedConstant";

export function Registration() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: registrationInitialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await register(values.email.trim(), values.password);
        if (response?.data?.success?.email) {
          toast.success(AUTH_MESSAGES.SIGN_UP_SUCCESS, { position: TOAST_POSITION });
          navigate(APP_PUBLIC_ROUTES.AUTH_LOGIN);
        }
      } catch (error) {
        return;
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <h2 className="h4 mb-4">{AUTH_LABELS.REGISTER_TITLE}</h2>
      <div className="mb-3">
        <label htmlFor="register-email" className="form-label">
          {AUTH_LABELS.EMAIL}
        </label>
        <input
          id="register-email"
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
      <div className="mb-3">
        <label htmlFor="register-password" className="form-label">
          {AUTH_LABELS.PASSWORD}
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          {...formik.getFieldProps("password")}
          className={clsx("form-control", {
            "is-invalid": formik.touched.password && formik.errors.password,
          })}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="invalid-feedback">{formik.errors.password}</div>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="register-confirm-password" className="form-label">
          {AUTH_LABELS.CONFIRM_PASSWORD}
        </label>
        <input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          {...formik.getFieldProps("confirmPassword")}
          className={clsx("form-control", {
            "is-invalid": formik.touched.confirmPassword && formik.errors.confirmPassword,
          })}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
        )}
      </div>
      <button type="submit" className="btn btn-success w-100" disabled={loading}>
        {loading ? AUTH_LABELS.PLEASE_WAIT : AUTH_LABELS.SIGN_UP}
      </button>
      <p className="text-center text-secondary mt-3 mb-0">
        {AUTH_LABELS.HAVE_ACCOUNT}{" "}
        <Link to={APP_PUBLIC_ROUTES.AUTH_LOGIN}>{AUTH_LABELS.SIGN_IN}</Link>
      </p>
    </form>
  );
}
