// src/components/SignUpDialog.tsx
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

interface SignUpDialogProps {
  open: boolean;
  onClose: () => void;
  // ⭐️ 스낵바 함수 받기
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function SignUpDialog({ open, onClose, showSnackbar }: SignUpDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSignUp = async () => {
    let hasError = false;
    if (!validateEmail(email)) { setEmailError(true); hasError = true; }
    if (password !== confirmPassword || password === "") { 
      setPasswordError(true); 
      hasError = true; 
      showSnackbar("비밀번호가 일치하지 않습니다.", "error"); // 즉시 피드백
    }
    if (hasError) return;

    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 회원가입 성공: 초록색 스낵바로 서버 메시지 출력
        showSnackbar(data.message || "회원가입이 완료되었습니다!", "success");
        onClose();
      } else {
        // ❌ 실패: 빨간색 스낵바
        showSnackbar(data.detail || "회원가입 실패", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("오류가 발생했습니다.", "error");
    }
  };

  const commonInputStyle = {
    "& label.Mui-focused": { color: "#8D6E63" },
    "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#8D6E63" } },
    "& input:-webkit-autofill": { WebkitBoxShadow: "0 0 0 1000px white inset", WebkitTextFillColor: "#000" }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        회원가입
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="이메일" type="email" fullWidth value={email}
            onChange={(e) => { setEmail(e.target.value); if(emailError) setEmailError(false); }}
            onBlur={() => { if(email && !validateEmail(email)) setEmailError(true); }}
            error={emailError} helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
            sx={commonInputStyle}
          />
          <TextField
            label="비밀번호" type="password" fullWidth value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={commonInputStyle}
          />
          <TextField
            label="비밀번호 확인" type="password" fullWidth value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if(passwordError) setPasswordError(false); }}
            onBlur={() => { if(confirmPassword && password !== confirmPassword) setPasswordError(true); }}
            error={passwordError} helperText={passwordError ? "비밀번호가 일치하지 않습니다." : ""}
            sx={commonInputStyle}
          />
          
          <Button 
            variant="contained" size="large" fullWidth onClick={handleSignUp}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#8D6E63", "&:hover": { bgcolor: "#6D4C41" } }}
          >
            가입하기
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}