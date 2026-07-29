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

const MediaDropzone: React.FC<Props> = ({
  pages,
  onFilesSelect,
  onExtract,
  isLoading,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onFilesSelect(acceptedFiles);
    },
  });

  return (
    <Box
      sx={{
        p: 1.25,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        direction: "rtl",
        border: "1px solid #e5e5e5",
        borderRadius: 3,
        bgcolor: "#fff",
        boxShadow: "0 18px 55px rgba(0,0,0,0.08)",
      }}
    >
      <Typography sx={{ fontWeight: 700, color: "#2f2f2f", px: 1, pt: 0.5, fontSize: "0.9rem" }}>
        آپلود فایل
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          flexGrow: 1,
          minHeight: 260,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: isDragActive ? "#0072BC" : "#d4d4d8",
          bgcolor: isDragActive ? "rgba(0, 114, 188, 0.08)" : "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "@keyframes float": {
            "0%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-8px)" },
            "100%": { transform: "translateY(0px)" },
          },
          "&:hover": {
            borderColor: "#0072BC",
            bgcolor: "#f7f7f7",
            "& .upload-icon-container": {
              animation: "float 2s ease-in-out infinite",
              bgcolor: "rgba(0, 114, 188, 0.14)",
            },
            "& .upload-icon": {
              transform: "scale(1.1)",
            },
          },
        }}
      >
        <input {...getInputProps()} />
        {pages.length > 0 ? (
          <Box sx={{ width: "100%", p: 2 }}>
            <Typography
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: 2,
                color: "text.primary",
              }}
            >
              {pages.length} صفحه پیش‌نمایش آماده است
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                justifyContent: "center",
              }}
            >
              {pages.map((page) => (
                <Box
                  key={page.index}
                  sx={{
                    width: 90,
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "primary.light",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <img
                    src={page.previewUrl}
                    alt={page.label}
                    style={{ width: "100%", height: 68, objectFit: "cover" }}
                  />
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
            <Typography
              sx={{
                textAlign: "center",
                mt: 2,
                fontSize: "0.85rem",
                color: "text.secondary",
              }}
            >
              برای تغییر فایل‌ها کلیک کنید
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Box
              className="upload-icon-container"
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 2,
                borderRadius: "50%",
                bgcolor: "rgba(0, 114, 188, 0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <CloudUploadRoundedIcon
                className="upload-icon"
                sx={{
                  fontSize: 36,
                  color: "#0072BC",
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
            >
              {isDragActive ? "فایل‌ها را رها کنید" : "آپلود عکس یا PDF"}
            </Typography>
            <Typography
              sx={{ color: "text.secondary", fontSize: "0.9rem", mb: 2 }}
            >
              یک PDF یا یک عکس PNG/JPG انتخاب کنید
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Chip
                icon={<ImageIcon />}
                label="تصویر"
                size="small"
                variant="outlined"
                sx={{ px: 1, borderColor: "#d4d4d8", color: "#3f3f46", "& .MuiChip-icon": { color: "#71717a" } }}
              />
              <Chip
                icon={<PictureAsPdfRoundedIcon />}
                label="PDF"
                size="small"
                variant="outlined"
                sx={{ px: 1, borderColor: "#d4d4d8", color: "#3f3f46", "& .MuiChip-icon": { color: "#71717a" } }}
              />
            </Box>
          </Box>
        )}
      </Box>

      <Button
        disabled={pages.length === 0 || isLoading}
        variant="contained"
        fullWidth
        size="large"
        sx={{
          bgcolor: "#0072BC",
          borderRadius: 2,
          py: 1.15,
          "&:hover": { bgcolor: "#005f9e", boxShadow: "none" },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onExtract();
        }}
      >
        {isLoading ? (
          <CircularProgress size={22} sx={{ color: "#fff", ml: 1 }} />
        ) : (
          <AutoAwesomeIcon sx={{ ml: 1 }} />
        )}
        {isLoading ? "در حال تحلیل..." : "استخراج هوشمند سوالات"}
      </Button>
    </Box>
  );
};

export default MediaDropzone;
