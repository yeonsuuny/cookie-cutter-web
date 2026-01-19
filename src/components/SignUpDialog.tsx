// src/components/SignUpDialog.tsx
import React, { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Button, 
  Stack, 
  IconButton 
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
  
  // ⭐️ 에러 상태 관리 (이메일, 비밀번호 불일치)
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSignUp = () => {
    let hasError = false;

    // 1. 이메일 형식 체크
    if (!validateEmail(email)) {
      setEmailError(true);
      hasError = true;
    }

    // 2. 비밀번호 일치 체크
    // (비밀번호가 비어있지 않은지도 체크하면 더 좋습니다)
    if (password !== confirmPassword || password === "") {
      setPasswordError(true);
      hasError = true;
    }

    // 에러가 하나라도 있으면 가입 중단
    if (hasError) return;

    // 성공 시 로직
    console.log("회원가입 시도:", email);
    alert("회원가입이 완료되었습니다!"); // 가입 성공 알림은 팝업이 좋습니다
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        회원가입
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          
          {/* 이메일 입력 */}
          <TextField
            label="이메일"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false); // 타이핑 시 에러 해제
            }}
            error={emailError}
            helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
          />
          
          {/* 비밀번호 입력 */}
          <TextField
            label="비밀번호"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(false); // 비밀번호 바꾸면 에러 해제
            }}
          />

          {/* 비밀번호 확인 입력 (여기에 에러 표시) */}
          <TextField
            label="비밀번호 확인"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordError) setPasswordError(false); // 확인란 바꾸면 에러 해제
            }}
            error={passwordError}
            helperText={passwordError ? "비밀번호가 일치하지 않습니다." : ""}
          />
          
          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={handleSignUp}
            sx={{ 
              fontWeight: "bold", 
              py: 1.5,
              bgcolor: "#ff8fa3",             
              "&:hover": { bgcolor: "#ff758f" } 
            }}
          >
            가입하기
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}