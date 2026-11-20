import { FC, useEffect } from "react";
import { APP_NAME, PAGE_TITLE } from "../../shared/sharedConstant";
import StatusPage from "./StatusPage";

const StatusPageWrapper: FC = () => {
  useEffect(() => {
    document.title = `${PAGE_TITLE.STATUS_PAGE} | ${APP_NAME}`;
  }, []);

  return <StatusPage />;
};

export default StatusPageWrapper;
