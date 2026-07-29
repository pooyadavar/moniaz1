import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthProvider";
import MediaDropzone from "../components/MediaDropzone";
import type { PagePreview } from "../types/question";
import type { CreateExtractionResponse } from "../services/api";
import { apiRequest } from "../services/api";
import { filesToPages, revokePageUrls } from "../utils/mediaToPages";

interface Props {
  onSessionCreated?: (sessionId: number) => void;
}

const QuestionUploadPage: React.FC<Props> = ({ onSessionCreated }) => {
  const { token } = useAuth();
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => () => revokePageUrls(pages), [pages]);

  const handleFilesSelect = async (files: File[]) => {
    revokePageUrls(pages);
    setSelectedFile(files[0] ?? null);
    try {
      setPages(await filesToPages(files.slice(0, 1)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در پردازش فایل");
    }
  };

  const handleExtract = async () => {
    if (!selectedFile || !token) return;
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);

      const result = await apiRequest<CreateExtractionResponse>(
        "/api/extractions",
        {
          method: "POST",
          body: formData,
        },
        token,
      );

      toast.success("درخواست استخراج ثبت شد.");
      onSessionCreated?.(result.sessionId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ثبت درخواست انجام نشد.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: "100svh", display: "flex", alignItems: "center", py: { xs: 3, md: 5 } }}>
      <Box sx={{ width: "100%" }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant="h5"
          component="h3"
          sx={{ fontWeight: 750, color: "#171717", mb: 1.25 }}
        >
          فایل سوال را بفرست
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            maxWidth: 640,
            mx: "auto",
            fontSize: "0.78rem",
            lineHeight: 1.8,
            direction: "rtl",
          }}
        >
          PDF یا عکس سوال را آپلود کنید. خروجی در تاریخچه ذخیره می‌شود و بعد از
          پردازش، همان‌جا قابل ویرایش است.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 560, mx: "auto" }}>
        <MediaDropzone
          pages={pages}
          onFilesSelect={handleFilesSelect}
          onExtract={handleExtract}
          isLoading={isExtracting}
        />
      </Box>
      </Box>
    </Container>
  );
};

export default QuestionUploadPage;
