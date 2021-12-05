import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ActsColumnGraph(props) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: 0
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: props.title,
        align: "start",
        font: {
          size: 8,
        },
        padding: {
            top: 0,
            bottom: 8,
            left: 10,
            right: 10
        },
      },
    },
    scales: {
      y: {
        display: true,
        beginAtZero: true,
        min: 0.0,
        max: 1.0,
      },
    },
  };

  const labels = props.columns;

  const data = {
    labels,
    datasets: [
      {
        label: "Activation",
        data: props.values,
        backgroundColor: props.barColour,
      },
    ],
  };

  return (
      <div style={{ height: "12vh", width: "100%" }}>
        <Bar options={options} data={data} />
      </div>
  );
}

export default ActsColumnGraph;
