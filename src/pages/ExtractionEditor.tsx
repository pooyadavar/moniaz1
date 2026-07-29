import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { ExtractionDetailResponse, ExtractionSessionDetail } from "../services/api";
import { apiRequest, buildAiAssetUrl } from "../services/api";
import { useAuth } from "../auth/AuthProvider";

interface Props {
  sessionId: number;
  onSessionUpdate?: () => void;
}

type JsonRecord = Record<string, unknown>;

interface EditableOption {
  key: string;
  text: string;
  latex: string;
}

interface EditableQuestion {
  id: string;
  number: number;
  pageIndex: number;
  stem: string;
  stemLatex: string;
  assetUrls: string[];
  options: EditableOption[];
  correctOption: number | "";
}

const optionKeys = ["A", "B", "C", "D"];

const isProcessing = (status: string) => !["done", "failed"].includes(status);

const statusText = (status: string) => {
  if (status === "done") return "آماده و قابل ویرایش";
  if (status === "failed") return "ناموفق";
  return "در حال پردازش";
};

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};

const textValue = (value: unknown) => String(value ?? "").trim();

const cloneJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const findQuestions = (payload: unknown): unknown[] => {
  const root = asRecord(payload);
  const result = asRecord(root.result);
  const document = asRecord(root.document);
  const resultDocument = asRecord(result.document);
  const candidates = [
    root.questions,
    result.questions,
    document.questions,
    resultDocument.questions,
  ];
  return (candidates.find(Array.isArray) as unknown[]) || [];
};

const answerToNumber = (value: unknown): number | "" => {
  const text = textValue(value).toUpperCase();
  const letterIndex = optionKeys.indexOf(text);
  if (letterIndex >= 0) return letterIndex + 1;
  const numeric = Number(text);
  return numeric >= 1 && numeric <= 4 ? numeric : "";
};

const numberToAnswer = (value: number | "") =>
  typeof value === "number" ? optionKeys[value - 1] || null : null;

const normalizeQuestions = (payload: unknown): EditableQuestion[] =>
  findQuestions(payload).map((item, index) => {
    const question = asRecord(item);
    const rawOptions = Array.isArray(question.options) ? question.options : [];
    const assetUrls = (Array.isArray(question.assets) ? question.assets : [])
      .map((asset) => {
        const row = asRecord(asset);
        return buildAiAssetUrl(row.file_id || row.fileId || row.file_url || row.fileUrl);
      })
      .filter((url): url is string => Boolean(url));
    const options = optionKeys.map((key, optionIndex) => {
      const option = asRecord(rawOptions[optionIndex]);
      const text = textValue(option.text_fa || option.text);
      const latex = textValue(option.latex);
      return {
        key: textValue(option.key) || key,
        text: text || latex,
        latex,
      };
    });

    return {
      id: textValue(question.question_id) || `q-${index + 1}`,
      number: Number(question.question_number || question.questionNumber || index + 1),
      pageIndex: Number(question.page_index ?? question.pageIndex ?? 0),
      stem: textValue(question.stem_fa || question.questionText),
      stemLatex: textValue(question.stem_latex),
      assetUrls,
      options,
      correctOption: answerToNumber(question.answer_key || question.answerKey || question.correctOption),
    };
  });

