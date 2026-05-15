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
  { id: 'sevastopol',  name: 'Sevastopol',  parent: 'ussr', centroid: [33.5, 44.6],  terrain: 'mountain', isCoastal: true,  garrison: 10, fortLevel: 3, supplyLevel: 1.0, industryOutput: 8,  manpowerOutput: 200, resourceOutput: { food: 10 }, adjacentTo: ['ussr', 'turkey', 'stalingrad'] },
  { id: 'vladivostok', name: 'Vladivostok', parent: 'ussr', centroid: [131.9, 43.1], terrain: 'forest',   isCoastal: true,  garrison: 14, fortLevel: 3, supplyLevel: 0.9, industryOutput: 10, manpowerOutput: 250, resourceOutput: { steel: 10, food: 10 }, adjacentTo: ['ussr', 'manchuria', 'china-north', 'japan'] },
  { id: 'baku',        name: 'Baku',        parent: 'ussr', centroid: [49.8, 40.4],  terrain: 'mountain', isCoastal: true,  garrison: 12, fortLevel: 3, supplyLevel: 0.9, industryOutput: 12, manpowerOutput: 200, resourceOutput: { oil: 60, steel: 10, food: 10 }, adjacentTo: ['ussr', 'stalingrad', 'sevastopol', 'turkey', 'iran'] },
  { id: 'murmansk',    name: 'Murmansk',    parent: 'ussr', centroid: [33.0, 68.9],  terrain: 'tundra',   isCoastal: true,  garrison: 6,  fortLevel: 2, supplyLevel: 0.8, industryOutput: 4,  manpowerOutput: 80,  resourceOutput: { steel: 5, food: 3 },  adjacentTo: ['ussr', 'leningrad', 'finland', 'norway'] },
  { id: 'rostov',         name: 'Rostov',         parent: 'ussr', centroid: [39.7, 47.2],  terrain: 'plains',   isCoastal: false, garrison: 10, fortLevel: 2, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 200, resourceOutput: { steel: 10, food: 20 }, adjacentTo: ['ussr', 'kiev', 'stalingrad', 'sevastopol'] },
  { id: 'yekaterinburg',  name: 'Yekaterinburg',  parent: 'ussr', centroid: [60.6, 56.8],  terrain: 'mountain', isCoastal: false, garrison: 10, fortLevel: 2, supplyLevel: 1.0, industryOutput: 15, manpowerOutput: 300, resourceOutput: { steel: 25, oil: 15, food: 15 }, adjacentTo: ['ussr', 'novosibirsk'] },
  { id: 'novosibirsk',    name: 'Novosibirsk',    parent: 'ussr', centroid: [82.9, 55.0],  terrain: 'forest',   isCoastal: false, garrison: 8,  fortLevel: 2, supplyLevel: 0.9, industryOutput: 12, manpowerOutput: 250, resourceOutput: { steel: 15, oil: 10, food: 20 }, adjacentTo: ['ussr', 'yekaterinburg', 'irkutsk', 'tashkent', 'mongolia'] },
  { id: 'irkutsk',        name: 'Irkutsk',        parent: 'ussr', centroid: [104.3, 52.3], terrain: 'forest',   isCoastal: false, garrison: 7,  fortLevel: 2, supplyLevel: 0.9, industryOutput: 8,  manpowerOutput: 180, resourceOutput: { steel: 10, food: 15 }, adjacentTo: ['ussr', 'novosibirsk', 'yakutsk', 'vladivostok', 'mongolia'] },
  { id: 'yakutsk',        name: 'Yakutsk',        parent: 'ussr', centroid: [129.7, 62.0], terrain: 'tundra',   isCoastal: false, garrison: 4,  fortLevel: 1, supplyLevel: 0.7, industryOutput: 4,  manpowerOutput: 80,  resourceOutput: { oil: 15, steel: 10, food: 5 }, adjacentTo: ['ussr', 'irkutsk', 'vladivostok'] },
  { id: 'tashkent',       name: 'Tashkent',       parent: 'ussr', centroid: [69.3, 41.3],  terrain: 'desert',   isCoastal: false, garrison: 6,  fortLevel: 1, supplyLevel: 0.8, industryOutput: 6,  manpowerOutput: 150, resourceOutput: { steel: 8, food: 20 }, adjacentTo: ['ussr', 'novosibirsk', 'afghanistan', 'iran', 'china'] },

  // ── FRANCE (capital: "france" → Paris) ───────────────────────────────
  { id: 'marseille',  name: 'Marseille',  parent: 'france', centroid: [5.4, 43.3],  terrain: 'coast',  isCoastal: true,  garrison: 12, fortLevel: 2, supplyLevel: 1.0, industryOutput: 8,  manpowerOutput: 104, resourceOutput: { food: 10 }, adjacentTo: ['france', 'italy', 'lyon', 'algeria'] },
  { id: 'lyon',       name: 'Lyon',       parent: 'france', centroid: [4.8, 45.8],  terrain: 'plains', isCoastal: false, garrison: 11, fortLevel: 2, supplyLevel: 1.0, industryOutput: 12, manpowerOutput: 104, resourceOutput: { steel: 8, food: 10 }, adjacentTo: ['france', 'italy', 'switzerland', 'marseille', 'strasbourg'] },
  { id: 'strasbourg', name: 'Strasbourg', parent: 'france', centroid: [7.7, 48.6],  terrain: 'plains', isCoastal: false, garrison: 14, fortLevel: 4, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 104, resourceOutput: { steel: 8, food: 10 }, adjacentTo: ['france', 'germany', 'cologne', 'switzerland', 'lyon'] },
  { id: 'bordeaux',   name: 'Bordeaux',   parent: 'france', centroid: [-0.6, 44.8], terrain: 'plains', isCoastal: true,  garrison: 9,  fortLevel: 1, supplyLevel: 1.0, industryOutput: 7,  manpowerOutput: 104, resourceOutput: { food: 5 }, adjacentTo: ['france', 'spain'], navalAdjacentTo: ['uk', 'wales'] },

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

  // ══════════════════════════════════════════════════════════════════════
  // EUROPE — MINOR NATIONS
  // ══════════════════════════════════════════════════════════════════════

  // ── POLAND (capital: "poland" → Warsaw) ──────────────────────────────
  { id: 'poznan',    name: 'Poznań',  parent: 'poland', centroid: [16.9, 52.4], terrain: 'plains',   isCoastal: false, garrison: 5, fortLevel: 2, supplyLevel: 1.0, industryOutput: 6, manpowerOutput: 80, resourceOutput: { steel: 4, food: 8 }, adjacentTo: ['poland', 'gdansk-pl', 'krakow-pl', 'germany'] },
  { id: 'krakow-pl', name: 'Kraków', parent: 'poland', centroid: [19.9, 50.1], terrain: 'mountain', isCoastal: false, garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 5, manpowerOutput: 75, resourceOutput: { steel: 3, food: 7 }, adjacentTo: ['poland', 'poznan', 'lublin-pl', 'slovakia', 'austria'] },
  { id: 'gdansk-pl', name: 'Gdańsk', parent: 'poland', centroid: [18.6, 54.3], terrain: 'plains',   isCoastal: true,  garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 5, manpowerOutput: 60, resourceOutput: { food: 7 },           adjacentTo: ['poland', 'poznan', 'germany', 'ussr'] },
  { id: 'lublin-pl', name: 'Lublin', parent: 'poland', centroid: [22.5, 51.2], terrain: 'plains',   isCoastal: false, garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 75, resourceOutput: { food: 8 },           adjacentTo: ['poland', 'krakow-pl', 'ussr'] },

  // ── ROMANIA (capital: "romania" → Bucharest) ─────────────────────────
  { id: 'transylvania', name: 'Transylvania', parent: 'romania', centroid: [24.0, 46.7], terrain: 'mountain', isCoastal: false, garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 6, manpowerOutput: 55, resourceOutput: { steel: 5, food: 8 },  adjacentTo: ['romania', 'moldavia-ro', 'hungary', 'yugoslavia', 'austria'] },
  { id: 'moldavia-ro',  name: 'Moldavia',    parent: 'romania', centroid: [27.6, 47.0], terrain: 'plains',   isCoastal: false, garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 50, resourceOutput: { oil: 10, food: 8 }, adjacentTo: ['romania', 'transylvania', 'dobruja', 'ussr'] },
  { id: 'dobruja',      name: 'Dobruja',     parent: 'romania', centroid: [28.5, 44.3], terrain: 'plains',   isCoastal: true,  garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 45, resourceOutput: { oil: 8, food: 7 },  adjacentTo: ['romania', 'moldavia-ro', 'bulgaria'] },

  // ── HUNGARY (capital: "hungary" → Budapest) ──────────────────────────
  { id: 'transdanubia', name: 'Transdanubia', parent: 'hungary', centroid: [17.6, 47.3], terrain: 'plains', isCoastal: false, garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 5, manpowerOutput: 40, resourceOutput: { food: 8 },        adjacentTo: ['hungary', 'great-plain', 'austria', 'yugoslavia'] },
  { id: 'great-plain',  name: 'Great Plain',  parent: 'hungary', centroid: [21.0, 47.2], terrain: 'plains', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 38, resourceOutput: { food: 8, oil: 2 }, adjacentTo: ['hungary', 'transdanubia', 'romania', 'yugoslavia', 'slovakia'] },

  // ── YUGOSLAVIA (capital: "yugoslavia" → Belgrade) ────────────────────
  { id: 'zagreb-yu',    name: 'Zagreb',    parent: 'yugoslavia', centroid: [16.0, 45.8], terrain: 'plains',   isCoastal: true,  garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 35, resourceOutput: { food: 5, steel: 2 }, adjacentTo: ['yugoslavia', 'slovenia-yu', 'bosnia-yu', 'hungary', 'austria', 'italy'] },
  { id: 'slovenia-yu',  name: 'Slovenia',  parent: 'yugoslavia', centroid: [14.5, 46.1], terrain: 'mountain', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 25, resourceOutput: { food: 4, steel: 2 }, adjacentTo: ['yugoslavia', 'zagreb-yu', 'italy', 'austria'] },
  { id: 'bosnia-yu',    name: 'Bosnia',    parent: 'yugoslavia', centroid: [17.8, 44.0], terrain: 'mountain', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 2, manpowerOutput: 28, resourceOutput: { food: 4, steel: 1 }, adjacentTo: ['yugoslavia', 'zagreb-yu', 'macedonia-yu'] },
  { id: 'macedonia-yu', name: 'Macedonia', parent: 'yugoslavia', centroid: [21.7, 41.6], terrain: 'mountain', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 2, manpowerOutput: 28, resourceOutput: { food: 4 },          adjacentTo: ['yugoslavia', 'bosnia-yu', 'greece', 'bulgaria', 'albania'] },

  // ── FINLAND (capital: "finland" → Helsinki) ──────────────────────────
  { id: 'karelia-fi', name: 'Karelia',  parent: 'finland', centroid: [27.5, 62.5], terrain: 'forest', isCoastal: false, garrison: 5, fortLevel: 3, supplyLevel: 0.9, industryOutput: 3, manpowerOutput: 18, resourceOutput: { food: 4 },  adjacentTo: ['finland', 'lapland-fi', 'ussr', 'leningrad'] },
  { id: 'lapland-fi', name: 'Lapland',  parent: 'finland', centroid: [25.8, 68.0], terrain: 'tundra', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 0.7, industryOutput: 1, manpowerOutput: 10, resourceOutput: { steel: 3 }, adjacentTo: ['finland', 'karelia-fi', 'norway', 'sweden', 'murmansk'] },

  // ── GREECE (capital: "greece" → Athens) ──────────────────────────────
  { id: 'thessaloniki-gr', name: 'Thessaloniki', parent: 'greece', centroid: [23.0, 40.6], terrain: 'plains',   isCoastal: true,  garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 30, resourceOutput: { food: 6 }, adjacentTo: ['greece', 'epirus-gr', 'yugoslavia', 'bulgaria'] },
  { id: 'epirus-gr',       name: 'Epirus',       parent: 'greece', centroid: [20.7, 39.2], terrain: 'mountain', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 2, manpowerOutput: 25, resourceOutput: { food: 4 }, adjacentTo: ['greece', 'thessaloniki-gr', 'albania'] },

  // ── TURKEY (capital: "turkey" → Ankara) ──────────────────────────────
  { id: 'istanbul-tr',      name: 'Istanbul',       parent: 'turkey', centroid: [29.0, 41.0], terrain: 'urban',    isCoastal: true,  garrison: 6, fortLevel: 3, supplyLevel: 1.0, industryOutput: 5, manpowerOutput: 55, resourceOutput: { food: 6 },  adjacentTo: ['turkey', 'izmir-tr', 'bulgaria', 'greece'] },
  { id: 'izmir-tr',         name: 'Izmir',          parent: 'turkey', centroid: [27.1, 38.4], terrain: 'coast',    isCoastal: true,  garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 45, resourceOutput: { food: 7 },  adjacentTo: ['turkey', 'istanbul-tr', 'erzurum-tr'] },
  { id: 'erzurum-tr',       name: 'Eastern Anatolia', parent: 'turkey', centroid: [41.3, 39.9], terrain: 'mountain', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 40, resourceOutput: { food: 4 }, adjacentTo: ['turkey', 'izmir-tr', 'ussr', 'iran', 'iraq', 'syria'] },

  // ── SPAIN (capital: "spain" → Madrid) ────────────────────────────────
  { id: 'catalonia-sp', name: 'Catalonia', parent: 'spain', centroid: [1.6, 41.4],  terrain: 'plains',   isCoastal: true,  garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 8, manpowerOutput: 90, resourceOutput: { steel: 4, food: 8 }, adjacentTo: ['spain', 'andalusia-sp', 'france'] },
  { id: 'andalusia-sp', name: 'Andalusia', parent: 'spain', centroid: [-5.0, 37.5], terrain: 'plains',   isCoastal: true,  garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 6, manpowerOutput: 80, resourceOutput: { food: 9 },          adjacentTo: ['spain', 'catalonia-sp', 'portugal', 'morocco'] },

  // ── NORWAY (capital: "norway" → Oslo) ────────────────────────────────
  { id: 'bergen-no',      name: 'Bergen',      parent: 'norway', centroid: [5.3, 60.4],  terrain: 'mountain', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 20, resourceOutput: { food: 4 },        adjacentTo: ['norway', 'trondheim-no', 'sweden'] },
  { id: 'trondheim-no',   name: 'Trondheim',   parent: 'norway', centroid: [10.4, 63.4], terrain: 'mountain', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.9, industryOutput: 2, manpowerOutput: 15, resourceOutput: { food: 3 },        adjacentTo: ['norway', 'bergen-no', 'north-norway-no', 'sweden'] },
  { id: 'north-norway-no',name: 'N. Norway',   parent: 'norway', centroid: [18.9, 69.7], terrain: 'tundra',   isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.7, industryOutput: 1, manpowerOutput: 8,  resourceOutput: { steel: 3 },       adjacentTo: ['norway', 'trondheim-no', 'murmansk', 'sweden', 'finland'] },

  // ── SWEDEN (capital: "sweden" → Stockholm) ───────────────────────────
  { id: 'goteborg-sw', name: 'Göteborg', parent: 'sweden', centroid: [11.9, 57.7], terrain: 'plains',   isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 5, manpowerOutput: 22, resourceOutput: { steel: 8, food: 5 }, adjacentTo: ['sweden', 'malmo-sw', 'norrland-sw', 'norway', 'denmark'] },
  { id: 'malmo-sw',    name: 'Malmö',    parent: 'sweden', centroid: [13.0, 55.6], terrain: 'plains',   isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 18, resourceOutput: { steel: 5, food: 4 }, adjacentTo: ['sweden', 'goteborg-sw', 'denmark'] },
  { id: 'norrland-sw', name: 'Norrland', parent: 'sweden', centroid: [17.0, 65.0], terrain: 'forest',   isCoastal: false, garrison: 1, fortLevel: 1, supplyLevel: 0.8, industryOutput: 4, manpowerOutput: 15, resourceOutput: { steel: 12, food: 3 }, adjacentTo: ['sweden', 'goteborg-sw', 'norway', 'finland'] },

  // ── DENMARK (capital: "denmark" → Copenhagen) ────────────────────────
  { id: 'jutland-dk', name: 'Jutland', parent: 'denmark', centroid: [9.5, 56.3], terrain: 'plains', isCoastal: true, garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 28, resourceOutput: { food: 8 }, adjacentTo: ['denmark', 'germany', 'sweden', 'norway'] },

  // ── NETHERLANDS (capital: "netherlands" → Amsterdam) ─────────────────
  { id: 'rotterdam-nl', name: 'Rotterdam', parent: 'netherlands', centroid: [4.5, 51.9], terrain: 'plains', isCoastal: true, garrison: 3, fortLevel: 1, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 45, resourceOutput: { food: 7 }, adjacentTo: ['netherlands', 'amsterdam-nl', 'belgium', 'germany'] },
  { id: 'amsterdam-nl', name: 'Amsterdam', parent: 'netherlands', centroid: [4.9, 52.4], terrain: 'urban',  isCoastal: true, garrison: 3, fortLevel: 2, supplyLevel: 1.0, industryOutput: 10, manpowerOutput: 45, resourceOutput: { food: 8 }, adjacentTo: ['netherlands', 'rotterdam-nl', 'germany'] },

  // ── BELGIUM (capital: "belgium" → Brussels) ──────────────────────────
  { id: 'wallonia-be', name: 'Wallonia', parent: 'belgium', centroid: [5.6, 50.6], terrain: 'plains', isCoastal: false, garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 13, manpowerOutput: 45, resourceOutput: { steel: 8, food: 5 }, adjacentTo: ['belgium', 'brussels-be', 'france', 'germany', 'cologne'] },
  { id: 'brussels-be', name: 'Brussels', parent: 'belgium', centroid: [4.4, 50.8], terrain: 'urban',  isCoastal: false, garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 12, manpowerOutput: 45, resourceOutput: { steel: 7, food: 5 }, adjacentTo: ['belgium', 'wallonia-be', 'france', 'netherlands'] },

  // ── BULGARIA (capital: "bulgaria" → Sofia) ───────────────────────────
  { id: 'plovdiv-bg', name: 'Plovdiv', parent: 'bulgaria', centroid: [24.7, 42.1], terrain: 'plains', isCoastal: false, garrison: 4, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 38, resourceOutput: { food: 7 }, adjacentTo: ['bulgaria', 'sofia-bg', 'greece', 'turkey'] },
  { id: 'sofia-bg',   name: 'Sofia',   parent: 'bulgaria', centroid: [23.3, 42.7], terrain: 'plains', isCoastal: false, garrison: 4, fortLevel: 2, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 42, resourceOutput: { food: 8 }, adjacentTo: ['bulgaria', 'plovdiv-bg', 'yugoslavia', 'romania'] },

  // ── PORTUGAL (capital: "portugal" → Lisbon) ──────────────────────────
  { id: 'porto-pt', name: 'Porto', parent: 'portugal', centroid: [-8.6, 41.2], terrain: 'plains', isCoastal: true, garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 38, resourceOutput: { food: 7 }, adjacentTo: ['portugal', 'lisbon-pt', 'spain'] },
  { id: 'lisbon-pt', name: 'Lisbon', parent: 'portugal', centroid: [-9.1, 38.7], terrain: 'coast',  isCoastal: true, garrison: 3, fortLevel: 2, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 42, resourceOutput: { food: 8 }, adjacentTo: ['portugal', 'porto-pt', 'spain'] },

  // ══════════════════════════════════════════════════════════════════════
  // MIDDLE EAST / AFRICA
  // ══════════════════════════════════════════════════════════════════════

  // ── IRAN (capital: "iran" → Tehran) ──────────────────────────────────
  { id: 'khuzestan',    name: 'Khuzestan',  parent: 'iran', centroid: [48.5, 31.3], terrain: 'desert', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 3, manpowerOutput: 38, resourceOutput: { oil: 30, food: 5 }, adjacentTo: ['iran', 'tehran-ir', 'azerbaijan-ir', 'iraq'] },
  { id: 'tehran-ir',    name: 'Tehran',     parent: 'iran', centroid: [51.4, 35.7], terrain: 'plains', isCoastal: false, garrison: 3, fortLevel: 2, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 45, resourceOutput: { oil: 5, food: 4 },  adjacentTo: ['iran', 'khuzestan', 'azerbaijan-ir', 'khorasan-ir', 'ussr'] },
  { id: 'azerbaijan-ir',name: 'Azerbaijan', parent: 'iran', centroid: [46.3, 38.1], terrain: 'mountain', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 2, manpowerOutput: 35, resourceOutput: { oil: 8, food: 4 }, adjacentTo: ['iran', 'tehran-ir', 'ussr', 'turkey', 'baku'] },
  { id: 'khorasan-ir',  name: 'Khorasan',  parent: 'iran', centroid: [59.6, 36.3], terrain: 'desert', isCoastal: false, garrison: 1, fortLevel: 1, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 30, resourceOutput: { food: 4 },         adjacentTo: ['iran', 'tehran-ir', 'afghanistan', 'ussr', 'tashkent'] },

  // ── IRAQ (capital: "iraq" → Baghdad) ─────────────────────────────────
  { id: 'mosul-iq',  name: 'Mosul',  parent: 'iraq', centroid: [43.1, 36.3], terrain: 'plains', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 2, manpowerOutput: 18, resourceOutput: { oil: 18, food: 4 }, adjacentTo: ['iraq', 'baghdad-iq', 'turkey', 'syria'] },
  { id: 'baghdad-iq',name: 'Baghdad', parent: 'iraq', centroid: [44.4, 33.3], terrain: 'desert', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 2, manpowerOutput: 17, resourceOutput: { oil: 8, food: 3 },  adjacentTo: ['iraq', 'mosul-iq', 'basra-iq', 'iran', 'saudi-arabia', 'syria'] },
  { id: 'basra-iq',  name: 'Basra',  parent: 'iraq', centroid: [47.8, 30.5], terrain: 'desert', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.9, industryOutput: 1, manpowerOutput: 15, resourceOutput: { oil: 14, food: 3 }, adjacentTo: ['iraq', 'baghdad-iq', 'iran', 'saudi-arabia'] },

  // ── EGYPT (capital: "egypt" → Cairo) ─────────────────────────────────
  { id: 'alexandria-eg', name: 'Alexandria', parent: 'egypt', centroid: [29.9, 31.2], terrain: 'coast',  isCoastal: true,  garrison: 3, fortLevel: 2, supplyLevel: 0.9, industryOutput: 3, manpowerOutput: 65, resourceOutput: { food: 8 },        adjacentTo: ['egypt', 'cairo-eg', 'libya'] },
  { id: 'cairo-eg',      name: 'Cairo',      parent: 'egypt', centroid: [31.2, 30.1], terrain: 'desert', isCoastal: false, garrison: 3, fortLevel: 2, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 70, resourceOutput: { oil: 4, food: 7 }, adjacentTo: ['egypt', 'alexandria-eg', 'sinai-eg', 'sudan', 'libya'] },
  { id: 'sinai-eg',      name: 'Sinai',      parent: 'egypt', centroid: [33.7, 29.8], terrain: 'desert', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.7, industryOutput: 1, manpowerOutput: 40, resourceOutput: { oil: 3 },         adjacentTo: ['egypt', 'cairo-eg', 'saudi-arabia', 'palestine', 'syria'] },

  // ── SAUDI ARABIA (capital: "saudi-arabia" → Riyadh) ──────────────────
  { id: 'hejaz',             name: 'Hejaz',            parent: 'saudi-arabia', centroid: [39.8, 21.4], terrain: 'desert', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.5, industryOutput: 1, manpowerOutput: 20, resourceOutput: { food: 2 },        adjacentTo: ['saudi-arabia', 'riyadh-sa', 'yemen', 'egypt'] },
  { id: 'riyadh-sa',         name: 'Riyadh',           parent: 'saudi-arabia', centroid: [46.7, 24.7], terrain: 'desert', isCoastal: false, garrison: 1, fortLevel: 1, supplyLevel: 0.6, industryOutput: 1, manpowerOutput: 20, resourceOutput: { oil: 20, food: 2 }, adjacentTo: ['saudi-arabia', 'hejaz', 'eastern-province-sa', 'iraq'] },
  { id: 'eastern-province-sa', name: 'Eastern Province', parent: 'saudi-arabia', centroid: [50.0, 26.3], terrain: 'desert', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.5, industryOutput: 1, manpowerOutput: 18, resourceOutput: { oil: 35, food: 1 }, adjacentTo: ['saudi-arabia', 'riyadh-sa', 'iran', 'iraq'] },

  // ── INDIA (capital: "india" → Delhi) — UK territory ──────────────────
  { id: 'bombay-in',  name: 'Bombay',  parent: 'india', centroid: [72.8, 19.1], terrain: 'coast',  isCoastal: true,  garrison: 3, fortLevel: 2, supplyLevel: 0.9, industryOutput: 6, manpowerOutput: 600, resourceOutput: { steel: 5, food: 18 }, adjacentTo: ['india', 'delhi-in', 'madras-in'] },
  { id: 'delhi-in',   name: 'Delhi',   parent: 'india', centroid: [77.2, 28.6], terrain: 'plains', isCoastal: false, garrison: 3, fortLevel: 2, supplyLevel: 1.0, industryOutput: 7, manpowerOutput: 700, resourceOutput: { food: 18, oil: 3 },    adjacentTo: ['india', 'bombay-in', 'calcutta-in', 'punjab-in', 'afghanistan'] },
  { id: 'calcutta-in',name: 'Calcutta',parent: 'india', centroid: [88.4, 22.6], terrain: 'plains', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 5, manpowerOutput: 650, resourceOutput: { food: 20 },           adjacentTo: ['india', 'delhi-in', 'madras-in', 'burma', 'china'] },
  { id: 'madras-in',  name: 'Madras',  parent: 'india', centroid: [80.3, 13.1], terrain: 'coast',  isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 5, manpowerOutput: 580, resourceOutput: { food: 15 },           adjacentTo: ['india', 'bombay-in', 'calcutta-in', 'sri-lanka'] },
  { id: 'punjab-in',  name: 'Punjab',  parent: 'india', centroid: [74.9, 31.5], terrain: 'plains', isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 3, manpowerOutput: 450, resourceOutput: { food: 9 },            adjacentTo: ['india', 'delhi-in', 'afghanistan', 'ussr', 'tashkent'] },

  // ── ALGERIA (capital: "algeria" → Algiers) — France territory ─────────
  { id: 'oran-dz',        name: 'Oran',       parent: 'algeria', centroid: [-0.6, 35.7], terrain: 'desert', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.7, industryOutput: 2, manpowerOutput: 28, resourceOutput: { food: 5 },        adjacentTo: ['algeria', 'algiers-dz', 'morocco'] },
  { id: 'algiers-dz',     name: 'Algiers',    parent: 'algeria', centroid: [3.1, 36.7],  terrain: 'coast',  isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 30, resourceOutput: { oil: 2, food: 5 }, adjacentTo: ['algeria', 'oran-dz', 'constantine-dz', 'france', 'marseille'] },
  { id: 'constantine-dz', name: 'Constantine',parent: 'algeria', centroid: [6.6, 36.4],  terrain: 'plains', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.7, industryOutput: 1, manpowerOutput: 22, resourceOutput: { food: 5 },        adjacentTo: ['algeria', 'algiers-dz', 'tunisia', 'libya'] },

  // ── LIBYA (capital: "libya" → Tripoli) — Italy territory ─────────────
  { id: 'tripoli-ly',  name: 'Tripoli',  parent: 'libya', centroid: [13.2, 32.9], terrain: 'desert', isCoastal: true,  garrison: 3, fortLevel: 1, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 8,  resourceOutput: { oil: 5 },  adjacentTo: ['libya', 'benghazi-ly', 'tunisia', 'algeria', 'italy', 'sicily'] },
  { id: 'benghazi-ly', name: 'Benghazi', parent: 'libya', centroid: [20.1, 32.1], terrain: 'desert', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 0.7, industryOutput: 1, manpowerOutput: 7,  resourceOutput: { oil: 5 },  adjacentTo: ['libya', 'tripoli-ly', 'egypt'] },

  // ── ETHIOPIA (capital: "ethiopia" → Addis Ababa) — Italy territory ───
  { id: 'addis-ababa', name: 'Addis Ababa', parent: 'ethiopia', centroid: [38.7, 9.0],  terrain: 'mountain', isCoastal: false, garrison: 3, fortLevel: 1, supplyLevel: 0.6, industryOutput: 2, manpowerOutput: 55, resourceOutput: { food: 11 }, adjacentTo: ['ethiopia', 'ogaden-et', 'somalia', 'kenya', 'sudan'] },
  { id: 'ogaden-et',   name: 'Ogaden',    parent: 'ethiopia', centroid: [44.2, 7.5],  terrain: 'desert',   isCoastal: false, garrison: 2, fortLevel: 0, supplyLevel: 0.4, industryOutput: 1, manpowerOutput: 45, resourceOutput: { food: 9 },  adjacentTo: ['ethiopia', 'addis-ababa', 'somalia', 'kenya'] },

  // ── MOROCCO (capital: "morocco" → Rabat) — Spain territory ───────────
  { id: 'casablanca-ma', name: 'Casablanca', parent: 'morocco', centroid: [-7.6, 33.6], terrain: 'plains', isCoastal: true,  garrison: 3, fortLevel: 1, supplyLevel: 0.8, industryOutput: 3, manpowerOutput: 55, resourceOutput: { food: 8 }, adjacentTo: ['morocco', 'rabat-ma', 'algeria'] },
  { id: 'rabat-ma',      name: 'Rabat',      parent: 'morocco', centroid: [-6.8, 34.0], terrain: 'coast',  isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 45, resourceOutput: { food: 7 }, adjacentTo: ['morocco', 'casablanca-ma', 'spain'] },

  // ── SOUTH AFRICA (capital: "south-africa" → Pretoria) ────────────────
  { id: 'cape-town-sa',  name: 'Cape Town',        parent: 'south-africa', centroid: [18.4, -33.9], terrain: 'coast',  isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 38, resourceOutput: { food: 7 },        adjacentTo: ['south-africa', 'pretoria-sa', 'namibia', 'angola'] },
  { id: 'pretoria-sa',   name: 'Pretoria',         parent: 'south-africa', centroid: [28.2, -25.7], terrain: 'plains', isCoastal: false, garrison: 2, fortLevel: 2, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 42, resourceOutput: { steel: 7, food: 7 }, adjacentTo: ['south-africa', 'cape-town-sa', 'durban-sa', 'botswana', 'zimbabwe', 'mozambique'] },
  { id: 'durban-sa',     name: 'Durban',           parent: 'south-africa', centroid: [31.0, -29.9], terrain: 'coast',  isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 30, resourceOutput: { steel: 6, food: 6 }, adjacentTo: ['south-africa', 'pretoria-sa', 'kenya', 'mozambique'] },

  // ══════════════════════════════════════════════════════════════════════
  // EAST / SOUTHEAST ASIA
  // ══════════════════════════════════════════════════════════════════════

  // ── KOREA (capital: "korea" → Seoul) — Japan territory ───────────────
  { id: 'pyongyang-ko', name: 'Pyongyang', parent: 'korea', centroid: [125.8, 39.0], terrain: 'plains', isCoastal: true,  garrison: 3, fortLevel: 1, supplyLevel: 0.9, industryOutput: 5, manpowerOutput: 90, resourceOutput: { steel: 4, food: 7 }, adjacentTo: ['korea', 'busan-ko', 'manchuria', 'ussr'] },
  { id: 'busan-ko',     name: 'Busan',     parent: 'korea', centroid: [129.0, 35.2], terrain: 'coast',  isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 0.9, industryOutput: 5, manpowerOutput: 80, resourceOutput: { steel: 3, food: 7 }, adjacentTo: ['korea', 'pyongyang-ko', 'japan', 'kyushu'] },

  // ── MANCHURIA (capital: "manchuria" → Mukden) — Japan territory ───────
  { id: 'mukden',    name: 'Mukden',  parent: 'manchuria', centroid: [123.5, 41.8], terrain: 'plains', isCoastal: false, garrison: 6, fortLevel: 2, supplyLevel: 0.9, industryOutput: 8, manpowerOutput: 110, resourceOutput: { steel: 10, food: 10, oil: 3 }, adjacentTo: ['manchuria', 'harbin', 'dalian-ma', 'korea', 'china-north', 'ussr', 'mongolia'] },
  { id: 'harbin',    name: 'Harbin',  parent: 'manchuria', centroid: [126.6, 45.8], terrain: 'plains', isCoastal: false, garrison: 5, fortLevel: 2, supplyLevel: 0.8, industryOutput: 5, manpowerOutput: 90,  resourceOutput: { steel: 5, food: 10, oil: 1 }, adjacentTo: ['manchuria', 'mukden', 'ussr', 'vladivostok'] },
  { id: 'dalian-ma', name: 'Dalian',  parent: 'manchuria', centroid: [121.6, 38.9], terrain: 'coast',  isCoastal: true,  garrison: 4, fortLevel: 2, supplyLevel: 0.9, industryOutput: 7, manpowerOutput: 80,  resourceOutput: { steel: 5, food: 5 },          adjacentTo: ['manchuria', 'mukden', 'china-north', 'korea'] },

  // ── BURMA (capital: "burma" → Rangoon) — UK territory ────────────────
  { id: 'rangoon-bu', name: 'Rangoon',  parent: 'burma', centroid: [96.2, 16.9], terrain: 'jungle', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 0.8, industryOutput: 3, manpowerOutput: 80, resourceOutput: { oil: 8, food: 10 }, adjacentTo: ['burma', 'mandalay-bu', 'thailand', 'malaysia'] },
  { id: 'mandalay-bu',name: 'Mandalay', parent: 'burma', centroid: [96.1, 21.9], terrain: 'plains', isCoastal: false, garrison: 1, fortLevel: 0, supplyLevel: 0.7, industryOutput: 2, manpowerOutput: 70, resourceOutput: { oil: 7, food: 10 }, adjacentTo: ['burma', 'rangoon-bu', 'india', 'china', 'chongqing'] },

  // ── VIETNAM/INDOCHINA (capital: "vietnam" → Hanoi) — France territory ─
  { id: 'hue-vn',    name: 'Hué',    parent: 'vietnam', centroid: [107.6, 16.5], terrain: 'jungle', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.7, industryOutput: 2, manpowerOutput: 65, resourceOutput: { food: 9 }, adjacentTo: ['vietnam', 'hanoi-vn', 'saigon-vn', 'laos', 'cambodia'] },
  { id: 'hanoi-vn',  name: 'Hanoi',  parent: 'vietnam', centroid: [105.8, 21.0], terrain: 'plains', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 70, resourceOutput: { food: 9, oil: 2 }, adjacentTo: ['vietnam', 'hue-vn', 'china', 'laos'] },
  { id: 'saigon-vn', name: 'Saigon', parent: 'vietnam', centroid: [106.7, 10.8], terrain: 'jungle', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 65, resourceOutput: { food: 9 }, adjacentTo: ['vietnam', 'hue-vn', 'cambodia', 'thailand', 'malaysia'] },

  // ── THAILAND (capital: "thailand" → Bangkok) ─────────────────────────
  { id: 'chiangmai-th', name: 'Chiang Mai', parent: 'thailand', centroid: [99.0, 18.8], terrain: 'mountain', isCoastal: false, garrison: 2, fortLevel: 0, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 60, resourceOutput: { food: 12 }, adjacentTo: ['thailand', 'bangkok-th', 'burma', 'laos'] },
  { id: 'bangkok-th',   name: 'Bangkok',    parent: 'thailand', centroid: [100.5, 13.8], terrain: 'plains',   isCoastal: true,  garrison: 4, fortLevel: 1, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 90, resourceOutput: { food: 18 }, adjacentTo: ['thailand', 'chiangmai-th', 'vietnam', 'cambodia', 'malaysia'] },

  // ── INDONESIA (capital: "indonesia" → Batavia/Java) — Netherlands ─────
  { id: 'batavia-id', name: 'Java',    parent: 'indonesia', centroid: [107.5, -7.0],  terrain: 'jungle', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 0.8, industryOutput: 3, manpowerOutput: 140, resourceOutput: { oil: 10, food: 10 }, adjacentTo: ['indonesia', 'sumatra-id', 'borneo-id', 'australia', 'new-guinea'] },
  { id: 'sumatra-id', name: 'Sumatra', parent: 'indonesia', centroid: [102.5, 0.5],   terrain: 'jungle', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.7, industryOutput: 3, manpowerOutput: 130, resourceOutput: { oil: 20, food: 10 }, adjacentTo: ['indonesia', 'batavia-id', 'malaysia'] },
  { id: 'borneo-id',  name: 'Borneo',  parent: 'indonesia', centroid: [115.0, 1.0],   terrain: 'jungle', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.6, industryOutput: 2, manpowerOutput: 120, resourceOutput: { oil: 20, food: 10 }, adjacentTo: ['indonesia', 'batavia-id', 'malaysia', 'philippines'] },

  // ══════════════════════════════════════════════════════════════════════
  // AMERICAS & PACIFIC
  // ══════════════════════════════════════════════════════════════════════

  // ── CANADA (capital: "canada" → Ottawa) — UK territory ───────────────
  { id: 'quebec-ca',  name: 'Québec',           parent: 'canada', centroid: [-72.0, 48.0],  terrain: 'forest', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 1.0, industryOutput: 5, manpowerOutput: 28, resourceOutput: { steel: 8, food: 10 }, adjacentTo: ['canada', 'ottawa-ca', 'prairies-ca', 'usa', 'new-york'] },
  { id: 'ottawa-ca',  name: 'Ontario',          parent: 'canada', centroid: [-79.0, 45.5],  terrain: 'plains', isCoastal: false, garrison: 1, fortLevel: 1, supplyLevel: 1.0, industryOutput: 6, manpowerOutput: 32, resourceOutput: { steel: 10, food: 12 }, adjacentTo: ['canada', 'quebec-ca', 'prairies-ca', 'usa', 'new-york', 'midwest'] },
  { id: 'prairies-ca',name: 'Prairies',         parent: 'canada', centroid: [-101.0, 52.5], terrain: 'plains', isCoastal: false, garrison: 1, fortLevel: 0, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 22, resourceOutput: { oil: 5, food: 14 }, adjacentTo: ['canada', 'ottawa-ca', 'bc-ca', 'usa', 'midwest'] },
  { id: 'bc-ca',      name: 'British Columbia', parent: 'canada', centroid: [-123.0, 53.5], terrain: 'mountain', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 18, resourceOutput: { steel: 8, food: 5 }, adjacentTo: ['canada', 'prairies-ca', 'usa', 'california'] },

  // ── BRAZIL (capital: "brazil" → Rio de Janeiro) ──────────────────────
  { id: 'sao-paulo-br', name: 'São Paulo',    parent: 'brazil', centroid: [-46.6, -23.5], terrain: 'plains', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 5, manpowerOutput: 110, resourceOutput: { steel: 4, food: 12 }, adjacentTo: ['brazil', 'rio-de-janeiro-br', 'minas-br', 'argentina'] },
  { id: 'rio-de-janeiro-br', name: 'Rio de Janeiro', parent: 'brazil', centroid: [-43.2, -22.9], terrain: 'coast', isCoastal: true, garrison: 2, fortLevel: 2, supplyLevel: 1.0, industryOutput: 5, manpowerOutput: 120, resourceOutput: { food: 13, steel: 3 }, adjacentTo: ['brazil', 'sao-paulo-br', 'minas-br', 'amazon-br'] },
  { id: 'minas-br',    name: 'Minas Gerais',  parent: 'brazil', centroid: [-44.0, -19.5], terrain: 'plains', isCoastal: false, garrison: 1, fortLevel: 0, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 95,  resourceOutput: { steel: 3, food: 11 }, adjacentTo: ['brazil', 'sao-paulo-br', 'rio-de-janeiro-br', 'amazon-br'] },
  { id: 'amazon-br',   name: 'Amazon',        parent: 'brazil', centroid: [-58.0, -3.0],  terrain: 'jungle', isCoastal: false, garrison: 1, fortLevel: 0, supplyLevel: 0.6, industryOutput: 2, manpowerOutput: 80,  resourceOutput: { food: 14 },          adjacentTo: ['brazil', 'minas-br', 'colombia', 'venezuela', 'peru', 'bolivia'] },

  // ── MEXICO (capital: "mexico" → Mexico City) ─────────────────────────
  { id: 'veracruz-mx',     name: 'Veracruz',      parent: 'mexico', centroid: [-96.1, 19.2],  terrain: 'jungle', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 65, resourceOutput: { oil: 8, food: 10 }, adjacentTo: ['mexico', 'mexico-city-mx', 'yucatan-mx'] },
  { id: 'mexico-city-mx',  name: 'Mexico City',   parent: 'mexico', centroid: [-99.1, 19.4],  terrain: 'urban',  isCoastal: false, garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 80, resourceOutput: { oil: 4, food: 10 }, adjacentTo: ['mexico', 'veracruz-mx', 'northern-mexico-mx'] },
  { id: 'northern-mexico-mx', name: 'N. Mexico',  parent: 'mexico', centroid: [-105.3, 28.0], terrain: 'desert', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 55, resourceOutput: { oil: 8, food: 10 }, adjacentTo: ['mexico', 'mexico-city-mx', 'usa', 'texas', 'california'] },

  // ── ARGENTINA (capital: "argentina" → Buenos Aires) ──────────────────
  { id: 'cordoba-ar',   name: 'Córdoba',   parent: 'argentina', centroid: [-64.2, -31.4], terrain: 'plains', isCoastal: false, garrison: 2, fortLevel: 0, supplyLevel: 1.0, industryOutput: 3, manpowerOutput: 45, resourceOutput: { food: 14, oil: 3 }, adjacentTo: ['argentina', 'buenos-aires-ar', 'patagonia-ar', 'chile', 'bolivia'] },
  { id: 'buenos-aires-ar', name: 'Buenos Aires', parent: 'argentina', centroid: [-58.4, -34.6], terrain: 'plains', isCoastal: true, garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 55, resourceOutput: { food: 13, oil: 3 }, adjacentTo: ['argentina', 'cordoba-ar', 'patagonia-ar', 'brazil', 'uruguay', 'paraguay'] },
  { id: 'patagonia-ar', name: 'Patagonia', parent: 'argentina', centroid: [-68.0, -44.0], terrain: 'plains', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 30, resourceOutput: { food: 10, oil: 4 }, adjacentTo: ['argentina', 'cordoba-ar', 'buenos-aires-ar', 'chile'] },

  // ── AUSTRALIA (capital: "australia" → Canberra) ──────────────────────
  { id: 'sydney-au',  name: 'New South Wales', parent: 'australia', centroid: [148.0, -33.0], terrain: 'plains', isCoastal: true,  garrison: 2, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 18, resourceOutput: { steel: 5, food: 8 }, adjacentTo: ['australia', 'canberra-au', 'queensland-au', 'new-zealand'] },
  { id: 'canberra-au',name: 'Victoria',        parent: 'australia', centroid: [144.5, -37.5], terrain: 'plains', isCoastal: true,  garrison: 1, fortLevel: 1, supplyLevel: 1.0, industryOutput: 4, manpowerOutput: 16, resourceOutput: { steel: 5, food: 8 }, adjacentTo: ['australia', 'sydney-au', 'wa-au'] },
  { id: 'queensland-au', name: 'Queensland',   parent: 'australia', centroid: [146.0, -20.0], terrain: 'plains', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.9, industryOutput: 3, manpowerOutput: 14, resourceOutput: { steel: 5, food: 7 }, adjacentTo: ['australia', 'sydney-au', 'wa-au', 'new-guinea'] },
  { id: 'wa-au',      name: 'W. Australia',    parent: 'australia', centroid: [120.0, -26.0], terrain: 'desert', isCoastal: true,  garrison: 1, fortLevel: 0, supplyLevel: 0.8, industryOutput: 2, manpowerOutput: 10, resourceOutput: { steel: 5, food: 7 }, adjacentTo: ['australia', 'canberra-au', 'queensland-au'] },
];

