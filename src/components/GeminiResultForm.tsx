import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, MenuItem, Switch, TextField, Typography } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';

import ImageIcon from '@mui/icons-material/Image';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

interface ExtractedData {
  questionText?: string;
  options?: string[];
  correctOption?: number;
  hasQuestionImage?: boolean;
  questionImageCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface Props {
  extractedData: ExtractedData | null;
  onSave: (data: ExtractedData) => void;
  croppedImageUrl?: string | null;
  hasQuestionImage: boolean;
  onHasQuestionImageChange: (hasImage: boolean) => void;
  onEditCrop: () => void;
}

const GeminiResultForm: React.FC<Props> = ({
  extractedData,
  onSave,
  croppedImageUrl,
  hasQuestionImage,
  onHasQuestionImageChange,
  onEditCrop
}) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(1);

  useEffect(() => {
    setQuestionText(extractedData?.questionText || '');
    setOptions([0, 1, 2, 3].map((index) => extractedData?.options?.[index] || ''));
    setCorrectOption(extractedData?.correctOption || 1);
  }, [extractedData]);

  const handleSave = () => {
    onSave({
      ...extractedData,
      questionText,
      options,
      correctOption,
      hasQuestionImage,
      questionImageCrop: hasQuestionImage ? extractedData?.questionImageCrop || null : null
    });
  };

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
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          variant="outlined"
          fullWidth
          slotProps={{ input: { sx: { fontSize: '1.1rem', lineHeight: 1.6 } } }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          {['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'].map((opt, index) => (
             <TextField
                key={index}
                label={opt}
                value={options[index]}
                onChange={(event) => {
                  const nextOptions = [...options];
                  nextOptions[index] = event.target.value;
                  setOptions(nextOptions);
                }}
                variant="outlined"
                fullWidth
              />
          ))}
        </Box>

        <TextField
          select
          label="گزینه صحیح"
          value={correctOption}
          onChange={(event) => setCorrectOption(Number(event.target.value))}
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

        <Box sx={{ p: 2, background: 'rgba(0,0,0,0.18)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ImageIcon sx={{ color: hasQuestionImage ? '#ec4899' : '#9ca3af', fontSize: '1.25rem' }} />
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                صورت سوال عکس دارد؟
              </Typography>
              <Typography sx={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                {hasQuestionImage ? 'تصویر جداگانه همراه سوال ذخیره می‌شود.' : 'فیلد تصویر در دیتابیس null می‌ماند.'}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={hasQuestionImage}
            onChange={(event) => onHasQuestionImageChange(event.target.checked)}
          />
        </Box>
      </Box>

      {hasQuestionImage && (
        <Box sx={{ mt: 2, p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 1.5, zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon sx={{ color: '#ec4899', fontSize: '1.2rem' }} />
            <Typography sx={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>تصویر برش خورده سوال</Typography>
          </Box>
          {croppedImageUrl ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', p: 1 }}>
              <img src={croppedImageUrl} alt="Cropped" style={{ maxHeight: '150px', objectFit: 'contain', borderRadius: '4px' }} />
            </Box>
          ) : (
            <Typography sx={{ color: '#fbbf24', fontSize: '0.9rem' }}>
              هنوز برشی برای تصویر سوال ذخیره نشده است.
            </Typography>
          )}
          <Button variant="outlined" onClick={onEditCrop} sx={{ alignSelf: 'flex-start' }}>
            <TuneRoundedIcon sx={{ ml: 1, fontSize: '1.1rem' }} />
            ویرایش برش
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 'auto', pt: 2, zIndex: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
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
