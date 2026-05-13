import { Terrain, Resources } from './types';

export interface ProvinceSeed {
  id: string;
  name: string;
  parent: string;
  centroid: [number, number];
  terrain: Terrain;
  isCoastal: boolean;
  garrison: number;
  fortLevel: number;
  supplyLevel: number;
  industryOutput: number;
  manpowerOutput: number;
  resourceOutput: Partial<Resources>;
  adjacentTo: string[];
  navalAdjacentTo?: string[];
}

// Sub-provinces added on top of the 8 majors. Each major also keeps its
// existing top-level territory (the capital city), so the country polygon
// stays anchored on a real game entity.
export const PROVINCES: ProvinceSeed[] = [
  // ── GERMANY (capital: "germany" → Berlin) ────────────────────────────
  { id: 'munich',    name: 'Munich',    parent: 'germany', centroid: [11.6, 48.1], terrain: 'mountain', isCoastal: false, garrison: 8, fortLevel: 2, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 150, resourceOutput: { steel: 5, food: 10 }, adjacentTo: ['germany', 'austria', 'switzerland', 'frankfurt'] },
  { id: 'hamburg',   name: 'Hamburg',   parent: 'germany', centroid: [10.0, 53.5], terrain: 'plains',   isCoastal: true,  garrison: 6, fortLevel: 2, supplyLevel: 1.0, industryOutput: 12, manpowerOutput: 150, resourceOutput: { steel: 10, food: 5 }, adjacentTo: ['germany', 'denmark', 'netherlands'] },
  { id: 'cologne',   name: 'Cologne',   parent: 'germany', centroid: [6.9, 50.9],  terrain: 'urban',    isCoastal: false, garrison: 5, fortLevel: 2, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 150, resourceOutput: { steel: 8, food: 5 },  adjacentTo: ['germany', 'belgium', 'netherlands', 'france', 'frankfurt'] },
  { id: 'frankfurt', name: 'Frankfurt', parent: 'germany', centroid: [8.7, 50.1],  terrain: 'urban',    isCoastal: false, garrison: 4, fortLevel: 1, supplyLevel: 1.0, industryOutput: 13, manpowerOutput: 150, resourceOutput: { steel: 7, food: 5 },  adjacentTo: ['germany', 'cologne', 'munich'] },

  // ── USSR (capital: "ussr" → Moscow) ──────────────────────────────────
  { id: 'leningrad',   name: 'Leningrad',   parent: 'ussr', centroid: [30.3, 59.9],  terrain: 'plains',   isCoastal: true,  garrison: 18, fortLevel: 3, supplyLevel: 1.0, industryOutput: 18, manpowerOutput: 300, resourceOutput: { steel: 15, food: 15 }, adjacentTo: ['ussr', 'finland'] },
  { id: 'stalingrad',  name: 'Stalingrad',  parent: 'ussr', centroid: [44.5, 48.7],  terrain: 'plains',   isCoastal: false, garrison: 16, fortLevel: 3, supplyLevel: 1.0, industryOutput: 22, manpowerOutput: 350, resourceOutput: { oil: 25, steel: 20, food: 15 }, adjacentTo: ['ussr', 'kiev', 'sevastopol'] },
  { id: 'kiev',        name: 'Kiev',        parent: 'ussr', centroid: [30.5, 50.5],  terrain: 'plains',   isCoastal: false, garrison: 14, fortLevel: 2, supplyLevel: 1.0, industryOutput: 15, manpowerOutput: 400, resourceOutput: { steel: 15, food: 25 }, adjacentTo: ['ussr', 'poland', 'romania', 'hungary', 'stalingrad'] },
  { id: 'sevastopol',  name: 'Sevastopol',  parent: 'ussr', centroid: [33.5, 44.6],  terrain: 'mountain', isCoastal: true,  garrison: 10, fortLevel: 3, supplyLevel: 1.0, industryOutput: 8, manpowerOutput: 200, resourceOutput: { food: 10 }, adjacentTo: ['ussr', 'turkey', 'stalingrad'] },
  { id: 'vladivostok', name: 'Vladivostok', parent: 'ussr', centroid: [131.9, 43.1], terrain: 'forest',   isCoastal: true,  garrison: 14, fortLevel: 3, supplyLevel: 0.9, industryOutput: 10, manpowerOutput: 250, resourceOutput: { steel: 10, food: 10 }, adjacentTo: ['ussr', 'manchuria', 'china-north', 'japan'] },
  { id: 'baku',        name: 'Baku',        parent: 'ussr', centroid: [49.8, 40.4],  terrain: 'mountain', isCoastal: true,  garrison: 12, fortLevel: 3, supplyLevel: 0.9, industryOutput: 12, manpowerOutput: 200, resourceOutput: { oil: 60, steel: 10, food: 10 }, adjacentTo: ['ussr', 'stalingrad', 'sevastopol', 'turkey', 'iran'] },
  { id: 'murmansk',    name: 'Murmansk',    parent: 'ussr', centroid: [33.0, 68.9],  terrain: 'tundra',   isCoastal: true,  garrison: 6,  fortLevel: 2, supplyLevel: 0.8, industryOutput: 4,  manpowerOutput: 80,  resourceOutput: { steel: 5,  food: 3 },  adjacentTo: ['ussr', 'leningrad', 'finland', 'norway'] },
  { id: 'rostov',         name: 'Rostov',         parent: 'ussr', centroid: [39.7, 47.2],   terrain: 'plains',   isCoastal: false, garrison: 10, fortLevel: 2, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 200, resourceOutput: { steel: 10, food: 20 }, adjacentTo: ['ussr', 'kiev', 'stalingrad', 'sevastopol'] },
  { id: 'yekaterinburg',  name: 'Yekaterinburg',  parent: 'ussr', centroid: [60.6, 56.8],   terrain: 'mountain', isCoastal: false, garrison: 10, fortLevel: 2, supplyLevel: 1.0, industryOutput: 15, manpowerOutput: 300, resourceOutput: { steel: 25, oil: 15, food: 15 }, adjacentTo: ['ussr', 'novosibirsk'] },
  { id: 'novosibirsk',    name: 'Novosibirsk',    parent: 'ussr', centroid: [82.9, 55.0],   terrain: 'forest',   isCoastal: false, garrison: 8,  fortLevel: 2, supplyLevel: 0.9, industryOutput: 12, manpowerOutput: 250, resourceOutput: { steel: 15, oil: 10, food: 20 }, adjacentTo: ['ussr', 'yekaterinburg', 'irkutsk', 'tashkent'] },
  { id: 'irkutsk',        name: 'Irkutsk',        parent: 'ussr', centroid: [104.3, 52.3],  terrain: 'forest',   isCoastal: false, garrison: 7,  fortLevel: 2, supplyLevel: 0.9, industryOutput: 8,  manpowerOutput: 180, resourceOutput: { steel: 10, food: 15 }, adjacentTo: ['ussr', 'novosibirsk', 'yakutsk', 'vladivostok', 'mongolia'] },
  { id: 'yakutsk',        name: 'Yakutsk',        parent: 'ussr', centroid: [129.7, 62.0],  terrain: 'tundra',   isCoastal: false, garrison: 4,  fortLevel: 1, supplyLevel: 0.7, industryOutput: 4,  manpowerOutput: 80,  resourceOutput: { oil: 15, steel: 10, food: 5 }, adjacentTo: ['ussr', 'irkutsk', 'vladivostok'] },
  { id: 'tashkent',       name: 'Tashkent',       parent: 'ussr', centroid: [69.3, 41.3],   terrain: 'desert',   isCoastal: false, garrison: 6,  fortLevel: 1, supplyLevel: 0.8, industryOutput: 6,  manpowerOutput: 150, resourceOutput: { steel: 8, food: 20 }, adjacentTo: ['ussr', 'novosibirsk', 'afghanistan', 'iran'] },

  // ── FRANCE (capital: "france" → Paris) ───────────────────────────────
  { id: 'marseille',  name: 'Marseille',  parent: 'france', centroid: [5.4, 43.3],  terrain: 'coast',  isCoastal: true,  garrison: 8,  fortLevel: 2, supplyLevel: 1.0, industryOutput: 8,  manpowerOutput: 100, resourceOutput: { food: 10 }, adjacentTo: ['france', 'italy', 'lyon', 'algeria'] },
  { id: 'lyon',       name: 'Lyon',       parent: 'france', centroid: [4.8, 45.8],  terrain: 'plains', isCoastal: false, garrison: 7,  fortLevel: 2, supplyLevel: 1.0, industryOutput: 12, manpowerOutput: 100, resourceOutput: { steel: 8, food: 10 }, adjacentTo: ['france', 'italy', 'switzerland', 'marseille', 'strasbourg'] },
  { id: 'strasbourg', name: 'Strasbourg', parent: 'france', centroid: [7.7, 48.6],  terrain: 'plains', isCoastal: false, garrison: 10, fortLevel: 4, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 100, resourceOutput: { steel: 8, food: 10 }, adjacentTo: ['france', 'germany', 'cologne', 'switzerland', 'lyon'] },
  { id: 'bordeaux',   name: 'Bordeaux',   parent: 'france', centroid: [-0.6, 44.8], terrain: 'plains', isCoastal: true,  garrison: 5,  fortLevel: 1, supplyLevel: 1.0, industryOutput: 7,  manpowerOutput: 100, resourceOutput: { food: 5 }, adjacentTo: ['france', 'spain'], navalAdjacentTo: ['uk', 'wales'] },

  // ── UK (capital: "uk" → London) ──────────────────────────────────────
  { id: 'scotland',  name: 'Scotland',   parent: 'uk', centroid: [-4.0, 56.5], terrain: 'mountain', isCoastal: true, garrison: 10, fortLevel: 3, supplyLevel: 1.0, industryOutput: 12, manpowerOutput: 80,  resourceOutput: { steel: 8, food: 5 }, adjacentTo: ['uk', 'iceland'], navalAdjacentTo: ['norway'] },
  { id: 'wales',     name: 'Wales',      parent: 'uk', centroid: [-3.5, 52.0], terrain: 'mountain', isCoastal: true, garrison: 6,  fortLevel: 2, supplyLevel: 1.0, industryOutput: 8,  manpowerOutput: 50,  resourceOutput: { steel: 5, food: 5 }, adjacentTo: ['uk', 'ireland'] },
  { id: 'n-england', name: 'N. England', parent: 'uk', centroid: [-1.5, 53.5], terrain: 'plains',   isCoastal: true, garrison: 10, fortLevel: 3, supplyLevel: 1.0, industryOutput: 15, manpowerOutput: 100, resourceOutput: { steel: 7, food: 5 }, adjacentTo: ['uk', 'scotland'] },

  // ── ITALY (capital: "italy" → Rome) ──────────────────────────────────
  { id: 'milan',  name: 'Milan',  parent: 'italy', centroid: [9.2, 45.5],  terrain: 'plains',   isCoastal: false, garrison: 10, fortLevel: 3, supplyLevel: 1.0, industryOutput: 12, manpowerOutput: 130, resourceOutput: { steel: 5, food: 10 }, adjacentTo: ['italy', 'france', 'lyon', 'switzerland', 'austria', 'yugoslavia'] },
  { id: 'naples', name: 'Naples', parent: 'italy', centroid: [14.3, 40.9], terrain: 'mountain', isCoastal: true,  garrison: 6,  fortLevel: 2, supplyLevel: 1.0, industryOutput: 6,  manpowerOutput: 80,  resourceOutput: { food: 8 }, adjacentTo: ['italy', 'sicily'] },
  { id: 'sicily', name: 'Sicily', parent: 'italy', centroid: [14.0, 37.6], terrain: 'mountain', isCoastal: true,  garrison: 5,  fortLevel: 2, supplyLevel: 0.9, industryOutput: 4,  manpowerOutput: 50,  resourceOutput: { food: 5 }, adjacentTo: ['italy', 'naples', 'libya', 'tunisia'] },

  // ── JAPAN (capital: "japan" → Tokyo) ─────────────────────────────────
  { id: 'osaka',    name: 'Osaka',    parent: 'japan', centroid: [135.5, 34.7], terrain: 'urban',    isCoastal: true, garrison: 10, fortLevel: 3, supplyLevel: 1.0, industryOutput: 18, manpowerOutput: 200, resourceOutput: { steel: 10, food: 10 }, adjacentTo: ['japan', 'kyushu'] },
  { id: 'kyushu',   name: 'Kyushu',   parent: 'japan', centroid: [130.5, 32.8], terrain: 'mountain', isCoastal: true, garrison: 8,  fortLevel: 3, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 150, resourceOutput: { steel: 8,  food: 10 }, adjacentTo: ['japan', 'osaka', 'korea', 'china-north'] },
  { id: 'hokkaido', name: 'Hokkaido', parent: 'japan', centroid: [142.0, 43.5], terrain: 'forest',   isCoastal: true, garrison: 7,  fortLevel: 2, supplyLevel: 0.9, industryOutput: 8,  manpowerOutput: 100, resourceOutput: { food: 10 }, adjacentTo: ['japan'], navalAdjacentTo: ['ussr', 'vladivostok'] },

  // ── USA (capital: "usa" → Washington) ────────────────────────────────
  { id: 'new-york',   name: 'New York',   parent: 'usa', centroid: [-74.0, 40.7],  terrain: 'urban',  isCoastal: true,  garrison: 6, fortLevel: 3, supplyLevel: 1.0, industryOutput: 35, manpowerOutput: 300, resourceOutput: { steel: 50, food: 30 }, adjacentTo: ['usa', 'canada'], navalAdjacentTo: ['uk'] },
  { id: 'california', name: 'California', parent: 'usa', centroid: [-119.0, 36.0], terrain: 'plains', isCoastal: true,  garrison: 5, fortLevel: 2, supplyLevel: 1.0, industryOutput: 30, manpowerOutput: 250, resourceOutput: { oil: 60, steel: 40, food: 30 }, adjacentTo: ['usa', 'mexico'], navalAdjacentTo: ['japan', 'philippines'] },
  { id: 'texas',      name: 'Texas',      parent: 'usa', centroid: [-99.0, 31.5],  terrain: 'desert', isCoastal: true,  garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 22, manpowerOutput: 200, resourceOutput: { oil: 80, steel: 30, food: 30 }, adjacentTo: ['usa', 'mexico'] },
  { id: 'midwest',    name: 'Midwest',    parent: 'usa', centroid: [-93.0, 41.5],  terrain: 'plains', isCoastal: false, garrison: 5, fortLevel: 2, supplyLevel: 1.0, industryOutput: 40, manpowerOutput: 350, resourceOutput: { steel: 50, food: 50 }, adjacentTo: ['usa', 'canada', 'new-york'] },
  { id: 'chicago',    name: 'Chicago',    parent: 'usa', centroid: [-87.6, 41.9],  terrain: 'urban',  isCoastal: false, garrison: 6, fortLevel: 2, supplyLevel: 1.0, industryOutput: 35, manpowerOutput: 250, resourceOutput: { steel: 40, food: 30 }, adjacentTo: ['usa', 'midwest', 'new-york'] },
  { id: 'florida',    name: 'Florida',    parent: 'usa', centroid: [-81.8, 28.5],  terrain: 'coast',  isCoastal: true,  garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 12, manpowerOutput: 150, resourceOutput: { food: 30 }, adjacentTo: ['usa', 'texas'], navalAdjacentTo: ['cuba'] },

  // ── CHINA (capital: "china" → Nanjing) ───────────────────────────────
  { id: 'beijing',   name: 'Beijing',   parent: 'china', centroid: [116.4, 39.9], terrain: 'plains',   isCoastal: false, garrison: 14, fortLevel: 2, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 1000, resourceOutput: { food: 25 }, adjacentTo: ['china', 'china-north', 'mongolia', 'ussr'] },
  { id: 'shanghai',  name: 'Shanghai',  parent: 'china', centroid: [121.5, 31.2], terrain: 'urban',    isCoastal: true,  garrison: 12, fortLevel: 2, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 800,  resourceOutput: { steel: 2, food: 20 }, adjacentTo: ['china', 'china-north'] },
  { id: 'wuhan',     name: 'Wuhan',     parent: 'china', centroid: [114.3, 30.6], terrain: 'plains',   isCoastal: false, garrison: 12, fortLevel: 1, supplyLevel: 0.9, industryOutput: 2, manpowerOutput: 800,  resourceOutput: { food: 20 }, adjacentTo: ['china', 'shanghai', 'chongqing'] },
  { id: 'chongqing', name: 'Chongqing', parent: 'china', centroid: [106.5, 29.6], terrain: 'mountain', isCoastal: false, garrison: 13, fortLevel: 2, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 700,  resourceOutput: { food: 15 }, adjacentTo: ['china', 'wuhan', 'burma', 'india'] },
];

