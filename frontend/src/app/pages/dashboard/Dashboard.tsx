import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import StatusBadge from "../../components/status-badge/StatusBadge";
import { useAuth } from "../../modules/auth";
import WebsiteFormModal from "./components/WebsiteFormModal";
import { archiveWebsite, getWebsites } from "./service/dashboardServices";
import { DASHBOARD_LABELS, DASHBOARD_MESSAGES, MAX_WEBSITES_PER_USER } from "./DashboardConstants";
import { IWebsite } from "../../shared/sharedInterface";
import {
  DATA_REFRESH_INTERVAL_MS,
  ROUTE_BUILDERS,
  TOAST_POSITION,
} from "../../shared/sharedConstant";
import "./dashboard.css";

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [websites, setWebsites] = useState<IWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [websiteToEdit, setWebsiteToEdit] = useState<IWebsite | undefined>();
  const [websiteToRemove, setWebsiteToRemove] = useState<IWebsite | undefined>();
  const [removing, setRemoving] = useState(false);

  const loadWebsites = useCallback(async () => {
    try {
      const websiteList = await getWebsites();
      setWebsites(websiteList);
    } catch (error) {
      return;
    } finally {
      setLoading(false);
    }
  }, []);

  const openForm = (website?: IWebsite) => {
    setWebsiteToEdit(website);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    loadWebsites();
  };

  const handleRemove = async () => {
    if (!websiteToRemove?.id) {
      return;
    }
    setRemoving(true);
    try {
      await archiveWebsite(websiteToRemove?.id);
      toast.success(DASHBOARD_MESSAGES.WEBSITE_ARCHIVED, { position: TOAST_POSITION });
      setWebsiteToRemove(undefined);
      await loadWebsites();
    } catch (error) {
      return;
    } finally {
      setRemoving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(statusPageLink);
      toast.success(DASHBOARD_MESSAGES.LINK_COPIED, { position: TOAST_POSITION });
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    loadWebsites();
    const refreshTimer = setInterval(loadWebsites, DATA_REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimer);
  }, [loadWebsites]);

  const isLimitReached = websites?.length >= MAX_WEBSITES_PER_USER;
  const statusPagePath = ROUTE_BUILDERS.statusPage(currentUser?.status_page_slug ?? "");
  const statusPageLink = `${window.location.origin}${statusPagePath}`;

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="text-secondary">
          <strong className="text-dark">
            {websites?.length} of {MAX_WEBSITES_PER_USER}
          </strong>{" "}
          {DASHBOARD_LABELS.SITES_USED}
          {isLimitReached && <div className="small">{DASHBOARD_LABELS.LIMIT_REACHED}</div>}
        </div>
        <button
          type="button"
          className="btn btn-success"
          disabled={isLimitReached}
          onClick={() => openForm()}
        >
          {DASHBOARD_LABELS.ADD_WEBSITE}
        </button>
      </div>
      {currentUser?.status_page_slug && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <div className="fw-semibold">{DASHBOARD_LABELS.STATUS_PAGE_LINK}</div>
              <div className="small text-secondary">{DASHBOARD_LABELS.STATUS_PAGE_HINT}</div>
              <code className="small text-break">{statusPageLink}</code>
            </div>
            <div className="d-flex gap-2">
              <Link
                to={statusPagePath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-success"
              >
                {DASHBOARD_LABELS.OPEN}
              </Link>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCopyLink}>
                {DASHBOARD_LABELS.COPY}
              </button>
            </div>
          </div>
        </div>
      )}
      {websites?.length === 0 ? (
        <div className="sw-dashboard-empty rounded-3 text-center bg-white p-5">
          <h2 className="h5">{DASHBOARD_LABELS.EMPTY_TITLE}</h2>
          <p className="text-secondary mb-0">{DASHBOARD_LABELS.EMPTY_TEXT}</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
          {websites?.map((website) => (
            <div className="col" key={website?.id}>
              <div className="card h-100 border-0 shadow-sm sw-dashboard-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <Link
                      to={ROUTE_BUILDERS.websiteDetails(website?.id)}
                      className="h5 mb-0 text-decoration-none text-dark text-break"
                    >
                      {website?.name}
                    </Link>
                    <StatusBadge status={website?.current_status} />
                  </div>
                  <a
                    href={website?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="small text-secondary text-break mb-3"
                  >
                    {website?.url}
                  </a>
                  <div className="small text-secondary mb-3">
                    {DASHBOARD_LABELS.EVERY} {website?.check_interval_minutes}{" "}
                    {DASHBOARD_LABELS.SHORT_MINUTES}
                    {website?.is_public && (
                      <span className="badge text-bg-light border ms-2">
                        {DASHBOARD_LABELS.PUBLIC}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto d-flex gap-2">
                    <Link
                      to={ROUTE_BUILDERS.websiteDetails(website?.id)}
                      className="btn btn-sm btn-outline-success"
                    >
                      {DASHBOARD_LABELS.DETAILS}
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openForm(website)}
                    >
                      {DASHBOARD_LABELS.EDIT}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger ms-auto"
                      onClick={() => setWebsiteToRemove(website)}
                    >
                      {DASHBOARD_LABELS.REMOVE}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <WebsiteFormModal
          website={websiteToEdit}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
      <Modal show={!!websiteToRemove} onHide={() => setWebsiteToRemove(undefined)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5">{DASHBOARD_LABELS.REMOVE_TITLE}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fw-semibold text-break mb-1">{websiteToRemove?.name}</p>
          <p className="text-secondary mb-0">{DASHBOARD_LABELS.REMOVE_TEXT}</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setWebsiteToRemove(undefined)}
          >
            {DASHBOARD_LABELS.CANCEL}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={removing}
            onClick={handleRemove}
          >
            {removing ? DASHBOARD_LABELS.REMOVING : DASHBOARD_LABELS.REMOVE}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Dashboard;
