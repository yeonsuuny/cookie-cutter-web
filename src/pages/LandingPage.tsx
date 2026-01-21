// src/pages/LandingPage.tsx
import { Box, Container, Typography } from "@mui/material";
import OvenUploader from "../components/OvenUploader";

interface LandingPageProps {
  onStart: (file: File) => void;
  // onCheckLogin 제거 (App에서 처리함)
}

export default function LandingPage({ onStart }: LandingPageProps) {

  const handleOvenFileSelect = (file: File) => {
    // ⭐️ 로그인 체크 로직 삭제!
    // 그냥 무조건 부모(App)에게 파일을 전달합니다.
    onStart(file);
  };

  return (
    <Box sx={{ 
      minHeight: "calc(100vh - 72px)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      bgcolor: "#FFF9F0"
    }}>
      
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#5D4037", fontFamily: "'Jua', sans-serif" }}>
            🍪 나만의 쿠키 커터 만들기
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: "#8D6E63", fontSize: "1.1rem", fontFamily: "'Jua', sans-serif" }}>
            오븐에 이미지를 넣으면 3D 모델로 구워드려요!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
             <OvenUploader onFileSelected={handleOvenFileSelect} />
          </Box>

        </Box>
      </Container>
    </Box>
  );
}