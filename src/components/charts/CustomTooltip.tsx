import { chartStyle } from "@/styles/chartTheme";
import { Box, Paper, Typography } from "@mui/material";
import * as React from "react";
import { TooltipProps } from "recharts";

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: "12px",
          backgroundColor: chartStyle.tooltip.contentStyle.backgroundColor,
          border: chartStyle.tooltip.contentStyle.border,
          borderRadius: "8px",
        }}
      >
        <Typography sx={chartStyle.tooltip.labelStyle}>{label}</Typography>
        {payload.map((pld, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                backgroundColor: pld.color,
                mr: 1,
                borderRadius: "50%",
              }}
            />
            <Typography sx={chartStyle.tooltip.itemStyle}>
              {`${pld.name}: `}
              <Typography component="span" fontWeight="bold">
                {pld.value}
              </Typography>
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }

  return null;
};

export default CustomTooltip;