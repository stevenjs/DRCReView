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

type ControlBarProps = {
  maxCycle: number,
  cycle: number,
  playing: boolean,
  setCycle: (cycle: number) => void,
  playClicked: () => void
};

function ControlBar({ maxCycle, cycle, playing, setCycle, playClicked } : ControlBarProps): JSX.Element {
  return (
    <Navbar fixed="bottom" variant="dark" bg="dark">
      <Container>
        <ButtonGroup size="sm">
          <Button
            onClick={() => setCycle(1)}
            disabled={cycle === 1}
          >
            <FontAwesomeIcon icon={faStepBackward} />
          </Button>
          <Button onClick={() => playClicked()}>
            {playing ? (
              <FontAwesomeIcon icon={faPause} />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </Button>
          <Button
            onClick={() => setCycle(maxCycle)}
            disabled={cycle === maxCycle}
          >
            <FontAwesomeIcon icon={faStepForward} />
          </Button>
        </ButtonGroup>
        &nbsp;
        <ButtonGroup size="sm">
          <Button
            onClick={() => setCycle(cycle - 1)}
            disabled={cycle === 1}
          >
            <FontAwesomeIcon icon={faCaretLeft} />
          </Button>
          <Button
            onClick={() => setCycle(cycle + 1)}
            disabled={cycle === maxCycle}
          >
            <FontAwesomeIcon icon={faCaretRight} />
          </Button>
        </ButtonGroup>
        &nbsp;&nbsp;
        <Form.Range
          min="1"
          max={maxCycle}
          step="1"
          value={cycle}
          onChange={(e) => setCycle(parseInt(e.target.value))}
        />
        &nbsp;
        <Navbar.Text className="text-light">{cycle}</Navbar.Text>
      </Container>
    </Navbar>
  );
}

export default ControlBar;
