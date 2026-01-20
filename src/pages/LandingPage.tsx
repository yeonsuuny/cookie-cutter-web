import { Box, Container, Typography } from "@mui/material";
// ⭐️ 새로 만든 컴포넌트 불러오기
import OvenUploader from "../components/OvenUploader";

interface LandingPageProps {
  onStart: (file: File) => void;
  onCheckLogin: () => boolean;
}

export default function LandingPage({ onStart, onCheckLogin }: LandingPageProps) {

  // ⭐️ 오븐에서 파일이 선택되었을 때 실행될 함수
  const handleOvenFileSelect = (file: File) => {
    // 1. 로그인 체크
    if (!onCheckLogin()) return; 
    
    // 2. 통과하면 앱 시작
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

          {/* ⭐️ 기존 Paper 코드를 다 지우고 이거 한 줄이면 끝! */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
             <OvenUploader onFileSelected={handleOvenFileSelect} />
          </Box>

        </Box>
      </Container>
    </Box>
  );
}