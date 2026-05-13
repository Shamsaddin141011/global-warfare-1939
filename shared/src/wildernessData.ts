import { Terrain } from './types';

export interface WildernessSeed {
  id: string;
  name: string;
  iso: string;
  centroid: [number, number];
  terrain: Terrain;
  isCoastal: boolean;
}

// Every world-atlas-110m country not already a game territory.
// All belong to the 'wilderness' country (grey, neutral, weak).
export const WILDERNESS_REGIONS: WildernessSeed[] = [
  // Africa — west
  { id: 'senegal',         name: 'Senegal',         iso: '686', centroid: [-14.5, 14.5], terrain: 'desert', isCoastal: true },
  { id: 'gambia',          name: 'Gambia',          iso: '270', centroid: [-15.5, 13.4], terrain: 'plains', isCoastal: true },
  { id: 'guinea-bissau',   name: 'Guinea-Bissau',   iso: '624', centroid: [-15.0, 12.0], terrain: 'jungle', isCoastal: true },
  { id: 'guinea',          name: 'Guinea',          iso: '324', centroid: [-9.0, 9.9],   terrain: 'jungle', isCoastal: true },
  { id: 'sierra-leone',    name: 'Sierra Leone',    iso: '694', centroid: [-11.5, 8.5],  terrain: 'jungle', isCoastal: true },
  { id: 'liberia',         name: 'Liberia',         iso: '430', centroid: [-9.4, 6.4],   terrain: 'jungle', isCoastal: true },
  { id: 'ivory-coast',     name: 'Ivory Coast',     iso: '384', centroid: [-5.5, 7.5],   terrain: 'jungle', isCoastal: true },
  { id: 'ghana',           name: 'Ghana',           iso: '288', centroid: [-1.0, 7.9],   terrain: 'jungle', isCoastal: true },
  { id: 'burkina-faso',    name: 'Burkina Faso',    iso: '854', centroid: [-2.0, 12.0],  terrain: 'desert', isCoastal: false },
  // Africa — central/sahel
  { id: 'niger',           name: 'Niger',           iso: '562', centroid: [8.0, 17.0],   terrain: 'desert', isCoastal: false },
  { id: 'chad',            name: 'Chad',            iso: '148', centroid: [19.0, 15.0],  terrain: 'desert', isCoastal: false },
  { id: 'cameroon',        name: 'Cameroon',        iso: '120', centroid: [12.5, 7.5],   terrain: 'jungle', isCoastal: true },
  { id: 'car',             name: 'Central Africa',  iso: '140', centroid: [21.0, 7.0],   terrain: 'jungle', isCoastal: false },
  { id: 'congo',           name: 'Congo',           iso: '178', centroid: [15.5, -0.5],  terrain: 'jungle', isCoastal: true },
  { id: 'equatorial-guinea', name: 'Eq. Guinea',    iso: '226', centroid: [10.3, 1.6],   terrain: 'jungle', isCoastal: true },
  { id: 'gabon',           name: 'Gabon',           iso: '266', centroid: [11.7, -0.8],  terrain: 'jungle', isCoastal: true },
  // Africa — horn / east
  { id: 'eritrea',         name: 'Eritrea',         iso: '232', centroid: [39.0, 15.0],  terrain: 'desert', isCoastal: true },
  { id: 'djibouti',        name: 'Djibouti',        iso: '262', centroid: [42.5, 11.8],  terrain: 'desert', isCoastal: true },
  { id: 'rwanda',          name: 'Rwanda',          iso: '646', centroid: [29.9, -2.0],  terrain: 'mountain', isCoastal: false },
  { id: 'burundi',         name: 'Burundi',         iso: '108', centroid: [30.0, -3.5],  terrain: 'mountain', isCoastal: false },
  { id: 'malawi',          name: 'Malawi',          iso: '454', centroid: [34.3, -13.3], terrain: 'plains', isCoastal: false },
  // Africa — south
  { id: 'lesotho',         name: 'Lesotho',         iso: '426', centroid: [28.0, -29.5], terrain: 'mountain', isCoastal: false },
  { id: 'eswatini',        name: 'Eswatini',        iso: '748', centroid: [31.5, -26.5], terrain: 'mountain', isCoastal: false },
  // Middle East
  { id: 'lebanon',         name: 'Lebanon',         iso: '422', centroid: [35.8, 33.9],  terrain: 'mountain', isCoastal: true },
  { id: 'jordan',          name: 'Jordan',          iso: '400', centroid: [36.0, 31.0],  terrain: 'desert', isCoastal: false },
  { id: 'kuwait',          name: 'Kuwait',          iso: '414', centroid: [47.8, 29.3],  terrain: 'desert', isCoastal: true },
  { id: 'qatar',           name: 'Qatar',           iso: '634', centroid: [51.2, 25.3],  terrain: 'desert', isCoastal: true },
  { id: 'uae',             name: 'UAE',             iso: '784', centroid: [54.0, 24.0],  terrain: 'desert', isCoastal: true },
  { id: 'cyprus',          name: 'Cyprus',          iso: '196', centroid: [33.0, 35.1],  terrain: 'mountain', isCoastal: true },
  // South Asia
  { id: 'pakistan',        name: 'Pakistan',        iso: '586', centroid: [70.0, 30.0],  terrain: 'mountain', isCoastal: true },
  { id: 'bangladesh',      name: 'Bangladesh',      iso: '50',  centroid: [90.0, 24.0],  terrain: 'jungle', isCoastal: true },
  { id: 'nepal',           name: 'Nepal',           iso: '524', centroid: [84.0, 28.5],  terrain: 'mountain', isCoastal: false },
  { id: 'bhutan',          name: 'Bhutan',          iso: '64',  centroid: [90.4, 27.5],  terrain: 'mountain', isCoastal: false },
  // SE Asia islands
  { id: 'timor-leste',     name: 'Timor-Leste',     iso: '626', centroid: [125.7, -8.8], terrain: 'jungle', isCoastal: true },
  // Central America
  { id: 'belize',          name: 'Belize',          iso: '84',  centroid: [-88.5, 17.3], terrain: 'jungle', isCoastal: true },
  { id: 'guatemala',       name: 'Guatemala',       iso: '320', centroid: [-90.4, 15.8], terrain: 'mountain', isCoastal: true },
  { id: 'el-salvador',     name: 'El Salvador',     iso: '222', centroid: [-88.9, 13.7], terrain: 'mountain', isCoastal: true },
  { id: 'honduras',        name: 'Honduras',        iso: '340', centroid: [-86.5, 14.6], terrain: 'mountain', isCoastal: true },
  { id: 'nicaragua',       name: 'Nicaragua',       iso: '558', centroid: [-85.0, 13.0], terrain: 'jungle', isCoastal: true },
  { id: 'costa-rica',      name: 'Costa Rica',      iso: '188', centroid: [-84.2, 9.6],  terrain: 'jungle', isCoastal: true },
  { id: 'panama',          name: 'Panama',          iso: '591', centroid: [-80.0, 9.0],  terrain: 'jungle', isCoastal: true },
  // Caribbean
  { id: 'haiti',           name: 'Haiti',           iso: '332', centroid: [-72.5, 19.0], terrain: 'jungle', isCoastal: true },
  { id: 'dominican-rep',   name: 'Dominican Rep.',  iso: '214', centroid: [-70.5, 19.0], terrain: 'jungle', isCoastal: true },
  { id: 'jamaica',         name: 'Jamaica',         iso: '388', centroid: [-77.5, 18.1], terrain: 'jungle', isCoastal: true },
  { id: 'bahamas',         name: 'Bahamas',         iso: '44',  centroid: [-77.4, 25.0], terrain: 'coast', isCoastal: true },
  // South America (remainders)
  { id: 'suriname',        name: 'Suriname',        iso: '740', centroid: [-56.0, 4.0],  terrain: 'jungle', isCoastal: true },
  { id: 'guyana',          name: 'Guyana',          iso: '328', centroid: [-58.9, 5.0],  terrain: 'jungle', isCoastal: true },
  { id: 'french-guiana',   name: 'French Guiana',   iso: '254', centroid: [-53.0, 4.0],  terrain: 'jungle', isCoastal: true },
  { id: 'trinidad',        name: 'Trinidad',        iso: '780', centroid: [-61.2, 10.7], terrain: 'jungle', isCoastal: true },
  // Pacific
  { id: 'fiji',            name: 'Fiji',            iso: '242', centroid: [178.0, -17.7], terrain: 'jungle', isCoastal: true },
  { id: 'solomon-islands', name: 'Solomon Islands', iso: '90',  centroid: [160.0, -9.5],  terrain: 'jungle', isCoastal: true },
  { id: 'new-caledonia',   name: 'New Caledonia',   iso: '540', centroid: [165.5, -21.5], terrain: 'jungle', isCoastal: true },
  { id: 'vanuatu',         name: 'Vanuatu',         iso: '548', centroid: [167.0, -16.0], terrain: 'jungle', isCoastal: true },
  { id: 'papua',           name: 'Papua',           iso: '598', centroid: [143.0, -6.0],  terrain: 'jungle', isCoastal: true },
  // Europe
  { id: 'luxembourg',      name: 'Luxembourg',      iso: '442', centroid: [6.1, 49.8],   terrain: 'forest', isCoastal: false },
  { id: 'malta',           name: 'Malta',           iso: '470', centroid: [14.4, 35.9],  terrain: 'coast', isCoastal: true },
  // Polar
  { id: 'antarctica',      name: 'Antarctica',      iso: '10',  centroid: [0.0, -85.0],  terrain: 'tundra', isCoastal: true },
];
