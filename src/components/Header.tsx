import { AppBar, Toolbar, Box, Button } from "@mui/material";

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onUploadClick: () => void;
  onLibraryClick: () => void;
}

export default function Header({ onLoginClick, onSignUpClick, onUploadClick, onLibraryClick }: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="default"
      sx={{
        borderBottom: "1px solid #eee",
        bgcolor: "#FFE6E6", // 헤더 배경색
      }}
    >
      <Toolbar
        sx={{
          height: 100,
          px: { xs: 2, md: 5 },
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left: Logo */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 160 }}>
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img
              // 👇 파일명을 업로드하신 파일명으로 변경하세요
              // (public 폴더에 '쓰리딜라잇로고.png'가 있어야 합니다)
              src="/쓰리딜라잇로고.png" 
              alt="3Delight logo"
              style={{ 
                height: 100,
                // 👇 이 부분이 핵심입니다! (흰 배경을 투명하게 만듦)
                mixBlendMode: "multiply" 
              }}
            />
          </a>
        </Box>

        {/* Center: Nav */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start", pl: 5, gap: 3 }}>
          <Button 
            color="inherit" 
            onClick={onUploadClick}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "1.2rem" }}
          >
            업로드
          </Button>
          
          <Button 
            color="inherit" 
            href="https://smartstore.naver.com/3dlight"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "1.2rem" }}
          >
            샵
          </Button>

          <Button 
            onClick={onLibraryClick} 
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "1.2rem", color: "#333" }}
          >
            보관함
          </Button>
        </Box>

        {/* Right: Auth */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 160, justifyContent: "flex-end" }}>
          <Button onClick={onLoginClick} sx={{ textTransform: "none", fontWeight: 600, fontSize: "1.0rem", color: "#333" }}>
            로그인
          </Button>
          <Button
            variant="contained"
            onClick={onSignUpClick}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1.0rem",
              borderRadius: 2,
              px: 2,
              py: 0.9,
              bgcolor: "#ff8fa3", 
              "&:hover": { bgcolor: "#ff758f" }
            }}
          >
            가입
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}