const serializeQuestions = (questions: EditableQuestion[]) =>
  questions
    .map((question) => {
      const lines = [`${question.number}. ${question.stem}`.trim()];
      if (question.stemLatex) lines.push(`فرمول صورت سوال: ${question.stemLatex}`);
      question.options.forEach((option, index) => {
        lines.push(`${option.key || optionKeys[index]}) ${option.text}`.trim());
      });
      const answer = numberToAnswer(question.correctOption);
      if (answer) lines.push(`پاسخ: ${answer}`);
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");

const applyQuestionsToPayload = (payload: unknown, questions: EditableQuestion[]) => {
  const next = cloneJson(payload || {});
  const targets = findQuestions(next);
  questions.forEach((editable, index) => {
    const target = asRecord(targets[index]);
    if (!target) return;
    target.stem_fa = editable.stem;
    target.stem_latex = editable.stemLatex || null;
    target.answer_key = numberToAnswer(editable.correctOption);
    target.question_number = editable.number;
    target.page_index = editable.pageIndex;
    const rawOptions = Array.isArray(target.options) ? target.options : [];
    target.options = optionKeys.map((key, optionIndex) => ({
      ...asRecord(rawOptions[optionIndex]),
      key,
      text_fa: editable.options[optionIndex]?.text || "",
      latex: editable.options[optionIndex]?.latex || null,
    }));
  });
  return next;
};

const getEditablePayload = (session: ExtractionSessionDetail | null) =>
  session?.currentOutputJson || session?.aiOutputJson || null;

const ExtractionEditor: React.FC<Props> = ({ sessionId, onSessionUpdate }) => {
  const { token } = useAuth();
  const [session, setSession] = useState<ExtractionSessionDetail | null>(null);
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [expandedId, setExpandedId] = useState<string | false>(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const loadedPayloadRef = useRef("");
  const lastStatusRef = useRef<string>("");

  const serializedText = useMemo(() => serializeQuestions(questions), [questions]);
  const snapshot = useMemo(() => JSON.stringify(questions), [questions]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let timer: number | undefined;

    const load = async () => {
      setError("");
      try {
        const result = await apiRequest<ExtractionDetailResponse>(
          `/api/extractions/${sessionId}/status`,
          {},
          token,
        );
        if (cancelled) return;

        const payload = getEditablePayload(result.session);
        const payloadSnapshot = JSON.stringify(payload || {});
        setSession(result.session);
        if (payloadSnapshot !== loadedPayloadRef.current) {
          const nextQuestions = normalizeQuestions(payload);
          setQuestions(nextQuestions);
          setExpandedId(nextQuestions[0]?.id || false);
          setLastSavedSnapshot(JSON.stringify(nextQuestions));
          loadedPayloadRef.current = payloadSnapshot;
        }
        setIsLoading(false);
        if (result.session.status !== lastStatusRef.current) {
          lastStatusRef.current = result.session.status;
          onSessionUpdate?.();
        }

        if (isProcessing(result.session.status)) {
          timer = window.setTimeout(load, 2500);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "دریافت نتیجه انجام نشد.");
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadedPayloadRef.current = "";
    lastStatusRef.current = "";
    load();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [onSessionUpdate, sessionId, token]);

  useEffect(() => {
    if (!token || !session || session.status !== "done") return;
    if (!questions.length || snapshot === lastSavedSnapshot) return;

    const timer = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        const basePayload = getEditablePayload(session) || {};
        const contentJson = applyQuestionsToPayload(basePayload, questions);
        const result = await apiRequest<ExtractionDetailResponse>(
          `/api/extractions/${session.id}/content`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: serializedText, contentJson }),
          },
          token,
        );
        setLastSavedSnapshot(snapshot);
        setSession(result.session);
        loadedPayloadRef.current = JSON.stringify(result.session.currentOutputJson || result.session.aiOutputJson || {});
        setSaveState("saved");
        onSessionUpdate?.();
      } catch {
        setSaveState("error");
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [lastSavedSnapshot, onSessionUpdate, questions, serializedText, session, snapshot, token]);

  const updateQuestion = (id: string, updater: (question: EditableQuestion) => EditableQuestion) => {
    setQuestions((prev) => prev.map((question) => (question.id === id ? updater(question) : question)));
  };

  if (isLoading && !session) {
    return (
      <Box sx={{ p: { xs: 3, md: 5 }, display: "flex", justifyContent: "center", bgcolor: "#fff" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 2, md: 4 }, direction: "rtl" }}>
      <Box sx={{ maxWidth: 920, mx: "auto", display: "flex", flexDirection: "column", gap: 2.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 750, fontSize: "1rem", color: "#171717" }}>
              {session?.title || session?.originalFilename || `درخواست ${sessionId}`}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
              {session?.updatedAt ? new Date(session.updatedAt).toLocaleString("fa-IR") : ""}
            </Typography>
          </Box>
          <Chip
            label={session ? statusText(session.status) : "در حال دریافت"}
            color={session?.status === "failed" ? "error" : session?.status === "done" ? "success" : "primary"}
            variant="outlined"
            sx={{ borderRadius: 999, bgcolor: "#fff" }}
          />
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {session?.status === "failed" ? <Alert severity="error">پردازش این فایل ناموفق بود.</Alert> : null}
        {session && isProcessing(session.status) ? (
          <Alert severity="info">نتیجه هنوز آماده نیست. وضعیت خودکار به‌روزرسانی می‌شود.</Alert>
        ) : null}
        {session?.status === "done" && !questions.length ? (
          <Alert severity="warning">خروجی آماده است، ولی سوالی داخل نتیجه پیدا نشد.</Alert>
        ) : null}

        {questions.length ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 750, color: "#171717" }}>{questions.length} سوال استخراج شد</Typography>
              <Typography sx={{ color: saveState === "error" ? "error.main" : "text.secondary", fontSize: "0.78rem" }}>
                {saveState === "saving"
                  ? "در حال ذخیره تغییرات..."
                  : saveState === "saved"
                    ? "ذخیره شد"
                    : saveState === "error"
                      ? "خطا در ذخیره خودکار"
                      : "هر تغییر بعد از مکث کوتاه ذخیره می‌شود."}
              </Typography>
            </Box>

            {questions.map((question, questionIndex) => (
              <Accordion
                key={question.id}
                expanded={expandedId === question.id}
                onChange={(_, expanded) => setExpandedId(expanded ? question.id : false)}
                disableGutters
                sx={{
                  border: "1px solid #e5e5e5",
                  borderRadius: "10px !important",
                  boxShadow: "none",
                  overflow: "hidden",
                  bgcolor: "#fff",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#6b7280" }} />}
                  sx={{ minHeight: 58, "&:hover": { bgcolor: "#f7f7f8" }, "& .MuiAccordionSummary-content": { my: 1 } }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, width: "100%" }}>
                    <Chip
                      label={questionIndex + 1}
                      size="small"
                      sx={{ bgcolor: "#f1f1f1", color: "#171717", borderRadius: 999, fontWeight: 700 }}
                    />
                    <Typography sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#242424" }}>
                      {question.stem || `سوال ${questionIndex + 1}`}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 2, bgcolor: "#fafafa", borderTop: "1px solid #ededed" }}>
                  <TextField
                    label="صورت سوال"
                    value={question.stem}
                    onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, stem: event.target.value }))}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                  <TextField
                    label="فرمول صورت سوال"
                    value={question.stemLatex}
                    onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, stemLatex: event.target.value }))}
                    fullWidth
                  />
                  {question.assetUrls.length ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography sx={{ fontWeight: 800, color: "#444", fontSize: "0.86rem" }}>
                        تصویرهای سوال
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
                        {question.assetUrls.map((url) => (
                          <Box
                            key={url}
                            sx={{
                              p: 1,
                              border: "1px solid #e5e5e5",
                              borderRadius: 1,
                              bgcolor: "#fff",
                              textAlign: "center",
                            }}
                          >
                            <img
                              src={url}
                              alt="تصویر سوال"
                              style={{ maxWidth: "100%", maxHeight: 260, objectFit: "contain" }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : null}
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                    {question.options.map((option, optionIndex) => (
                      <TextField
                        key={option.key}
                        label={`گزینه ${option.key || optionIndex + 1}`}
                        value={option.text}
                        onChange={(event) =>
                          updateQuestion(question.id, (current) => {
                            const options = [...current.options];
                            options[optionIndex] = { ...options[optionIndex], text: event.target.value };
                            return { ...current, options };
                          })
                        }
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    ))}
                  </Box>
                  <FormControl fullWidth>
                    <InputLabel>گزینه صحیح</InputLabel>
                    <Select
                      label="گزینه صحیح"
                      value={question.correctOption}
                      onChange={(event) => {
                        const value = event.target.value as number | "";
                        updateQuestion(question.id, (current) => ({
                          ...current,
                          correctOption: value === "" ? "" : Number(value),
                        }));
                      }}
                    >
                      <MenuItem value="">
                        <em>نامشخص</em>
                      </MenuItem>
                      {[1, 2, 3, 4].map((value) => (
                        <MenuItem key={value} value={value}>
                          گزینه {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default ExtractionEditor;
