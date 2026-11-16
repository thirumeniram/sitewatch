import { get, patch, post, remove } from "../../../modules/auth/core/_requests";
import { WEBSITE_URL, getWebsiteUrl } from "../../../utils/services-constants";
import { IWebsite } from "../../../shared/sharedInterface";
import { IWebsiteFormValues, IWebsiteId } from "../DashboardInterface";

export const getWebsites = async (): Promise<IWebsite[]> => {
  const response = await get<IWebsite[]>(WEBSITE_URL);
  return response?.data?.success ?? [];
};

export const addWebsite = async (values: IWebsiteFormValues) => {
  const response = await post<IWebsite>(WEBSITE_URL, values);
  return response?.data?.success;
};

export const updateWebsite = async (websiteId: string, changes: Partial<IWebsiteFormValues>) => {
  const response = await patch<IWebsite>(getWebsiteUrl(websiteId), changes);
  return response?.data?.success;
};

export const archiveWebsite = async (websiteId: string) => {
  const response = await remove<IWebsiteId>(getWebsiteUrl(websiteId));
  return response?.data?.success;
};
