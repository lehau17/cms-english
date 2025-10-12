// A central place for defining the visual style of charts

export const chartColors = {
  primary: "#0088FE", // Blue
  secondary: "#00C49F", // Green
  tertiary: "#FFBB28", // Yellow
  quaternary: "#FF8042", // Orange
  accent1: "#9254DE", // Purple
  accent2: "#F759AB", // Pink
  grid: "#e0e0e0",
  tooltipBg: "#ffffff",
  tooltipBorder: "#cccccc",
  text: "#333333",
  label: "#666666",
};

export const chartFonts = {
  fontFamily: "Roboto, sans-serif",
  fontSize: "12px",
};

export const chartStyle = {
  tooltip: {
    contentStyle: {
      backgroundColor: chartColors.tooltipBg,
      border: `1px solid ${chartColors.tooltipBorder}`,
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      padding: "12px",
    },
    labelStyle: {
      color: chartColors.label,
      fontWeight: "bold",
      marginBottom: "8px",
      fontSize: "14px",
    },
    itemStyle: {
      color: chartColors.text,
      fontSize: "12px",
    },
  },
  legend: {
    textStyle: {
      color: chartColors.label,
      fontSize: "14px",
    },
  },
  axis: {
    tick: {
      fill: chartColors.label,
      fontSize: chartFonts.fontSize,
      fontFamily: chartFonts.fontFamily,
    },
    label: {
      fill: chartColors.text,
      fontSize: "14px",
      fontWeight: "bold",
      fontFamily: chartFonts.fontFamily,
    },
  },
};