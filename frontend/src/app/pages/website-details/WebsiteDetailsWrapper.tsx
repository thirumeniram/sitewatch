import { FC } from "react";
import PageTitle from "../../components/page-title/PageTitle";
import { PAGE_TITLE } from "../../shared/sharedConstant";
import WebsiteDetails from "./WebsiteDetails";

const WebsiteDetailsWrapper: FC = () => {
  return (
    <>
      <PageTitle title={PAGE_TITLE.WEBSITE_DETAILS} />
      <WebsiteDetails />
    </>
  );
};

export default WebsiteDetailsWrapper;
