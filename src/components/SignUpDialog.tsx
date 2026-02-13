import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * =============================================================================
 * ★ [수정 가이드 - 자주 찾는 곳] ★
 * =============================================================================
 * 1. 디자인 색상(갈색) 변경
 * -> [Ctrl+F]로 "#8D6E63"을 검색해서 원하는 색상 코드로 바꾸세요.
 * * 2. 서버 주소(백엔드) 변경
 * -> 아래 [4-2]번 영역의 fetch URL을 수정하세요.
 * * 3. 알림 메시지(가입 성공/실패) 변경
 * -> 아래 [4-3], [4-4]번 영역의 한글 멘트를 수정하세요.
 * =============================================================================
 */

// =============================================================================
// [1] 유틸리티 함수
// =============================================================================
// 이메일 형식이 맞는지 검사하는 기계적인 코드입니다.
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// =============================================================================
// [2] Props 인터페이스
// =============================================================================
interface SignUpDialogProps {
  open: boolean;
  onClose: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function SignUpDialog({ open, onClose, showSnackbar }: SignUpDialogProps) {
  // ===========================================================================
  // [3] 상태 관리 (데이터 저장소)
  // ===========================================================================
  // 화면에 입력된 값들을 임시로 저장하는 변수들입니다.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 에러 상태 (입력값이 틀렸을 때 빨간 테두리를 띄우기 위함)
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // ===========================================================================
  // [4] 기능 로직 (가입 버튼 클릭 시 실행)
  // ===========================================================================
  const handleSignUp = async () => {
    let hasError = false;

    // 4-1. 입력값 검사 (이메일 형식이 맞는지, 비밀번호가 똑같은지)
    if (!validateEmail(email)) { 
      setEmailError(true); 
      hasError = true; 
    }

    // 비밀번호 일치 확인
    if (password !== confirmPassword || password === "") { 
      setPasswordError(true); 
      hasError = true; 
      // 비밀번호 다를 때 뜨는 알림 메시지
      showSnackbar("비밀번호가 일치하지 않습니다.", "error");
    }
    
    // 에러가 하나라도 있으면 API 요청 보내지 않음
    if (hasError) return;

    try {
      // 4-2. [중요] 서버로 회원가입 요청 보내기
      // 백엔드 주소가 바뀌면 따옴표 안의 주소를 수정하세요.
      const response = await fetch("https://cookie-cutter-server.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 4-3. 가입 성공했을 때 메시지
        showSnackbar(data.message || "회원가입이 완료되었습니다!", "success");
        onClose();
      } else {
        // 4-4. 가입 실패했을 때 메시지 (이미 있는 이메일 등)
        showSnackbar(data.detail || "회원가입 실패", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("오류가 발생했습니다.", "error");
    }
  };

  // ===========================================================================
  // [스타일 설정] 입력창 색상
  // ===========================================================================
  const commonInputStyle = {
    // 입력창 클릭 시 (라벨) 색상
    "& label.Mui-focused": { color: "#8D6E63" },
    // 입력창 테두리 색상
    "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#8D6E63" } },
    // 자동완성 시 배경색 변경 방지 (흰색 유지)
    "& input:-webkit-autofill": { WebkitBoxShadow: "0 0 0 1000px white inset", WebkitTextFillColor: "#000" }
  };

  // ===========================================================================
  // [5] UI 렌더링 (화면 구성)
  // ===========================================================================
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* 5-1. 헤더 (제목 + 닫기 버튼) */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* 팝업창 제목 */}
        회원가입
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          
          {/* 5-2. 이메일 입력칸 */}
          <TextField
            label="이메일" // 입력칸 이름
            type="email" fullWidth value={email}
            onChange={(e) => { 
              setEmail(e.target.value); 
              if(emailError) setEmailError(false);
            }}
            onBlur={() => { 
              if(email && !validateEmail(email)) setEmailError(true); // 포커스 잃을 때 검사
            }}
            error={emailError}
            // 이메일 형식 틀렸을 때 경고 문구
            helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
            sx={commonInputStyle} 
          />

          {/* 5-3. 비밀번호 입력칸 */}
          <TextField
            label="비밀번호" // 입력칸 이름
            type="password" fullWidth value={password}
            onChange={(e) => 
              setPassword(e.target.value)}
              sx={commonInputStyle}
          />

          {/* 5-4. 비밀번호 확인 입력칸 */}
          <TextField
            label="비밀번호 확인" // 입력칸 이름
            type="password" fullWidth value={confirmPassword}
            onChange={(e) => { 
              setConfirmPassword(e.target.value); 
              if(passwordError) setPasswordError(false); 
            }}
            onBlur={() => { 
              if(confirmPassword && password !== confirmPassword) setPasswordError(true); 
            }}
            error={passwordError}
            // 비밀번호 다를 때 경고 문구 
            helperText={passwordError ? "비밀번호가 일치하지 않습니다." : ""}
            sx={commonInputStyle}
          />
          
          {/* 5-5. 가입 완료 버튼 */}
          <Button 
            variant="contained" size="large" fullWidth onClick={handleSignUp}
            sx={{ 
              fontWeight: "bold", // 글자 굵게
              py: 1.5,            // 버튼 크기 (세로폭)

              bgcolor: "#8D6E63",                   // 버튼 배경 색상
              "&:hover": { bgcolor: "#6D4C41" } }}  // 마우스 올렸을 때 색상
          >
            {/* 버튼 글자 */}
            가입
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}