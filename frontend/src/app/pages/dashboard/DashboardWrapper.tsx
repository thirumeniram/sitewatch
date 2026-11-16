import { FC } from "react";
import PageTitle from "../../components/page-title/PageTitle";
import { PAGE_TITLE } from "../../shared/sharedConstant";
import Dashboard from "./Dashboard";

const DashboardWrapper: FC = () => {
  return (
    <>
      <PageTitle title={PAGE_TITLE.DASHBOARD} />
      <Dashboard />
    </>
  );
};

export default DashboardWrapper;
