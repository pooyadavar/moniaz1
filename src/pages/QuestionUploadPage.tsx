import React, { useState } from "react";
import { Box, Container, Typography, Fade } from "@mui/material";
import type { Crop } from "react-image-crop";
import ImageDropzone from "../components/ImageDropzone";
import GeminiResultForm from "../components/GeminiResultForm";
import ImageCropperBox from "../components/ImageCropperBox";

interface ImageCropPercent {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ExtractedData {
  questionText?: string;
  options?: string[];
  correctOption?: number;
  hasQuestionImage?: boolean;
  questionImageCrop?: ImageCropPercent | null;
}

const toReactCrop = (crop?: ImageCropPercent | null): Crop | null => {
  if (!crop) return null;

  return {
    unit: "%",
    x: crop.x,
    y: crop.y,
    width: crop.width,
    height: crop.height,
  };
};

const cropImageFromPercent = (imageSrc: string, crop: ImageCropPercent): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const x = Math.max(0, Math.min(100, crop.x));
      const y = Math.max(0, Math.min(100, crop.y));
      const width = Math.max(0, Math.min(100 - x, crop.width));
      const height = Math.max(0, Math.min(100 - y, crop.height));
      const sourceX = (x / 100) * image.naturalWidth;
      const sourceY = (y / 100) * image.naturalHeight;
      const sourceWidth = (width / 100) * image.naturalWidth;
      const sourceHeight = (height / 100) * image.naturalHeight;

