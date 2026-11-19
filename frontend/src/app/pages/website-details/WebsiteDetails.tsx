import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../../components/status-badge/StatusBadge";
import ResponseTimeChart from "./components/ResponseTimeChart";
import {
  getWebsite,
  getWebsiteIncidents,
  getWebsiteStats,
} from "./service/websiteDetailsServices";
import { IIncident, IWebsiteStats } from "./WebsiteDetailsInterface";
import { EMPTY_WEBSITE_STATS, WEBSITE_DETAILS_LABELS } from "./WebsiteDetailsConstants";
import { IWebsite } from "../../shared/sharedInterface";
import {
  APP_PRIVATE_ROUTES,
  COMMON_MESSAGES,
  DATA_REFRESH_INTERVAL_MS,
} from "../../shared/sharedConstant";
import { formatDateTime, formatDuration, formatPercent } from "../../utils/Utils";
import "./website-details.css";

const WebsiteDetails: React.FC = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState<IWebsite | undefined>();
  const [stats, setStats] = useState<IWebsiteStats>(EMPTY_WEBSITE_STATS);
  const [incidents, setIncidents] = useState<IIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  const loadDetails = useCallback(async () => {
    if (!websiteId) {
      return;
    }
    try {
      const websiteData = await getWebsite(websiteId);
      const [statsData, incidentList] = await Promise.all([
        getWebsiteStats(websiteId),
        getWebsiteIncidents(websiteId),
      ]);
      setWebsite(websiteData);
      setStats(statsData);
      setIncidents(incidentList);
      hasLoaded.current = true;
    } catch (error) {
      if (!hasLoaded.current) {
        navigate(APP_PRIVATE_ROUTES.DASHBOARD);
      }
    } finally {
      setLoading(false);
    }
  }, [websiteId, navigate]);

  useEffect(() => {
    loadDetails();
    const refreshTimer = setInterval(loadDetails, DATA_REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimer);
  }, [loadDetails]);

  const lastResponseTime = stats?.recent_checks?.[0]?.response_time_ms;
  const statCards = [
    { label: WEBSITE_DETAILS_LABELS.UPTIME_24H, value: formatPercent(stats?.uptime_24h) },
    { label: WEBSITE_DETAILS_LABELS.UPTIME_7D, value: formatPercent(stats?.uptime_7d) },
    {
      label: WEBSITE_DETAILS_LABELS.CHECKED_EVERY,
      value: `${website?.check_interval_minutes ?? COMMON_MESSAGES.EMPTY_VALUE} ${WEBSITE_DETAILS_LABELS.MINUTES}`,
    },
    {
      label: WEBSITE_DETAILS_LABELS.LAST_RESPONSE,
      value:
        lastResponseTime === null || lastResponseTime === undefined
          ? COMMON_MESSAGES.EMPTY_VALUE
          : `${lastResponseTime} ${WEBSITE_DETAILS_LABELS.MILLISECONDS}`,
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  return (
    <>
      <Link to={APP_PRIVATE_ROUTES.DASHBOARD} className="small text-decoration-none">
        &larr; {WEBSITE_DETAILS_LABELS.BACK}
      </Link>
      <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
        <h2 className="h4 mb-0 text-break">{website?.name}</h2>
        <StatusBadge status={website?.current_status} />
      </div>
      <a
        href={website?.url}
        target="_blank"
        rel="noopener noreferrer"
        className="small text-secondary text-break"
      >
        {website?.url}
      </a>
      <div className="row row-cols-2 row-cols-lg-4 g-3 mt-1 mb-3">
        {statCards.map((statCard) => (
          <div className="col" key={statCard.label}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="small text-secondary">{statCard.label}</div>
                <div className="sw-details-stat-value">{statCard.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <h3 className="h6 mb-1">{WEBSITE_DETAILS_LABELS.CHART_TITLE}</h3>
          <p className="small text-secondary">{WEBSITE_DETAILS_LABELS.CHART_SUBTITLE}</p>
          {stats?.recent_checks?.length > 0 ? (
            <ResponseTimeChart checks={stats?.recent_checks} />
          ) : (
            <p className="text-secondary mb-0">{WEBSITE_DETAILS_LABELS.NO_CHECKS}</p>
          )}
        </div>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="h6 mb-3">{WEBSITE_DETAILS_LABELS.INCIDENTS_TITLE}</h3>
          {incidents?.length > 0 ? (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>{WEBSITE_DETAILS_LABELS.STATUS}</th>
                    <th>{WEBSITE_DETAILS_LABELS.STARTED}</th>
                    <th>{WEBSITE_DETAILS_LABELS.ENDED}</th>
                    <th>{WEBSITE_DETAILS_LABELS.DURATION}</th>
                    <th>{WEBSITE_DETAILS_LABELS.REASON}</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents?.map((incident) => (
                    <tr key={incident?.id}>
                      <td>
                        <StatusBadge status={incident?.status} />
                      </td>
                      <td className="text-nowrap">{formatDateTime(incident?.started_at)}</td>
                      <td className="text-nowrap">{formatDateTime(incident?.ended_at)}</td>
                      <td className="text-nowrap">
                        {formatDuration(incident?.started_at, incident?.ended_at)}
                      </td>
                      <td>
                        {incident?.failure_reason ?? COMMON_MESSAGES.EMPTY_VALUE}
                        {incident?.summary && (
                          <div className="small text-secondary mt-1">{incident?.summary}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-secondary mb-0">{WEBSITE_DETAILS_LABELS.NO_INCIDENTS}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default WebsiteDetails;
