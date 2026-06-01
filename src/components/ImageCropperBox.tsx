import React, { useEffect, useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Box, Button, Typography } from '@mui/material';
import CropIcon from '@mui/icons-material/Crop';
import ContentCutIcon from '@mui/icons-material/ContentCut';

interface Props {
  imageSrc: string;
  onCropSave: (croppedImage: string) => void;
  initialCrop?: Crop | null;
}

const ImageCropperBox: React.FC<Props> = ({ imageSrc, onCropSave, initialCrop }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCrop(initialCrop || undefined);
    setCompletedCrop(undefined);
  }, [initialCrop, imageSrc]);

  const handleSave = () => {
    if (!completedCrop || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    const image = imageRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    onCropSave(base64Image);
  };

  return (
    <Box className="glass" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex' }}>
          <CropIcon sx={{ color: '#ec4899' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
          برش عکس سوال
        </Typography>
      </Box>

      <Typography sx={{ color: 'gray.main', fontSize: '0.95rem' }}>
        اگر جمینای بخش تصویری سوال را اشتباه تشخیص داده، محدوده درست را انتخاب و ذخیره کنید.
      </Typography>

      <Box sx={{ 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '16px', 
        overflow: 'hidden',
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: '400px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
        >
          <img 
            ref={imageRef} 
            src={imageSrc} 
            alt="Upload" 
            style={{ maxHeight: '400px', objectFit: 'contain' }} 
            crossOrigin="anonymous"
          />
        </ReactCrop>
      </Box>

      <Button
        variant="contained"
        disabled={!completedCrop || completedCrop.width === 0}
        onClick={handleSave}
        sx={{
          borderRadius: "100px",
          py: 1.5,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          '&:hover': {
             background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
          },
          '&:disabled': {
             background: 'rgba(255,255,255,0.05)',
             color: 'rgba(255,255,255,0.3)'
          }
        }}
      >
        <ContentCutIcon sx={{ ml: 1, fontSize: '1.2rem' }} />
        ذخیره بخش انتخاب شده
      </Button>
    </Box>
  );
};

export default ImageCropperBox;
