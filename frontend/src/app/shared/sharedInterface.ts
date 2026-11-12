import { WEBSITE_STATUS } from "./sharedConstant";

export type IWebsiteStatus = keyof typeof WEBSITE_STATUS;

export interface IWebsite {
  id: string;
  name: string;
  url: string;
  check_interval_minutes: number;
  current_status: IWebsiteStatus;
  is_public: boolean;
  created_at: string;
  modified_at: string;
}
