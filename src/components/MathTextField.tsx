import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import MathText from "./MathText";
import { hasMathMarkup } from "../utils/parseMathSegments";

type Props = Omit<TextFieldProps, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

const MathTextField: React.FC<Props> = ({ value, onChange, helperText, ...rest }) => {
  const defaultHelper =
    "فرمول‌ها را با $...$ بنویسید — مثال: $\\sqrt{2}$ یا $\\frac{a}{b}$ یا $x^2+3x$";

  return (
    <Box>
      {/* <TextField
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // helperText={helperText ?? defaultHelper}
        slotProps={{
          input: {
            sx: { fontFamily: "'Vazirmatn', 'IRANSans', monospace", fontSize: "0.95rem" },
          },
        }}
      /> */}

      {value.trim() && (
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            borderRadius: "8px",
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>
            {hasMathMarkup(value) ? "پیش‌نمایش (با فرمول)" : "پیش‌نمایش متن"}
          </Typography>
          <MathText content={value} />
        </Box>
      )}
    </Box>
  );
};

export default MathTextField;
