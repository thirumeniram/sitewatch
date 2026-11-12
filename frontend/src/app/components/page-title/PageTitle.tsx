import React, { useEffect } from "react";
import { IPageTitleProps } from "../component-interface";
import { APP_NAME } from "../../shared/sharedConstant";

const PageTitle: React.FC<IPageTitleProps> = ({ title, children }) => {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;
  }, [title]);

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <h1 className="h3 mb-0 text-break">{title}</h1>
      {children}
    </div>
  );
};

export default PageTitle;
