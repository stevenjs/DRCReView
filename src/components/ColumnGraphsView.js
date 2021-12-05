import React, { useState, useEffect } from "react";

import Stack from "react-bootstrap/Stack";

import ActsColumnGraph from "./ActsColumnGraph";
import ControlBar from "./ControlBar";

function ColumnGraphsView(props) {
  const [cycle, setCycle] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (playing && cycle >= props.maxCycle) {
      setPlaying(false);
      clearInterval(timer);
      setTimer(0);
      setCycle(props.maxCycle);
    }
  }, [playing, props.maxCycle, cycle, timer]);

  const toggleAnimation = () => {
    if (timer) {
      setPlaying(false);
      clearInterval(timer);
      setTimer(0);
      return;
    }

    const intervalID = setInterval(() => {
      setCycle((cycle) => cycle + 1);
    }, 100);

    setTimer(intervalID);
    setPlaying(true);
    if (cycle >= props.maxCycle) setCycle(1);
  };

  const updateCycle = (c) => {
    if (c > props.maxCycle) c = props.maxCycle;
    else if (c < 1) c = 1;
    setCycle(c);
  };

  return (
    <>
      {props.actsData ? (
        <Stack gap={0}>
          <div style={{fontSize: 10}} className="text-end">
            Cycle {cycle}
          </div>
          {typeof props.actsData.layerPositions["L"] !== "undefined" ? (
            <ActsColumnGraph
              title="Letter Layer"
              columns={getColumnLabels("L", props.actsData)}
              values={getValues("L", cycle, props.actsData)}
              barColour="#003f5c"
            />
          ) : null}

          {typeof props.actsData.layerPositions["Orth"] !== "undefined" ? (
            <ActsColumnGraph
              title="Orthographic Input Lexicon"
              columns={getColumnLabels("Orth", props.actsData)}
              values={getValues("Orth", cycle, props.actsData)}
              barColour="#444e86"
            />
          ) : null}

          {typeof props.actsData.layerPositions["Phon"] !== "undefined" ? (
            <ActsColumnGraph
              title="Phonological Output Lexicon"
              columns={getColumnLabels("Phon", props.actsData)}
              values={getValues("Phon", cycle, props.actsData)}
              barColour="#955196"
            />
          ) : null}

          {typeof props.actsData.layerPositions["Sem"] !== "undefined" ? (
            <ActsColumnGraph
              title="Semantic System"
              columns={getColumnLabels("Sem", props.actsData)}
              values={getValues("Sem", cycle, props.actsData)}
              barColour="#dd5182"
            />
          ) : null}

          {typeof props.actsData.layerPositions["GPC"] !== "undefined" ||
          typeof props.actsData.layerPositions["GPCR"] !== "undefined" ? (
            <ActsColumnGraph
              title={"GPC Route" + getGPCActivityString(cycle, props.actsData)}
              columns={getGPCColumnLabels(props.actsData)}
              values={getGPCValues(cycle, props.actsData)}
              barColour="#ff6e54"
            />
          ) : null}

          {typeof props.actsData.layerPositions["P"] !== "undefined" ? (
            <ActsColumnGraph
              title="Phoneme Layer"
              columns={getColumnLabels("P", props.actsData)}
              values={getValues("P", cycle, props.actsData)}
              barColour="#ffa600"
            />
          ) : null}
        </Stack>
      ) : null}
      <ControlBar
        maxCycle={props.maxCycle}
        cycle={cycle}
        playing={playing}
        setCycle={(c) => updateCycle(c)}
        playClicked={toggleAnimation}
      />
    </>
  );
}

export default ColumnGraphsView;

function getColumnLabels(layer, actsData) {
  const singlePositionLayers = ["Orth", "Phon", "Sem"];
  let labels = [];

  actsData.layerPositions[layer].forEach(function (pos) {
    actsData.units[layer][pos].forEach(function (unit) {
      const name =
        Object.keys(actsData.layerPositions[layer]).length === 1 &&
        actsData.layerPositions[layer][0] === 1 &&
        singlePositionLayers.includes(layer)
          ? unit
          : layer + pos + " " + unit;
      labels.push(name);
    });
  });

  return labels;
}

function getValues(layer, cycle, actsData) {
  let row = [];
  actsData.layerPositions[layer].forEach(function (pos) {
    actsData.units[layer][pos].forEach(function (unit) {
      if (typeof actsData.activations[layer][cycle] === "undefined")
        row.push(undefined);
      else if (typeof actsData.activations[layer][cycle][pos] === "undefined")
        row.push(undefined);
      else row.push(actsData.activations[layer][cycle][pos][unit]);
    });
  });
  return row;
}

function getGPCColumnLabels(actsData) {
  const layers = ["GPC", "GPCR"];
  let labels = [];

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
        labels.push(name);
      });
    });
  });

  return labels;
}

function getGPCValues(cycle, actsData) {
  const layers = ["GPC", "GPCR"];
  let data = [];

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
        if (typeof actsData.activations[layer][cycle] === "undefined")
          data.push(undefined);
        else if (typeof actsData.activations[layer][cycle][pos] === "undefined")
          data.push(undefined);
        else if (
          typeof actsData.activations[layer][cycle][pos][unit] === "undefined"
        )
          data.push(undefined);
        else data.push(actsData.activations[layer][cycle][pos][unit]);
      });
    });
  });

  return data;
}

function getGPCActivityString(cycle, actsData) {
  if (typeof actsData.gpcActivity[cycle] === "undefined") return "";
  else return "    " + actsData.gpcActivity[cycle];
}
