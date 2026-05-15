import React, { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Line } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, TerritoryState, PlayerAction, MoveAction } from '@shared/types';
import { COUNTRY_COLORS } from '@shared/constants';
import { WILDERNESS_REGIONS } from '@shared/wildernessData';
import { formatManpower } from '../lib/mapColors';
import { Delaunay } from 'd3-delaunay';
import { geoMercator, geoPath } from 'd3-geo';

const MAJOR_COUNTRIES = ['germany', 'ussr', 'france', 'uk', 'italy', 'japan', 'usa', 'china'] as const;
const MAP_PROJECTION = geoMercator().scale(220).translate([400, 300]);
const MAP_PATH_GEN = geoPath(MAP_PROJECTION as any);

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const ISO_TO_TERRITORY: Record<string, string> = {
  '276': 'germany', '40': 'austria', '250': 'france', '826': 'uk',
  '380': 'italy', '724': 'spain', '620': 'portugal', '578': 'norway',
  '752': 'sweden', '208': 'denmark', '246': 'finland', '616': 'poland',
  '528': 'netherlands', '56': 'belgium', '756': 'switzerland',
  '348': 'hungary', '642': 'romania', '100': 'bulgaria',
  '688': 'yugoslavia', '300': 'greece', '8': 'albania', '792': 'turkey',
  '703': 'slovakia', '643': 'ussr',
  // Soviet republics — in 1939 these were all USSR territory
  '398': 'ussr', // Kazakhstan (Kazakh SSR)
  '804': 'ussr', // Ukraine (Ukrainian SSR)
  '112': 'ussr', // Belarus (Byelorussian SSR)
  '233': 'ussr', // Estonia (annexed 1940)
  '428': 'ussr', // Latvia (annexed 1940)
  '440': 'ussr', // Lithuania (annexed 1940)
  '498': 'ussr', // Moldova (Moldavian SSR)
  '268': 'ussr', // Georgia (Georgian SSR)
  '51':  'ussr', // Armenia (Armenian SSR)
  '31':  'ussr', // Azerbaijan (Azerbaijan SSR)
  '762': 'ussr', // Tajikistan (Tajik SSR)
  '795': 'ussr', // Turkmenistan (Turkmen SSR)
  '860': 'ussr', // Uzbekistan (Uzbek SSR)
  '417': 'ussr', // Kyrgyzstan (Kirghiz SSR)
  '392': 'japan', '410': 'korea', '408': 'manchuria',
  '158': 'china-north', '156': 'china',
  '496': 'mongolia', '764': 'thailand', '704': 'vietnam',
  '458': 'malaysia', '360': 'indonesia', '608': 'philippines',
  '104': 'burma', '356': 'india',
  '364': 'iran', '368': 'iraq', '682': 'saudi-arabia',
  '818': 'egypt', '760': 'syria', '434': 'libya',
  '231': 'ethiopia', '706': 'somalia',
  '12': 'algeria', '504': 'morocco', '788': 'tunisia',
  '566': 'nigeria', '466': 'fr-west-africa', '180': 'belgian-congo',
  '404': 'kenya', '729': 'sudan', '710': 'south-africa',
  '24': 'angola', '508': 'mozambique', '450': 'madagascar',
  '840': 'usa', '124': 'canada', '76': 'brazil', '484': 'mexico', '32': 'argentina',
  '36': 'australia', '554': 'new-zealand', '598': 'new-guinea',
  // Wilderness — unaligned ghostland territories
  '352': 'iceland', '372': 'ireland', '304': 'greenland',
  '192': 'cuba', '170': 'colombia', '862': 'venezuela',
  '604': 'peru', '152': 'chile', '68': 'bolivia',
  '600': 'paraguay', '858': 'uruguay', '218': 'ecuador',
  '887': 'yemen', '512': 'oman', '4': 'afghanistan',
  '144': 'sri-lanka', '116': 'cambodia', '418': 'laos',
  '834': 'tanzania', '800': 'uganda', '894': 'zambia',
  '716': 'zimbabwe', '72': 'botswana', '516': 'namibia',
  '376': 'palestine',
};

