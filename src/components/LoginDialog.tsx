// src/components/LoginDialog.tsx
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// 이메일 검사 함수
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  // ⭐️ 추가된 부분: 로그인 성공 시 호출할 함수 타입 정의
  onLoginSuccess?: () => void;
}

export default function LoginDialog({ open, onClose, onSwitchToSignUp, onLoginSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState(false);

  const handleLogin = () => {
    if (!validateEmail(email)) {
      setEmailError(true); // 에러 상태 켜기
      return; // 함수 여기서 종료 (로그인 진행 안 함)
    }
    // (나중에 여기에 백엔드 API 호출이 들어갑니다)
    console.log("로그인 시도:", email, password);
    
    alert(`환영합니다! ${email}님.`); // 로그인 성공 알림
    
    // ⭐️ 핵심: 로그인 상태 변경 알리기
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    
    onClose(); // 창 닫기
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* ... (나머지 UI 코드는 기존 핑크 버튼 수정하신 그대로 유지) ... */}
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