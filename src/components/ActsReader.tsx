import React from "react";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";

import { usePapaParse } from "react-papaparse";
import DRCActivations from "../lib/DRCActivations";

import CSVReader from "./CSVReader";

type ActsReaderProps = {
  onActsFileLoad: (acts?: DRCActivations) => void,
  onActsFileError: (err: any) => void,
  onRemoveActsFile: () => void
};

function ActsReader({ onActsFileLoad, onActsFileError, onRemoveActsFile }: ActsReaderProps): JSX.Element {
  const { readRemoteFile } = usePapaParse();

  const handleRawData = (results: any) =>
    parseRawData(results.data, onActsFileLoad, onActsFileError);

  return (
    <Stack gap={2} className="mx-auto">
      <CSVReader
        onUploadAccepted={handleRawData}
        onFileRemoved={onRemoveActsFile}
        message="Drop DRC <code>.acts</code> file here or click to load."
        accept="text/acts, .acts, application/drc"
        config={{
          delimiter: " ",
          dynamicTyping: true,
          skipEmptyLines: false,
          error: onActsFileError
        }}
      />
      <Container>
        <Row className="justify-content-md-center">
          <Col md="auto" className="text-secondary">
            or
          </Col>
        </Row>
      </Container>
      <Container>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <Button
              variant="secondary"
              onClick={() => {
                readRemoteFile("bork.acts", {
                  delimiter: " ",
                  dynamicTyping: true,
                  skipEmptyLines: false,
                  download: true,
                  complete: (results: any) =>
                    parseRawData(
                      results.data,
                      onActsFileLoad,
                      onActsFileError
                    ),
                  error: (err: any) => onActsFileError(err),
                });
              }}
            >
              Load Example Data
            </Button>
          </Col>
        </Row>
      </Container>
    </Stack>
  );
}

export default ActsReader;

function parseRawData(data: any, onComplete: (acts?: DRCActivations) => void, onError: (err: any) => void) {
  let errorEncountered = false;
  var acts = new DRCActivations();

  data.every((row: any, index: number) => {
    const data =
      Object.prototype.toString.call(row) === "[object Array]" ? row : row.data;

    // Skip empty lines
    if (data === null || data.every((elt: any) => elt === null)) return true;

    if (!acts.interpretActsLine(data)) {
      notHandled(data, index);
      const err = {
        row: index,
        message: "line format not recognised",
      };
      onError(err);
      errorEncountered = true;
      return false;
    }

    return true;
  });

  if (errorEncountered) {
    onComplete(undefined);
  } else {
    acts.handleEndOfData();
    onComplete(acts);
  }
}

function notHandled(data: any, index: number) {
  console.error("Line " + (index + 1) + " not handled: " + data.join(" "));
}
