import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { supabase } from "../supabaseClient";

// =============================================================================
// [1] 유틸리티 함수
// =============================================================================
// 이메일 형식이 올바른지 검사하는 함수
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// =============================================================================
// [2] Props 인터페이스
// =============================================================================
// 부모 컴포넌트(App.tsx 등)에서 받아오는 기능들
interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onLoginSuccess?: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
  onFindPasswordClick: () => void;
}

export default function LoginDialog({
  open, onClose, onSwitchToSignUp, onLoginSuccess, showSnackbar, onFindPasswordClick
}: LoginDialogProps) {

  // ===========================================================================
  // [3] 상태 관리 (데이터 저장소)
  // ===========================================================================
  // 화면에서 사용자가 입력하는 값들을 저장하는 변수들
  const [email, setEmail] = useState("");              // 이메일 입력값
  const [password, setPassword] = useState("");        // 비밀번호 입력값
  const [emailError, setEmailError] = useState(false); // 이메일 형식이 틀렸을 때 빨간줄 표시 여부

  // ===========================================================================
  // [4] 이벤트 핸들러 (로그인 기능)
  // ===========================================================================

  // [4-1] 카카오 로그인 (Supabase 연동)
  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          scopes: 'profile_nickname profile_image',
          redirectTo: window.location.origin,
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
    // 1. 이메일 형식이 이상하면 중단
    if (!validateEmail(email)) {
      setEmailError(true);
      showSnackbar("올바른 이메일 형식을 입력해주세요.", "error");
      return;
    }

    try {
      // 2. 백엔드 서버로 아이디/비번 전송 (서버 주소 변경 시 여기 수정!)
      const response = await fetch("https://cookie-cutter-server.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. 로그인 성공 시 처리
        localStorage.setItem("accessToken", data.access_token);
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        // 4. 로그인 실패 시 처리
        showSnackbar(data.detail || "이메일 또는 비밀번호가 틀렸습니다.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar("서버와 통신 중 오류가 발생했습니다.", "error");
    }
  };

  // [디자인 스타일] 입력창 색상 설정
  const commonInputStyle = {
    // [수정 포인트] 입력창 클릭 시 라벨 색상
    "& label.Mui-focused": { color: "#8D6E63" },
    "& .MuiOutlinedInput-root": {
      // [수정 포안트] 입력창 테두리 색상
      "&.Mui-focused fieldset": { borderColor: "#8D6E63" }
    },

    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px white inset",
      WebkitTextFillColor: "#000",
    }
  };

  // ===========================================================================
  // [5] UI 렌더링 (화면에 보이는 부분)
  // ===========================================================================
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* 5-1. 헤더 (제목 + 닫기 버튼) */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between", // 제목은 왼쪽, 닫기 버튼은 오른쪽 끝으로
          alignItems: "center"
        }}>
        로그인
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Stack: 세로로 요소들을 쌓아주는 상자 */}
        <Stack
          spacing={3}     // 요소들(이메일, 비밀번호 입력칸, 로그인 버튼 등) 사이의 간격 (숫자가 클수록 넓어짐)
          sx={{ mt: 1 }}  // mt(margin-top): 헤더(로그인+닫기 버튼)과의 위쪽 여백을 조금 둠
        >

          {/* 5-2. 이메일 & 비밀번호 입력창 */}
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
            sx={{
              fontWeight: "bold",                 // 글자 굵게
              py: 1.5,                            // 버튼 높이 (세로 폭, 숫자가 크면 더 뚱뚱해짐)
              bgcolor: "#8D6E63",               // 버튼 배경 색상
              "&:hover": { bgcolor: "#6D4C41" } // 마우스 올렸을 때 변하는 색상
            }}
          >
            로그인
          </Button>

          {/* 5-4. 카카오 로그인 버튼 */}
          <Button
            variant="contained" size="large" fullWidth onClick={handleKakaoLogin}
            sx={{
              fontWeight: "bold",                  // 글자 굵게
              py: 1.5,                             // 버튼 높이 (세로 폭)
              bgcolor: "#FEE500",                // 카카오 버튼 색상
              color: "#000000",                  // 글자 색상
              "&:hover": { bgcolor: "#E6CF00" }, // 마우스 올렸을 때 변하는 색상
              mb: 1                                // mb(margin-bottom): 버튼 아래쪽 여백 - 밑에 있는 글씨랑 띄우기
            }}
          >
            카카오톡으로 시작하기
          </Button>

          {/* 5-5. 하단 링크 모음 (비밀번호 찾기 / 회원가입) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column", // 세로로 배치
              alignItems: "center",    // 가운데 정렬
              gap: 1                   // 두 링크(비번 찾기, 회원가입) 사이의 간격
            }}
          >
            {/* 비밀번호 찾기 */}
            <Typography 
              variant="body2" 
              color="text.secondary"         // 회색 글씨 (색상을 변경하고 싶으면 색상코드 입력하시면 됩니다)
              sx={{ 
                cursor: "pointer", 
                textDecoration: "underline"  // 밑줄 긋기
              }}
              onClick={() => { onClose(); onFindPasswordClick(); }}
            >
              비밀번호를 잊으셨나요?
            </Typography>
            
            {/* 회원가입 */}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                cursor: "pointer", 
                textDecoration: "underline" 
              }}
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