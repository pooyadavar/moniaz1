import React from "react";
import { Box } from "@mui/material";
import katex from "katex";
import { parseMathSegments } from "../utils/parseMathSegments";

const renderLatex = (latex: string, displayMode: boolean): string => {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
      trust: false,
    });
  } catch {
    return latex;
  }
};

interface Props {
  content: string;
  className?: string;
  fontSize?: string | number;
  fontFamily?: string;
}

const MathText: React.FC<Props> = ({ content, className, fontSize = "inherit", fontFamily = "inherit" }) => {
  const segments = parseMathSegments(content);

  return (
    <Box
      component="span"
      className={className}
      dir="auto"
      sx={{
        lineHeight: 1.6,
        wordBreak: "break-word",
        fontSize: fontSize, // Base font size for the text content
        fontFamily: fontFamily,
        "& .katex": { fontSize: "0.9em" }, // Adjust KaTeX font size relative to the base
        "& .katex-display": { margin: "0.25em 0" },
      }}
    >
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        if (segment.display) {
          return (
            <Box
              key={index}
              component="span"
              dir="ltr"
              sx={{ display: "block", textAlign: "center", my: 0.5, unicodeBidi: 'isolate' }}
              dangerouslySetInnerHTML={{
                __html: renderLatex(segment.content, true),
              }}
            />
          );
        }

        return (
          <Box
            component="span"
            key={index}
            dir="ltr"
            sx={{ display: 'inline-block', unicodeBidi: 'isolate' }}
            dangerouslySetInnerHTML={{
              __html: renderLatex(segment.content, false),
            }}
          />
        );
      })}
    </Box>
  );
};

export default MathText;


