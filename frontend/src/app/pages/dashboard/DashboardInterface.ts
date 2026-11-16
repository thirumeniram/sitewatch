import { IWebsite } from "../../shared/sharedInterface";

export interface IWebsiteFormValues {
  name: string;
  url: string;
  check_interval_minutes: number;
  is_public: boolean;
}

export interface IWebsiteId {
  id: string;
}

export interface IWebsiteFormModalProps {
  website?: IWebsite;
  onClose: () => void;
  onSaved: () => void;
}
