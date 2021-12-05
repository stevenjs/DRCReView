import React, { useState } from "react";

import Alert from "react-bootstrap/Alert";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUpload,
  faTable,
} from "@fortawesome/free-solid-svg-icons";

import ActsReader from "./components/ActsReader";
import TableView from "./components/TableView";
import ColumnGraphsView from "./components/ColumnGraphsView";

import "./App.css";

const App = () => {
  const [tabKey, setTabKey] = useState("load");
  const [actsError, setActsError] = useState({ type: undefined, row: undefined, message: undefined });
  const [actsData, setActsData] = useState();

  const onActsFileLoad = (data) => {
    setActsData(data);
    setTabKey("tables");
  };

  const onActsFileError = (err, file, inputElem, reason) => {
    setActsError(err);
  };

  const onRemoveActsFile = () => {
    setActsData();
    setActsError({});
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
        {typeof actsError.type !== "undefined" ? (
          <Alert variant="danger" onClose={() => setActsError({})} dismissible>
            Error on line #{actsError.row}: {actsError.message}
          </Alert>
        ) : null}
        <Tabs
          activeKey={tabKey}
          onSelect={(k) => setTabKey(k)}
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
            eventKey="tables"
            title={<FontAwesomeIcon icon={faTable} />}
            disabled={!actsData}
          >
            <TableView data={actsData} />
          </Tab>
          <Tab
            eventKey="columngraphs"
            title={<FontAwesomeIcon icon={faChartBar} />}
            disabled={!actsData}
          >
            <ColumnGraphsView actsData={actsData} maxCycle={actsData ? actsData.maxCycle : 1} />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
};

export default App;
