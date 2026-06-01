import React from 'react';
import { Box, Button, TextField, Typography, MenuItem, Chip } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';

import ImageIcon from '@mui/icons-material/Image';

interface Props {
  extractedData: any;
  onSave: (data: any) => void;
  croppedImageUrl?: string | null;
}

const GeminiResultForm: React.FC<Props> = ({ extractedData, onSave, croppedImageUrl }) => {
  return (
    <Box className="glass" sx={{
      p: { xs: 3, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient blur inside card */}
      <Box sx={{
        position: 'absolute', top: '-50px', right: '-50px',
        width: '150px', height: '150px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(30px)', zIndex: 0
      }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            p: 1, borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <EditNoteRoundedIcon sx={{ color: '#a855f7' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
            نتایج استخراج شده
          </Typography>
        </Box>
        <Chip 
          label="نیازمند بررسی شما" 
          size="small"
          sx={{ 
            backgroundColor: 'rgba(253, 224, 71, 0.15)', 
            color: '#fde047', 
            fontWeight: 600,
            border: '1px solid rgba(253, 224, 71, 0.3)',
            px: 1
          }} 
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, zIndex: 1, flexGrow: 1 }}>
        <TextField
          label="صورت سوال"
          multiline
          rows={3}
          defaultValue={extractedData?.questionText || ''}
          variant="outlined"
          fullWidth
          slotProps={{ input: { sx: { fontSize: '1.1rem', lineHeight: 1.6 } } }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          {['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'].map((opt, index) => (
             <TextField
                key={index}
                label={opt}
                defaultValue={extractedData?.options?.[index] || ''}
                variant="outlined"
                fullWidth
              />
          ))}
        </Box>

        <TextField
          select
          label="گزینه صحیح"
          defaultValue={extractedData?.correctOption || 1}
          fullWidth
        >
          {[1, 2, 3, 4].map((option) => (
            <MenuItem key={option} value={option}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                گزینه {option}
              </Box>
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {croppedImageUrl && (
        <Box sx={{ mt: 2, p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 1.5, zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon sx={{ color: '#ec4899', fontSize: '1.2rem' }} />
            <Typography sx={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>تصویر برش خورده سوال</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', p: 1 }}>
            <img src={croppedImageUrl} alt="Cropped" style={{ maxHeight: '150px', objectFit: 'contain', borderRadius: '4px' }} />
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 'auto', pt: 2, zIndex: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onSave(extractedData)}
          sx={{ 
            borderRadius: "100px", 
            py: 1.8, 
            fontWeight: 700, 
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
            "&:hover": {
              boxShadow: '0 15px 35px -5px rgba(16, 185, 129, 0.5)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <SaveRoundedIcon sx={{ ml: 1.5, mb: 0.5 }} />
          تایید نهایی و ذخیره در دیتابیس
        </Button>
      </Box>
    </Box>
  );
};

export default GeminiResultForm;