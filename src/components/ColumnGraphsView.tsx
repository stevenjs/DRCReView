import React, { useState, useEffect, useCallback } from "react";

import Stack from "react-bootstrap/Stack";
import DRCActivations from "../lib/DRCActivations";

import ActsColumnGraph from "./ActsColumnGraph";
import ControlBar from "./ControlBar";

type ColumnGraphsViewProps = {
  maxCycle: number,
  activations?: DRCActivations
};

function ColumnGraphsView({ maxCycle, activations }: ColumnGraphsViewProps): JSX.Element {
  const [cycle, setCycle] = useState<number>(1);
  const [playing, setPlaying] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timer>();
  const [newData, setNewData] = useState<boolean>(false);

  const toggleAnimation = useCallback(() => {
    if (timer) {
      setPlaying(false);
      clearInterval(timer);
      setTimer(undefined);
      return;
    }

    const intervalID = setInterval(() => {
      setCycle((cycle) => cycle + 1);
    }, 100);

    setTimer(intervalID);
    setPlaying(true);
    if (cycle >= maxCycle) setCycle(1);
  }, [cycle, maxCycle, timer]);

  const updateCycle = (c: number) => {
    if (c > maxCycle) c = maxCycle;
    else if (c < 1) c = 1;
    setCycle(c);
  };

  useEffect(() => {
    if ((playing && cycle >= maxCycle)) {
      setPlaying(false);
      clearInterval(timer);
      setTimer(undefined);
      setCycle(maxCycle);
    }
    if (!activations) {
      setNewData(true);
    }
    if (newData && activations) {
      setNewData(false);
      toggleAnimation();
    }
  }, [playing, maxCycle, activations, cycle, timer, newData, toggleAnimation]);

  return (
    <>
      {activations ? (
        <Stack gap={0}>
          <div style={{fontSize: 10}} className="text-end">
            Cycle {cycle}
          </div>
          {activations.hasLayer("L") ? (
            <ActsColumnGraph
              title="Letter Layer"
              columns={getColumnLabels("L", activations)}
              values={getValues("L", cycle, activations)}
              barColour="#003f5c"
            />
          ) : null}

          {activations.hasLayer("Orth") ? (
            <ActsColumnGraph
              title="Orthographic Input Lexicon"
              columns={getColumnLabels("Orth", activations)}
              values={getValues("Orth", cycle, activations)}
              barColour="#444e86"
            />
          ) : null}

          {activations.hasLayer("Phon") ? (
            <ActsColumnGraph
              title="Phonological Output Lexicon"
              columns={getColumnLabels("Phon", activations)}
              values={getValues("Phon", cycle, activations)}
              barColour="#955196"
            />
          ) : null}

          {activations.hasLayer("Sem") ? (
            <ActsColumnGraph
              title="Semantic System"
              columns={getColumnLabels("Sem", activations)}
              values={getValues("Sem", cycle, activations)}
              barColour="#dd5182"
            />
          ) : null}

          {activations.hasLayer("GPC") ||
          activations.hasLayer("GPCR") ? (
            <ActsColumnGraph
              title={"GPC Route" + getGPCActivityString(cycle, activations)}
              columns={getGPCColumnLabels(activations)}
              values={getGPCValues(cycle, activations)}
              barColour="#ff6e54"
            />
          ) : null}

          {activations.hasLayer("P") ? (
            <ActsColumnGraph
              title="Phoneme Layer"
              columns={getColumnLabels("P", activations)}
              values={getValues("P", cycle, activations)}
              barColour="#ffa600"
            />
          ) : null}
        </Stack>
      ) : null}
      <ControlBar
        maxCycle={maxCycle}
        cycle={cycle}
        playing={playing}
        setCycle={(c) => updateCycle(c)}
        playClicked={toggleAnimation}
      />
    </>
  );
}

export default ColumnGraphsView;

function getColumnLabels(layer: string, activations: DRCActivations): string[] {
  const singlePositionLayers = ["Orth", "Phon", "Sem"];
  let labels: string[] = [];

  activations.layerPositions(layer).forEach(function (pos: number) {
    activations.unitsInLayerAtPosition(layer, pos).forEach(function (unit: string) {
      const name =
        Object.keys(activations.layerPositions(layer)).length === 1 &&
        activations.layerPositions(layer)[0] === 1 &&
        singlePositionLayers.includes(layer)
          ? unit
          : layer + pos + " " + unit;
      labels.push(name);
    });
  });

  return labels;
}

function getValues(layer: string, cycle: number, activations: DRCActivations): number[] {
  let row: number[] = [];
  activations.layerPositions(layer).forEach(function (pos: number) {
    activations.unitsInLayerAtPosition(layer, pos).forEach(function (unit: string) {
      const level: number = activations.activation(cycle, unit, layer, pos) ?? 0.0;
      row.push(level);
    });
  });
  return row;
}

function getGPCColumnLabels(activations: DRCActivations): string[] {
  const layers = ["GPC", "GPCR"];
  let labels: string[] = [];

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
        labels.push(name);
      });
    });
  });

  return labels;
}

function getGPCValues(cycle: number, activations: DRCActivations): number[] {
  const layers = ["GPC", "GPCR"];
  let data: number[] = [];

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
        const level: number = activations.activation(cycle, unit, layer, pos) ?? 0.0;
        data.push(level);
      });
    });
  });

  return data;
}

function getGPCActivityString(cycle: number, activations: DRCActivations): string {
  const gpcActivity = activations.gpcActivity(cycle);
  if (gpcActivity) return "    " + gpcActivity;
  return "";
}
