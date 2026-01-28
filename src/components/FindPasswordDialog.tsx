// src/components/FindPasswordDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// =============================================================================
// [1] 유틸리티 함수
// =============================================================================
// 이메일 형식이 올바른지 정규식으로 검사하는 함수
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

interface FindPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function FindPasswordDialog({ open, onClose, showSnackbar }: FindPasswordDialogProps) {
  // ===========================================================================
  // [2] 상태 관리 (State)
  // ===========================================================================
  // 2-1. 입력 폼 관련 상태
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  // 2-2. 쿨타임(타이머) 관련 상태 (백엔드 보안 정책 대응)
  const [isCoolingDown, setIsCoolingDown] = useState(false); // 현재 대기 중인지 여부
  const [timeLeft, setTimeLeft] = useState(0);               // 남은 시간 (초)

  // ===========================================================================
  // [3] 타이머 로직 (useEffect)
  // ===========================================================================
  // 쿨타임이 시작되면 1초마다 timeLeft를 1씩 줄입니다.
  // 시간이 0이 되면 쿨타임 상태를 해제합니다.
  useEffect(() => {
    let timer: number | undefined;

    if (isCoolingDown && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // 카운트다운 종료 시: 다시 버튼 활성화
      setIsCoolingDown(false);
    }

    // 컴포넌트가 사라지거나 재실행될 때 타이머 정리 (메모리 누수 방지)
    return () => clearInterval(timer);
  }, [isCoolingDown, timeLeft]);

  // ===========================================================================
  // [4] 이벤트 핸들러 (API 통신)
  // ===========================================================================
  const handleSendEmail = async () => {
    // 4-1. 유효성 검사 (이메일 형식 확인)
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }

    // 4-2. 중복 클릭 방지 (이미 쿨타임 중이면 함수 종료)
    if (isCoolingDown) return;

    try {
      // 4-3. 서버로 비밀번호 재설정 요청 전송
      const response = await fetch("https://cookie-cutter-server.onrender.com/password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          redirect_url: window.location.origin // 이메일 링크 클릭 시 돌아올 주소
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 4-4. 성공 시 처리
        showSnackbar("재설정 이메일이 발송되었습니다. 메일함을 확인해주세요!", "success");
        
        // 중요: 메일 발송 성공 시 60초 쿨타임 시작 (학대 방지)
        setIsCoolingDown(true);
        setTimeLeft(60);
        
      } else {
        // 4-5. 실패 시 처리 (서버 에러 메시지 표시)
        showSnackbar(data.detail || "이메일 발송에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error("Reset password request error:", error);
      showSnackbar("서버 통신 중 오류가 발생했습니다.", "error");
    }
  };

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
      {/* 5-1. 다이얼로그 헤더 (제목 + 닫기 버튼) */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        비밀번호 찾기
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 5-2. 안내 문구 영역 */}
          <Typography variant="body2" color="text.secondary">
            가입하신 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.
            
            {/* 조건부 렌더링: 쿨타임 중일 때만 경고 문구 표시 */}
            {isCoolingDown && (
              <span style={{ color: "#d32f2f", display: "block", marginTop: "8px", fontWeight: "bold" }}>
                ⚠️ 보안을 위해 메일 재발송은 1분 간격으로 가능합니다.
              </span>
            )}
          </Typography>

          {/* 5-3. 이메일 입력 필드 */}
          <TextField
            label="이메일" type="email" fullWidth variant="outlined" value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
            }} 
            error={emailError}
            helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
            sx={commonInputStyle}
          />
          
          {/* 5-4. 전송 버튼 (상태에 따라 모양/텍스트 변경) */}
          <Button 
            variant="contained" size="large" fullWidth onClick={handleSendEmail}
            
            // 쿨타임 중이면 버튼 비활성화 (클릭 불가)
            disabled={isCoolingDown}
            sx={{ 
              fontWeight: "bold", py: 1.5, 
              bgcolor: "#8D6E63", 
              "&:hover": { bgcolor: "#6D4C41" },
              
              // 비활성화 상태 스타일
              "&.Mui-disabled": {
                bgcolor: "#D7CCC8",
                color: "#5D4037"
              }
            }}
          >
            {/* 쿨타임 중이면 남은 시간 표시, 아니면 기본 텍스트 표시 */}
            {isCoolingDown ? `${timeLeft}초 후 재전송 가능` : "메일 보내기"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}