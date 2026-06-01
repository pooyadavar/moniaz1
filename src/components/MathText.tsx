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
}

const MathText: React.FC<Props> = ({ content, className }) => {
  const segments = parseMathSegments(content);

  return (
    <Box
      component="span"
      className={className}
      dir="auto"
      sx={{
        lineHeight: 1.85,
        wordBreak: "break-word",
        "& .katex": { fontSize: "1.08em" },
        "& .katex-display": { margin: "0.5em 0" },
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
              sx={{ display: "block", textAlign: "center", my: 0.5 }}
              dangerouslySetInnerHTML={{
                __html: renderLatex(segment.content, true),
              }}
            />
          );
        }

        return (
          <span
            key={index}
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
