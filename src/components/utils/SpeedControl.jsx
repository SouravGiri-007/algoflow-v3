import { memo } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const SpeedControl = memo(function SpeedControl({ animationSpeed, setAnimationSpeed, isAnimating }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-slate-300 text-sm font-medium">Speed:</label>
      <Select
        value={animationSpeed.toString()}
        onValueChange={(v) => setAnimationSpeed(parseInt(v))}
        disabled={isAnimating}
      >
        <SelectTrigger className="w-32 text-sm text-white border"
          style={{ background: "oklch(0.17 0.03 240)", borderColor: "oklch(0.28 0.05 240)" }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent style={{ background: "oklch(0.15 0.025 240)", borderColor: "oklch(0.25 0.04 240)" }}>
          {[
            { label: "Super Slow", val: "2000" },
            { label: "Slow", val: "1200" },
            { label: "Medium", val: "800" },
            { label: "Fast", val: "400" },
            { label: "Very Fast", val: "200" },
            { label: "Lightning", val: "50" },
            { label: "Instant", val: "1" },
          ].map(({ label, val }) => (
            <SelectItem key={val} value={val} className="text-slate-200 focus:bg-[oklch(0.22_0.04_240)] focus:text-white">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

export default SpeedControl;
