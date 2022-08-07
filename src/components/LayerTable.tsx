import React from "react";

import Stack from "react-bootstrap/Stack";
import Table from "react-bootstrap/Table";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFileCsv } from "@fortawesome/free-solid-svg-icons";

import { useCSVDownloader } from "react-papaparse";

type LayerTableProps = {
  title: string;
  data: any
};

function LayerTable({ title, data }: LayerTableProps): JSX.Element {
  const { CSVDownloader, Type } = useCSVDownloader();

  return (
    <Stack gap={1}>
      <div>
      <CSVDownloader
          filename={title}
          className="float-end btn btn-primary"
          type={Type.Button}
          data={data}
        >
          <FontAwesomeIcon icon={faDownload} />{" "}
          <FontAwesomeIcon icon={faFileCsv} />
        </CSVDownloader>
      </div>
      <Table striped bordered hover size="sm" responsive>
        <thead>
          <tr>
            {data[0].map(function (heading: string, index: number) {
              const name = "heading_" + index;
              return <th key={name}>{heading}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).map(function (cycle: string, cyc_index: number) {
            if (cyc_index === 0) return null;
            const name = "row_" + cyc_index;
            return (
              <tr key={name}>
                {data[cycle].map(function (value: string, val_index: number) {
                  const name = "value_" + val_index;
                  return (
                    <td align={isNaN(Number(value)) ? "left" : "right"} key={name}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Stack>
  );
}

export default LayerTable;
