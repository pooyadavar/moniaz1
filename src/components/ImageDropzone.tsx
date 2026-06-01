import React from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

interface Props {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
  isLoading: boolean;
}

const ImageDropzone: React.FC<Props> = ({ onImageSelect, selectedImage, isLoading }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
  });

  return (
    <Box className="glass" sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', p: 3 }}>
      <Box
        {...getRootProps()}
        sx={{
          flexGrow: 1,
          minHeight: '400px',
          backgroundColor: isDragActive ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          border: '2px dashed',
          borderColor: isDragActive ? '#a855f7' : 'rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { 
            borderColor: 'rgba(168, 85, 247, 0.5)', 
            backgroundColor: 'rgba(168, 85, 247, 0.05)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <input {...getInputProps()} />
        {selectedImage ? (
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <Box sx={{ 
              position: 'absolute', inset: 0, 
              background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', 
              zIndex: 1, pointerEvents: 'none' 
            }} />
            <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 0, position: 'relative' }} />
            <Typography sx={{ 
              position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', 
              color: '#fff', zIndex: 2, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              px: 2, py: 0.5, borderRadius: '100px', fontSize: '0.85rem'
            }}>
              برای تغییر تصویر کلیک کنید
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4, textAlign: 'center' }}>
            <Box sx={{ 
              width: 80, height: 80, borderRadius: '50%', 
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(236,72,153,0.2) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168,85,247,0.1)'
            }}>
              <CloudUploadRoundedIcon sx={{ fontSize: 40, color: '#d8b4fe' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              {isDragActive ? "تصویر را اینجا رها کنید" : "آپلود تصویر سوال"}
            </Typography>
            <Typography sx={{ color: '#9ca3af', fontSize: '0.9rem', maxWidth: '80%' }}>
              تصویر خود را بکشید و اینجا رها کنید یا برای انتخاب فایل کلیک کنید
            </Typography>
          </Box>
        )}
      </Box>

      <Button
        disabled={!selectedImage || isLoading}
        variant="contained"
        fullWidth
        sx={{
          py: 2,
          fontSize: '1.1rem',
          position: 'relative',
          overflow: 'hidden',
          "&::after": {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(rgba(255,255,255,0.2), transparent)',
            opacity: 0,
            transition: 'opacity 0.3s',
          },
          "&:hover::after": { opacity: 1 },
          "&:disabled": { background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.3)' }
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: '#fff', mr: 2 }} />
        ) : (
          <AutoAwesomeIcon sx={{ ml: 1.5, mb: 0.5 }} />
        )}
        {isLoading ? "در حال تحلیل تصویر..." : "استخراج هوشمند اطلاعات"}
      </Button>
    </Box>
  );
};

export default ImageDropzone;