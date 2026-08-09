export const CATEGORY_COLORS = {
  Technology:  "#6366f1", // indigo
  Programming: "#8b5cf6", // violet
  Business:    "#0ea5e9", // sky blue
  Health:      "#10b981", // emerald
  Lifestyle:   "#f59e0b", // amber
  Food:        "#ef4444", // red
  Travel:      "#14b8a6", // teal
};

export function categoryColor(category) {
  return CATEGORY_COLORS[category] ?? "#9ca3af"; // gray fallback
}
