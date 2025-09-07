"use client";

import {
  Bike,
  Car,
  Copy,
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
import { type JSX, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Stat from "@/components/shared/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

/* ---------------- Types & constants ---------------- */

type Mode = "driving" | "cycling" | "walking";
type Unit = "km" | "mi";
type Traffic = "light" | "normal" | "heavy";
type Pin = "from" | "to";

const MODE_ICON: Record<Mode, JSX.Element> = {
  driving: <Car className="h-4 w-4" />,
  cycling: <Bike className="h-4 w-4" />,
  walking: <Footprints className="h-4 w-4" />,
};

const BASE_SPEED_KMH: Record<Mode, number> = { driving: 55, cycling: 16, walking: 5 };
const ROAD_FACTOR: Record<Mode, number> = { driving: 1.25, cycling: 1.15, walking: 1.1 };
const TRAFFIC_FACTOR: Record<Traffic, number> = { light: 0.9, normal: 1.0, heavy: 1.35 };
const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

/* ---------------- Geo helpers ---------------- */

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
function initialBearing(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
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
  ];
  return d[Math.round((b % 360) / 22.5) % 16];
}
function formatHoursToHM(hours: number) {
  if (!Number.isFinite(hours) || hours < 0) return "—";
  const h = Math.floor(hours),
    m = Math.round((hours - h) * 60);
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

/* ---------------- Leaflet dynamic parts (SSR off) ----------------
   NOTE: Hooks dynamic-import করা যাবে না। তাই useMapEvents ব্যবহার করে
   একটি ছোট কম্পোনেন্ট বানিয়ে সেটাকেই dynamic করা হয়েছে।
------------------------------------------------------------------- */

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, {
  ssr: false,
});
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, { ssr: false });
const Polyline = dynamic(async () => (await import("react-leaflet")).Polyline, { ssr: false });

// ✅ useMapEvents-ভিত্তিক component
const MapClickHandler = dynamic(
  async () => {
    const { useMapEvents } = await import("react-leaflet");
    return function Handler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
      useMapEvents({
        click(e) {
          onClick(e.latlng.lat, e.latlng.lng);
        },
      });
      return null;
    };
  },
  { ssr: false },
);

// ✅ Leaflet default icon fix (otherwise markers invisible in Next.js)
function useLeafletDefaultIcon() {
  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      // @ts-expect-error
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);
}

/* ---------------- Page ---------------- */

