import React, { useState } from "react";
import { Box, Container, Typography, Fade } from "@mui/material";
import ImageDropzone from "../components/ImageDropzone";
import GeminiResultForm from "../components/GeminiResultForm";
import ImageCropperBox from "../components/ImageCropperBox";

const QuestionUploadPage: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [geminiData, setGeminiData] = useState<any>(null);

  // این تابع رو پیدا کن و با این کد جایگزین کن
  const handleImageSelect = async (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCroppedImageUrl(null); // ریست کردن کراپ قبلی
    setIsExtracting(true); // لودینگ رو فعال می‌کنیم

    try {
      // ۱. ساخت فرم‌دیتا برای ارسال فایل
      const formData = new FormData();
      formData.append("image", file);

      // ۲. ارسال ریکوئست به API اول (استخراج)
      const response = await fetch(
        "http://localhost:3000/api/questions/extract",
        {
          method: "POST",
          body: formData, // اینجا دیگه هدر Content-Type نمی‌ذاریم چون مرورگر خودش برای FormData تنظیمش می‌کنه
        },
      );

      const result = await response.json();

      if (result.success) {
        // دیتایی که جمینای برگردونده رو می‌ریزیم تو استیت تا فرم سمت چپ پر بشه
        setGeminiData(result.data);
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
  };

  // این تابع رو پیدا کن و با این کد جایگزین کن
  const handleSaveToDb = async (finalData: any) => {
    try {
      // دیتای متنی رو با عکس کراپ شده ترکیب می‌کنیم
      const payload = {
        ...finalData,
        questionImage: croppedImageUrl, // همون عکس Base64 که از کراپ اومده
      };

      // ارسال ریکوئست به API دوم (ذخیره)
      const response = await fetch("http://localhost:3000/api/questions/save", {
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

          {previewUrl && (
            <Fade in={true} timeout={800}>
              <Box>
                <ImageCropperBox
                  imageSrc={previewUrl}
                  onCropSave={handleCropSave}
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
              />
            </Box>
          </Fade>
        </Box>
      </Box>
    </Container>
  );
};

export default QuestionUploadPage;
