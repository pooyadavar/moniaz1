import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Switch,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ImageIcon from "@mui/icons-material/Image";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import type { PagePreview, QuestionDraft } from "../types/question";
import ImageCropperBox from "./ImageCropperBox";
import MathTextField from "./MathTextField";
import MathText from "./MathText";
import { expandCropWithPadding } from "../utils/cropPadding";
import type { Crop } from "react-image-crop";

interface Props {
  questions: QuestionDraft[];
  pages: PagePreview[];
  expandedId: string | false;
  onExpandedChange: (id: string | false) => void;
  onQuestionChange: (
    id: string,
    updater: (question: QuestionDraft) => QuestionDraft,
  ) => void;
  onSaveAll: () => void;
  isSaving: boolean;
}

const toReactCrop = (
  crop?: { x: number; y: number; width: number; height: number } | null,
): Crop | null => {
  if (!crop) return null;
  const p = expandCropWithPadding(crop);
  return { unit: "%", x: p.x, y: p.y, width: p.width, height: p.height };
};

const QuestionsAccordionPanel: React.FC<Props> = ({
  questions,
  pages,
  expandedId,
  onExpandedChange,
  onQuestionChange,
  onSaveAll,
  isSaving,
}) => {
  const [editModes, setEditModes] = useState<
    Record<string, { question: boolean; options: boolean }>
  >({});

  const toggleEditMode = (id: string, field: "question" | "options") => {
    setEditModes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: !(prev[id]?.[field] ?? false),
      },
    }));
  };

  if (questions.length === 0) {
    return (
      <Box
        className="moniaz-card"
        sx={{
          p: 4,
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            color: "text.secondary",
            textAlign: "center",
            maxWidth: 360,
            fontSize: "0.85rem",
          }}
        >
          فایل‌ها را آپلود کنید و استخراج را بزنید. هر سوال جدا نمایش داده
          می‌شود
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className="moniaz-card"
      sx={{
        p: { xs: 2, md: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
        direction: "rtl",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {questions.length} سوال استخراج شد
          </Typography>
        </Box>
        <Chip
          label="نیازمند بررسی"
          size="small"
          color="warning"
          variant="outlined"
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.75,
          flexGrow: 1,
          overflowY: "auto",
          maxHeight: { lg: "2000vh" },
          direction: "rtl",
        }}
      >
        {questions.map((question, questionIndex) => {
          const page =
            pages.find((p) => p.index === question.pageIndex) ??
            pages[question.pageIndex];
          const isExpanded = expandedId === question.id;
          const summary =
            question.questionText.trim().slice(0, 72) ||
            `سوال ${questionIndex + 1}`;
          const cropEditor = question.cropEditorOpen;
          const cropSource =
            cropEditor === "question"
              ? question.questionImageCrop
              : typeof cropEditor === "number"
                ? question.options[cropEditor]?.imageCrop
                : null;

          const effectiveQuestionImage =
            question.questionCroppedUrl ||
            (typeof question.questionImageCrop === "string" &&
            question.questionImageCrop.startsWith("data:image")
              ? question.questionImageCrop
              : null);

          return (
            <Accordion
              key={question.id}
              expanded={isExpanded}
              onChange={(_, exp) => onExpandedChange(exp ? question.id : false)}
              disableGutters
              sx={{
                background: "rgba(0,0,0,0.22)",
                border: "0.5px solid rgba(255,255,255,0.03)",
                borderRadius: "14px !important",
                "&:before": { display: "none" },
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{ color: isExpanded ? "#fff" : "primary.main" }}
                  />
                }
                sx={{
                  bgcolor: isExpanded ? "primary.main" : "#f4f8fc",
                  minHeight: 52,
                  "& .MuiAccordionSummary-content": { my: 1 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    label={`${questionIndex + 1}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: isExpanded
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(0,123,255,0.12)",
                      color: isExpanded ? "#fff" : "primary.dark",
                    }}
                  />
                  <Chip
                    label={`صفحه ${question.pageIndex + 1}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: isExpanded
                        ? "rgba(255,255,255,0.5)"
                        : "primary.light",
                      color: isExpanded ? "#fff" : "primary.main",
                    }}
                  />
                  <Box
                    sx={{
                      fontWeight: 900,
                      color: isExpanded ? "#fff" : "text.primary",
                      overflow: "hidden",
                      fontSize: "1.4rem",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                      minWidth: 80,
                      "& .katex-display": { display: "inline-block", m: 0 },
                      "& > span": { display: "inline" },
                    }}
                  >
                    <MathText
                      content={summary}
                      fontSize="0.75rem"
                      fontFamily="'Vazirmatn', 'IRANSans', sans-serif"
                    />
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  bgcolor: "#fff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    صورت سوال
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      حالت ویرایش
                    </Typography>
                    <Switch
                      size="small"
                      checked={editModes[question.id]?.question ?? false}
                      onChange={() => toggleEditMode(question.id, "question")}
                    />
                  </Box>
                </Box>
                <MathTextField
                  label=" "
                  multiline
                  minRows={2}
                  value={question.questionText}
                  onChange={(value) =>
                    onQuestionChange(question.id, (c) => ({
                      ...c,
                      questionText: value,
                    }))
                  }
                  fullWidth
                  isEditMode={editModes[question.id]?.question ?? false}
                />

                {question.hasQuestionImage && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      bgcolor: "#f0f7ff",
                      border: "1px solid #c5ddf5",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <ImageIcon
                        sx={{ color: "primary.main", fontSize: "1.1rem" }}
                      />
                      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        تصویر صورت سوال
                      </Typography>
                    </Box>
                    {effectiveQuestionImage ? (
                      <Box sx={{ textAlign: "center", mb: 1 }}>
                        <img
                          src={effectiveQuestionImage}
                          alt="باکس سوال"
                          style={{
                            maxHeight: 240,
                            objectFit: "contain",
                            borderRadius: 6,
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          color: "warning.dark",
                          fontSize: "0.85rem",
                          mb: 1,
                        }}
                      >
                        محدوده برش را تأیید کنید.
                      </Typography>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        onQuestionChange(question.id, (c) => ({
                          ...c,
                          cropEditorOpen:
                            c.cropEditorOpen === "question"
                              ? false
                              : "question",
                        }))
                      }
                    >
                      <TuneRoundedIcon sx={{ ml: 0.5, fontSize: "1rem" }} />
                      {question.cropEditorOpen === "question"
                        ? "بستن برش"
                        : "ویرایش برش"}
                    </Button>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    گزینه‌ها
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      حالت ویرایش گزینه‌ها
                    </Typography>
                    <Switch
                      size="small"
                      checked={editModes[question.id]?.options ?? false}
                      onChange={() => toggleEditMode(question.id, "options")}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  {question.options.map((option, optionIndex) => {
                    const isImageOption =
                      option.type === "image" || Boolean(option.imageCrop);
                    const rawOptionCrop =
                      question.optionCroppedUrls[optionIndex];
                    const effectiveOptionImage =
                      rawOptionCrop ||
                      (typeof option.imageCrop === "string" &&
                      option.imageCrop.startsWith("data:image")
                        ? option.imageCrop
                        : null);

                    return (
                      <Box key={optionIndex}>
                        {isImageOption ? (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "8px",
                              bgcolor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                mb: 1,
                              }}
                            >
                              گزینه {optionIndex + 1} (تصویری)
                            </Typography>
                            {effectiveOptionImage ? (
                              <img
                                src={effectiveOptionImage}
                                alt=""
                                style={{
                                  width: "100%",
                                  maxHeight: 120,
                                  objectFit: "contain",
                                  marginBottom: 8,
                                  borderRadius: 4,
                                }}
                              />
                            ) : (
                              <Typography
                                sx={{
                                  color: "warning.dark",
                                  fontSize: "0.75rem",
                                  mb: 1,
                                }}
                              >
                                برش گزینه را تأیید کنید.
                              </Typography>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                onQuestionChange(question.id, (c) => ({
                                  ...c,
                                  cropEditorOpen:
                                    c.cropEditorOpen === optionIndex
                                      ? false
                                      : optionIndex,
                                }))
                              }
                            >
                              <TuneRoundedIcon sx={{ ml: 0.5, fontSize: "1rem" }} />
                              {question.cropEditorOpen === optionIndex
                                ? "بستن برش"
                                : "ویرایش برش"}
                            </Button>
                          </Box>
                        ) : (
                          <MathTextField
                            label={`گزینه ${optionIndex + 1}`}
                            value={option.text}
                            onChange={(value) =>
                              onQuestionChange(question.id, (c) => {
                                const opts = [...c.options];
                                opts[optionIndex] = {
                                  ...opts[optionIndex],
                                  text: value,
                                };
                                return { ...c, options: opts };
                              })
                            }
                            fullWidth
                            minRows={1}
                            isEditMode={
                              editModes[question.id]?.options ?? false
                            }
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>

                <FormControl fullWidth>
                  <InputLabel>گزینه صحیح</InputLabel>
                  <Select
                    label="گزینه صحیح"
                    value={question.correctOption ?? ""}
                    onChange={(e) =>
                      onQuestionChange(question.id, (c) => ({
                        ...c,
                        correctOption:
                          String(e.target.value) === ""
                            ? null
                            : Number(e.target.value),
                      }))
                    }
                  >
                    <MenuItem value="">
                      <em>انتخاب کنید</em>
                    </MenuItem>
                    {[1, 2, 3, 4].map((n) => (
                      <MenuItem key={n} value={n}>
                        گزینه {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {page && cropEditor !== false && (
                  <ImageCropperBox
                    imageSrc={page.previewUrl}
                    initialCrop={typeof cropSource === "string" ? null : toReactCrop(cropSource)}
                    onCropSave={(cropped, cropPercent) => {
                      onQuestionChange(question.id, (c) => {
                        if (cropEditor === "question") {
                          return {
                            ...c,
                            questionCroppedUrl: cropped,
                            questionImageCrop: cropPercent ?? c.questionImageCrop,
                            cropEditorOpen: false,
                          };
                        }
                        if (typeof cropEditor === "number") {
                          const urls = [...c.optionCroppedUrls];
                          const opts = [...c.options];
                          urls[cropEditor] = cropped;
                          opts[cropEditor] = {
                            ...opts[cropEditor],
                            imageCrop: cropPercent ?? opts[cropEditor].imageCrop,
                          };
                          return {
                            ...c,
                            optionCroppedUrls: urls,
                            options: opts,
                            cropEditorOpen: false,
                          };
                        }
                        return c;
                      });
                    }}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      <Button
        fullWidth
        variant="contained"
        color="success"
        size="large"
        disabled={isSaving}
        onClick={onSaveAll}
      >
        <SaveRoundedIcon sx={{ ml: 1 }} />
        {isSaving
          ? "در حال ذخیره..."
          : `ذخیره ${questions.length} سوال در دیتابیس`}
      </Button>
    </Box>
  );
};

export default QuestionsAccordionPanel;
