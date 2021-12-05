import React from "react";

import { Button, ButtonGroup, Container, Form, Navbar } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faStepForward,
  faStepBackward,
  faPlay,
  faPause,
} from "@fortawesome/free-solid-svg-icons";

function ControlBar(props) {
  return (
    <Navbar fixed="bottom" variant="dark" bg="dark">
      <Container>
        <ButtonGroup size="sm">
          <Button
            onClick={() => props.setCycle(1)}
            disabled={props.cycle === 1}
          >
            <FontAwesomeIcon icon={faStepBackward} />
          </Button>
          <Button onClick={() => props.playClicked()}>
            {props.playing ? (
              <FontAwesomeIcon icon={faPause} />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </Button>
          <Button
            onClick={() => props.setCycle(props.maxCycle)}
            disabled={props.cycle === props.maxCycle}
          >
            <FontAwesomeIcon icon={faStepForward} />
          </Button>
        </ButtonGroup>
        &nbsp;
        <ButtonGroup size="sm">
          <Button
            onClick={() => props.setCycle(props.cycle - 1)}
            disabled={props.cycle === 1}
          >
            <FontAwesomeIcon icon={faCaretLeft} />
          </Button>
          <Button
            onClick={() => props.setCycle(props.cycle + 1)}
            disabled={props.cycle === props.maxCycle}
          >
            <FontAwesomeIcon icon={faCaretRight} />
          </Button>
        </ButtonGroup>
        &nbsp;
        <Navbar.Text className="text-light">{1}</Navbar.Text>
        &nbsp;
        <Form.Range
          min="1"
          max={props.maxCycle}
          step="1"
          value={props.cycle}
          onChange={(e) => props.setCycle(parseInt(e.target.value))}
        />
        &nbsp;
        <Navbar.Text className="text-light">{props.maxCycle}</Navbar.Text>
      </Container>
    </Navbar>
  );
}

export default ControlBar;
