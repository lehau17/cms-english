import { chartStyle } from "@/styles/chartTheme";
import { Box, Paper, Typography } from "@mui/material";
import * as React from "react";
import { TooltipProps } from "recharts";

// Use 'any' to bypass strict recharts type checking for now, as it can be inconsistent across versions
const CustomTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={0}
        sx={chartStyle.tooltip.contentStyle}
      >
        <Typography sx={chartStyle.tooltip.labelStyle}>{label}</Typography>
        {payload.map((pld: any, index: number) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 120, mb: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: pld.color,
                  mr: 1.5,
                  borderRadius: "50%",
                }}
              />
              <Typography sx={chartStyle.tooltip.itemStyle}>
                {pld.name}
              </Typography>
            </Box>
            <Typography component="span" fontWeight="600" fontSize="13px" sx={{ ml: 2 }}>
              {pld.value?.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }

  return null;
};

export default CustomTooltip;