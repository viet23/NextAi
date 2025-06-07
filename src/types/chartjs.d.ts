import { TooltipPosition } from "chart.js";

declare module "chart.js" {
  interface TooltipPositionerMap {
    followCursor: (
      _items: TooltipItem<"doughnut">[],
      eventPosition: { x: number; y: number }
    ) => TooltipPosition;
  }
}
