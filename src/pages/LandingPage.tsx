// src/pages/LandingPage.tsx
import React, { useRef, useState } from "react"; 
import { Box, Container, Typography, Paper, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface LandingPageProps {
  onStart: (file: File) => void;
  onCheckLogin: () => boolean;
}

export default function LandingPage({ onStart, onCheckLogin }: LandingPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- 기존 기능 로직 (유지) ---
  const handleUploadClick = () => {
    if (!onCheckLogin()) return; 
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onStart(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!onCheckLogin()) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onStart(file);
    }
  };

  return (
    // 전체 배경 (나중에 여기에 움직이는 그라데이션을 넣을 예정)
    <Box sx={{ 
      minHeight: "calc(100vh - 72px)", // 헤더 높이 뺌
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      bgcolor: "#FFF9F0" // 아주 연한 쿠키 배경색 (임시)
    }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
      />
      
      <Container maxWidth="sm"> {/* 너비를 좀 좁혀서 중앙 집중 */}
        <Box sx={{ textAlign: "center" }}>
          
          {/* 1. 텍스트 영역 */}
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#5D4037", fontFamily: "'Jua', sans-serif" }}>
            🍪 나만의 쿠키 커터 만들기
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: "#8D6E63", fontSize: "1.1rem", fontFamily: "'Jua', sans-serif" }}>
            이미지를 넣으면 3D 모델로 구워드려요!
          </Typography>

          {/* 2. 업로드 박스 영역 */}
          <Paper
            elevation={0}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={handleUploadClick}
            sx={{
              p: 6, 
              borderRadius: 6, 
              transition: "0.3s", 
              cursor: "pointer",
              border: isDragging ? "3px dashed #FF7043" : "3px dashed #D7CCC8", // 쿠키색 테두리
              bgcolor: isDragging ? "#FFF3E0" : "rgba(255, 255, 255, 0.6)", // 평소엔 반투명
              backdropFilter: "blur(10px)", // 유리 효과
              transform: isDragging ? "scale(1.02)" : "none",
              "&:hover": { 
                borderColor: "#FFAB91", 
                bgcolor: "#FFF8E1", 
                transform: "translateY(-5px)" 
              },
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 72, color: isDragging ? "#FF7043" : "#D7CCC8", mb: 2 }} />
            
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#5D4037", mb: 1, fontFamily: "'Jua', sans-serif" }}>
              {isDragging ? "반죽(파일)을 놓으세요!" : "이미지 업로드"} 
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontFamily: "'Jua', sans-serif" }}>
              {isDragging ? "바로 3D로 변환됩니다" : "클릭하거나 파일을 드래그하세요"}
            </Typography>
            
            <Button 
              variant="contained" 
              size="large" 
              onClick={(e) => { e.stopPropagation(); handleUploadClick(); }} 
              sx={{ 
                borderRadius: 99, 
                px: 6, 
                py: 1.5, 
                fontSize: "1.2rem", 
                fontWeight: "bold", 
                bgcolor: "#FF7043", 
                fontFamily: "'Jua', sans-serif",
                "&:hover": { bgcolor: "#F4511E" }, 
                pointerEvents: "none" // 버튼 클릭이 Paper 클릭으로 전달되게
              }}
            >
              Start Now
            </Button>
          </Paper>

        </Box>
      </Container>
    </Box>
  );
}