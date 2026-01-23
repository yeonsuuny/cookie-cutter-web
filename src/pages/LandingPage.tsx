// src/pages/LandingPage.tsx
import { Box, Container } from "@mui/material";
import OvenUploader from "../components/OvenUploader";
import "./LandingPage.css"; // ⭐️ CSS 파일 연결 필수

interface LandingPageProps {
  onStart: (file: File) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {

  const handleOvenFileSelect = (file: File) => {
    onStart(file);
  };

  return (
    // 전체를 감싸는 래퍼 (기존 Box 대신 div 사용)
    <div className="landing-page-wrapper"> 
      
      {/* ✅ 1. 배경 이미지 (여기로 분리됨!) */}
      {/* CSS의 .bakery-background 클래스가 이미지를 담당합니다 */}
      <div className="bakery-background" />

      {/* ✅ 2. 탁자 위 소품들 (배경 위에 얹기) */}
      <img 
        src="/milk_butter_pour.png" 
        alt="Milk and Butter" 
        className="table-deco deco-milk" 
      />
      <img 
        src="/cookie_cutter.png" 
        alt="Cookie Cutter" 
        className="table-deco deco-cutter" 
      />

      {/* ✅ 3. 오븐 및 컨텐츠 (가장 위에 올라옴) */}
      <Container maxWidth="sm" className="content-container">
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
             <OvenUploader onFileSelected={handleOvenFileSelect} />
          </Box>
        </Box>
      </Container>
      
    </div>
  );
}