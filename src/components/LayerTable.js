import React from "react";

import Stack from "react-bootstrap/Stack";
import Table from "react-bootstrap/Table";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFileCsv } from "@fortawesome/free-solid-svg-icons";

import { CSVDownloader } from "react-papaparse";

function LayerTable(props) {
  return (
    <Stack gap={1}>
      <div>
      <CSVDownloader
          filename={props.title}
          className="float-end btn btn-primary"
          type="button"
          data={props.data}
        >
          <FontAwesomeIcon icon={faDownload} />{" "}
          <FontAwesomeIcon icon={faFileCsv} />
        </CSVDownloader>
      </div>
      <Table striped bordered hover size="sm" responsive>
        <thead>
          <tr>
            {props.data[0].map(function (heading, index) {
              const name = "heading_" + index;
              return <th key={name}>{heading}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {Object.keys(props.data).map(function (cycle, cyc_index) {
            if (cyc_index === 0) return null;
            const name = "row_" + cyc_index;
            return (
              <tr key={name}>
                {props.data[cycle].map(function (value, val_index) {
                  const name = "value_" + val_index;
                  return (
                    <td align={isNaN(value) ? "left" : "right"} key={name}>
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