// Each existing major-country territory becomes a single city (the capital).
// Rename + recentroid so the marker sits on the actual capital.
export const RENAMED_CAPITALS: Record<string, { name: string; centroid: [number, number] }> = {
  germany: { name: 'Berlin',     centroid: [13.4, 52.5] },
  ussr:    { name: 'Moscow',     centroid: [37.6, 55.8] },
  france:  { name: 'Paris',      centroid: [2.3, 48.9] },
  uk:      { name: 'London',     centroid: [-0.1, 51.5] },
  italy:   { name: 'Rome',       centroid: [12.5, 41.9] },
  japan:   { name: 'Tokyo',      centroid: [139.7, 35.7] },
  usa:     { name: 'Washington', centroid: [-77.0, 38.9] },
  china:   { name: 'Nanjing',    centroid: [118.8, 32.0] },
};

// Cut down the capital territory's stats so the sum of (capital + provinces)
// roughly matches the pre-split totals — keeps balance stable.
export const CAPITAL_STAT_OVERRIDES: Record<string, {
  garrison: number;
  fortLevel: number;
  industryOutput: number;
  manpowerOutput: number;
  resourceOutput: Partial<Resources>;
}> = {
  germany: { garrison: 12, fortLevel: 4, industryOutput: 15, manpowerOutput: 200,  resourceOutput: { steel: 10, food: 5 } },
  ussr:    { garrison: 18, fortLevel: 4, industryOutput: 27, manpowerOutput: 500,  resourceOutput: { oil: 55, steel: 20, food: 15 } },
  france:  { garrison: 10, fortLevel: 5, industryOutput: 8,  manpowerOutput: 100,  resourceOutput: { steel: 2, food: 5 } },
  uk:      { garrison: 9,  fortLevel: 5, industryOutput: 25, manpowerOutput: 220,  resourceOutput: { steel: 10, food: 5 } },
  italy:   { garrison: 7,  fortLevel: 3, industryOutput: 8,  manpowerOutput: 140,  resourceOutput: { food: 2,  steel: 5 } },
  japan:   { garrison: 10, fortLevel: 4, industryOutput: 19, manpowerOutput: 250,  resourceOutput: { steel: 12, food: 10 } },
  usa:     { garrison: 10, fortLevel: 3, industryOutput: 23, manpowerOutput: 200,  resourceOutput: { oil: 60, steel: 30, food: 10 } },
  china:   { garrison: 14, fortLevel: 2, industryOutput: 4,  manpowerOutput: 1700, resourceOutput: { food: 20 } },
};
