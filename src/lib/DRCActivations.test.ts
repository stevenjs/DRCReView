import DRCActivations from './DRCActivations';

it('constructs', () => {
  let acts = new DRCActivations();
  expect(typeof(acts.maxCycle)).toBe('undefined');
  expect(typeof(acts.namingThreshold)).toBe('undefined');
  expect(acts.layers.length).toBe(0);
  expect(acts.gpcActivity(1)).toBeUndefined();
});

it('handles old-style comment lines', () => {
  let acts = new DRCActivations();
  expect(acts.namingThreshold).toBeUndefined();
  acts.interpretActsLine(['#', 'Naming', 'threshold:', 0.234]);
  expect(acts.namingThreshold).toBe(0.234);
});

it('handles old-style GPC activity lines', () => {
  let acts = new DRCActivations();
  acts.interpretActsLine(['Cycle124', 'GPCRoute', 'bork+', 'b->b', 'or->9,3', 'k->k', '{ork->9k}']);
  expect(acts.gpcActivity(124)).toBe('bork+ b->b or->9,3 k->k {ork->9k}');
  expect(acts.gpcActivity(1)).toBeUndefined();
});

it('handles old-style activations lines', () => {
  let acts = new DRCActivations();
  expect(acts.maxCycle).toBeUndefined();
  expect(acts.layers.length).toBe(0);
  expect(acts.layerPositions('P')).toBeUndefined();
  expect(acts.activation(133, 'b', 'P')).toBeUndefined();
  expect(acts.activation(133, 'b', 'P', 1)).toBeUndefined();
  acts.interpretActsLine(['Cycle133', 'P1', 0.153557, 'b']);
  expect(acts.maxCycle).toBe(133);
  expect(acts.layers.length).toBe(1);
  expect(acts.layers).toContain("P");
  expect(acts.layerPositions('P').length).toBe(1);
  expect(acts.layerPositions('P')).toContain(1);
  expect(acts.activation(133, 'b', 'P')).toBeCloseTo(0.153557);
  expect(acts.activation(133, 'b', 'P', 1)).toBeCloseTo(0.153557);
});

it('handles old-style total lines', () => {
  let acts = new DRCActivations();
  expect(acts.hasLayer('Sem')).toBe(false);
  acts.interpretActsLine(['TSem', 'Cycle133', 3.514319]);
  expect(acts.maxCycle).toBe(133);
  expect(acts.layers.length).toBe(1);
  expect(acts.layers).toContain("Sem");
  expect(acts.hasLayer('Sem')).toBe(true);
  expect(acts.total(133, "Sem")).toBeCloseTo(3.514319);
});
