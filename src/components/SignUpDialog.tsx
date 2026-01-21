// src/components/SignUpDialog.tsx
import { useState } from "react";
import { 
  Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// 이메일 정규식 검사 함수
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

interface SignUpDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SignUpDialog({ open, onClose }: SignUpDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // ⭐️ async 키워드 추가 (API 호출을 위해 비동기 함수로 변경)
  const handleSignUp = async () => {
    let hasError = false;

    // 1. 이메일 형식 체크
    if (!validateEmail(email)) {
      setEmailError(true);
      hasError = true;
    }

    // 2. 비밀번호 일치 체크
    if (password !== confirmPassword || password === "") {
      setPasswordError(true);
      hasError = true;
    }

    if (hasError) return;

    // ⭐️ 3. 실제 API 호출 (백엔드 서버로 데이터 전송)
    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/register", {
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
        // 성공 (200 OK) [cite: 4]
        alert("회원가입이 완료되었습니다! 로그인 해주세요.");
        onClose(); 
      } else {
        // 실패 (400/500 Error) - 예: 이미 등록된 이메일 [cite: 4]
        alert(data.detail || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* UI 부분은 변경 없음 */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        회원가입
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="이메일" type="email" fullWidth value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(false); }}
            error={emailError} helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
          />
          <TextField
            label="비밀번호" type="password" fullWidth value={password}
            onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(false); }}
          />
          <TextField
            label="비밀번호 확인" type="password" fullWidth value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(false); }}
            error={passwordError} helperText={passwordError ? "비밀번호가 일치하지 않습니다." : ""}
          />
          
          <Button 
            variant="contained" size="large" fullWidth onClick={handleSignUp}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#ff8fa3", "&:hover": { bgcolor: "#ff758f" } }}
          >
            가입하기
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}