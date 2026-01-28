import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { supabase } from "../supabaseClient";

// =============================================================================
// [1] 유틸리티 함수
// =============================================================================
// 이메일 형식 유효성 검사 (Regex)
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// =============================================================================
// [2] Props 인터페이스 정의
// =============================================================================
interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;     // 회원가입 창으로 전환
  onLoginSuccess?: () => void;      // 로그인 성공 시 콜백
  showSnackbar: (message: string, severity: "success" | "error") => void;
  onFindPasswordClick: () => void;  // 비밀번호 찾기 창으로 전환
}

export default function LoginDialog({ 
  open, onClose, onSwitchToSignUp, onLoginSuccess, showSnackbar, onFindPasswordClick 
}: LoginDialogProps) {
  
  // ===========================================================================
  // [3] 상태 관리 (State)
  // ===========================================================================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);

  // ===========================================================================
  // [4] 이벤트 핸들러 (로그인 로직)
  // ===========================================================================

  // [4-1] 카카오 로그인 (Supabase OAuth)
  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          scopes: 'profile_nickname profile_image', 
          redirectTo: window.location.origin, // 로그인 후 돌아올 현재 도메인
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  // [4-2] 일반 이메일 로그인 (자체 백엔드 API 통신)
  const handleLogin = async () => {
    // 유효성 검사
    if (!validateEmail(email)) {
      setEmailError(true); 
      showSnackbar("올바른 이메일 형식을 입력해주세요.", "error"); 
      return; 
    }
    
    try {
      // 백엔드로 로그인 요청
      const response = await fetch("https://cookie-cutter-server.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 성공 시 토큰 저장 및 모달 닫기
        localStorage.setItem("accessToken", data.access_token);
        if (onLoginSuccess) onLoginSuccess();
        onClose(); 
      } else {
        // 실패 시 에러 메시지 출력
        showSnackbar(data.detail || "이메일 또는 비밀번호가 틀렸습니다.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar("서버와 통신 중 오류가 발생했습니다.", "error");
    }
  };

  // MUI TextField 공통 스타일
  const commonInputStyle = {
    "& label.Mui-focused": { color: "#8D6E63" },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": { borderColor: "#8D6E63" }
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px white inset",
      WebkitTextFillColor: "#000",
    }
  };

  // ===========================================================================
  // [5] UI 렌더링
  // ===========================================================================
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* 5-1. 헤더 (제목 + 닫기 버튼) */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        로그인
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 5-2. 입력 필드 영역 */}
          <TextField
            label="이메일" type="email" fullWidth variant="outlined" value={email} 
            onBlur={() => {
              if (email !== "" && !validateEmail(email)) setEmailError(true);
            }}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
            }} 
            error={emailError}
            helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
            sx={commonInputStyle}
          />

          <TextField 
            label="비밀번호" type="password" fullWidth variant="outlined" value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            sx={commonInputStyle}
          />
          
          {/* 5-3. 로그인 버튼 영역 */}
          <Button 
            variant="contained" size="large" fullWidth onClick={handleLogin}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#8D6E63", "&:hover": { bgcolor: "#6D4C41" } }}
          >
            로그인
          </Button>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleKakaoLogin}
            sx={{
              fontWeight: "bold",
              py: 1.5,
              bgcolor: "#FEE500", 
              color: "#000000",   
              "&:hover": { bgcolor: "#E6CF00" },
              mb: 1
            }}
          >
            카카오톡으로 시작하기
          </Button>

          {/* 5-4. 하단 링크 (비밀번호 찾기 / 회원가입) */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" 
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => { onClose(); onFindPasswordClick(); }} 
            >
              비밀번호를 잊으셨나요?
            </Typography>

            <Typography variant="body2" color="text.secondary" 
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => { onClose(); onSwitchToSignUp(); }}
            >
              아직 계정이 없으신가요? 회원가입
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}