export default function DistanceETAPage() {
  useLeafletDefaultIcon();

  const [center, setCenter] = useState<[number, number]>([23.8103, 90.4125]); // Dhaka area
  const [fromCoord, setFromCoord] = useState<{ lat: number; lon: number } | null>(null);
  const [toCoord, setToCoord] = useState<{ lat: number; lon: number } | null>(null);
  const [activePin, setActivePin] = useState<Pin>("from");

  const [unit, setUnit] = useState<Unit>("km");
  const [mode, setMode] = useState<Mode>("driving");
  const [traffic, setTraffic] = useState<Traffic>("normal");

  const out = useMemo(() => {
    if (!fromCoord || !toCoord) return null;
    const straightKm = haversineKm(fromCoord, toCoord);
    const roadKm = straightKm * ROAD_FACTOR[mode];
    const hours = (roadKm / BASE_SPEED_KMH[mode]) * TRAFFIC_FACTOR[traffic];
    const bearing = initialBearing(fromCoord, toCoord);
    const compass = degToCompass(bearing);
    return {
      straight: unit === "km" ? straightKm : straightKm * 0.621371,
      distance: unit === "km" ? roadKm : roadKm * 0.621371,
      eta: hours,
      bearing,
      compass,
    };
  }, [fromCoord, toCoord, unit, mode, traffic]);

  const swap = () => {
    setFromCoord((f) => {
      const t = toCoord;
      setToCoord(f);
      return t ?? null;
    });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCenter([lat, lon]);
        (activePin === "from" ? setFromCoord : setToCoord)({ lat, lon });
      },
      () => toast.error("Unable to fetch location"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const copySummary = async () => {
    if (!out || !fromCoord || !toCoord) return;
    const lines = [
      `Distance & ETA (${fromCoord.lat.toFixed(5)}, ${fromCoord.lon.toFixed(5)} -> ${toCoord.lat.toFixed(5)}, ${toCoord.lon.toFixed(5)})`,
      `Mode: ${mode}, Traffic: ${traffic}, Unit: ${unit}`,
      `Straight-line: ${nf.format(out.straight)} ${unit}`,
      `Estimated route distance: ${nf.format(out.distance)} ${unit}`,
      `ETA: ${formatHoursToHM(out.eta)}`,
      `Initial bearing: ${nf.format(out.bearing)}° (${out.compass})`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Summary copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  const polyline: [number, number][] = useMemo(() => {
    if (!fromCoord || !toCoord) return [];
    return [
      [fromCoord.lat, fromCoord.lon],
      [toCoord.lat, toCoord.lon],
    ];
  }, [fromCoord, toCoord]);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <MotionGlassCard className="space-y-4">
        {/* Flowing Action Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Route className="h-6 w-6" /> Distance & ETA
            </h1>
            <p className="text-sm text-muted-foreground">
              Pick start & destination from the map. Estimate uses straight-line math with
              road/traffic factors.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setActivePin(activePin === "from" ? "to" : "from")}
              className="gap-2"
            >
              <MapIcon className="h-4 w-4" /> Active: {activePin === "from" ? "From" : "To"}
            </Button>
            <Button variant="outline" onClick={useMyLocation} className="gap-2">
              <Crosshair className="h-4 w-4" /> Use my location
            </Button>
            <Button variant="outline" onClick={swap} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Swap
            </Button>
            <Button variant="outline" onClick={copySummary} className="gap-2">
              <Copy className="h-4 w-4" /> Copy Summary
            </Button>
          </div>
        </GlassCard>

        {/* Map & Settings */}
        <GlassCard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Map & Settings</CardTitle>
              <Badge variant="secondary" className="ml-1">
                <Sparkles className="h-3.5 w-3.5" /> Click to place pins
              </Badge>
            </div>
            <CardDescription>
              Select unit, mode, and traffic — then click the map to set From/To.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 lg:grid-cols-3">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border">
                {/* height fixed so leaflet can mount properly */}
                {/* @ts-ignore */}
                <MapContainer center={center} zoom={7} className="h-[420px] md:h-[500px] w-full">
                  {/* @ts-ignore */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {/* clicks */}
                  <MapClickHandler
                    onClick={(lat, lon) => {
                      if (activePin === "from") setFromCoord({ lat, lon });
                      else setToCoord({ lat, lon });
                    }}
                  />
                  {/* markers & line */}
                  {fromCoord && (
                    /* @ts-expect-error */ <Marker position={[fromCoord.lat, fromCoord.lon]} />
                  )}
                  {toCoord && /* @ts-ignore */ <Marker position={[toCoord.lat, toCoord.lon]} />}
                  {polyline.length === 2 && /* @ts-ignore */ <Polyline positions={polyline} />}
                </MapContainer>
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
                <div className="flex gap-2">
                  <Button
                    variant={activePin === "from" ? "default" : "outline"}
                    onClick={() => setActivePin("from")}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" /> From
                  </Button>
                  <Button
                    variant={activePin === "to" ? "default" : "outline"}
                    onClick={() => setActivePin("to")}
                    className="w-full"
                  >
                    <Navigation2 className="h-4 w-4 mr-2" /> To
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                  <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km">Kilometers</SelectItem>
                    <SelectItem value="mi">Miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driving">
                      <div className="flex items-center gap-2">{MODE_ICON.driving} Driving</div>
                    </SelectItem>
                    <SelectItem value="cycling">
                      <div className="flex items-center gap-2">{MODE_ICON.cycling} Cycling</div>
                    </SelectItem>
                    <SelectItem value="walking">
                      <div className="flex items-center gap-2">{MODE_ICON.walking} Walking</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Traffic</Label>
                <Select value={traffic} onValueChange={(v) => setTraffic(v as Traffic)}>
                  <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator className="my-2" />

        {/* Results */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>
              Estimate based on straight-line math + mode road-factor & traffic-factor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <GlassCard className="p-4">
                <Stat
                  label="Straight-line"
                  value={out ? `${nf.format(out.straight)} ${unit}` : "—"}
                />
              </GlassCard>
              <GlassCard className="p-4">
                <Stat
                  label="Est. route distance"
                  value={out ? `${nf.format(out.distance)} ${unit}` : "—"}
                />
              </GlassCard>
              <GlassCard className="p-4">
                <Stat label="ETA" value={out ? formatHoursToHM(out.eta) : "—"} />
              </GlassCard>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <GlassCard className="p-4">
                <div className="text-sm text-muted-foreground">Initial bearing</div>
                <div className="mt-1 text-lg font-medium">
                  {out ? `${nf.format(out.bearing)}° (${out.compass})` : "—"}
                </div>
              </GlassCard>
              <GlassCard className="p-4 md:col-span-2 text-xs text-muted-foreground">
                Speeds: {BASE_SPEED_KMH[mode]} km/h. Road factor: {ROAD_FACTOR[mode]}×. Traffic:{" "}
                {TRAFFIC_FACTOR[traffic]}× on time. For exact routing, use a maps app.
              </GlassCard>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MoveRight className="h-3.5 w-3.5" /> Tip: Toggle the active pin to decide which point
              the next map click will set.
            </div>
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
