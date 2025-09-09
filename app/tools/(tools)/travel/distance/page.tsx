"use client";

import type * as LeafletNS from "leaflet";
import {
  Bike,
  Car,
  Crosshair,
  Footprints,
  Map as MapIcon,
  MapPin,
  MoveRight,
  Navigation2,
  RefreshCcw,
  Route,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";

import { ActionButton, CopyButton, ResetButton } from "@/components/shared/action-buttons";
import SelectField from "@/components/shared/form-fields/select-field";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* Types & Consts */
type Mode = "driving" | "cycling" | "walking";
type Unit = "km" | "mi";
type Traffic = "light" | "normal" | "heavy";
type Pin = "from" | "to";
type LatLon = { lat: number; lon: number };

const BASE_SPEED_KMH: Record<Mode, number> = { driving: 55, cycling: 16, walking: 5 };
const ROAD_FACTOR: Record<Mode, number> = { driving: 1.25, cycling: 1.15, walking: 1.1 };
const TRAFFIC_FACTOR: Record<Traffic, number> = { light: 0.9, normal: 1.0, heavy: 1.35 };
const KM_TO_MI = 0.621371;
const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const LS_KEY = "tools-hub:distance-eta:v2";

/* Math */
function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function haversineKm(a: LatLon, b: LatLon) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
function initialBearing(a: LatLon, b: LatLon) {
  const φ1 = toRad(a.lat),
    φ2 = toRad(b.lat),
    λ1 = toRad(a.lon),
    λ2 = toRad(b.lon);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}
function degToCompass(b: number) {
  const d = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ] as const;
  return d[Math.round((b % 360) / 22.5) % 16];
}
function formatHoursToHM(hours: number) {
  if (!Number.isFinite(hours) || hours < 0) return "—";
  const totalM = Math.round(hours * 60);
  const h = Math.floor(totalM / 60);
  const m = totalM % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}
function kmToUnit(vKm: number, unit: Unit) {
  return unit === "km" ? vKm : vKm * KM_TO_MI;
}

/* Leaflet icon patch (SSR-safe, fully typed, no 'any') */
function useLeafletDefaultIcon() {
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const mod = await import("leaflet");
      const L: typeof LeafletNS =
        (mod as unknown as { default?: typeof LeafletNS }).default ?? (mod as typeof LeafletNS);

      if (cancelled) return;

      const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
      if ("_getIconUrl" in proto) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete proto._getIconUrl;
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      } as Partial<LeafletNS.IconOptions>);
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}

/* Single dynamic import for all React-Leaflet pieces (prevents getPane undefined) */
const LeafletMap = dynamic(
  async () => {
    const RL = await import("react-leaflet");
    const { MapContainer, TileLayer, Marker, Polyline, useMapEvents } = RL;

    function ClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
      useMapEvents({
        click(e) {
          onClick(e.latlng.lat, e.latlng.lng);
        },
      });
      return null;
    }

    function MapBlock(props: {
      center: [number, number];
      activePin: Pin;
      fromCoord: LatLon | null;
      toCoord: LatLon | null;
      polyline: [number, number][];
      setFromCoord: (v: LatLon) => void;
      setToCoord: (v: LatLon) => void;
    }) {
      const { center, activePin, fromCoord, toCoord, polyline, setFromCoord, setToCoord } = props;

      return (
        <MapContainer
          center={center}
          zoom={7}
          className="h-[420px] md:h-[500px] w-full"
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <ClickHandler
            onClick={(lat, lon) => {
              if (activePin === "from") setFromCoord({ lat, lon });
              else setToCoord({ lat, lon });
            }}
          />
          {fromCoord && <Marker position={[fromCoord.lat, fromCoord.lon]} />}
          {toCoord && <Marker position={[toCoord.lat, toCoord.lon]} />}
          {polyline.length === 2 && <Polyline positions={polyline} />}
        </MapContainer>
      );
    }

    return { default: MapBlock };
  },
  { ssr: false },
);

