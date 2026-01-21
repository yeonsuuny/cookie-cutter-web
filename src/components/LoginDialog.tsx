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
}

export default function LoginDialog({ open, onClose, onSwitchToSignUp, onLoginSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);

  // ⭐️ async 추가
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError(true); 
      return; 
    }
    
    // ⭐️ 실제 로그인 API 호출
    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 성공 시 (200 OK) - 토큰 저장 [cite: 7]
        // LocalStorage에 토큰 저장 (설계서 권장사항)
        localStorage.setItem("accessToken", data.access_token);
        
        console.log("로그인 성공, 토큰:", data.access_token);
        alert(`환영합니다! ${email}님.`); 
        
        // 로그인 상태 변경 알리기
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        onClose(); 
      } else {
        // 실패 시 (400/500 Error) [cite: 7]
        alert(data.detail || "이메일 또는 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* UI 부분은 변경 없음 */}
       <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        로그인
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField label="이메일" type="email" fullWidth variant="outlined" value={email} onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(false);
          }} 
          error={emailError}
          helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
          />
          <TextField label="비밀번호" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <Button 
            variant="contained" size="large" fullWidth onClick={handleLogin}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#ff8fa3", "&:hover": { bgcolor: "#ff758f" } }}
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