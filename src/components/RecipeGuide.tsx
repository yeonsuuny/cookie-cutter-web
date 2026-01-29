import { Dialog, IconButton, Typography, Box, Stack } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface RecipeGuideProps {
  open: boolean;
  onClose: () => void;
}

const handFont = {
  fontFamily: "'Jua', sans-serif", 
  color: '#5d4037', 
};

export default function RecipeGuide({ open, onClose }: RecipeGuideProps) {
  
  // 📝 단계별 데이터 (순서 수정됨!)
  const steps = [
    {
      id: 1,
      title: "1. 업로드",
      desc: <>원하는 이미지 파일을 업로드 합니다<br />PNG 파일만 가능해요!</>,
      imgSrc: "/judang_upload.png",
      imgWidth: '155px' 
    },
    {
      id: 2,
      title: "2. 커스텀",
      desc: "3D 모델 사이즈를 수정합니다",
      imgSrc: "/judang_settings.png",
      imgWidth: '145px' 
    },
    {
      id: 3,
      title: "3. 다운로드",
      desc: <>수정된 모델을 STL 파일로<br />다운받습니다</>,
      imgSrc: "/judang_download.png",
      imgWidth: '145px' 
    },
    {
      // 👇 여기가 마지막 단계가 됩니다!
      id: 4,
      title: "4. 굽기", 
      desc: "완성된 쿠키 커터로 쿠키를 구워봐요!", // 문구는 원하시는 대로 수정하세요!
      imgSrc: "/judang_cooking.png",
      imgWidth: '150px' 
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        style: {
          backgroundImage: `url("/popup2.png")`, 
          backgroundSize: '100% 100%', 
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          
          width: '600px',
          height: '800px',
          padding: '80px 40px 40px 40px',
          boxSizing: 'border-box'
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', top: '85px', right: '65px', color: '#8d6e63' }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '40px' }}>
        
        {/* 제목 */}
        <Typography variant="h5" sx={{ ...handFont, fontSize: '1.8rem', mb: 2, fontWeight: 'bold' }}>
         3🍪LIGHT RECIPE
        </Typography>

        {/* 리스트 (스크롤 가능) */}
        <Box sx={{ 
          width: '100%', 
          maxWidth: '450px', 
          flexGrow: 1, 
          overflowY: 'auto',
          paddingRight: '10px',
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(93, 64, 55, 0.3)", borderRadius: "3px" }
        }}>
          <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px', transform: 'translate(28px)' }}>
            {steps.map((step, index) => (
              <Box 
                key={step.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row', 
        
                  borderBottom: index === steps.length - 1 ? 'none' : '2px dashed rgba(93, 64, 55, 0.2)',
        
                  paddingBottom: '10px'
                }}
              >
                {/* ✍️ 글씨 */}
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography variant="h6" sx={{ ...handFont, fontSize: '1.4rem' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" sx={{ ...handFont, fontSize: '1.11rem', letterSpacing: '-0.5px', opacity: 0.8 }}>
                    {step.desc}
                  </Typography>
                </Box>

                {/* 🖼️ 그림 */}
                <Box 
                  component="img"
                  src={step.imgSrc}
                  alt={step.title}
                  sx={{
                    width: step.imgWidth, 
                    height: 'auto',
                    objectFit: 'contain',
                    marginLeft: '15px' 
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}