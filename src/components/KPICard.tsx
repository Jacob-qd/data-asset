import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  className?: string;
  delay?: number;
}

export default function KPICard({
  title,
  value,
  change,
  changeType = "up",
  icon,
  iconBg = "bg-primary-50 dark:bg-primary-900/20",
  iconColor = "text-primary-500",
  sparklineData = [30, 45, 35, 50, 40, 60, 55, 70, 65, 75],
  sparklineColor = "#6366F1",
  className,
  delay = 0,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const [animated, setAnimated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // CountUp animation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimated(true);
      const numericValue = parseFloat(String(value).replace(/,/g, ""));
      if (isNaN(numericValue)) {
        setDisplayValue(String(value));
        return;
      }
      const duration = 1000;
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = numericValue * eased;
        if (String(value).includes(".")) {
          setDisplayValue(current.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        } else {
          setDisplayValue(Math.round(current).toLocaleString("zh-CN"));
        }
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(String(value));
        }
      };
      requestAnimationFrame(animate);
    }, delay + 300);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  // Sparkline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = 2;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    // Draw area
    ctx.beginPath();
    sparklineData.forEach((val, i) => {
      const x = padding + (i / (sparklineData.length - 1)) * (w - padding * 2);
      const y = padding + (1 - (val - min) / range) * (h - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w - padding, h);
    ctx.lineTo(padding, h);
    ctx.closePath();
    ctx.fillStyle = sparklineColor + "20";
    ctx.fill();

    // Draw line
    ctx.beginPath();
    sparklineData.forEach((val, i) => {
      const x = padding + (i / (sparklineData.length - 1)) * (w - padding * 2);
      const y = padding + (1 - (val - min) / range) * (h - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = sparklineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }, [sparklineData, sparklineColor]);

  return (
    <div
      className={cn(
        "bg-white dark:bg-dark-card rounded-lg shadow-md p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow animate-slideUp opacity-0",
        animated && "opacity-100",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Top: icon + title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              iconBg
            )}
          >
            <span className={iconColor}>{icon}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {title}
          </span>
        </div>
      </div>

      {/* Middle: value */}
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">
          {displayValue}
        </div>
      </div>

      {/* Bottom: change rate + sparkline */}
      <div className="mt-3 flex items-end justify-between gap-4">
        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              changeType === "up" && "text-emerald-600 dark:text-emerald-400",
              changeType === "down" && "text-red-600 dark:text-red-400",
              changeType === "neutral" && "text-slate-500 dark:text-slate-400"
            )}
          >
            {changeType === "up" && "↑ "}
            {changeType === "down" && "↓ "}
            {change}
          </span>
        )}
        <canvas
          ref={canvasRef}
          className="w-24 h-10 flex-shrink-0"
          style={{ width: "96px", height: "40px" }}
        />
      </div>
    </div>
  );
}
