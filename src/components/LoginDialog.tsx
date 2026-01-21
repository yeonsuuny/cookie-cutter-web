// src/components/LoginDialog.tsx
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onLoginSuccess?: () => void;
  // ⭐️ 부모에게 받은 스낵바 함수 타입 정의
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function LoginDialog({ 
  open, onClose, onSwitchToSignUp, onLoginSuccess, showSnackbar 
}: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError(true); 
      showSnackbar("올바른 이메일 형식을 입력해주세요.", "error"); // 에러 알림
      return; 
    }
    
    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 로그인 성공
        localStorage.setItem("accessToken", data.access_token);
        if (onLoginSuccess) onLoginSuccess();
        onClose(); // 모달 닫기
      } else {
        // ❌ 로그인 실패 (서버 메시지 띄우기)
        showSnackbar(data.detail || "이메일 또는 비밀번호가 틀렸습니다.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar("서버와 통신 중 오류가 발생했습니다.", "error");
    }
  };

  // ⭐️ [디자인] 공통 스타일 (갈색 테마 + 파란 배경 제거)
  const commonInputStyle = {
    "& label.Mui-focused": { color: "#8D6E63" },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": { borderColor: "#8D6E63" }
    },
    // 👇 자동완성 파란 배경 제거 핵심 코드
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px white inset",
      WebkitTextFillColor: "#000",
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
       <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        로그인
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="이메일" type="email" fullWidth variant="outlined" value={email} 
            // 커서 나갈 때 유효성 검사
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
          
          <Button 
            variant="contained" size="large" fullWidth onClick={handleLogin}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#8D6E63", "&:hover": { bgcolor: "#6D4C41" } }}
          >
            로그인하기
          </Button>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => { onClose(); onSwitchToSignUp(); }}
          >
            아직 계정이 없으신가요? 회원가입
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}