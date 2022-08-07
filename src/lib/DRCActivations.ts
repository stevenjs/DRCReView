class DRCActivations {
  protected _namingThreshold?: number;
  protected _maxCycle?: number;
  protected _layers: string[];
  protected _layerPositions: {
    [index: string]: number[]; // layer -> positions
  };
  protected _units: {
    // layer
    [index: string]: {
      [index: number]: string[]; // pos -> unit name
    };
  };
  protected _activations: {
    // layer
    [index: string]: {
      // cycle
      [index: number]: {
        // pos
        [index: number]: {
          [index: string]: number; // unit -> activation level
        };
      };
    };
  };
  protected _gpcActivity: string[];
  protected _totals: {
      // cycle
      [index: number]: {
        [index: string]: number; // layer -> total
      }
  };

  constructor() {
    this._namingThreshold = undefined;
    this._maxCycle = undefined;
    this._layers = [];
    this._layerPositions = {};
    this._units = {};
    this._activations = {};
    this._gpcActivity = [];
    this._totals = [];
  }

  /**
   * Get the naming threshold used in the simulation
   * @returns the naming threshold, if known, otherwise undefined
   */
  get namingThreshold() {
    return this._namingThreshold;
  }

  /**
   * Get the maximum cycle in the data
   * @returns The maximum cycle
   */
  get maxCycle() {
    return this._maxCycle;
  }

  /**
   * Get the layers
   * @returns An array of the layers
   */
  get layers() {
    return this._layers;
  }

  /**
   * Test whether there is any data for a specific layer
   * @param layer The name of the layer
   * @returns True if there is any data for the named layer, false otherwise
   */
  hasLayer(layer: string): boolean {
    return this._layers.includes(layer);
  }

  /**
   * Get the positions in a layer
   * @param layer The name of the layer
   * @returns An array of the positions in that layer
   */
  layerPositions(layer: string): number[] {
    return this._layerPositions[layer];
  }

  /**
   * Get the units in a position of a layer
   * @param layer The name of the layer
   * @param pos The positon
   * @returns An array containing the names of the units
   */
  unitsInLayerAtPosition(layer: string, pos: number): string[] {
    if (layer in this._units && pos in this._units[layer]) {
      return this._units[layer][pos];
    }
    return [];
  }

  /**
   * Get the GPC activity for a specific cycle
   * @param cycle The cycle
   * @returns 
   */
  gpcActivity(cycle: number): string | undefined {
    return this._gpcActivity[cycle];
  }

  /**
   * Get the activation level for a unit in a layer at a specific cycle
   * @param cycle The cycle
   * @param unit The name of the unit
   * @param layer The name of the layer
   * @param pos The position in the layer
   * @returns The activation level
   */
  activation(
    cycle: number,
    unit: string,
    layer: string,
    pos?: number
  ): number | undefined {
    if (typeof pos === "undefined") pos = 1;
    if (
      layer in this._activations &&
      cycle in this._activations[layer] &&
      pos in this._activations[layer][cycle] &&
      unit in this._activations[layer][cycle][pos]
    )
      return this._activations[layer][cycle][pos][unit];
    else return undefined;
  }

  /**
   * Test whether there are any totals
   * @returns True if there are any totals, false otherwise
   */
  hasTotals(): boolean {
    return Object.keys(this._totals).length > 0;
  }

  /**
   * Get all the cycles with totals
   * @returns An array containing all the cycles with totals
   */
  cyclesWithTotals(): number[] {
    return Object.keys(this._totals).map(c => parseInt(c));
  }

  /**
   * Get the total activation for a layer at a specific cycle
   * @param cycle The cycle
   * @param layer The name of the layer
   * @returns The total activation
   */
  total(cycle: number, layer: string): number | undefined {
      if (cycle in this._totals && layer in this._totals[cycle])
        return this._totals[cycle][layer];
      else return undefined;
  }

  /**
   * Interpret and store the data from a single in in a DRC activations file.
   * @param data An array containing the fields of a line from a DRC activations file
   * @returns True if line format recognised, false otherwise
   */
  interpretActsLine(data: any[]) {
    if (typeof data[0] === "string" && (data[0] === "#" || data[0] === ";"))
      this.handleComment(data);
    else if (
      typeof data[0] === "string" &&
      data[0].startsWith("Cycle") &&
      typeof data[1] === "string" &&
      data[1] === "GPCRoute"
    )
      this.handleOldStyleGPCActivityLine(data);
    else if (typeof data[0] === "string" && data[0].startsWith("Cycle"))
      this.handleOldStyleActsLine(data);
    else if (
      typeof data[0] === "string" &&
      data[0].startsWith("T") &&
      typeof data[1] === "string" &&
      data[1].startsWith("Cycle")
    )
      this.handleOldStyleTotalLine(data);
    else return false;
    return true;
  }

  /**
   * Do final steps needed after all lines from the activations file have been read
   */
  handleEndOfData() {
    for (const layer in this._layerPositions) {
      this._layerPositions[layer].sort((a: number, b: number) => a - b);
    }
    for (const layer in this._units) {
      for (const pos in this._units[layer]) {
        this._units[layer][pos].sort();
      }
    }
  }

  /**
   * Interpret and store the data from on old-syle comment line
   * @param data An array containing the fields from on old-syle comment line
   */
  private handleComment(data: any[]) {
    // Older style naming threshold parameter comment is the only thing we care about
    if (
      data[1] === "Naming" &&
      data[2] === "threshold:" &&
      typeof data[3] === "number"
    ) {
      this._namingThreshold = data[3];
    }
  }

  /**
   * Interpret and store the data from on old-syle GPC activity line
   * e.g. Cycle124 GPCRoute bork+ b->b or->9,3 k->k {ork->9k}
   * @param data An array containing the fields from on old-syle GPC activity line
   */
  private handleOldStyleGPCActivityLine(data: any[]) { 
    let cycle = parseInt(data[0].substring(5));
    this._gpcActivity[cycle] = data.slice(2).join(" ");
  }

  /**
   * Interpret and store the data from an old-style activation-level line
   * e.g. Cycle133 P1 0.153557 b
   * @param data An array containing the fields from an old-style activation-level line
   */
  private handleOldStyleActsLine(data: any[]) {
    let cycle = parseInt(data[0].substring(5));
    let layer = data[1];
    let act = data[2];
    let unit = data[3];
    let pos = 1;

    if (layer.startsWith("VF")) return;

    if (this._maxCycle === undefined || cycle > this._maxCycle)
      this._maxCycle = cycle;

    let digitIndex = layer.search(/\d/);
    if (digitIndex !== -1) {
      pos = parseInt(layer.substring(digitIndex));
      layer = layer.substring(0, digitIndex);
    }

    if (!this._layers.includes(layer)) this._layers.push(layer);

    if (typeof this._layerPositions[layer] === "undefined")
      this._layerPositions[layer] = [];
    if (!this._layerPositions[layer].includes(pos))
      this._layerPositions[layer].push(pos);

    if (typeof this._activations[layer] === "undefined")
      this._activations[layer] = {};
    if (typeof this._activations[layer][cycle] === "undefined")
      this._activations[layer][cycle] = [];
    if (typeof this._activations[layer][cycle][pos] === "undefined")
      this._activations[layer][cycle][pos] = {};

    this._activations[layer][cycle][pos][unit] = act;

    if (typeof this._units[layer] === "undefined") this._units[layer] = [];
    if (typeof this._units[layer][pos] === "undefined")
      this._units[layer][pos] = [];
    if (!this._units[layer][pos].includes(unit))
      this._units[layer][pos].push(unit);
  }

  /**
   * Interpret and store the data from an old-style total activation line
   * e.g. TSem Cycle133 3.514319
   * @param data An array containing the fields from an old-style total activation line
   */
  private handleOldStyleTotalLine(data: any[]) {
    let layer = data[0].substring(1);
    let cycle = parseInt(data[1].substring(5));
    let total = data[2];
  
    if (layer === "VF") return;
    if (layer === "O") layer = "Orth";
    if (layer === "P") layer = "Phon";
    if (layer === "Ph") layer = "P";
  
    if (!this._layers.includes(layer)) this._layers.push(layer);
    if (typeof this._totals[cycle] === "undefined")
      this._totals[cycle] = {};
    this._totals[cycle][layer] = total;
  
    if (this._maxCycle === undefined || cycle > this._maxCycle) this._maxCycle = cycle;
  }
}

export default DRCActivations;
