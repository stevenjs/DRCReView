import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
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

type ActsColumnGraphProps = {
  title: string,
  columns: string[],
  values: number[],
  barColour: string
};

function ActsColumnGraph({ title, columns, values, barColour }: ActsColumnGraphProps): JSX.Element {
  const options: ChartOptions<'bar'> = {
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
        text: title,
        align: "start",
        font: {
          size: 11,
        },
        padding: {
            top: 5,
            bottom: 8
        },
      }
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

  const labels = columns;

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: "Activation",
        data: values,
        backgroundColor: barColour,
        borderWidth: 0,
        maxBarThickness: 35
      },
    ],
  };

  return (
      <div style={{ height: "13vh", width: "100%" }}>
        <Bar options={options} data={data} />
      </div>
  );
}

export default ActsColumnGraph;
