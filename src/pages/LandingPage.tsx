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
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundImage: "url(/background.png)",
      backgroundSize: "100% 100%",
      backgroundPosition: "bottom center",
      backgroundRepeat: "no-repeat",
      paddingTop: "210px"
    }}>
      
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
             <OvenUploader onFileSelected={handleOvenFileSelect} />
          </Box>

        </Box>
      </Container>
    </Box>
  );
}