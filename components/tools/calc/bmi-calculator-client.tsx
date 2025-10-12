"use client";

import { ActivitySquare, Calculator, Info, Ruler, Weight } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { trackToolUsage, trackToolConversion } from "@/lib/gtm";

type HeightUnit = "cm" | "in";
type WeightUnit = "kg" | "lb";

export default function BMICalculatorClient() {
  const [heightValue, setHeightValue] = useState<string>("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightValue, setWeightValue] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");

  const [submitted, setSubmitted] = useState(false);
  const [note, setNote] = useState<string>("");

  const sanitize = (val: string) => {
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

  const rangeText = useMemo(() => {
    if (!parsed) return "—";
    const fmt = (n: number, d = 0) =>
      n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

    const { minKg, maxKg } = parsed;
    if (weightUnit === "kg") return `${fmt(minKg, 1)} – ${fmt(maxKg, 1)} kg`;
    const minLb = minKg / 0.45359237;
    const maxLb = maxKg / 0.45359237;
    return `${fmt(minLb, 1)} – ${fmt(maxLb, 1)} lb`;
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
    trackToolUsage("BMI Calculator", "Calculators");
    
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
      trackToolConversion("BMI Calculator", "calculated");
      setNote("");
    }
    setSubmitted(true);
  }

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={ActivitySquare}
        title="BMI Calculator"
        description="Enter height & weight, choose units, then calculate."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="default"
              icon={Calculator}
              label="Calculate"
              onClick={calculate}
            />
          </>
        }
      />

      {/* Settings / Inputs */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Inputs</CardTitle>
          <CardDescription>Choose your units and provide your measurements.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 sm:grid-cols-2">
          {/* Height */}
          <div className="space-y-2">
            <div className="flex items-end gap-2 ">
              <InputField
                icon={Ruler}
                label="Height"
                inputMode="decimal"
                placeholder={heightUnit === "cm" ? "170" : "67"}
                value={heightValue}
                onChange={(e) => setHeightValue(sanitize(e.target.value))}
              />

              <SelectField
                value={heightUnit}
                onValueChange={(v) => setHeightUnit(v as HeightUnit)}
                options={[
                  { label: "CM", value: "cm" },
                  { label: "INCH", value: "in" },
                ]}
              />
            </div>
            <p className="text-xs text-muted-foreground">Example: 170 cm or 67 inch</p>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <InputField
                icon={Weight}
                label="Weight"
                inputMode="decimal"
                placeholder={weightUnit === "kg" ? "65" : "143"}
                value={weightValue}
                onChange={(e) => setWeightValue(sanitize(e.target.value))}
              />
              <SelectField
                value={weightUnit}
                onValueChange={(v) => setWeightUnit(v as WeightUnit)}
                options={[
                  { label: "KG", value: "kg" },
                  { label: "LB", value: "lb" },
                ]}
              />
            </div>
            <p className="text-xs text-muted-foreground">Example: 65 kg or 143 lb</p>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Results */}
      <GlassCard>
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
                <TextareaField
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
    </>
  );
}