export const RENAMED_CAPITALS: Record<string, { name: string; centroid: [number, number] }> = {
  // Original 8 majors
  germany: { name: 'Berlin',     centroid: [13.4, 52.5] },
  ussr:    { name: 'Moscow',     centroid: [37.6, 55.8] },
  france:  { name: 'Paris',      centroid: [2.3, 48.9] },
  uk:      { name: 'London',     centroid: [-0.1, 51.5] },
  italy:   { name: 'Rome',       centroid: [12.5, 41.9] },
  japan:   { name: 'Tokyo',      centroid: [139.7, 35.7] },
  usa:     { name: 'Washington', centroid: [-77.0, 38.9] },
  china:   { name: 'Nanjing',    centroid: [118.8, 32.0] },
  // Europe — minor nations
  poland:      { name: 'Warsaw',      centroid: [21.0, 52.2] },
  romania:     { name: 'Bucharest',   centroid: [26.1, 44.4] },
  hungary:     { name: 'Budapest',    centroid: [19.0, 47.5] },
  yugoslavia:  { name: 'Belgrade',    centroid: [20.5, 44.8] },
  finland:     { name: 'Helsinki',    centroid: [25.0, 60.2] },
  greece:      { name: 'Athens',      centroid: [23.7, 37.9] },
  turkey:      { name: 'Ankara',      centroid: [32.9, 39.9] },
  spain:       { name: 'Madrid',      centroid: [-3.7, 40.4] },
  norway:      { name: 'Oslo',        centroid: [10.7, 59.9] },
  sweden:      { name: 'Stockholm',   centroid: [18.0, 59.3] },
  denmark:     { name: 'Copenhagen',  centroid: [12.6, 55.7] },
  netherlands: { name: 'The Hague',   centroid: [4.3, 52.1] },
  belgium:     { name: 'Antwerp',     centroid: [4.4, 51.2] },
  bulgaria:    { name: 'Sofia',       centroid: [23.3, 42.7] },
  portugal:    { name: 'Lisbon',      centroid: [-9.1, 38.7] },
  // Middle East / Africa
  iran:         { name: 'Tehran',      centroid: [51.4, 35.7] },
  iraq:         { name: 'Baghdad',     centroid: [44.4, 33.3] },
  egypt:        { name: 'Cairo',       centroid: [31.2, 30.1] },
  'saudi-arabia': { name: 'Riyadh',   centroid: [46.7, 24.7] },
  india:        { name: 'Delhi',       centroid: [77.2, 28.6] },
  algeria:      { name: 'Algiers',     centroid: [3.1, 36.7] },
  libya:        { name: 'Tripoli',     centroid: [13.2, 32.9] },
  ethiopia:     { name: 'Addis Ababa', centroid: [38.7, 9.0] },
  morocco:      { name: 'Rabat',       centroid: [-6.8, 34.0] },
  'south-africa': { name: 'Pretoria', centroid: [28.2, -25.7] },
  // Asia
  korea:      { name: 'Seoul',     centroid: [126.97, 37.57] },
  manchuria:  { name: 'Mukden',    centroid: [123.5, 41.8] },
  burma:      { name: 'Rangoon',   centroid: [96.2, 16.9] },
  vietnam:    { name: 'Hanoi',     centroid: [105.8, 21.0] },
  thailand:   { name: 'Bangkok',   centroid: [100.5, 13.8] },
  indonesia:  { name: 'Batavia',   centroid: [106.8, -6.2] },
  // Americas / Pacific
  canada:    { name: 'Ottawa',        centroid: [-75.7, 45.4] },
  brazil:    { name: 'Rio de Janeiro',centroid: [-43.2, -22.9] },
  mexico:    { name: 'Mexico City',   centroid: [-99.1, 19.4] },
  argentina: { name: 'Buenos Aires',  centroid: [-58.4, -34.6] },
  australia: { name: 'Canberra',      centroid: [149.1, -35.3] },
};

