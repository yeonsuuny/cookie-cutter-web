import { useState } from "react";
import { Box, Container} from "@mui/material";

import OvenUploader from "../components/OvenUploader";
import RecipeGuide from "../components/RecipeGuide";

// 랜딩 화면 전용 스타일
// - 배경 이미지 / 탁자 위 소품 위치 / 레시피 메모지 위치는 대부분 여기서 조정합니다.
import "./LandingPage.css";

/**
 * LandingPage
 * - 사용자가 처음 보는 첫 화면
 * - 배경 위에 소품을 올리고, 중앙에 오븐 업로드 UI를 배치합니다.
 * - 왼쪽(벽) 레시피 메모지를 클릭하면 사용법 가이드(RecipeGuide)를 띄웁니다.
 *
 * ⚠️ 주의
 * - 소품들은 '배경 위에 떠 있는 이미지'라서 z-index(레이어 순서)가 꼬이면 클릭이 안 되거나
 *   오븐 UI 위로 이미지가 덮일 수 있어요. (CSS에서 z-index를 확인)
 */

interface LandingPageProps {
  onStart: (file: File) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  // 가이드(RecipeGuide) 모달이 열려있는지 여부
  const [openGuide, setOpenGuide] = useState(false);

  /** 레시피 가이드 열기 */
  const handleOpenGuide = () => setOpenGuide(true);
  /** 레시피 가이드 닫기 */
  const handleCloseGuide = () => setOpenGuide(false);

  /**
   * 오븐 업로더에서 사용자가 파일을 골랐을 때 실행됩니다.
   * - 여기서는 "파일을 받았다"는 사실만 상위로 넘기고,
   *   변환 요청/페이지 이동 등은 onStart 쪽에서 담당합니다.
   */
  const handleOvenFileSelect = (file: File) => {
    onStart(file);
  };

  return (
    <div className="landing-page-wrapper"> 
      
      {/*
        1) 배경 레이어
        - 실제 배경 이미지는 LandingPage.css(.bakery-background)에서 설정됩니다.
      */}
      <div className="bakery-background" />

      {/*
        2) 탁자 위 소품 레이어
        - 이미지는 public 폴더 기준 경로(/파일명.png)로 불러옵니다.
        - 위치/크기 조정은 LandingPage.css에서 합니다.
      */}
      <img 
        src="/milk_butter_pour.png" 
        alt="Milk and Butter" 
        className="table-deco deco-milk" // LandingPage.css에서 우유/버터 위치 설정
      />
      <img 
        src="/cookie_cutter.png" 
        alt="Cookie Cutter" 
        className="table-deco deco-cutter" // LandingPage.css에서 쿠키 커터 위치 설정
      />
      <img 
        src="/cookie.png" 
        alt="Cookies" 
        className="table-deco deco-cookies" // LandingPage.css에서 쿠키 위치 설정
      />

      {/*
        3) 벽에 붙은 레시피 메모지 버튼
        - '메모지처럼 보이지만 실제로는 버튼' 입니다.
        - 클릭하면 RecipeGuide(사용법 모달)를 열어요.

        ✅ 텍스트 수정
        - "SECRET RECIPE" / "눌러보세요!"를 바꾸고 싶으면 아래 텍스트만 수정하면 됩니다.
      */}
      <div className="wall-recipe-note" onClick={handleOpenGuide}>
        <div className="tape" />
        <div className="note-content">
          <h4>
            SECRET
            <br />
            RECIPE
          </h4>
          <span>눌러보세요!</span>
        </div>
      </div>
      
      {/*
        4) 중앙 컨텐츠(오븐 업로더)
        - Container: 가운데 정렬 + 최대 폭 제한
        - OvenUploader: 사용자가 PNG 파일을 업로드하는 핵심 UI
      */}
      <Container maxWidth="sm" className="content-container">
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <OvenUploader onFileSelected={handleOvenFileSelect} />
          </Box>
        </Box>
      </Container>
      
      {/*
        5) 사용법 가이드(모달)
        - openGuide가 true면 보임
        - 닫기 버튼/배경 클릭 시 handleCloseGuide로 닫힘
      */}
      <RecipeGuide open={openGuide} onClose={handleCloseGuide} />
    </div>
  );
}