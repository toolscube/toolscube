"use client";

import { ActivitySquare, Calculator, Info, RotateCcw, Ruler, Weight } from "lucide-react";
import { useMemo, useState } from "react";
import Stat from "@/components/shared/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type HeightUnit = "cm" | "in";
type WeightUnit = "kg" | "lb";

export default function BMIPage() {
  // form state
  const [heightValue, setHeightValue] = useState<string>("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightValue, setWeightValue] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");

  // UX state
  const [submitted, setSubmitted] = useState(false);
  const [note, setNote] = useState<string>("");

  // helpers
  const sanitize = (val: string) => {
    // allow only digits and one dot
    const cleaned = val.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
  };

  const pretty = (n: number, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : "—");

  const parsed = useMemo(() => {
    const h = parseFloat(heightValue);
    const w = parseFloat(weightValue);

    if (!h || !w || h <= 0 || w <= 0) return null;

    const meters = heightUnit === "cm" ? h / 100 : h * 0.0254;
    const kg = weightUnit === "kg" ? w : w * 0.45359237;
    const bmi = kg / (meters * meters);

    let category: "Underweight" | "Healthy" | "Overweight" | "Obese" = "Healthy";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Healthy";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";

    const minKg = 18.5 * meters * meters;
    const maxKg = 24.9 * meters * meters;

    return { bmi, category, minKg, maxKg, meters, kg };
  }, [heightValue, heightUnit, weightValue, weightUnit]);

  // convert healthy range to current weight unit for display
  const rangeText = useMemo(() => {
    if (!parsed) return "—";
    const { minKg, maxKg } = parsed;
    if (weightUnit === "kg") return `${pretty(minKg, 1)} – ${pretty(maxKg, 1)} kg`;
    const minLb = minKg / 0.45359237;
    const maxLb = maxKg / 0.45359237;
    return `${pretty(minLb, 1)} – ${pretty(maxLb, 1)} lb`;
  }, [parsed, weightUnit]);

  const categoryBadge = (cat?: string) => {
    if (!cat) return null;
    const tone =
      cat === "Healthy"
        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
        : cat === "Underweight"
          ? "bg-amber-500/15 text-amber-500 border-amber-500/20"
          : cat === "Overweight"
            ? "bg-orange-500/15 text-orange-500 border-orange-500/20"
            : "bg-red-500/15 text-red-500 border-red-500/20";
    return (
      <Badge variant="outline" className={tone}>
        {cat}
      </Badge>
    );
  };

  function resetAll() {
    setHeightValue("");
    setHeightUnit("cm");
    setWeightValue("");
    setWeightUnit("kg");
    setSubmitted(false);
    setNote("");
  }

  function calculate() {
    // basic UX validation
    if (!heightValue || !weightValue) {
      setNote("Please enter both height and weight.");
      setSubmitted(true);
      return;
    }
    const h = parseFloat(heightValue);
    const w = parseFloat(weightValue);
    if (!h || !w || h <= 0 || w <= 0) {
      setNote("Values must be positive numbers.");
    } else if ((heightUnit === "cm" && h < 50) || (heightUnit === "in" && h < 20)) {
      setNote("Height looks too small — please recheck.");
    } else if ((weightUnit === "kg" && w < 20) || (weightUnit === "lb" && w < 45)) {
      setNote("Weight looks too small — please recheck.");
    } else {
      setNote("");
    }
    setSubmitted(true);
  }

  return (
    <div className="py-10 space-y-8">
      <MotionGlassCard className="space-y-4">
        {/* Flowing Action Bar */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ActivitySquare className="h-6 w-6" /> BMI Calculator
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter height & weight, choose units, then calculate.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={calculate} className="gap-2">
              <Calculator className="h-4 w-4" /> Calculate
            </Button>
          </div>
        </GlassCard>

        {/* Settings / Inputs */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Choose your units and provide your measurements.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            {/* Height */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Ruler className="h-4 w-4" /> Height
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  placeholder={heightUnit === "cm" ? "170" : "67"}
                  value={heightValue}
                  onChange={(e) => setHeightValue(sanitize(e.target.value))}
                  className="bg-background/60 backdrop-blur"
                />
                <Select value={heightUnit} onValueChange={(v: HeightUnit) => setHeightUnit(v)}>
                  <SelectTrigger className="w-28 bg-background/60 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">CM</SelectItem>
                    <SelectItem value="in">INCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Example: 170 cm or 67 inch</p>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Weight className="h-4 w-4" /> Weight
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  placeholder={weightUnit === "kg" ? "65" : "143"}
                  value={weightValue}
                  onChange={(e) => setWeightValue(sanitize(e.target.value))}
                  className="bg-background/60 backdrop-blur"
                />
                <Select value={weightUnit} onValueChange={(v: WeightUnit) => setWeightUnit(v)}>
                  <SelectTrigger className="w-28 bg-background/60 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">KG</SelectItem>
                    <SelectItem value="lb">LB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Example: 65 kg or 143 lb</p>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Results */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>Your BMI, category, and healthy weight range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <GlassCard className="p-4">
                <Stat label="BMI" value={submitted && parsed ? pretty(parsed.bmi, 1) : "—"} />
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <div className="mt-1">
                    {submitted && parsed ? (
                      categoryBadge(parsed.category)
                    ) : (
                      <Badge variant="outline">—</Badge>
                    )}
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <Stat label="Healthy Range" value={submitted && parsed ? rangeText : "—"} />
              </GlassCard>
            </div>

            {/* interpretation + note */}
            <div className="grid gap-4 md:grid-cols-2">
              <GlassCard className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">How to read your BMI</p>
                    <p className="text-sm text-muted-foreground">
                      Underweight &lt; 18.5 • Healthy 18.5–24.9 • Overweight 25–29.9 • Obese ≥ 30.
                      Healthy range depends on height; always consider body composition and consult
                      professionals when needed.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Notes</p>
                  <Textarea
                    placeholder="Add any notes (e.g., morning weight, after workout, etc.)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[70px]"
                  />
                  {submitted && (!parsed || note) && (
                    <p className="text-xs text-muted-foreground">
                      {parsed
                        ? "Saved locally in this session."
                        : "Enter valid numbers and hit Calculate."}
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