export const CAPITAL_STAT_OVERRIDES: Record<string, {
  garrison: number;
  fortLevel: number;
  industryOutput: number;
  manpowerOutput: number;
  resourceOutput: Partial<Resources>;
}> = {
  // Original 8 majors
  germany: { garrison: 12, fortLevel: 4, industryOutput: 15, manpowerOutput: 200,  resourceOutput: { steel: 10, food: 5 } },
  ussr:    { garrison: 18, fortLevel: 4, industryOutput: 27, manpowerOutput: 500,  resourceOutput: { oil: 55, steel: 20, food: 15 } },
  france:  { garrison: 10, fortLevel: 5, industryOutput: 8,  manpowerOutput: 100,  resourceOutput: { steel: 2, food: 5 } },
  uk:      { garrison: 9,  fortLevel: 5, industryOutput: 25, manpowerOutput: 220,  resourceOutput: { steel: 10, food: 5 } },
  italy:   { garrison: 7,  fortLevel: 3, industryOutput: 8,  manpowerOutput: 140,  resourceOutput: { food: 2, steel: 5 } },
  japan:   { garrison: 10, fortLevel: 4, industryOutput: 19, manpowerOutput: 250,  resourceOutput: { steel: 12, food: 10 } },
  usa:     { garrison: 10, fortLevel: 3, industryOutput: 23, manpowerOutput: 200,  resourceOutput: { oil: 60, steel: 30, food: 10 } },
  china:   { garrison: 14, fortLevel: 2, industryOutput: 4,  manpowerOutput: 1700, resourceOutput: { food: 20 } },
  // Europe
  poland:      { garrison: 6,  fortLevel: 3, industryOutput: 5,  manpowerOutput: 80,  resourceOutput: { steel: 3, food: 8 } },
  romania:     { garrison: 4,  fortLevel: 2, industryOutput: 6,  manpowerOutput: 60,  resourceOutput: { oil: 12, food: 8 } },
  hungary:     { garrison: 4,  fortLevel: 2, industryOutput: 6,  manpowerOutput: 44,  resourceOutput: { oil: 3, food: 8 } },
  yugoslavia:  { garrison: 3,  fortLevel: 2, industryOutput: 3,  manpowerOutput: 40,  resourceOutput: { food: 7, steel: 2 } },
  finland:     { garrison: 4,  fortLevel: 3, industryOutput: 4,  manpowerOutput: 22,  resourceOutput: { food: 6 } },
  greece:      { garrison: 3,  fortLevel: 2, industryOutput: 4,  manpowerOutput: 30,  resourceOutput: { food: 5 } },
  turkey:      { garrison: 4,  fortLevel: 2, industryOutput: 4,  manpowerOutput: 50,  resourceOutput: { food: 6 } },
  spain:       { garrison: 5,  fortLevel: 2, industryOutput: 6,  manpowerOutput: 80,  resourceOutput: { steel: 6, food: 8 } },
  norway:      { garrison: 2,  fortLevel: 2, industryOutput: 3,  manpowerOutput: 22,  resourceOutput: { food: 3 } },
  sweden:      { garrison: 2,  fortLevel: 2, industryOutput: 5,  manpowerOutput: 27,  resourceOutput: { steel: 8, food: 5 } },
  denmark:     { garrison: 2,  fortLevel: 2, industryOutput: 4,  manpowerOutput: 32,  resourceOutput: { food: 7 } },
  netherlands: { garrison: 2,  fortLevel: 2, industryOutput: 10, manpowerOutput: 45,  resourceOutput: { food: 8 } },
  belgium:     { garrison: 3,  fortLevel: 3, industryOutput: 12, manpowerOutput: 45,  resourceOutput: { steel: 9, food: 5 } },
  bulgaria:    { garrison: 4,  fortLevel: 2, industryOutput: 4,  manpowerOutput: 42,  resourceOutput: { food: 8 } },
  portugal:    { garrison: 3,  fortLevel: 2, industryOutput: 4,  manpowerOutput: 42,  resourceOutput: { food: 8 } },
  // Middle East / Africa
  iran:           { garrison: 3,  fortLevel: 2, industryOutput: 3,  manpowerOutput: 45,  resourceOutput: { oil: 17, food: 4 } },
  iraq:           { garrison: 2,  fortLevel: 1, industryOutput: 2,  manpowerOutput: 17,  resourceOutput: { oil: 8, food: 4 } },
  egypt:          { garrison: 3,  fortLevel: 3, industryOutput: 3,  manpowerOutput: 70,  resourceOutput: { oil: 3, food: 8 } },
  'saudi-arabia': { garrison: 1,  fortLevel: 1, industryOutput: 1,  manpowerOutput: 22,  resourceOutput: { oil: 25, food: 2 } },
  india:          { garrison: 3,  fortLevel: 2, industryOutput: 6,  manpowerOutput: 650, resourceOutput: { food: 18, oil: 4 } },
  algeria:        { garrison: 1,  fortLevel: 1, industryOutput: 1,  manpowerOutput: 22,  resourceOutput: { oil: 1, food: 5 } },
  libya:          { garrison: 3,  fortLevel: 1, industryOutput: 1,  manpowerOutput: 8,   resourceOutput: { oil: 0, food: 0 } },
  ethiopia:       { garrison: 3,  fortLevel: 1, industryOutput: 1,  manpowerOutput: 55,  resourceOutput: { food: 11 } },
  morocco:        { garrison: 2,  fortLevel: 1, industryOutput: 2,  manpowerOutput: 45,  resourceOutput: { food: 8 } },
  'south-africa': { garrison: 2,  fortLevel: 2, industryOutput: 4,  manpowerOutput: 42,  resourceOutput: { steel: 7, food: 7 } },
  // Asia
  korea:     { garrison: 3,  fortLevel: 2, industryOutput: 5,  manpowerOutput: 90,  resourceOutput: { steel: 3, food: 6 } },
  manchuria: { garrison: 5,  fortLevel: 2, industryOutput: 5,  manpowerOutput: 110, resourceOutput: { steel: 5, food: 10, oil: 1 } },
  burma:     { garrison: 2,  fortLevel: 1, industryOutput: 2,  manpowerOutput: 80,  resourceOutput: { oil: 7, food: 10 } },
  vietnam:   { garrison: 1,  fortLevel: 1, industryOutput: 1,  manpowerOutput: 70,  resourceOutput: { food: 8, oil: 3 } },
  thailand:  { garrison: 4,  fortLevel: 1, industryOutput: 3,  manpowerOutput: 90,  resourceOutput: { food: 18 } },
  indonesia: { garrison: 1,  fortLevel: 1, industryOutput: 2,  manpowerOutput: 130, resourceOutput: { oil: 20, food: 10 } },
  // Americas / Pacific
  canada:    { garrison: 1,  fortLevel: 1, industryOutput: 5,  manpowerOutput: 28,  resourceOutput: { oil: 3, steel: 8, food: 10 } },
  brazil:    { garrison: 2,  fortLevel: 1, industryOutput: 5,  manpowerOutput: 110, resourceOutput: { food: 13, steel: 3 } },
  mexico:    { garrison: 2,  fortLevel: 1, industryOutput: 4,  manpowerOutput: 80,  resourceOutput: { oil: 8, food: 10 } },
  argentina: { garrison: 2,  fortLevel: 1, industryOutput: 4,  manpowerOutput: 55,  resourceOutput: { food: 13, oil: 3 } },
  australia: { garrison: 2,  fortLevel: 2, industryOutput: 4,  manpowerOutput: 22,  resourceOutput: { steel: 5, food: 8 } },
};
