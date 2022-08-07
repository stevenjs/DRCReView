import React, { useState } from "react";

import Alert from "react-bootstrap/Alert";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faUpload,
  faTable,
} from "@fortawesome/free-solid-svg-icons";

import ActsReader from "./components/ActsReader";
import TableView from "./components/TableView";
import ColumnGraphsView from "./components/ColumnGraphsView";

import "./App.css";
import DRCActivations from "./lib/DRCActivations";

const App = (): JSX.Element => {
  const [tabKey, setTabKey] = useState<string>("load");
  const [actsError, setActsError] = useState<string>("");
  const [activations, setActivations] = useState<DRCActivations>();

  const onActsFileLoad = (acts?: DRCActivations) => {
    if (acts) clearActsError();
    setActivations(acts);
    setTabKey(acts ? "columngraphs" : "load");
  };

  const onActsFileError = (err: any) => {
    if (err !== null && err !== undefined) {
      let message = "";
      if (typeof err.row !== "undefined") {
        message += "Error on line #" + err.row + ((typeof err.message !== "undefined") ? ": " : "");
      }
      if (typeof err.message !== "undefined") {
        message += err.message;
      }
      setActsError(message);
    }
  };

  const clearActsError = () => {
    setActsError("");
  };

  const onRemoveActsFile = () => {
    setActivations(undefined);
    clearActsError();
    setTabKey("load");
  };

  return (
    <>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand>DRCReView</Navbar.Brand>
        </Container>
      </Navbar>
      <Container className="p-3">
        {actsError !== "" ? (
          <Alert variant="danger" onClose={() => clearActsError()} dismissible>
            {actsError}
          </Alert>
        ) : null}
        <Tabs
          activeKey={tabKey}
          onSelect={(k) => setTabKey(k == null ? "load" : k)}
          className="mb-1"
        >
          <Tab eventKey="load" title={<FontAwesomeIcon icon={faUpload} />}>
            <Container className="p-2 mb-4 rounded-3">
              <ActsReader
                onActsFileLoad={onActsFileLoad}
                onActsFileError={onActsFileError}
                onRemoveActsFile={onRemoveActsFile}
              />
            </Container>
          </Tab>
          <Tab
            eventKey="columngraphs"
            title={<FontAwesomeIcon icon={faChartColumn} />}
            disabled={!activations}
          >
            <ColumnGraphsView activations={activations} maxCycle={activations?.maxCycle ?? 1} />
          </Tab>
          <Tab
            eventKey="tables"
            title={<FontAwesomeIcon icon={faTable} />}
            disabled={!activations}
          >
            <TableView activations={activations} />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
};

export default App;
