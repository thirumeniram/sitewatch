import React from "react";
import { Line } from "react-chartjs-2";
import { IResponseTimeChartProps } from "../WebsiteDetailsInterface";
import {
  CHART_DOWN_POINT_COLOR,
  CHART_FILL_COLOR,
  CHART_LINE_COLOR,
  CHART_LINE_TENSION,
  CHART_POINT_RADIUS,
  CHECK_STATUS_DOWN,
  WEBSITE_DETAILS_LABELS,
} from "../WebsiteDetailsConstants";
import { formatTime } from "../../../utils/Utils";

const ResponseTimeChart: React.FC<IResponseTimeChartProps> = ({ checks = [] }) => {
  const oldestFirstChecks = [...checks].reverse();
  const chartData = {
    labels: oldestFirstChecks.map((check) => formatTime(check?.checked_at)),
    datasets: [
      {
        label: WEBSITE_DETAILS_LABELS.CHART_AXIS,
        data: oldestFirstChecks.map((check) => check?.response_time_ms ?? 0),
        borderColor: CHART_LINE_COLOR,
        backgroundColor: CHART_FILL_COLOR,
        pointBackgroundColor: oldestFirstChecks.map((check) =>
          check?.status === CHECK_STATUS_DOWN ? CHART_DOWN_POINT_COLOR : CHART_LINE_COLOR,
        ),
        pointBorderColor: oldestFirstChecks.map((check) =>
          check?.status === CHECK_STATUS_DOWN ? CHART_DOWN_POINT_COLOR : CHART_LINE_COLOR,
        ),
        pointRadius: CHART_POINT_RADIUS,
        tension: CHART_LINE_TENSION,
        fill: true,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: WEBSITE_DETAILS_LABELS.CHART_AXIS },
      },
    },
  };

  return (
    <div className="sw-details-chart">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default ResponseTimeChart;
