import React from "react";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";

import LayerTable from "./LayerTable";
import { Nav } from "react-bootstrap";

function TableView(props) {
  return (
    <>
      {props.data ? (
        <Tab.Container defaultActiveKey={defaultTableViewTab(props.data)}>
          <Row>
            <Col className="bg-light" sm={3}>
              <Nav variant="pills" className="flex-column">
                {typeof props.data.layerPositions["L"] !== "undefined" ? (
                  <Nav.Item>
                    <Nav.Link eventKey="letter">Letter Layer</Nav.Link>
                  </Nav.Item>
                ) : null}

                {typeof props.data.layerPositions["Orth"] !== "undefined" ? (
                  <Nav.Item>
                    <Nav.Link eventKey="orth">Orthographic Lexicon</Nav.Link>
                  </Nav.Item>
                ) : null}

                {typeof props.data.layerPositions["Phon"] !== "undefined" ? (
                  <Nav.Item>
                    <Nav.Link eventKey="phon">Phonological Lexicon</Nav.Link>
                  </Nav.Item>
                ) : null}

                {typeof props.data.layerPositions["Sem"] !== "undefined" ? (
                  <Nav.Item>
                    <Nav.Link eventKey="sem">Semantic System</Nav.Link>
                  </Nav.Item>
                ) : null}

                {typeof props.data.layerPositions["GPC"] !== "undefined" ||
                typeof props.data.layerPositions["GPCR"] !== "undefined" ? (
                  <>
                  <Nav.Item>
                    <Nav.Link eventKey="gpc">GPC Route</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="gpcactivity">GPC Activity</Nav.Link>
                  </Nav.Item>
                  </>
                ) : null}

                {typeof props.data.layerPositions["P"] !== "undefined" ? (
                  <Nav.Item>
                    <Nav.Link eventKey="phoneme">Phoneme Layer</Nav.Link>
                  </Nav.Item>
                ) : null}

                {typeof props.data.totals !== "undefined" ? (
                  <Nav.Item>
                    <Nav.Link eventKey="totals">Totals</Nav.Link>
                  </Nav.Item>
                ) : null}
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                {typeof props.data.layerPositions["L"] !== "undefined" ? (
                  <Tab.Pane eventKey="letter">
                    <LayerTable
                      title="Letter"
                      data={generateTableData("L", props.data)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof props.data.layerPositions["Orth"] !== "undefined" ? (
                  <Tab.Pane eventKey="orth">
                    <LayerTable
                      title="Orthographic Lexicon"
                      data={generateTableData("Orth", props.data)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof props.data.layerPositions["Phon"] !== "undefined" ? (
                  <Tab.Pane eventKey="phon">
                    <LayerTable
                      title="Phonological Lexicon"
                      data={generateTableData("Phon", props.data)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof props.data.layerPositions["Sem"] !== "undefined" ? (
                  <Tab.Pane eventKey="sem">
                    <LayerTable
                      title="Semantic System"
                      data={generateTableData("Sem", props.data)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof props.data.layerPositions["GPC"] !== "undefined" ||
                typeof props.data.layerPositions["GPCR"] !== "undefined" ? (
                  <>
                  <Tab.Pane eventKey="gpc">
                    <LayerTable
                      title="GPC Route"
                      data={generateGPCTableData(props.data)}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="gpcactivity">
                    <LayerTable 
                    title="GPC Activity" 
                    data={generateGPCActivityTableData(props.data)}
                    />
                  </Tab.Pane>
                  </>
                ) : null}

                {typeof props.data.layerPositions["P"] !== "undefined" ? (
                  <Tab.Pane eventKey="phoneme">
                    <LayerTable
                      title="Phoneme"
                      data={generateTableData("P", props.data)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof props.data.totals !== "undefined" ? (
                  <Tab.Pane eventKey="totals">
                    <LayerTable
                      title="Totals"
                      data={generateTotalsData(props.data)}
                    />
                  </Tab.Pane>
                ) : null}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      ) : null}
    </>
  );
}

export default TableView;

function defaultTableViewTab(actsData) {
  if (typeof actsData.layerPositions["L"] !== "undefined") return "letter";
  if (typeof actsData.layerPositions["Orth"] !== "undefined") return "orth";
  if (typeof actsData.layerPositions["Phon"] !== "undefined") return "phon";
  if (typeof actsData.layerPositions["Sem"] !== "undefined") return "sem";
  if (
    typeof actsData.layerPositions["GPC"] !== "undefined" ||
    typeof actsData.layerPositions["GPCR"] !== "undefined"
  )
    return "gpc";
  if (typeof actsData.layerPositions["P"] !== "undefined") return "phoneme";
  if (typeof actsData.totals !== "undefined") return "totals";
}

function generateTableData(layer, actsData) {
  const singlePositionLayers = ["Orth", "Phon", "Sem"];
  let data = [];

  let hdr = [];
  hdr.push("Cycle");
  actsData.layerPositions[layer].forEach(function (pos) {
    actsData.units[layer][pos].forEach(function (unit) {
      const name =
        Object.keys(actsData.layerPositions[layer]).length === 1 &&
        actsData.layerPositions[layer][0] === 1 &&
        singlePositionLayers.includes(layer)
          ? unit
          : layer + pos + " " + unit;
      hdr.push(name);
    });
  });

  data.push(hdr);

  Object.keys(actsData.activations[layer]).forEach(function (cycle) {
    let row = [];
    row.push(cycle);
    actsData.layerPositions[layer].forEach(function (pos) {
      actsData.units[layer][pos].forEach(function (unit) {
        if (typeof actsData.activations[layer][cycle][pos] === "undefined")
          row.push(undefined);
        else row.push(actsData.activations[layer][cycle][pos][unit]);
      });
    });
    data.push(row);
  });

  return data;
}

function generateGPCTableData(actsData) {
  const layers = ["GPC", "GPCR"];
  let data = [];

  let hdr = [];
  hdr.push("Cycle");

  let positions = [];
  layers.forEach((layer) => {
    actsData.layerPositions[layer].forEach((pos) => {
      if (!positions.includes(pos)) positions.push(pos);
    });
  });

  positions.sort((a, b) => a - b);

  positions.forEach((pos) => {
    layers.forEach((layer) => {
      if (typeof actsData.units[layer] === "undefined") return;
      if (typeof actsData.units[layer][pos] === "undefined") return;
      actsData.units[layer][pos].forEach((unit) => {
        const name = layer + pos + " " + unit;
        hdr.push(name);
      });
    });
  });

  data.push(hdr);

  let cycles = [];
  layers.forEach((layer) => {
    Object.keys(actsData.activations[layer]).forEach((cycle) => {
      if (!cycles.includes(cycle)) cycles.push(cycle);
    });
  });

  cycles.sort((a, b) => a - b);

  cycles.forEach((cycle) => {
    let row = [];
    row.push(cycle);
    positions.forEach((pos) => {
      layers.forEach((layer) => {
        if (typeof actsData.units[layer] === "undefined") return;
        if (typeof actsData.units[layer][pos] === "undefined") return;
        actsData.units[layer][pos].forEach((unit) => {
          if (typeof actsData.activations[layer][cycle] === "undefined")
            row.push(undefined);
          else if (
            typeof actsData.activations[layer][cycle][pos] === "undefined"
          )
            row.push(undefined);
          else if (
            typeof actsData.activations[layer][cycle][pos][unit] === "undefined"
          )
            row.push(undefined);
          else row.push(actsData.activations[layer][cycle][pos][unit]);
        });
      });
    });
    data.push(row);
  });

  return data;
}

function generateGPCActivityTableData(actsData) {
  let data = [];

  let hdr = [];
  hdr.push("Begin");
  hdr.push("End");
  hdr.push("GPC Route Input");
  hdr.push("GPC Rules");
  hdr.push("Body-Rime");
  data.push(hdr);

  let previous = '';
  let previousCycle = -1;
  let begin = 1;
  Object.keys(actsData.gpcActivity).forEach((cycle) => {
    const activity = actsData.gpcActivity[cycle];
    if (activity !== previous) {
      if (previous !== '') {
        data.push(createGPCActivityRow(begin, previousCycle, previous));
      }

      previous = activity;
      begin = cycle;
    }
    previousCycle = cycle;
  });

  if (previous !== '') {
    data.push(createGPCActivityRow(begin, previousCycle, previous));
  }

  return data;
}

function createGPCActivityRow(begin, end, activity) {
  let row = [];
  row.push(begin);
  row.push(end);
  const fields = activity.split(" ");
  row.push(fields[0]);
  if (activity.endsWith("}")) {
    row.push(fields.splice(1, fields.length-2).join(" "));
    row.push(fields.splice(-1)[0].slice(1,-1));
  } else {
    row.push(fields.splice(1).join(" "));
    row.push(undefined);
  }
  return row;
}

function generateTotalsData(actsData) {
  const layers = {
    L: "Letter",
    Orth: "Orthographic Lexicon",
    Phon: "Phonological Lexicon",
    Sem: "Semantic System",
    GPC: "GPC Rules",
    GPCR: "GPC Rime",
    P: "Phoneme",
  };

  let data = [];

  let hdr = [];
  hdr.push("Cycle");

  Object.keys(layers).forEach((key) => {
    if (actsData.layers.includes(key)) hdr.push(layers[key]);
  });

  data.push(hdr);

  Object.keys(actsData.totals).forEach((cycle) => {
    let row = [cycle];
    Object.keys(layers).forEach((layer) => {
      if (typeof actsData.totals[cycle][layer] === "undefined")
        row.push(undefined);
      else row.push(actsData.totals[cycle][layer]);
    });
    data.push(row);
  });

  return data;
}
