import React, { useState } from "react";
import { useFormik } from "formik";
import { Modal } from "react-bootstrap";
import clsx from "clsx";
import { toast } from "react-toastify";
import { addWebsite, updateWebsite } from "../service/dashboardServices";
import { IWebsiteFormModalProps, IWebsiteFormValues } from "../DashboardInterface";
import {
  CHECK_INTERVAL_MINUTES,
  DASHBOARD_LABELS,
  DASHBOARD_MESSAGES,
  websiteInitialValues,
  websiteSchema,
} from "../DashboardConstants";
import { IWebsite } from "../../../shared/sharedInterface";
import { TOAST_POSITION } from "../../../shared/sharedConstant";

const getChangedValues = (
  website: IWebsite,
  values: IWebsiteFormValues,
): Partial<IWebsiteFormValues> => {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) => website?.[key as keyof IWebsiteFormValues] !== value,
    ),
  ) as Partial<IWebsiteFormValues>;
};

const WebsiteFormModal: React.FC<IWebsiteFormModalProps> = ({ website, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);

  const formik = useFormik<IWebsiteFormValues>({
    initialValues: website
      ? {
          name: website?.name,
          url: website?.url,
          check_interval_minutes: website?.check_interval_minutes,
          is_public: website?.is_public,
        }
      : websiteInitialValues,
    validationSchema: websiteSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const cleanValues: IWebsiteFormValues = {
          name: values.name.trim(),
          url: new URL(values.url.trim()).toString(),
          check_interval_minutes: Number(values.check_interval_minutes),
          is_public: values.is_public,
        };
        if (website) {
          const changes = getChangedValues(website, cleanValues);
          if (Object.keys(changes).length > 0) {
            await updateWebsite(website?.id, changes);
            toast.success(DASHBOARD_MESSAGES.WEBSITE_UPDATED, { position: TOAST_POSITION });
          }
        } else {
          await addWebsite(cleanValues);
          toast.success(DASHBOARD_MESSAGES.WEBSITE_ADDED, { position: TOAST_POSITION });
        }
        onSaved();
      } catch (error) {
        return;
      } finally {
        setSaving(false);
      }
    },
  });

  return (
    <Modal show onHide={onClose} centered>
      <form onSubmit={formik.handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="h5">
            {website ? DASHBOARD_LABELS.EDIT_WEBSITE : DASHBOARD_LABELS.ADD_WEBSITE}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="website-name" className="form-label">
              {DASHBOARD_LABELS.NAME}
            </label>
            <input
              id="website-name"
              type="text"
              placeholder={DASHBOARD_LABELS.NAME_PLACEHOLDER}
              {...formik.getFieldProps("name")}
              className={clsx("form-control", {
                "is-invalid": formik.touched.name && formik.errors.name,
              })}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="invalid-feedback">{formik.errors.name}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="website-url" className="form-label">
              {DASHBOARD_LABELS.URL}
            </label>
            <input
              id="website-url"
              type="url"
              placeholder={DASHBOARD_LABELS.URL_PLACEHOLDER}
              {...formik.getFieldProps("url")}
              className={clsx("form-control", {
                "is-invalid": formik.touched.url && formik.errors.url,
              })}
            />
            {formik.touched.url && formik.errors.url && (
              <div className="invalid-feedback">{formik.errors.url}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="website-interval" className="form-label">
              {DASHBOARD_LABELS.CHECK_EVERY}
            </label>
            <select
              id="website-interval"
              {...formik.getFieldProps("check_interval_minutes")}
              className="form-select"
            >
              {CHECK_INTERVAL_MINUTES.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} {minutes === 1 ? DASHBOARD_LABELS.MINUTE : DASHBOARD_LABELS.MINUTES}
                </option>
              ))}
            </select>
          </div>
          <div className="form-check">
            <input
              id="website-is-public"
              type="checkbox"
              className="form-check-input"
              checked={formik.values.is_public}
              onChange={(event) => formik.setFieldValue("is_public", event.target.checked)}
            />
            <label htmlFor="website-is-public" className="form-check-label">
              {DASHBOARD_LABELS.IS_PUBLIC}
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            {DASHBOARD_LABELS.CANCEL}
          </button>
          <button type="submit" className="btn btn-success" disabled={saving}>
            {saving ? DASHBOARD_LABELS.SAVING : DASHBOARD_LABELS.SAVE}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default WebsiteFormModal;
