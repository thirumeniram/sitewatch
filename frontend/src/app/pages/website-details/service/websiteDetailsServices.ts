import { get } from "../../../modules/auth/core/_requests";
import {
  getWebsiteIncidentsUrl,
  getWebsiteStatsUrl,
  getWebsiteUrl,
} from "../../../utils/services-constants";
import { IWebsite } from "../../../shared/sharedInterface";
import { IIncident, IWebsiteStats } from "../WebsiteDetailsInterface";
import { EMPTY_WEBSITE_STATS } from "../WebsiteDetailsConstants";

export const getWebsite = async (websiteId: string): Promise<IWebsite | undefined> => {
  const response = await get<IWebsite>(getWebsiteUrl(websiteId));
  return response?.data?.success;
};

export const getWebsiteStats = async (websiteId: string): Promise<IWebsiteStats> => {
  const response = await get<IWebsiteStats>(getWebsiteStatsUrl(websiteId));
  return response?.data?.success ?? EMPTY_WEBSITE_STATS;
};

export const getWebsiteIncidents = async (websiteId: string): Promise<IIncident[]> => {
  const response = await get<IIncident[]>(getWebsiteIncidentsUrl(websiteId));
  return response?.data?.success ?? [];
};
