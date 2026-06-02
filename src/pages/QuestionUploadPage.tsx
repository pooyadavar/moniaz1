import React, { useCallback, useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import MediaDropzone from "../components/MediaDropzone";
import QuestionsAccordionPanel from "../components/QuestionsAccordionPanel";
import type {
  ExtractedQuestion,
  PagePreview,
  QuestionDraft,
} from "../types/question";
import { cropImageFromPercent } from "../utils/cropImage";
import { filesToPages, revokePageUrls } from "../utils/mediaToPages";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const createId = () => crypto.randomUUID();

const getPageForQuestion = (pages: PagePreview[], pageIndex: number) =>
  pages.find((p) => p.index === pageIndex) ?? pages[pageIndex];

const buildQuestionDraft = async (
  extracted: ExtractedQuestion,
  pagePreviewUrl: string,
): Promise<QuestionDraft> => {
  let questionCroppedUrl: string | null = null;
  const optionCroppedUrls: (string | null)[] = [null, null, null, null];

  if (extracted.hasQuestionImage && extracted.questionImageCrop) {
    questionCroppedUrl = await cropImageFromPercent(
      pagePreviewUrl,
      extracted.questionImageCrop,
    );
  }

  await Promise.all(
    extracted.options.map(async (option, index) => {
      if (option.type === "image" && option.imageCrop) {
        optionCroppedUrls[index] = await cropImageFromPercent(
          pagePreviewUrl,
          option.imageCrop,
        );
      }
    }),
  );

  return {
    ...extracted,
    id: createId(),
    questionCroppedUrl,
    optionCroppedUrls,
    cropEditorOpen: false,
  };
};

const QuestionUploadPage: React.FC = () => {
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [expandedId, setExpandedId] = useState<string | false>(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => () => revokePageUrls(pages), [pages]);

  const handleFilesSelect = async (files: File[]) => {
    revokePageUrls(pages);
    setQuestions([]);
    setExpandedId(false);
    try {
      setPages(await filesToPages(files));
    } catch (error) {
      alert(error instanceof Error ? error.message : "خطا در پردازش فایل‌ها");
    }
  };

  const handleExtract = async () => {
    if (!pages.length) return;
    setIsExtracting(true);
    setQuestions([]);
    setExpandedId(false);

    try {
      const formData = new FormData();
      pages.forEach((page) =>
        formData.append("files", page.file, page.file.name),
      );

      const response = await fetch(`${API_BASE_URL}/api/questions/extract`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!result.success) {
        alert("خطا در استخراج: " + (result.error || "نامشخص"));
        return;
      }

      const extractedList = (result.data?.questions ||
        []) as ExtractedQuestion[];
      if (!extractedList.length) {
        alert("سوالی پیدا نشد.");
        return;
      }

      const drafts = await Promise.all(
        extractedList.map((item) => {
          const page = getPageForQuestion(pages, item.pageIndex);
          if (!page) throw new Error(`صفحه ${item.pageIndex + 1} یافت نشد.`);
          return buildQuestionDraft(item, page.previewUrl);
        }),
      );

      setQuestions(drafts);
      setExpandedId(drafts[0]?.id ?? false);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "ارتباط با سرور برقرار نشد!",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleQuestionChange = useCallback(
    (id: string, updater: (q: QuestionDraft) => QuestionDraft) => {
      setQuestions((cur) =>
        cur.map((item) => (item.id === id ? updater(item) : item)),
      );
    },
    [],
  );

  const handleSaveAll = async () => {
    for (const q of questions) {
      if (!q.correctOption || q.correctOption < 1 || q.correctOption > 4) {
        alert("گزینه صحیح مشخص نیست — از پاسخنامه یا دستی انتخاب کنید.");
        setExpandedId(q.id);
        return;
      }
      if (q.hasQuestionImage && !q.questionCroppedUrl) {
        alert("برش تصویر صورت سوال را تکمیل کنید.");
        setExpandedId(q.id);
        return;
      }
      if (
        q.options.some((o, i) => o.type === "image" && !q.optionCroppedUrls[i])
      ) {
        alert("برش گزینه تصویری را تکمیل کنید.");
        setExpandedId(q.id);
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/save-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: questions.map((q) => ({
            questionText: q.questionText,
            options: q.options.map((o) =>
              o.type === "image"
                ? { type: "image", text: o.text }
                : { type: "text", text: o.text },
            ),
            correctOption: q.correctOption,
            hasQuestionImage: q.hasQuestionImage,
            questionImage: q.hasQuestionImage ? q.questionCroppedUrl : null,
            optionImages: q.options.map((o, i) =>
              o.type === "image" ? q.optionCroppedUrls[i] : null,
            ),
          })),
        }),
      });
      const result = await response.json();
      alert(
        result.success ? result.message || "ذخیره شد." : "خطا: " + result.error,
      );
    } catch {
      alert("خطا در ذخیره");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{ fontWeight: 600, color: "text.primary", mb: 1.5 }}
        >
          افزودن سوال با هوش مصنوعی
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            maxWidth: 640,
            mx: "auto",
            fontSize: "0.65rem",
            lineHeight: 1.8,
            direction: "rtl",
          }}
        >
          عکس یا PDF آپلود کنید. تشخیص تصویر صورت سوال و گزینه‌ها خودکار است و
          هر سوال را می‌توانید ویرایش کنید. در نهایت با ذخیره، سوالات به دیتابیس اضافه می‌شوند و برای استفاده در آزمون‌ها آماده خواهند بود.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: { xs: "1 1 auto", lg: "0 0 42%" } }}>
          <MediaDropzone
            pages={pages}
            onFilesSelect={handleFilesSelect}
            onExtract={handleExtract}
            isLoading={isExtracting}
          />
        </Box>

        <Box sx={{ flex: { xs: "1 1 auto", lg: "0 0 58%" }, minHeight: 480 }}>
          <QuestionsAccordionPanel
            questions={questions}
            pages={pages}
            expandedId={expandedId}
            onExpandedChange={setExpandedId}
            onQuestionChange={handleQuestionChange}
            onSaveAll={handleSaveAll}
            isSaving={isSaving}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default QuestionUploadPage;