export default function DistanceETAClient() {
  useLeafletDefaultIcon();

  // Dhaka default
  const [center, setCenter] = React.useState<[number, number]>([23.8103, 90.4125]);
  const [fromCoord, setFromCoord] = React.useState<LatLon | null>(null);
  const [toCoord, setToCoord] = React.useState<LatLon | null>(null);
  const [activePin, setActivePin] = React.useState<Pin>("from");

  const [unit, setUnit] = React.useState<Unit>("km");
  const [mode, setMode] = React.useState<Mode>("driving");
  const [traffic, setTraffic] = React.useState<Traffic>("normal");

  // hydrate from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        from?: LatLon | null;
        to?: LatLon | null;
        unit?: Unit;
        mode?: Mode;
        traffic?: Traffic;
        center?: [number, number];
      };
      if (data.from) setFromCoord(data.from);
      if (data.to) setToCoord(data.to);
      if (data.center) setCenter(data.center);
      if (data.unit) setUnit(data.unit);
      if (data.mode) setMode(data.mode);
      if (data.traffic) setTraffic(data.traffic);
    } catch {}
  }, []);

  // persist to localStorage (debounced)
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      const payload = JSON.stringify({ from: fromCoord, to: toCoord, unit, mode, traffic, center });
      localStorage.setItem(LS_KEY, payload);
    }, 250);
    return () => window.clearTimeout(id);
  }, [fromCoord, toCoord, unit, mode, traffic, center]);

  const out = React.useMemo(() => {
    if (!fromCoord || !toCoord) return null;
    const straightKm = haversineKm(fromCoord, toCoord);
    const roadKm = straightKm * ROAD_FACTOR[mode];
    const hours = (roadKm / BASE_SPEED_KMH[mode]) * TRAFFIC_FACTOR[traffic];
    const bearing = initialBearing(fromCoord, toCoord);
    const compass = degToCompass(bearing);
    return {
      straight: kmToUnit(straightKm, unit),
      distance: kmToUnit(roadKm, unit),
      eta: hours,
      bearing,
      compass,
    };
  }, [fromCoord, toCoord, unit, mode, traffic]);

  const polyline: [number, number][] = React.useMemo(() => {
    if (!fromCoord || !toCoord) return [];
    return [
      [fromCoord.lat, fromCoord.lon],
      [toCoord.lat, toCoord.lon],
    ];
  }, [fromCoord, toCoord]);

  const swap = () => {
    setFromCoord((prev) => {
      const oldFrom = prev;
      setToCoord((oldTo) => (oldFrom ? oldFrom : oldTo));
      return toCoord ? toCoord : null;
    });
  };

  const resetAll = () => {
    setFromCoord(null);
    setToCoord(null);
    setActivePin("from");
    setCenter([23.8103, 90.4125]);
  };

  const useMyLocation = React.useCallback((): void => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(c);
        (activePin === "from" ? setFromCoord : setToCoord)({ lat: c[0], lon: c[1] });
      },
      () => {
        toast.error("Unable to fetch your location.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [activePin]);

  const summary =
    out && fromCoord && toCoord
      ? [
          `Distance & ETA (${fromCoord.lat.toFixed(5)}, ${fromCoord.lon.toFixed(5)} -> ${toCoord.lat.toFixed(5)}, ${toCoord.lon.toFixed(5)})`,
          `Mode: ${mode}, Traffic: ${traffic}, Unit: ${unit}`,
          `Straight-line: ${nf.format(out.straight)} ${unit}`,
          `Estimated route distance: ${nf.format(out.distance)} ${unit}`,
          `ETA: ${formatHoursToHM(out.eta)}`,
          `Initial bearing: ${nf.format(out.bearing)}° (${out.compass})`,
        ].join("\n")
      : "";

  return (
    <>
      {/* Tool Header */}
      <ToolPageHeader
        icon={Route}
        title="Distance & ETA"
        description="Pick start & destination from the map."
        actions={
          <>
            <ActionButton
              icon={MapIcon}
              label={activePin === "from" ? "From" : "To"}
              onClick={() => setActivePin(activePin === "from" ? "to" : "from")}
            />
            <ActionButton icon={Crosshair} label="Location" onClick={useMyLocation} />
            <ResetButton onClick={resetAll} />
            <ActionButton
              icon={RefreshCcw}
              label="Swap"
              disabled={!fromCoord && !toCoord}
              onClick={swap}
            />
            <CopyButton disabled={!out || !fromCoord || !toCoord} getText={summary} />
          </>
        }
      />

      {/* Map + Controls */}
      <GlassCard>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Map & Settings</CardTitle>
            <Badge variant="secondary" className="ml-1">
              <Sparkles className="h-3.5 w-3.5" /> Click anywhere to place pins
            </Badge>
          </div>
          <CardDescription>
            Choose unit, mode, and traffic. Then use the map to set <em>From</em>/<em>To</em>.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border">
              <LeafletMap
                center={center}
                activePin={activePin}
                fromCoord={fromCoord}
                toCoord={toCoord}
                polyline={polyline}
                setFromCoord={setFromCoord}
                setToCoord={setToCoord}
              />
            </div>

            {/* Coords preview */}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <GlassCard className="p-3">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> From
                </div>
                <div className="mt-1 font-mono text-sm">
                  {fromCoord ? `${fromCoord.lat.toFixed(5)}, ${fromCoord.lon.toFixed(5)}` : "—"}
                </div>
              </GlassCard>
              <GlassCard className="p-3">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Navigation2 className="h-3.5 w-3.5" /> To
                </div>
                <div className="mt-1 font-mono text-sm">
                  {toCoord ? `${toCoord.lat.toFixed(5)}, ${toCoord.lon.toFixed(5)}` : "—"}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Controls */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Active pin</Label>
              <div className="flex flex-col gap-2">
                <ActionButton
                  icon={MapPin}
                  label="From"
                  variant={activePin === "from" ? "default" : "outline"}
                  onClick={() => setActivePin("from")}
                />
                <ActionButton
                  icon={Navigation2}
                  label="To"
                  variant={activePin === "to" ? "default" : "outline"}
                  onClick={() => setActivePin("to")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <SelectField
                label="Unit"
                value={unit}
                onValueChange={(v) => setUnit(v as Unit)}
                options={[
                  { value: "km", label: "Kilometers" },
                  { value: "mi", label: "Miles" },
                ]}
              />

              <SelectField
                label="Mode"
                value={mode}
                onValueChange={(v) => setMode(v as Mode)}
                options={[
                  { icon: Car, value: "driving", label: "Driving" },
                  { icon: Bike, value: "cycling", label: "Cycling" },
                  { icon: Footprints, value: "walking", label: "Walking" },
                ]}
              />

              <SelectField
                label="Traffic"
                value={traffic}
                onValueChange={(v) => setTraffic(v as Traffic)}
                options={[
                  { value: "light", label: "Light" },
                  { value: "normal", label: "Normal" },
                  { value: "heavy", label: "Heavy" },
                ]}
              />
            </div>

            <div className="grid gap-2">
              <Label>Tips</Label>
              <GlassCard className="p-3 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  <MoveRight className="h-3.5 w-3.5" />
                  Toggle the active pin to decide which point the next click sets.
                </div>
                <div>
                  Use <kbd className="rounded bg-muted px-1">Reset</kbd> to clear both pins.
                </div>
              </GlassCard>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Results */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>
            Estimated using straight-line distance × road-factor; time × traffic-factor.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Straight-line" value={out ? `${nf.format(out.straight)} ${unit}` : "—"} />
            <Stat
              label="Est. route distance"
              value={out ? `${nf.format(out.distance)} ${unit}` : "—"}
            />
            <Stat label="ETA" value={out ? formatHoursToHM(out.eta) : "—"} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Stat
              value={out ? `${nf.format(out.bearing)}° (${out.compass})` : "—"}
              label="Initial bearing"
            />
            <GlassCard className="p-4 md:col-span-2 text-xs text-muted-foreground">
              Speeds: {BASE_SPEED_KMH[mode]} km/h. Road factor: {ROAD_FACTOR[mode]}×. Traffic:{" "}
              {TRAFFIC_FACTOR[traffic]}× on time. For exact routing (turn-by-turn, live traffic),
              use a maps app.
            </GlassCard>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
