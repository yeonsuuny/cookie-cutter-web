import { useState } from "react";
import { Box, Container} from "@mui/material";
import OvenUploader from "../components/OvenUploader";
import RecipeGuide from "../components/RecipeGuide";
import "./LandingPage.css";


interface LandingPageProps {
  onStart: (file: File) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {

  const [openGuide, setOpenGuide] = useState(false);
  const handleOpenGuide = () => setOpenGuide(true);
  const handleCloseGuide = () => setOpenGuide(false);

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

      {/* 벽에 붙은 레시피 메모 */}
      <div className="wall-recipe-note" onClick={handleOpenGuide}>
        <div className="tape"></div> {/* 마스킹 테이프 */}
        <div className="note-content">
          <h4>SECRET<br/>RECIPE</h4>
          <span>눌러보세요!</span>
        </div>
      </div>

      <Container maxWidth="sm" className="content-container">
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
             <OvenUploader onFileSelected={handleOvenFileSelect} />
          </Box>
        </Box>
      </Container>
      
      {/* ✅ 여기에 한 줄만 넣으면 끝! */}
      <RecipeGuide open={openGuide} onClose={handleCloseGuide} />
      
    </div>
  );
}