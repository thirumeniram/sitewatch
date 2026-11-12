import React from "react";
import { IStatusBadgeProps } from "../component-interface";
import { STATUS_BADGE_CLASSES, STATUS_LABELS, WEBSITE_STATUS } from "../../shared/sharedConstant";

const StatusBadge: React.FC<IStatusBadgeProps> = ({ status = WEBSITE_STATUS.UNKNOWN }) => {
  return (
    <span className={`badge ${STATUS_BADGE_CLASSES[status] ?? STATUS_BADGE_CLASSES.UNKNOWN}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
};

export default StatusBadge;
