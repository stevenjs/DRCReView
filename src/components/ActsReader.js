import React from "react";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";

import { CSVReader, readRemoteFile } from "react-papaparse";

function ActsReader(props) {
  const handleRawData = (data) =>
    parseRawData(data, props.onActsFileLoad, props.onActsFileError);

  return (
    <Stack gap={2} className="mx-auto">
      <CSVReader
        onDrop={handleRawData}
        onError={props.onActsFileError}
        addRemoveButton
        onRemoveFile={props.onRemoveActsFile}
        accept="text/acts, .acts, application/drc"
        config={{
          delimiter: " ",
          dynamicTyping: true,
          skipEmptyLines: false,
        }}
      >
        <span>
          Drop DRC <code>.acts</code> file here or click to load.
        </span>
      </CSVReader>
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
              onClick={() =>
                loadExample(props.onActsFileLoad, props.onActsFileError)
              }
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

function loadExample(onComplete, onError) {
  readRemoteFile("bork.acts", {
    delimiter: " ",
    dynamicTyping: true,
    skipEmptyLines: false,
    complete: (results) => parseRawData(results.data, onComplete, onError),
    error: (err) => onError(err),
  });
}

function parseRawData(data, onComplete, onError) {
  let actsData = {
    namingThreshold: undefined,
    maxCycle: 0,
    layers: [],
    layerPositions: {},
    units: {},
    activations: [],
    gpcActivity: [],
    totals: [],
  };

  let errorEncountered = false;

  data.every((row, index) => {
    const data =
      Object.prototype.toString.call(row) === "[object Array]" ? row : row.data;

    // Skip empty lines
    if (data === null || data.every((elt) => elt === null)) return true;

    if (typeof data[0] === "string" && (data[0] === "#" || data[0] === ";"))
      handleComment(actsData, data, index);
    else if (
      typeof data[0] === "string" &&
      data[0].startsWith("Cycle") &&
      typeof data[1] === "string" &&
      data[1] === "GPCRoute"
    )
      handleOldStyleGPCActivityLine(actsData, data, index);
    else if (typeof data[0] === "string" && data[0].startsWith("Cycle"))
      handleOldStyleActsLine(actsData, data, index);
    else if (
      typeof data[0] === "string" &&
      data[0].startsWith("T") &&
      typeof data[1] === "string" &&
      data[1].startsWith("Cycle")
    )
      handleOldStyleTotalLine(actsData, data, index);
    else {
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
    onComplete();
  } else {
    tidy(actsData);
    onComplete(actsData);
  }
}

function handleComment(actsData, data, index) {
  // Older style naming threshold parameter
  if (
    data[1] === "Naming" &&
    data[2] === "threshold:" &&
    typeof data[3] === "number"
  ) {
    actsData.namingThreshold = data[3];
  }
}

function handleOldStyleGPCActivityLine(actsData, data, index) {
  // Handle an old-style GPC activity line
  // e.g. Cycle124 GPCRoute bork+ b->b or->9,3 k->k {ork->9k}
  let cycle = parseInt(data[0].substring(5));
  actsData.gpcActivity[cycle] = data.slice(2).join(" ");
}

function handleOldStyleActsLine(actsData, data, index) {
  // Handle an old-style activation line
  // e.g. Cycle133 P1 0.153557 b
  let cycle = parseInt(data[0].substring(5));
  let layer = data[1];
  let act = data[2];
  let unit = data[3];
  let pos = 1;

  if (layer.startsWith("VF")) return;

  if (cycle > actsData.maxCycle) actsData.maxCycle = cycle;

  let digitIndex = layer.search(/\d/);
  if (digitIndex !== -1) {
    pos = parseInt(layer.substring(digitIndex));
    layer = layer.substring(0, digitIndex);
  }

  if (!actsData.layers.includes(layer)) actsData.layers.push(layer);

  if (typeof actsData.layerPositions[layer] === "undefined")
    actsData.layerPositions[layer] = [];
  if (!actsData.layerPositions[layer].includes(pos))
    actsData.layerPositions[layer].push(pos);

  if (typeof actsData.activations[layer] === "undefined")
    actsData.activations[layer] = {};
  if (typeof actsData.activations[layer][cycle] === "undefined")
    actsData.activations[layer][cycle] = [];
  if (typeof actsData.activations[layer][cycle][pos] === "undefined")
    actsData.activations[layer][cycle][pos] = {};

  actsData.activations[layer][cycle][pos][unit] = act;

  if (typeof actsData.units[layer] === "undefined") actsData.units[layer] = [];
  if (typeof actsData.units[layer][pos] === "undefined")
    actsData.units[layer][pos] = [];
  if (!actsData.units[layer][pos].includes(unit))
    actsData.units[layer][pos].push(unit);
}

function handleOldStyleTotalLine(actsData, data, index) {
  // Handle an old-style total activation line
  // e.g. TSem Cycle133 3.514319
  let layer = data[0].substring(1);
  let cycle = parseInt(data[1].substring(5));
  let total = data[2];

  if (layer === "VF") return;
  if (layer === "O") layer = "Orth";
  if (layer === "P") layer = "Phon";
  if (layer === "Ph") layer = "P";

  if (!actsData.layers.includes(layer)) actsData.layers.push(layer);
  if (typeof actsData.totals[cycle] === "undefined")
    actsData.totals[cycle] = {};
  actsData.totals[cycle][layer] = total;

  if (cycle > actsData.maxCycle) actsData.maxCycle = cycle;
}

function notHandled(data, index) {
  console.error("Line " + (index + 1) + " not handled: " + data.join(" "));
}

function tidy(actsData) {
  if (typeof actsData.layerPositions !== "undefined") {
    // Sort the list of positions for each layer into numerically ascending order
    for (const layer in actsData.layerPositions) {
      actsData.layerPositions[layer].sort((a, b) => a - b);
    }
  }
  if (typeof actsData.units !== "undefined") {
    for (const layer in actsData.units) {
      for (const pos in actsData.units[layer]) {
        actsData.units[layer][pos].sort();
      }
    }
  }
}
