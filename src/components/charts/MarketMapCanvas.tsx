import world from "@/data/world-map.json";
import type { Market } from "@/data/types";
import type { MapRow } from "@/lib/market-map";
import { MARKET_MAP_TEXT as TEXT } from "./copy";

const UI = {
  root: "world-map",
  country: "map-country",
  viewBox: "0 0 720 300",
  background: { width: 720, height: 300, fill: "#f6f9f7", rx: 8 },
  gridLines: [60, 120, 180, 240],
  gridPath: (y: number) => `M0 ${y}H720`,
  grid: { stroke: "#e9efeb", strokeWidth: 0.5 },
  countryOutline: { stroke: "#fff", strokeWidth: 0.65 },
  selectedOutline: { stroke: "#142f32", strokeWidth: 2 },
} as const;

export function MarketMapCanvas({
  rows,
  selectedMarket,
  metricLabel,
  color,
  onChoose,
  onHover,
}: {
  rows: MapRow[];
  selectedMarket?: string;
  metricLabel: string;
  color: (band: number | null) => string;
  onChoose: (market: Market) => void;
  onHover: (market: string | null) => void;
}) {
  const byCountry = new Map(rows.map((row) => [row.market.iso3, row]));
  return (
    <div className={UI.root}>
      <svg
        viewBox={UI.viewBox}
        role="group"
        aria-label={TEXT.mapLabel(metricLabel)}
      >
        <rect {...UI.background} />
        {UI.gridLines.map((y) => (
          <path key={y} d={UI.gridPath(y)} {...UI.grid} aria-hidden="true" />
        ))}
        {world.map((country) => {
          const row = byCountry.get(country.id);
          const selected = row?.market.id === selectedMarket;
          const label = row
            ? TEXT.countryLabel(
                row.market.name,
                row.formattedValue,
                metricLabel,
              )
            : TEXT.countryWithoutData(country.name);
          return (
            <path
              key={country.id}
              d={country.path}
              fill={color(row?.band ?? null)}
              {...(row && selected ? UI.selectedOutline : UI.countryOutline)}
              fillRule="evenodd"
              vectorEffect="non-scaling-stroke"
              role={row ? "button" : undefined}
              aria-label={row ? label : undefined}
              aria-hidden={row ? undefined : true}
              aria-pressed={row ? selected : undefined}
              tabIndex={row ? 0 : undefined}
              className={row ? UI.country : undefined}
              onClick={row ? () => onChoose(row.market) : undefined}
              onKeyDown={
                row
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onChoose(row.market);
                      }
                    }
                  : undefined
              }
              onFocus={row ? () => onHover(row.market.id) : undefined}
              onMouseEnter={row ? () => onHover(row.market.id) : undefined}
              onMouseLeave={() => onHover(null)}
            >
              <title>{label}</title>
            </path>
          );
        })}
      </svg>
    </div>
  );
}
