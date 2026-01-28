// src/components/RecipeGuide.tsx
import { 
  Dialog,
  IconButton, 
  Typography, 
  Box,
  Stack
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
// 아이콘들이 없으면 npm install @mui/icons-material 필요 (이미 하셨을 거예요)
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CookieIcon from '@mui/icons-material/Cookie';
import DownloadIcon from '@mui/icons-material/Download';

interface RecipeGuideProps {
  open: boolean;
  onClose: () => void;
}

export default function RecipeGuide({ open, onClose }: RecipeGuideProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs" // 너비 적당하게
      PaperProps={{
        style: {
          backgroundColor: '#fffdf0', // 따뜻한 미색 종이
          borderRadius: '20px',
          padding: '10px', // 테두리 공간 확보
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)' // 붕 뜬 그림자
        }
      }}
    >
      {/* 🧵 안쪽 점선 테두리 박스 (아까 그 디자인!) */}
      <Box sx={{
        border: '2px dashed #5d4037',
        borderRadius: '15px',
        padding: '20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        
        {/* 닫기 버튼 (우측 상단) */}
        <IconButton 
          onClick={onClose} 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            color: '#8d6e63' 
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* 제목 */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#5d4037', mb: 1, mt: 1 }}>
          🍪 Baking Guide
        </Typography>
        <Typography variant="body2" sx={{ color: '#8d6e63', mb: 4 }}>
          나만의 쿠키 커터 굽는 법
        </Typography>

        {/* 내용: 단계별 설명 */}
        <Stack spacing={3}>
          
          {/* Step 1 */}
          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
            <Box sx={{ bgcolor: '#efebe9', p: 1.5, borderRadius: '50%', mr: 2 }}>
              <CloudUploadIcon sx={{ color: '#5d4037' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#5d4037' }}>
                1. 반죽 넣기 (Upload)
              </Typography>
              <Typography variant="caption" sx={{ color: '#8d6e63' }}>
                원하는 모양의 이미지를 오븐에 넣어주세요. 배경이 투명하면 더 좋아요!
              </Typography>
            </Box>
          </Box>

          {/* Step 2 */}
          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
            <Box sx={{ bgcolor: '#efebe9', p: 1.5, borderRadius: '50%', mr: 2 }}>
              <CookieIcon sx={{ color: '#5d4037' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#5d4037' }}>
                2. 굽기 (Convert)
              </Typography>
              <Typography variant="caption" sx={{ color: '#8d6e63' }}>
                오븐이 이미지를 3D 모델로 구워낼 때까지 잠시만 기다려주세요.
              </Typography>
            </Box>
          </Box>

          {/* Step 3 */}
          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
            <Box sx={{ bgcolor: '#efebe9', p: 1.5, borderRadius: '50%', mr: 2 }}>
              <DownloadIcon sx={{ color: '#5d4037' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#5d4037' }}>
                3. 완성 (Download)
              </Typography>
              <Typography variant="caption" sx={{ color: '#8d6e63' }}>
                따끈한 STL 파일을 받아 3D 프린터로 출력하면 끝!
              </Typography>
            </Box>
          </Box>

        </Stack>
      </Box>
    </Dialog>
  );
}