// Auto-extend with every WILDERNESS_REGIONS entry (Africa fillers, Caribbean, etc.)
for (const r of WILDERNESS_REGIONS) {
  if (!(r.iso in ISO_TO_TERRITORY)) ISO_TO_TERRITORY[r.iso] = r.id;
}

const UNKNOWN_FILL = '#1e2d3d';
const OCEAN_FILL = '#0d1a2e';
const WASTELAND_FILL = '#00ff44';

function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function getTerritoryColor(
  isoId: string,
  gameState: GameState | null,
  selectedId: string | null,
  targetId: string | null,
  hoveredId: string | null,
  adjacentEnemy: Set<string>,
  adjacentFriendly: Set<string>,
): { fill: string; stroke: string; strokeWidth: number } {
  const territoryId = ISO_TO_TERRITORY[isoId];
  if (!territoryId) return { fill: UNKNOWN_FILL, stroke: '#0d1117', strokeWidth: 0.3 };

  const territory = gameState?.territories[territoryId];
  if (territory?.isNuclearWasteland) return { fill: WASTELAND_FILL, stroke: '#00cc33', strokeWidth: 1 };

  if (territoryId === targetId)
    return { fill: '#7a1a1a', stroke: '#ff5050', strokeWidth: 2 };
  if (territoryId === selectedId)
    return { fill: '#4a4020', stroke: '#f0e080', strokeWidth: 2 };

  // Adjacent highlights (shown when a territory is selected and no target yet)
  if (!targetId) {
    if (adjacentEnemy.has(territoryId))
      return { fill: '#3d1010', stroke: '#ee4444', strokeWidth: 1.5 };
    if (adjacentFriendly.has(territoryId))
      return { fill: '#102030', stroke: '#3a80c0', strokeWidth: 1.5 };
  }

  if (territoryId === hoveredId) {
    const t = gameState?.territories[territoryId];
    const base = t ? (COUNTRY_COLORS[t.ownerId] ?? UNKNOWN_FILL) : UNKNOWN_FILL;
    return { fill: lighten(base, 35), stroke: '#c8a030', strokeWidth: 1 };
  }

  if (!gameState) return { fill: '#2a3a4a', stroke: '#0d1117', strokeWidth: 0.3 };
  if (!territory) return { fill: UNKNOWN_FILL, stroke: '#0d1117', strokeWidth: 0.3 };

  return {
    fill: COUNTRY_COLORS[territory.ownerId] ?? '#2a3a4a',
    stroke: '#0a0f18',
    strokeWidth: 0.4,
  };
}

interface NukeAnimation {
  from: [number, number];
  to: [number, number];
  targetId: string;
}

interface Props {
  gameState: GameState | null;
  selectedTerritoryId: string | null;
  targetTerritoryId: string | null;
  pendingActions: PlayerAction[];
  myCountryId: string | null;
  zoom: number;
  center: [number, number];
  onZoomChange: (z: number) => void;
  onCenterChange: (c: [number, number]) => void;
  onTerritoryClick: (id: string) => void;
  nukingMode: boolean;
  nukeUnlocked: boolean;
  nukeReady: boolean;
  nukeBuildProgress: number;
  nukeAnimation: NukeAnimation | null;
  onNukeButtonClick: () => void;
}

interface TooltipState {
  territory: TerritoryState;
  ownerName: string;
  ownerColor: string;
  x: number;
  y: number;
}

