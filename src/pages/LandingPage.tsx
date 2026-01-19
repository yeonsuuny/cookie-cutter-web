// src/pages/LandingPage.tsx
import React, { useRef, useState } from "react"; 
import { Box, Container, Typography, Paper, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface LandingPageProps {
  onStart: (file: File) => void;
  // ⭐️ [추가] 로그인 체크 함수를 받아옵니다
  onCheckLogin: () => boolean;
}

export default function LandingPage({ onStart, onCheckLogin }: LandingPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ⭐️ [수정] 클릭 시 로그인 여부를 먼저 확인합니다
  const handleUploadClick = () => {
    // 로그인이 안 되어 있다면(false), 여기서 멈춤 (App.tsx에서 알림창 띄움)
    if (!onCheckLogin()) return; 
    
    // 로그인이 되어 있다면 파일 창 열기
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

  // ⭐️ [수정] 드래그 앤 드롭 시에도 로그인 체크
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    // 드롭했을 때도 로그인이 필요하면 막아야 함
    if (!onCheckLogin()) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onStart(file);
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 72px)", bgcolor: "white", display: "flex", alignItems: "center" }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
      />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "center", gap: { xs: 6, md: 0 } }}>
          
          <Box sx={{ flex: 1, display: "flex", justifyContent: { xs: "center", md: "flex-end" }, pt: { md: 20 }, pr: { md: 2 } }}> 
            <Box component="img" src="/Pointing.png" alt="안내 캐릭터" sx={{ maxWidth: "100%", height: "auto", maxHeight: { xs: 200, md: 300 }, objectFit: "contain" }} />
          </Box>

          <Box sx={{ flex: 1.5, display: "flex", justifyContent: { xs: "center", md: "flex-start" }, width: "100%" }}>
            <Box sx={{ width: "100%", maxWidth: 600, textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#333" }}>
                🍪 쿠키 커터 메이커
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: "#666", fontSize: "1.1rem" }}>
                이미지 파일을 업로드하면 3D 모델로 변환됩니다
              </Typography>

              {/* 클릭 핸들러는 위에서 수정한 handleUploadClick이 연결되어 있음 */}
              <Paper
                elevation={0}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={handleUploadClick}
                sx={{
                  p: 6, borderRadius: 6, transition: "0.3s", cursor: "pointer",
                  border: isDragging ? "3px dashed #ff4081" : "3px dashed #FFE6E6",
                  bgcolor: isDragging ? "#fff0f5" : "#FFF9F9",
                  transform: isDragging ? "scale(1.02)" : "none",
                  "&:hover": { borderColor: "#ff8fa3", bgcolor: "#FFF0F0", transform: "translateY(-4px)" },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 72, color: isDragging ? "#ff4081" : "#ff8fa3", mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: "#333", mb: 1 }}>
                  {isDragging ? "여기에 놓으세요!" : "이미지 업로드"} 
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {isDragging ? "파일을 놓으면 바로 시작됩니다" : "파일을 드래그하거나 클릭하세요"}
                </Typography>
                <Button variant="contained" size="large" onClick={(e) => { e.stopPropagation(); handleUploadClick(); }} sx={{ borderRadius: 99, px: 6, py: 1.5, fontSize: "1.2rem", fontWeight: "bold", bgcolor: "#ff8fa3", "&:hover": { bgcolor: "#ff758f" }, pointerEvents: "none" }}>
                  Start Now
                </Button>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}