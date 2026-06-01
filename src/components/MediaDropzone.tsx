import React from "react";
import { Box, Button, Chip, Typography, CircularProgress } from "@mui/material";
import { useDropzone } from "react-dropzone";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ImageIcon from "@mui/icons-material/Image";
import type { PagePreview } from "../types/question";

interface Props {
  pages: PagePreview[];
  onFilesSelect: (files: File[]) => void;
  onExtract: () => void;
  isLoading: boolean;
}

const MediaDropzone: React.FC<Props> = ({ pages, onFilesSelect, onExtract, isLoading }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 20,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onFilesSelect(acceptedFiles);
    },
  });

  return (
    <Box className="moniaz-card" sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5, height: "100%" , direction: "rtl"}}>
      <Typography variant="h6" sx={{ fontWeight: 500, color: "text.primary" }}>
        آپلود فایل
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          flexGrow: 1,
          minHeight: 300,
          borderRadius: "10px",
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "#c5d5e4",
          bgcolor: isDragActive ? "rgba(0, 123, 255, 0.05)" : "#f8fbfd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "border-color 0.2s, background 0.2s",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "rgba(0, 123, 255, 0.04)",
          },
        }}
      >
        <input {...getInputProps()} />
        {pages.length > 0 ? (
          <Box sx={{ width: "100%", p: 2 }}>
            <Typography sx={{ fontWeight: 700, textAlign: "center", mb: 2, color: "text.primary" }}>
              {pages.length} صفحه آماده استخراج
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center" }}>
              {pages.map((page) => (
                <Box
                  key={page.index}
                  sx={{
                    width: 90,
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "primary.light",
                  }}
                >
                  <img src={page.previewUrl} alt={page.label} style={{ width: "100%", height: 68, objectFit: "cover" }} />
                  <Typography
                    sx={{
                      fontSize: "0.62rem",
                      p: 0.5,
                      textAlign: "center",
                      color: "text.secondary",
                      bgcolor: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {page.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography sx={{ textAlign: "center", mt: 2, fontSize: "0.85rem", color: "text.secondary" }}>
              برای تغییر فایل‌ها کلیک کنید
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 2,
                borderRadius: "50%",
                bgcolor: "rgba(0, 123, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 36, color: "primary.main" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
              {isDragActive ? "فایل‌ها را رها کنید" : "آپلود عکس یا PDF"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mb: 2 }}>
              چند عکس یا PDF چندصفحه‌ای — هر صفحه جدا تحلیل می‌شود
            </Typography>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip icon={<ImageIcon />} label="تصویر" size="small" color="primary" variant="outlined" />
              <Chip icon={<PictureAsPdfRoundedIcon />} label="PDF" size="small" color="primary" variant="outlined" />
            </Box>
          </Box>
        )}
      </Box>

      <Button
        disabled={pages.length === 0 || isLoading}
        variant="contained"
        fullWidth
        size="large"
        onClick={(e) => {
          e.stopPropagation();
          onExtract();
        }}
      >
        {isLoading ? <CircularProgress size={22} sx={{ color: "#fff", ml: 1 }} /> : <AutoAwesomeIcon sx={{ ml: 1 }} />}
        {isLoading ? "در حال تحلیل..." : "استخراج هوشمند سوالات"}
      </Button>
    </Box>
  );
};

export default MediaDropzone;
