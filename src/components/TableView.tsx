import React from "react";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";

import LayerTable from "./LayerTable";
import { Nav } from "react-bootstrap";
import DRCActivations from "../lib/DRCActivations";

type TableViewProps = {
  activations?: DRCActivations
};

function TableView({ activations }: TableViewProps): JSX.Element {
  return (
    <>
      {activations ? (
        <Tab.Container defaultActiveKey={defaultTableViewTab(activations)}>
          <Row>
            <Col className="bg-light" sm={3}>
              <Nav variant="pills" className="flex-column">
                {activations.hasLayer("L") ? (
                  <Nav.Item>
                    <Nav.Link eventKey="letter">Letter Layer</Nav.Link>
                  </Nav.Item>
                ) : null}

                {activations.hasLayer("Orth") ? (
                  <Nav.Item>
                    <Nav.Link eventKey="orth">Orthographic Lexicon</Nav.Link>
                  </Nav.Item>
                ) : null}

                {activations.hasLayer("Phon") ? (
                  <Nav.Item>
                    <Nav.Link eventKey="phon">Phonological Lexicon</Nav.Link>
                  </Nav.Item>
                ) : null}

                {activations.hasLayer("Sem") ? (
                  <Nav.Item>
                    <Nav.Link eventKey="sem">Semantic System</Nav.Link>
                  </Nav.Item>
                ) : null}

                {activations.hasLayer("GPC") ||
                activations.hasLayer("GPCR") ? (
                  <>
                  <Nav.Item>
                    <Nav.Link eventKey="gpc">GPC Route</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="gpcactivity">GPC Activity</Nav.Link>
                  </Nav.Item>
                  </>
                ) : null}

                {activations.hasLayer("P") ? (
                  <Nav.Item>
                    <Nav.Link eventKey="phoneme">Phoneme Layer</Nav.Link>
                  </Nav.Item>
                ) : null}

                {activations.hasTotals() ? (
                  <Nav.Item>
                    <Nav.Link eventKey="totals">Totals</Nav.Link>
                  </Nav.Item>
                ) : null}
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                {typeof activations.hasLayer("L") ? (
                  <Tab.Pane eventKey="letter">
                    <LayerTable
                      title="Letter"
                      data={generateTableData("L", activations)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof activations.hasLayer("Orth") ? (
                  <Tab.Pane eventKey="orth">
                    <LayerTable
                      title="Orthographic Lexicon"
                      data={generateTableData("Orth", activations)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof activations.hasLayer("Phon") ? (
                  <Tab.Pane eventKey="phon">
                    <LayerTable
                      title="Phonological Lexicon"
                      data={generateTableData("Phon", activations)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof activations.hasLayer("Sem") ? (
                  <Tab.Pane eventKey="sem">
                    <LayerTable
                      title="Semantic System"
                      data={generateTableData("Sem", activations)}
                    />
                  </Tab.Pane>
                ) : null}

                {typeof activations.hasLayer("GPC") ||
                typeof activations.hasLayer("GPCR") ? (
                  <>
                  <Tab.Pane eventKey="gpc">
                    <LayerTable
                      title="GPC Route"
                      data={generateGPCTableData(activations)}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="gpcactivity">
                    <LayerTable 
                    title="GPC Activity" 
                    data={generateGPCActivityTableData(activations)}
                    />
                  </Tab.Pane>
                  </>
                ) : null}

                {activations.hasLayer("P") ? (
                  <Tab.Pane eventKey="phoneme">
                    <LayerTable
                      title="Phoneme"
                      data={generateTableData("P", activations)}
                    />
                  </Tab.Pane>
                ) : null}

                {activations.hasTotals() ? (
                  <Tab.Pane eventKey="totals">
                    <LayerTable
                      title="Totals"
                      data={generateTotalsData(activations)}
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

function defaultTableViewTab(activations: DRCActivations) {
  if (activations.hasLayer("L")) return "letter";
  if (activations.hasLayer("Orth")) return "orth";
  if (activations.hasLayer("Phon")) return "phon";
  if (activations.hasLayer("Sem")) return "sem";
  if (
    activations.hasLayer("GPC") ||
    activations.hasLayer("GPCR")
  )
    return "gpc";
  if (activations.hasLayer("P")) return "phoneme";
  if (activations.hasTotals()) return "totals";
}

function generateTableData(layer: string, activations: DRCActivations) {
  const singlePositionLayers = ["Orth", "Phon", "Sem"];
  let data = [];

  let hdr = [];
  hdr.push("Cycle");

  activations.layerPositions(layer).forEach((pos: number) => {
    activations.unitsInLayerAtPosition(layer, pos).forEach((unit: string) => {
      const name: string =
        activations.layerPositions(layer).length === 1 &&
        activations.layerPositions(layer)[0] === 1 &&
        singlePositionLayers.includes(layer)
          ? unit
          : layer + pos + " " + unit;
      hdr.push(name);
    });
  });

  data.push(hdr);

  const max: number = activations.maxCycle ?? 0;
  for (let cycle: number = 0; cycle <= max; cycle++) {
    let row: (number | undefined)[] = [];
    row.push(cycle);
    activations.layerPositions(layer).forEach((pos: number) => {
      activations.unitsInLayerAtPosition(layer, pos).forEach((unit: string) => {
        row.push(activations.activation(cycle, unit, layer, pos));
      });
    });
    if (row.slice(1).find(v => v !== undefined)) data.push(row);
  }

  return data;
}

function generateGPCTableData(activations: DRCActivations) {
  const layers: string[] = ["GPC", "GPCR"];
  let data = [];

  let hdr = [];
  hdr.push("Cycle");

  let positions: number[] = [];
  layers.forEach((layer) => {
    activations.layerPositions(layer).forEach((pos: number) => {
      if (!positions.includes(pos)) positions.push(pos);
    });
  });

  positions.sort((a, b) => a - b);

  positions.forEach((pos: number) => {
    layers.forEach((layer: string) => {
      activations.unitsInLayerAtPosition(layer, pos).forEach((unit: string) => {
        const name = layer + pos + " " + unit;
        hdr.push(name);
      });
    });
  });

  data.push(hdr);

  const max: number = activations.maxCycle ?? 0;
  for (let cycle: number = 0; cycle <= max; cycle++) {
    let row: any[] = [];
    row.push(cycle);
    positions.forEach((pos: number) => {
      layers.forEach((layer: string) => {
        activations.unitsInLayerAtPosition(layer, pos).forEach((unit: string) => {
          row.push(activations.activation(cycle, unit, layer, pos));
        });
      });
    });

    if (row.slice(1).find(v => v !== undefined)) data.push(row);
  }

  return data;
}

function generateGPCActivityTableData(activations: DRCActivations) {
  let data = [];

  let hdr: string[] = [];
  hdr.push("Begin");
  hdr.push("End");
  hdr.push("GPC Route Input");
  hdr.push("GPC Rules");
  hdr.push("Body-Rime");
  data.push(hdr);

  let previous: string = '';
  let previousCycle: number = -1;
  let begin: number = 1;
  const max: number = activations.maxCycle ?? 0;
  for (let cycle: number = 0; cycle <= max; cycle++) {
    const activity = activations.gpcActivity(cycle) ?? '';
    if (activity !== previous) {
      if (previous !== '') {
        data.push(createGPCActivityRow(begin, previousCycle, previous));
      }

      previous = activity;
      begin = cycle;
    }
    previousCycle = cycle;
  }

  if (previous !== '') {
    data.push(createGPCActivityRow(begin, previousCycle, previous));
  }

  return data;
}

function createGPCActivityRow(begin: number, end: number, activity: string) {
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

function generateTotalsData(activations: DRCActivations) {
  let data = [];

  let hdr: string[] = [];
  hdr.push("Cycle");
  if (activations.hasLayer("L")) hdr.push("Letter");
  if (activations.hasLayer("Orth")) hdr.push("Orthographic Lexicon");
  if (activations.hasLayer("Phon")) hdr.push("Phonological Lexicon");
  if (activations.hasLayer("Sem")) hdr.push("Semantic System");
  if (activations.hasLayer("GPC")) hdr.push("GPC Rules");
  if (activations.hasLayer("GPCR")) hdr.push("GPC Rime");
  if (activations.hasLayer("P")) hdr.push("Phoneme");

  data.push(hdr);

  activations.cyclesWithTotals().forEach((cycle: number) => {
    let row: (number | undefined)[] = [cycle];
    ["L", "Orth", "Phon", "Sem", "GPC", "GPCR", "P"].forEach((layer: string) => {
      row.push(activations.total(cycle, layer));
    });
    data.push(row);
  })

  return data;
}