      canvas.width = Math.max(1, sourceWidth);
      canvas.height = Math.max(1, sourceHeight);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context is not available."));
        return;
      }

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      resolve(canvas.toDataURL("image/jpeg"));
    };
    image.onerror = () => reject(new Error("Image could not be loaded for cropping."));
    image.src = imageSrc;
  });
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const QuestionUploadPage: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [geminiData, setGeminiData] = useState<ExtractedData | null>(null);
  const [hasQuestionImage, setHasQuestionImage] = useState(false);
  const [isCropEditorOpen, setIsCropEditorOpen] = useState(false);

  // این تابع رو پیدا کن و با این کد جایگزین کن
  const handleImageSelect = async (file: File) => {
    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setCroppedImageUrl(null); // ریست کردن کراپ قبلی
    setGeminiData(null);
    setHasQuestionImage(false);
    setIsCropEditorOpen(false);
    setIsExtracting(true); // لودینگ رو فعال می‌کنیم

    try {
      // ۱. ساخت فرم‌دیتا برای ارسال فایل
      const formData = new FormData();
      formData.append("image", file);

      // ۲. ارسال ریکوئست به API اول (استخراج)
      const response = await fetch(
        `${API_BASE_URL}/api/questions/extract`,
        {
          method: "POST",
          body: formData, // اینجا دیگه هدر Content-Type نمی‌ذاریم چون مرورگر خودش برای FormData تنظیمش می‌کنه
        },
      );

      const result = await response.json();

      if (result.success) {
        // دیتایی که جمینای برگردونده رو می‌ریزیم تو استیت تا فرم سمت چپ پر بشه
        const extracted = result.data as ExtractedData;
        setGeminiData(extracted);
        setHasQuestionImage(Boolean(extracted.hasQuestionImage));

        if (extracted.hasQuestionImage && extracted.questionImageCrop) {
          const autoCroppedImage = await cropImageFromPercent(nextPreviewUrl, extracted.questionImageCrop);
          setCroppedImageUrl(autoCroppedImage);
          setIsCropEditorOpen(false);
        } else if (extracted.hasQuestionImage) {
          setIsCropEditorOpen(true);
        } else {
          setCroppedImageUrl(null);
          setIsCropEditorOpen(false);
        }
      } else {
        alert("خطا در استخراج: " + result.error);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("ارتباط با سرور برقرار نشد!");
    } finally {
      setIsExtracting(false); // لودینگ رو خاموش می‌کنیم
    }
  };

  const handleCropSave = (croppedImg: string) => {
    setCroppedImageUrl(croppedImg);
    setHasQuestionImage(true);
    setIsCropEditorOpen(false);
  };

  // این تابع رو پیدا کن و با این کد جایگزین کن
  const handleSaveToDb = async (finalData: ExtractedData) => {
    if (finalData.hasQuestionImage && !croppedImageUrl) {
      alert("برای سوالی که عکس دارد، اول محدوده تصویر را ذخیره کنید.");
      setIsCropEditorOpen(true);
      return;
    }

    try {
      // دیتای متنی رو با عکس کراپ شده ترکیب می‌کنیم
      const payload = {
        ...finalData,
        questionImage: finalData.hasQuestionImage ? croppedImageUrl : null, // همون عکس Base64 که از کراپ اومده
      };

      // ارسال ریکوئست به API دوم (ذخیره)
      const response = await fetch(`${API_BASE_URL}/api/questions/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(`ایول! سوال ذخیره شد. آیدی سوال: ${result.questionId}`);
        // اینجا می‌تونی فرم رو ریست کنی یا کاربر رو هدایت کنی
      } else {
        alert("خطا در ذخیره: " + result.error);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("ارتباط با سرور برای ذخیره برقرار نشد!");
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: { xs: 4, md: 8 }, mb: 8, position: "relative", zIndex: 1 }}
    >
      {/* Background glowing orbs */}
      <Box
        sx={{
          position: "fixed",
          top: "20%",
          left: "10%",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(40px)",
          zIndex: -1,
          borderRadius: "50%",
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "10%",
          right: "5%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
          zIndex: -1,
          borderRadius: "50%",
        }}
      />

      <Fade in={true} timeout={800}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 500,
              background: "linear-gradient(135deg, #fff 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            افزودن سوال جدید با هوش مصنوعی
          </Typography>
          <Typography
            sx={{
              color: "gray.main",
              maxWidth: "600px",
              mx: "auto",
              fontSize: "1.1rem",
            }}
          >
            تصویر سوال خود را آپلود کنید تا هوش مصنوعی به صورت خودکار صورت سوال
            و گزینه‌ها را برای شما استخراج کند.
          </Typography>
        </Box>
      </Fade>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 4,
          alignItems: "stretch",
        }}
      >
        {/* سمت راست: آپلود تصویر */}
        <Box
          sx={{
            flex: { xs: "1 1 auto", lg: "0 0 45%" },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Fade in={true} timeout={1000} style={{ transitionDelay: "200ms" }}>
            <Box sx={{ flexGrow: 1 }}>
              <ImageDropzone
                onImageSelect={handleImageSelect}
                selectedImage={previewUrl}
                isLoading={isExtracting}
              />
            </Box>
          </Fade>

          {previewUrl && isCropEditorOpen && (
            <Fade in={true} timeout={800}>
              <Box>
                <ImageCropperBox
                  imageSrc={previewUrl}
                  onCropSave={handleCropSave}
                  initialCrop={toReactCrop(geminiData?.questionImageCrop)}
                />
              </Box>
            </Fade>
          )}
        </Box>

        {/* سمت چپ: فرم اطلاعات استخراج شده */}
        <Box sx={{ flex: { xs: "1 1 auto", lg: "0 0 55%" }, width: "100%" }}>
          <Fade in={true} timeout={1000} style={{ transitionDelay: "400ms" }}>
            <Box sx={{ height: "100%" }}>
              <GeminiResultForm
                extractedData={geminiData}
                onSave={handleSaveToDb}
                croppedImageUrl={croppedImageUrl}
                hasQuestionImage={hasQuestionImage}
                onHasQuestionImageChange={(nextValue) => {
                  setHasQuestionImage(nextValue);
                  if (!nextValue) {
                    setCroppedImageUrl(null);
                    setIsCropEditorOpen(false);
                    return;
                  }

                  setIsCropEditorOpen(true);
                }}
                onEditCrop={() => setIsCropEditorOpen(true)}
              />
            </Box>
          </Fade>
        </Box>
      </Box>
    </Container>
  );
};

export default QuestionUploadPage;
