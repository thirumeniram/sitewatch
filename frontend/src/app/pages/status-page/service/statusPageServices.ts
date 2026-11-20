import { get } from "../../../modules/auth/core/_requests";
import { getStatusPageUrl } from "../../../utils/services-constants";
import { IStatusPage } from "../StatusPageInterface";

export const getStatusPage = async (slug: string): Promise<IStatusPage | undefined> => {
  const response = await get<IStatusPage>(getStatusPageUrl(slug));
  return response?.data?.success;
};
