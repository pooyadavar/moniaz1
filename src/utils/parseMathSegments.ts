export type MathSegment =
  | { type: "text"; content: string }
  | { type: "math"; content: string; display: boolean };

/** متن مخلوط فارسی + LaTeX را به بخش‌های متن و فرمول تقسیم می‌کند */
export const parseMathSegments = (text: string): MathSegment[] => {
  if (!text) return [];

  const segments: MathSegment[] = [];
  const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      segments.push({ type: "math", content: match[1].trim(), display: true });
    } else if (match[2] !== undefined) {
      segments.push({ type: "math", content: match[2].trim(), display: false });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return segments;
};

export const hasMathMarkup = (text: string) => /\$[^$]+\$/.test(text);
