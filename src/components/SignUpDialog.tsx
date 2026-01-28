import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
interface SignUpDialogProps {
  open: boolean;
  onClose: () => void;
  // 부모 컴포넌트(App.tsx)로부터 받은 스낵바(알림창) 제어 함수
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function SignUpDialog({ open, onClose, showSnackbar }: SignUpDialogProps) {
  // ===========================================================================
  // [3] 상태 관리 (State)
  // ===========================================================================
  // 3-1. 입력 데이터 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 3-2. 유효성 에러 상태 (빨간 테두리 및 에러 메시지용)
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // ===========================================================================
  // [4] 이벤트 핸들러 (회원가입 로직)
  // ===========================================================================
  const handleSignUp = async () => {
    let hasError = false;

    // 4-1. 클라이언트 측 유효성 검사
    // 이메일 형식 확인
    if (!validateEmail(email)) { 
      setEmailError(true); 
      hasError = true; 
    }
    // 비밀번호 일치 확인
    if (password !== confirmPassword || password === "") { 
      setPasswordError(true); 
      hasError = true; 
      showSnackbar("비밀번호가 일치하지 않습니다.", "error"); // 즉시 사용자 피드백
    }
    
    // 에러가 하나라도 있으면 API 요청 보내지 않음
    if (hasError) return;

    try {
      // 4-2. 서버로 회원가입 요청 전송
      const response = await fetch("https://cookie-cutter-server.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 4-3. 성공 시: 성공 메시지 표시 및 창 닫기
        showSnackbar(data.message || "회원가입이 완료되었습니다!", "success");
        onClose();
      } else {
        // 4-4. 실패 시: 서버 에러 메시지 표시 (예: 이미 존재하는 이메일 등)
        showSnackbar(data.detail || "회원가입 실패", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("오류가 발생했습니다.", "error");
    }
  };

  // MUI TextField 공통 커스텀 스타일
  const commonInputStyle = {
    "& label.Mui-focused": { color: "#8D6E63" },
    "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#8D6E63" } },
    "& input:-webkit-autofill": { WebkitBoxShadow: "0 0 0 1000px white inset", WebkitTextFillColor: "#000" }
  };

  // ===========================================================================
  // [5] UI 렌더링
  // ===========================================================================
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* 5-1. 헤더 (제목 + 닫기 버튼) */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        회원가입
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          
          {/* 5-2. 이메일 입력 필드 */}
          <TextField
            label="이메일" type="email" fullWidth value={email}
            onChange={(e) => { 
              setEmail(e.target.value); 
              if(emailError) setEmailError(false); // 타이핑 시작하면 에러 해제
            }}
            onBlur={() => { 
              if(email && !validateEmail(email)) setEmailError(true); // 포커스 잃을 때 검사
            }}
            error={emailError} helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
            sx={commonInputStyle}
          />

          {/* 5-3. 비밀번호 입력 필드 */}
          <TextField
            label="비밀번호" type="password" fullWidth value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={commonInputStyle}
          />

          {/* 5-4. 비밀번호 확인 입력 필드 */}
          <TextField
            label="비밀번호 확인" type="password" fullWidth value={confirmPassword}
            onChange={(e) => { 
              setConfirmPassword(e.target.value); 
              if(passwordError) setPasswordError(false); 
            }}
            onBlur={() => { 
              if(confirmPassword && password !== confirmPassword) setPasswordError(true); 
            }}
            error={passwordError} helperText={passwordError ? "비밀번호가 일치하지 않습니다." : ""}
            sx={commonInputStyle}
          />
          
          {/* 5-5. 가입 버튼 */}
          <Button 
            variant="contained" size="large" fullWidth onClick={handleSignUp}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#8D6E63", "&:hover": { bgcolor: "#6D4C41" } }}
          >
            가입
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}