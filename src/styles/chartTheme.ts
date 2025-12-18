// A central place for defining the visual style of charts

export const chartColors = {
  // Premium Palette
  primary: "#6366F1", // Indigo 500 - Main brand quality
  secondary: "#EC4899", // Pink 500 - Vibrant accent
  tertiary: "#10B981", // Emerald 500 - Success/Growth
  quaternary: "#F59E0B", // Amber 500 - Warning/Attention
  accent1: "#8B5CF6", // Violet 500
  accent2: "#06B6D4", // Cyan 500

  // Gradients (start/end colors for referencing in <defs>)
  gradients: {
    primary: ["#6366F1", "#A5B4FC"], // Indigo to Indigo-200
    secondary: ["#EC4899", "#FBCFE8"], // Pink to Pink-200
    tertiary: ["#10B981", "#D1FAE5"], // Emerald to Emerald-100
    quaternary: ["#F59E0B", "#FDE68A"], // Amber to Amber-200
  },

  // Base UI
  grid: "#E2E8F0", // Slate 200
  tooltipBg: "rgba(255, 255, 255, 0.95)", // Glass effect base
  tooltipBorder: "rgba(255, 255, 255, 0.2)",
  text: "#1E293B", // Slate 800
  label: "#64748B", // Slate 500
};

export const chartFonts = {
  fontFamily: "'Inter', 'Roboto', sans-serif",
  fontSize: "12px",
};

export const chartStyle = {
  tooltip: {
    contentStyle: {
      backgroundColor: chartColors.tooltipBg,
      border: `1px solid ${chartColors.grid}`,
      borderRadius: "12px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "12px 16px",
      backdropFilter: "blur(8px)",
    },
    labelStyle: {
      color: chartColors.text,
      fontWeight: 600,
      marginBottom: "8px",
      fontSize: "13px",
      borderBottom: `1px solid ${chartColors.grid}`,
      paddingBottom: "8px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
    },
    itemStyle: {
      color: chartColors.label,
      fontSize: "13px",
      fontWeight: 500,
      padding: "2px 0",
    },
  },
  legend: {
    textStyle: {
      color: chartColors.text,
      fontSize: "13px",
      fontWeight: 500,
    },
  },
  axis: {
    tick: {
      fill: chartColors.label,
      fontSize: "11px",
      fontFamily: chartFonts.fontFamily,
      fontWeight: 500,
    },
    label: {
      fill: chartColors.text,
      fontSize: "12px",
      fontWeight: 600,
      fontFamily: chartFonts.fontFamily,
    },
  },
};