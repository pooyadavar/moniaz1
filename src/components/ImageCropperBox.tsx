import React, { useEffect, useRef, useState } from 'react';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  convertToPercentCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Box, Button, Typography } from '@mui/material';
import CropIcon from '@mui/icons-material/Crop';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import type { ImageCropPercent } from '../types/question';

interface Props {
  imageSrc: string;
  onCropSave: (croppedImage: string, cropPercent: ImageCropPercent | null) => void;
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

  const syncPixelCrop = (nextCrop?: Crop) => {
    const image = imageRef.current;
    if (!image || !nextCrop || !image.width || !image.height) return;
    setCompletedCrop(convertToPixelCrop(nextCrop, image.width, image.height));
  };

  const handleImageLoad = () => {
    syncPixelCrop(crop ?? initialCrop ?? undefined);
  };

  const handleSave = () => {
    if (!completedCrop || !imageRef.current) return;
    const canvas = document.createElement('canvas');
    const image = imageRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const destWidth = completedCrop.width * scaleX;
    const destHeight = completedCrop.height * scaleY;

    canvas.width = destWidth;
    canvas.height = destHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      destWidth,
      destHeight,
    );

    const percentCrop = convertToPercentCrop(completedCrop, image.width, image.height);
    onCropSave(canvas.toDataURL('image/png'), {
      x: percentCrop.x,
      y: percentCrop.y,
      width: percentCrop.width,
      height: percentCrop.height,
    });
  };

  return (
    <Box className="moniaz-card" sx={{ p: 2.5, mt: 1, border: '2px solid #c5ddf5' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <CropIcon sx={{ color: 'primary.main' }} />
        <Typography sx={{ fontWeight: 700 }}>ویرایش محدوده برش</Typography>
      </Box>
      <Box
        sx={{
          bgcolor: '#f4f8fc',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          maxHeight: 400,
          border: '1px solid #d0dde8',
        }}
      >
        <ReactCrop
          crop={crop}
          onChange={(pixelCrop, percentCrop) => {
            setCrop(percentCrop);
            setCompletedCrop(pixelCrop);
          }}
          onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt=""
            onLoad={handleImageLoad}
            style={{ maxHeight: 400, objectFit: 'contain', display: 'block' }}
          />
        </ReactCrop>
      </Box>
      <Button
        variant="contained"
        disabled={!completedCrop || completedCrop.width === 0}
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        <ContentCutIcon sx={{ ml: 1 }} />
        ذخیره برش
      </Button>
    </Box>
  );
};

export default ImageCropperBox;