const WorldMap: React.FC<Props> = ({
  gameState, selectedTerritoryId, targetTerritoryId, pendingActions,
  myCountryId, zoom, center, onZoomChange, onCenterChange, onTerritoryClick,
  nukingMode, nukeUnlocked, nukeReady, nukeBuildProgress, nukeAnimation, onNukeButtonClick,
}) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [nukeMousePos, setNukeMousePos] = useState<{ x: number; y: number } | null>(null);
  const [nukeProgress, setNukeProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!nukeAnimation) { setNukeProgress(0); return; }
    const duration = 2800;
    let start: number | null = null;
    function animate(ts: number) {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setNukeProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [nukeAnimation]);

  const handleClick = useCallback((territoryId: string) => {
    onTerritoryClick(territoryId);
  }, [onTerritoryClick]);

  // Compute adjacency sets for the selected territory
  const { adjacentEnemy, adjacentFriendly } = useMemo(() => {
    const enemy = new Set<string>();
    const friendly = new Set<string>();
    if (!selectedTerritoryId || !gameState) return { adjacentEnemy: enemy, adjacentFriendly: friendly };
    const sel = gameState.territories[selectedTerritoryId];
    if (!sel || sel.ownerId !== myCountryId) return { adjacentEnemy: enemy, adjacentFriendly: friendly };
    for (const adjId of sel.adjacentTo) {
      const adjT = gameState.territories[adjId];
      if (!adjT) continue;
      if (adjT.ownerId !== myCountryId) enemy.add(adjId);
      else friendly.add(adjId);
    }
    return { adjacentEnemy: enemy, adjacentFriendly: friendly };
  }, [selectedTerritoryId, gameState, myCountryId]);

  // Compute Voronoi cells per major country so each province visually owns a section
  const voronoiByCountry = useMemo(() => {
    if (!gameState) return [] as Array<{
      countryId: string;
      mixed: boolean;
      cells: { provinceId: string; ownerId: string; pathD: string }[];
    }>;
    const out: Array<{
      countryId: string;
      mixed: boolean;
      cells: { provinceId: string; ownerId: string; pathD: string }[];
    }> = [];

    for (const major of MAJOR_COUNTRIES) {
      const provinces = Object.values(gameState.territories).filter(
        t => t.originalOwnerId === major
      );
      if (provinces.length < 2) continue;

      const points: [number, number][] = provinces
        .map(p => MAP_PROJECTION(p.centroid))
        .map(p => (p ? [p[0], p[1]] as [number, number] : [0, 0] as [number, number]));

      const xs = points.map(p => p[0]);
      const ys = points.map(p => p[1]);
      const pad = 400;
      const bbox: [number, number, number, number] = [
        Math.min(...xs) - pad, Math.min(...ys) - pad,
        Math.max(...xs) + pad, Math.max(...ys) + pad,
      ];

      const delaunay = Delaunay.from(points);
      const voronoi = delaunay.voronoi(bbox);
      const cells: { provinceId: string; ownerId: string; pathD: string }[] = [];
      for (let i = 0; i < provinces.length; i++) {
        const poly = voronoi.cellPolygon(i);
        if (!poly) continue;
        const d = 'M ' + poly.map((pt: number[]) => `${pt[0]},${pt[1]}`).join(' L ') + ' Z';
        cells.push({
          provinceId: provinces[i].id,
          ownerId: provinces[i].ownerId,
          pathD: d,
        });
      }
      const owners = new Set(cells.map(c => c.ownerId));
      out.push({ countryId: major, mixed: owners.size > 1, cells });
    }
    return out;
  }, [gameState]);

  // Build attack arrows from pending move actions
  const attackArrows = pendingActions
    .filter(a => a.type === 'move')
    .map(a => {
      const d = a.data as MoveAction;
      const from = gameState?.territories[d.fromTerritoryId]?.centroid;
      const to = gameState?.territories[d.toTerritoryId]?.centroid;
      const isAttack = gameState?.territories[d.toTerritoryId]?.ownerId !== myCountryId;
      return from && to ? { from, to, force: d.forceSize, isAttack } : null;
    })
    .filter(Boolean) as { from: [number, number]; to: [number, number]; force: number; isAttack: boolean }[];

  const showMarkers = zoom >= 2;

  // Only label major-power territories (capitals + sub-provinces), filtered by screen-space collision
  const visibleLabelIds = useMemo(() => {
    if (!gameState || zoom < 4) return new Set<string>();
    const territories = Object.values(gameState.territories).filter(
      t => t.centroid && (MAJOR_COUNTRIES as readonly string[]).includes(t.originalOwnerId)
    );
    // Capitals first so they always win collision ties
    const sorted = [...territories].sort((a, b) => {
      const aCapital = gameState.countries[a.originalOwnerId]?.capital === a.id ? 1 : 0;
      const bCapital = gameState.countries[b.originalOwnerId]?.capital === b.id ? 1 : 0;
      return bCapital - aCapital;
    });
    const minScreenDist = 45;
    const placed: Array<[number, number]> = [];
    const visible = new Set<string>();
    for (const t of sorted) {
      const proj = MAP_PROJECTION(t.centroid!);
      if (!proj) continue;
      const sx = proj[0] * zoom;
      const sy = proj[1] * zoom;
      const clash = placed.some(([ox, oy]) => Math.hypot(sx - ox, sy - oy) < minScreenDist);
      if (!clash) {
        placed.push([sx, sy]);
        visible.add(t.id);
      }
    }
    return visible;
  }, [gameState, zoom]);

  const bombCoords: [number, number] | null = nukeAnimation
    ? [
        nukeAnimation.from[0] + (nukeAnimation.to[0] - nukeAnimation.from[0]) * nukeProgress,
        nukeAnimation.from[1] + (nukeAnimation.to[1] - nukeAnimation.from[1]) * nukeProgress,
      ]
    : null;

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', background: OCEAN_FILL, overflow: 'hidden', cursor: nukingMode ? 'crosshair' : 'default' }}
      onMouseMove={nukingMode ? (e) => setNukeMousePos({ x: e.clientX, y: e.clientY }) : undefined}
      onMouseLeave={nukingMode ? () => setNukeMousePos(null) : undefined}
    >
      <style>{`
        @keyframes dashFlow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .attack-arrow { animation: dashFlow 0.6s linear infinite; }
        .move-arrow { animation: dashFlow 1s linear infinite; }
        @keyframes markerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
        .capital-marker { animation: markerPulse 2s ease-in-out infinite; }
        @keyframes adjacentPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .adjacent-enemy { animation: adjacentPulse 1.2s ease-in-out infinite; }
        @keyframes nukeCursor {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%,-50%) scale(1.15); opacity: 0.75; }
        }
        @keyframes nukeGlow {
          0%, 100% { box-shadow: 0 0 12px 4px rgba(255,80,0,0.7); }
          50% { box-shadow: 0 0 24px 8px rgba(255,200,0,0.9); }
        }
      `}</style>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 220 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          minZoom={0.8}
          maxZoom={12}
          onMoveEnd={({ zoom: z, coordinates }: { zoom: number; coordinates: [number, number] }) => {
            onZoomChange(z);
            onCenterChange(coordinates as [number, number]);
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) => {
              // Map each major-country territory id → ALL its geography polygons (for clipPath union)
              // USSR spans many ISO codes (Russia + Kazakhstan + Ukraine + Baltics + Caucasus + ...)
              const majorGeos: Record<string, any[]> = {};
              for (const geo of geographies) {
                const tid = ISO_TO_TERRITORY[String(geo.id)];
                if (tid && (MAJOR_COUNTRIES as readonly string[]).includes(tid)) {
                  if (!majorGeos[tid]) majorGeos[tid] = [];
                  majorGeos[tid].push(geo);
                }
              }

              return (
                <>
                  {/* ClipPaths for major countries — UNION of every polygon mapped to the major */}
                  <defs>
                    {Object.entries(majorGeos).map(([m, geos]) => (
                      <clipPath key={`clip-${m}`} id={`voronoi-clip-${m}`} clipPathUnits="userSpaceOnUse">
                        {geos.map((geo, i) => {
                          const d = MAP_PATH_GEN(geo);
                          if (!d) return null;
                          return <path key={i} d={d} />;
                        })}
                      </clipPath>
                    ))}
                  </defs>

                  {geographies.map((geo: any) => {
                const isoId = String(geo.id);
                const territoryId = ISO_TO_TERRITORY[isoId];
                const { fill, stroke, strokeWidth } = getTerritoryColor(
                  isoId, gameState, selectedTerritoryId, targetTerritoryId, hoveredId,
                  adjacentEnemy, adjacentFriendly,
                );
                const territory = territoryId ? gameState?.territories[territoryId] : undefined;
                const owner = territory ? gameState?.countries[territory.ownerId] : undefined;
                const isClickable = !!territoryId;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    style={{
                      default: { outline: 'none', transition: 'fill 0.25s ease, stroke 0.2s ease' },
                      hover: { outline: 'none', cursor: isClickable ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                    onClick={() => territoryId && handleClick(territoryId)}
                    onMouseEnter={(evt: React.MouseEvent) => {
                      if (territoryId) setHoveredId(territoryId);
                      if (territory) {
                        setTooltip({
                          territory,
                          ownerName: owner?.name ?? territory.ownerId,
                          ownerColor: owner?.color ?? '#aaa',
                          x: evt.clientX, y: evt.clientY,
                        });
                      }
                    }}
                    onMouseMove={(evt: React.MouseEvent) => {
                      setTooltip(t => t ? { ...t, x: evt.clientX, y: evt.clientY } : null);
                    }}
                    onMouseLeave={() => { setHoveredId(null); setTooltip(null); }}
                  />
                );
              })}

                  {/* Voronoi province-section overlay — each cell clickable */}
                  {voronoiByCountry.map(v => (
                    <g key={`vor-${v.countryId}`} clipPath={`url(#voronoi-clip-${v.countryId})`}>
                      {v.cells.map(c => {
                        const territory = gameState?.territories[c.provinceId];
                        const owner = territory ? gameState?.countries[territory.ownerId] : undefined;
                        const isSelected = c.provinceId === selectedTerritoryId;
                        const isTarget = c.provinceId === targetTerritoryId;
                        const isHover = c.provinceId === hoveredId;
                        const isAllied = !!(myCountryId && c.ownerId !== myCountryId && gameState?.countries[myCountryId]?.alliedWith?.includes(c.ownerId));
                        return (
                          <path
                            key={c.provinceId}
                            d={c.pathD}
                            fill={gameState?.territories[c.provinceId]?.isNuclearWasteland ? WASTELAND_FILL : (COUNTRY_COLORS[c.ownerId] ?? '#5a5a5a')}
                            fillOpacity={
                              isSelected ? 0.95 :
                              isTarget   ? 0.95 :
                              isHover    ? 0.85 :
                              v.mixed    ? 0.80 : 0.55
                            }
                            stroke={isSelected ? '#f0e080' : isTarget ? '#ff5050' : isAllied ? '#39ff14' : '#000'}
                            strokeWidth={isSelected || isTarget ? 2.5 : isAllied ? 2.5 : 1.5}
                            strokeOpacity={0.85}
                            vectorEffect="non-scaling-stroke"
                            style={{ cursor: 'pointer', transition: 'fill-opacity 0.12s ease' }}
                            onClick={(e) => { e.stopPropagation(); handleClick(c.provinceId); }}
                            onMouseEnter={(evt: React.MouseEvent) => {
                              setHoveredId(c.provinceId);
                              if (territory) {
                                setTooltip({
                                  territory,
                                  ownerName: owner?.name ?? territory.ownerId,
                                  ownerColor: owner?.color ?? '#aaa',
                                  x: evt.clientX, y: evt.clientY,
                                });
                              }
                            }}
                            onMouseMove={(evt: React.MouseEvent) => {
                              setTooltip(t => t ? { ...t, x: evt.clientX, y: evt.clientY } : null);
                            }}
                            onMouseLeave={() => { setHoveredId(null); setTooltip(null); }}
                          />
                        );
                      })}
                    </g>
                  ))}
                </>
              );
            }}
          </Geographies>

          {/* Attack / move arrows */}
          {attackArrows.map((arrow, i) => (
            <React.Fragment key={`arrow-${i}`}>
              <Line
                from={arrow.from}
                to={arrow.to}
                stroke={arrow.isAttack ? '#ff4040' : '#60a5fa'}
                strokeWidth={2 / zoom}
                strokeLinecap="round"
                className={arrow.isAttack ? 'attack-arrow' : 'move-arrow'}
                style={{ strokeDasharray: `${6 / zoom} ${3 / zoom}`, pointerEvents: 'none' }}
              />
              <Marker coordinates={arrow.to}>
                <circle
                  r={4 / zoom}
                  fill={arrow.isAttack ? '#ff4040' : '#60a5fa'}
                  stroke="#000"
                  strokeWidth={0.5 / zoom}
                  style={{ pointerEvents: 'none' }}
                />
                {arrow.force > 0 && (
                  <text textAnchor="middle" y={-8 / zoom} style={{
                    fontSize: 9 / zoom, fill: '#fff', fontWeight: 700,
                    fontFamily: 'monospace', pointerEvents: 'none',
                  }}>{arrow.force}</text>
                )}
              </Marker>
            </React.Fragment>
          ))}

          {/* Nuke flight path */}
          {nukeAnimation && (
            <>
              <Line
                from={nukeAnimation.from}
                to={nukeAnimation.to}
                stroke="#ff4400"
                strokeWidth={2 / zoom}
                style={{ strokeDasharray: `${8 / zoom} ${4 / zoom}`, pointerEvents: 'none', opacity: 0.8 }}
              />
              {bombCoords && (
                <Marker coordinates={bombCoords}>
                  <text textAnchor="middle" style={{ fontSize: 18 / zoom, pointerEvents: 'none', userSelect: 'none' }}>☢</text>
                </Marker>
              )}
              {nukeProgress >= 0.98 && (
                <Marker coordinates={nukeAnimation.to}>
                  <circle r={30 / zoom} fill="#00ff44" fillOpacity={0.4} stroke="#00ff44" strokeWidth={2 / zoom} style={{ pointerEvents: 'none' }} />
                  <text textAnchor="middle" style={{ fontSize: 22 / zoom, pointerEvents: 'none' }}>💥</text>
                </Marker>
              )}
            </>
          )}

          {/* Garrison markers */}
          {showMarkers && gameState && Object.values(gameState.territories).map(territory => {
            if (!territory.centroid) return null;
            const isSelected = territory.id === selectedTerritoryId;
            const isTarget = territory.id === targetTerritoryId;
            const isAdjEnemy = adjacentEnemy.has(territory.id);
            const owner = gameState.countries[territory.ownerId];
            const isCapital = owner?.capital === territory.id;
            const isStarved = owner && owner.resources.oil <= 0 && owner.resources.steel <= 0 && owner.resources.food <= 0;
            const markerSize = Math.max(3, 6 / zoom);
            const fontSize = Math.max(4, 7 / zoom);

            return (
              <Marker key={`m-${territory.id}`} coordinates={territory.centroid}>
                {isCapital && (
                  <text textAnchor="middle" y={-markerSize - 2} style={{
                    fontSize: fontSize * 1.2, fill: '#fbbf24', pointerEvents: 'none', fontFamily: 'serif',
                  }} className="capital-marker">★</text>
                )}
                {isStarved && territory.garrison > 0 && (
                  <text textAnchor="middle" y={-markerSize - fontSize - 2} style={{
                    fontSize: fontSize * 1.1, pointerEvents: 'none',
                  }}>⚠️</text>
                )}
                {/* Attack indicator for adjacent enemy */}
                {isAdjEnemy && !targetTerritoryId && (
                  <text textAnchor="middle" y={markerSize + fontSize + 3} style={{
                    fontSize: fontSize * 0.9, fill: '#f87171', pointerEvents: 'none', fontFamily: 'sans-serif', fontWeight: 700,
                  }}>⚔</text>
                )}
                {territory.garrison > 0 && (
                  <>
                    <circle
                      r={markerSize}
                      fill={isSelected ? '#f0e080' : isTarget ? '#ff4040' : isAdjEnemy ? '#5a1010' : 'rgba(0,0,0,0.65)'}
                      stroke={isAdjEnemy && !targetTerritoryId ? '#ee4444' : (owner?.color ?? '#666')}
                      strokeWidth={Math.max(0.5, (isAdjEnemy ? 1.2 : 0.8) / zoom)}
                      style={{ pointerEvents: 'none' }}
                    />
                    <text textAnchor="middle" dy={fontSize * 0.35} style={{
                      fontSize, fill: '#fff', fontWeight: 700, fontFamily: 'monospace', pointerEvents: 'none',
                    }}>{territory.garrison}</text>
                  </>
                )}
                {visibleLabelIds.has(territory.id) && (
                  <text textAnchor="middle" y={markerSize + fontSize + 1} style={{
                    fontSize: fontSize * 0.7, fill: 'rgba(255,255,255,0.9)',
                    stroke: 'rgba(0,0,0,0.9)', strokeWidth: `${1.8 / zoom}`,
                    paintOrder: 'stroke',
                    pointerEvents: 'none', fontFamily: 'Georgia, serif',
                    letterSpacing: '0.03em',
                  }}>{territory.name}</text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            style={{
              position: 'fixed',
              left: tooltip.x + 14,
              top: Math.max(10, tooltip.y - 60),
              zIndex: 50, pointerEvents: 'none',
            }}
          >
            <TerritoryTooltip
              territory={tooltip.territory}
              ownerName={tooltip.ownerName}
              ownerColor={tooltip.ownerColor}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nuke button */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 190 }}>
        {!nukeReady ? (
          <div style={{ background: 'rgba(10,20,10,0.92)', border: '1px solid #336633', borderRadius: 6, padding: '8px 12px', width: 190 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#66ff88', marginBottom: 5 }}>
              ☢ Arming Warhead… {nukeBuildProgress}%
            </div>
            <div style={{ height: 8, background: '#0a1a0a', borderRadius: 4, overflow: 'hidden', border: '1px solid #224422' }}>
              <div style={{
                height: '100%', width: `${nukeBuildProgress}%`,
                background: 'linear-gradient(90deg, #00cc33, #00ff44)',
                borderRadius: 4,
                boxShadow: '0 0 6px #00ff44',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: 9, color: '#446644', marginTop: 4 }}>
              Arming automatically · launches drains all resources
            </div>
          </div>
        ) : (
          <button
            onClick={onNukeButtonClick}
            style={{
              padding: '8px 14px',
              width: 190,
              background: nukingMode ? '#993300' : 'linear-gradient(135deg,#8b0000,#cc2200)',
              border: '2px solid #ff4400',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.05em',
              animation: !nukingMode ? 'nukeGlow 2s ease-in-out infinite' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {nukingMode ? '✕ Cancel Strike' : '☢ NUCLEAR STRIKE'}
          </button>
        )}
        {nukingMode && (
          <div style={{ background: 'rgba(180,0,0,0.9)', border: '1px solid #ff4400', borderRadius: 4, padding: '4px 8px', fontSize: 11, color: '#ffcccc', width: 190, textAlign: 'center' }}>
            Click any territory to launch
          </div>
        )}
      </div>

      {/* Nuke targeting cursor */}
      {nukingMode && nukeMousePos && (
        <div style={{
          position: 'fixed',
          left: nukeMousePos.x,
          top: nukeMousePos.y,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '3px solid #ff4400',
          pointerEvents: 'none',
          zIndex: 9999,
          animation: 'nukeCursor 1s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>☢</span>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,68,0,0.6)', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,68,0,0.6)', transform: 'translateX(-50%)' }} />
        </div>
      )}

      {/* Zoom controls */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: '+', action: () => onZoomChange(Math.min(12, zoom * 1.4)) },
          { label: '−', action: () => onZoomChange(Math.max(0.8, zoom / 1.4)) },
          { label: '⌂', action: () => { onZoomChange(1.2); onCenterChange([20, 30]); } },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            width: 32, height: 32, background: 'rgba(17,24,39,0.9)',
            border: '1px solid #4b5563', borderRadius: 4,
            color: '#e5e7eb', cursor: 'pointer',
            fontSize: btn.label === '⌂' ? 13 : 18, lineHeight: 1,
          }}>{btn.label}</button>
        ))}
      </div>

      {/* Production legend */}
      {gameState && myCountryId && gameState.countries[myCountryId]?.productionQueue?.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 16, left: 180,
          background: 'rgba(3,7,18,0.92)', border: '1px solid #92400e',
          borderRadius: 6, padding: '8px 10px', fontSize: 11, maxWidth: 280,
        }}>
          <div style={{ color: '#fcd34d', fontWeight: 600, marginBottom: 4 }}>
            🏭 In Production ({gameState.countries[myCountryId].productionQueue.length})
          </div>
          {gameState.countries[myCountryId].productionQueue.map((item, i) => {
            const spawnT = item.targetTerritoryId ? gameState.territories[item.targetTerritoryId] : undefined;
            const spawnName = spawnT?.name ?? gameState.territories[gameState.countries[myCountryId].capital]?.name ?? 'capital';
            const typeIcon: Record<string, string> = {
              infantry: '⚔️', armor: '🛡️', aircraft: '✈️', ships: '🚢', fortification: '🏰',
            };
            const turnsLabel = item.turnsLeft <= 0 ? 'next turn' : `${item.turnsLeft}t left`;
            const isLanded = item.type === 'aircraft' || item.type === 'ships';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ width: 14 }}>{typeIcon[item.type] ?? '•'}</span>
                <span style={{ color: '#e5e7eb' }}>×{item.quantity} {item.type}</span>
                <span style={{ color: '#9ca3af', fontSize: 10 }}>
                  → {isLanded ? (item.type === 'aircraft' ? 'air pool' : 'fleet pool') : spawnName}
                </span>
                <span style={{ color: '#fbbf24', marginLeft: 'auto', fontSize: 10 }}>{turnsLabel}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        background: 'rgba(3,7,18,0.92)', border: '1px solid #374151',
        borderRadius: 6, padding: '8px 10px', fontSize: 11,
      }}>
        <div style={{ color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>Factions</div>
        {[
          { color: '#9B2020', label: 'Axis' },
          { color: '#1A4A7B', label: 'Allies' },
          { color: '#5B7B8B', label: 'Neutral' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: f.color }} />
            <span style={{ color: '#d1d5db' }}>{f.label}</span>
          </div>
        ))}
        {selectedTerritoryId && (
          <div style={{ borderTop: '1px solid #374151', marginTop: 6, paddingTop: 6, color: '#d1d5db' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#ee4444' }} />
              <span>Attackable</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#3a80c0' }} />
              <span>Friendly</span>
            </div>
          </div>
        )}
        {pendingActions.length > 0 && (
          <div style={{ borderTop: '1px solid #374151', marginTop: 6, paddingTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <div style={{ width: 20, height: 2, background: '#ff4040', borderRadius: 1 }} />
              <span style={{ color: '#d1d5db' }}>Attack</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 20, height: 2, background: '#60a5fa', borderRadius: 1 }} />
              <span style={{ color: '#d1d5db' }}>Move</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TerritoryTooltip: React.FC<{
  territory: TerritoryState;
  ownerName: string;
  ownerColor: string;
}> = ({ territory, ownerName, ownerColor }) => (
  <div style={{
    background: '#030712', border: '1px solid #92400e',
    borderRadius: 8, padding: '10px 12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
    minWidth: 200, fontFamily: 'Georgia, serif',
  }}>
    <div style={{ color: territory.isNuclearWasteland ? '#00ff44' : '#fcd34d', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
      {territory.isNuclearWasteland ? '☢ ' : ''}{territory.name}
      {territory.isNuclearWasteland && <span style={{ fontSize: 10, marginLeft: 6, color: '#66ff88' }}>Nuclear Wasteland</span>}
    </div>
    <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 8 }}>
      <span style={{ color: ownerColor }}>●</span> {ownerName} · {territory.terrain.charAt(0).toUpperCase() + territory.terrain.slice(1)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', fontSize: 11 }}>
      {[
        { label: 'Garrison', value: `${territory.garrison} div.`, color: '#f9fafb' },
        { label: 'Fort', value: '★'.repeat(territory.fortLevel) + '☆'.repeat(5 - territory.fortLevel), color: '#fbbf24' },
        { label: 'Industry', value: String(territory.industryOutput), color: '#60a5fa' },
        { label: 'Manpower', value: formatManpower(territory.manpowerOutput), color: '#4ade80' },
        { label: 'Supply', value: `${Math.round(territory.supplyLevel * 100)}%`, color: territory.supplyLevel > 0.7 ? '#4ade80' : '#facc15' },
        ...(territory.resourceOutput.oil ? [{ label: 'Oil', value: String(territory.resourceOutput.oil), color: '#fb923c' }] : []),
        ...(territory.resourceOutput.steel ? [{ label: 'Steel', value: String(territory.resourceOutput.steel), color: '#d1d5db' }] : []),
      ].map(row => (
        <React.Fragment key={row.label}>
          <span style={{ color: '#6b7280' }}>{row.label}</span>
          <span style={{ color: row.color, fontWeight: 600 }}>{row.value}</span>
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default memo(WorldMap);
