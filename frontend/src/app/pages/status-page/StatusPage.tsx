import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import StatusBadge from "../../components/status-badge/StatusBadge";
import { getStatusPage } from "./service/statusPageServices";
import { IStatusPage } from "./StatusPageInterface";
import { DAY_BAR_CLASSES, DAY_BAR_TITLES, STATUS_PAGE_LABELS } from "./StatusPageConstants";
import {
  APP_NAME,
  APP_PUBLIC_ROUTES,
  COMMON_MESSAGES,
  DATA_REFRESH_INTERVAL_MS,
  WEBSITE_STATUS,
} from "../../shared/sharedConstant";
import { formatDateTime, formatDuration, formatPercent } from "../../utils/Utils";
import "./status-page.css";

const StatusPage: React.FC = () => {
  const { slug } = useParams();
  const [statusPage, setStatusPage] = useState<IStatusPage | undefined>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const hasLoaded = useRef(false);

  const loadStatusPage = useCallback(async () => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      const page = await getStatusPage(slug);
      setStatusPage(page);
      setNotFound(!page);
      hasLoaded.current = !!page;
    } catch (error) {
      if (!hasLoaded.current) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadStatusPage();
    const refreshTimer = setInterval(loadStatusPage, DATA_REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimer);
  }, [loadStatusPage]);

  const sites = statusPage?.sites ?? [];
  const incidents = statusPage?.incidents ?? [];
  const isSomethingDown = sites.some((site) => site?.current_status === WEBSITE_STATUS.DOWN);

  return (
    <div className="sw-status-page min-vh-100">
      <nav className="navbar bg-white border-bottom">
        <div className="container sw-status-content">
          <Link className="navbar-brand fw-bold text-success" to={APP_PUBLIC_ROUTES.AUTH_LOGIN}>
            {APP_NAME}
          </Link>
          <span className="text-secondary">{STATUS_PAGE_LABELS.TITLE}</span>
        </div>
      </nav>
      <main className="container sw-status-content py-4">
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-success" role="status" />
          </div>
        )}
        {!loading && notFound && (
          <div className="card border-0 shadow-sm text-center p-5">
            <h1 className="h4">{STATUS_PAGE_LABELS.NOT_FOUND}</h1>
            <p className="text-secondary mb-0">{STATUS_PAGE_LABELS.NOT_FOUND_TEXT}</p>
          </div>
        )}
        {!loading && !notFound && sites.length === 0 && (
          <div className="card border-0 shadow-sm text-center p-5">
            <h1 className="h4">{STATUS_PAGE_LABELS.NO_SITES}</h1>
            <p className="text-secondary mb-0">{STATUS_PAGE_LABELS.NO_SITES_TEXT}</p>
          </div>
        )}
        {!loading && !notFound && sites.length > 0 && (
          <>
            <div
              className={clsx(
                "alert mb-4 fw-semibold",
                isSomethingDown ? "alert-danger" : "alert-success",
              )}
              role="status"
            >
              {isSomethingDown ? STATUS_PAGE_LABELS.SOME_DOWN : STATUS_PAGE_LABELS.ALL_UP}
            </div>
            <div className="card border-0 shadow-sm mb-4">
              <ul className="list-group list-group-flush">
                {sites.map((site, index) => (
                  <li className="list-group-item py-3" key={`${site?.name}-${index}`}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-break">{site?.name}</span>
                        <StatusBadge status={site?.current_status} />
                      </div>
                      <span className="small text-secondary">
                        {STATUS_PAGE_LABELS.UPTIME_90D}:{" "}
                        <strong className="text-dark">{formatPercent(site?.uptime_90d)}</strong>
                      </span>
                    </div>
                    <div className="sw-status-days">
                      {site?.days?.map((day) => (
                        <span
                          key={day?.date}
                          className={clsx("sw-status-day", DAY_BAR_CLASSES[day?.status])}
                          title={`${day?.date}: ${DAY_BAR_TITLES[day?.status] ?? day?.status}`}
                        />
                      ))}
                    </div>
                    <div className="d-flex justify-content-between small text-secondary mt-1">
                      <span>{STATUS_PAGE_LABELS.LAST_30_DAYS}</span>
                      <span>{STATUS_PAGE_LABELS.TODAY}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h6 mb-3">{STATUS_PAGE_LABELS.INCIDENTS_TITLE}</h2>
                {incidents.length === 0 ? (
                  <p className="text-secondary mb-0">{STATUS_PAGE_LABELS.NO_INCIDENTS}</p>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {incidents.map((incident, index) => (
                      <li
                        className={clsx("py-2", index < incidents.length - 1 && "border-bottom")}
                        key={`${incident?.started_at}-${index}`}
                      >
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <StatusBadge status={incident?.status} />
                          <span className="fw-semibold text-break">{incident?.website_name}</span>
                          <span className="small text-secondary">
                            {formatDateTime(incident?.started_at)} &middot;{" "}
                            {formatDuration(incident?.started_at, incident?.ended_at)}
                          </span>
                        </div>
                        <div className="small text-secondary mt-1">
                          {incident?.summary ?? incident?.failure_reason ?? COMMON_MESSAGES.EMPTY_VALUE}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
        <p className="text-center small text-secondary mt-4 mb-0">
          {STATUS_PAGE_LABELS.POWERED_BY} {APP_NAME}
        </p>
      </main>
    </div>
  );
};

export default StatusPage;
