import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// =============================================================================
// [1] 유틸리티 함수
// =============================================================================
// 이메일 형식이 올바른지(@가 있는지 등) 검사하는 기계적인 코드
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
  // [2] 데이터 저장소
  // ===========================================================================
  // 2-1. 화면에서 변하는 값들을 저장하는 곳
  const [email, setEmail] = useState("");              // 사용자가 입력한 이메일
  const [emailError, setEmailError] = useState(false); // 이메일 형식이 틀렸을 때 빨간줄 표시 여부

  // 2-2. [기능 설정] 도배 방지를 위한 쿨타임(타이머) 관련 설정
  const [isCoolingDown, setIsCoolingDown] = useState(false); // 현재 대기 중인지 여부
  const [timeLeft, setTimeLeft] = useState(0);               // 남은 시간 (초)

  // ===========================================================================
  // [3] 타이머 자동 작동 로직
  // ===========================================================================
  // 시간이 1초씩 줄어들게 하는 코드입니다.
  // 시간이 0이 되면 쿨타임 상태를 해제합니다.
  useEffect(() => {
    let timer: number | undefined;

    if (isCoolingDown && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsCoolingDown(false); // 0초가 되면 버튼을 다시 누를 수 있게 풀어줌
    }

    return () => clearInterval(timer);
  }, [isCoolingDown, timeLeft]);

  // ===========================================================================
  // [4] 서버 전송 (이메일 보내기 버튼 클릭 시)
  // ===========================================================================
  const handleSendEmail = async () => {
    // 4-1. 이메일 주소가 이상하면 중단
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }

    // 4-2. 중복 클릭 방지 (이미 쿨타임 중이면 함수 종료)
    if (isCoolingDown) return;

    try {
      // 4-3. [설정] 서버 주소 (백엔드 주소가 바뀌면 여기를 수정하세요!)
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
        // [수정 포인트] 성공했을 때 뜨는 알림 메시지
        showSnackbar("재설정 이메일이 발송되었습니다. 메일함을 확인해주세요!", "success");
        
        // ---------------------------------------------------------------
        // 4-4. [중요 기능 수정] 재전송 대기 시간 설정 (현재: 60초)
        // 숫자를 180으로 바꾸면 3분, 30으로 바꾸면 30초 대기가 됩니다.
        // ---------------------------------------------------------------
        setIsCoolingDown(true);
        setTimeLeft(60);
        
      } else {
        // [수정 포인트] 실패했을 때 뜨는 알림 메시지
        showSnackbar(data.detail || "이메일 발송에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error("Reset password request error:", error);
      showSnackbar("서버 통신 중 오류가 발생했습니다.", "error");
    }
  };

  // ===========================================================================
  // [디자인 스타일] 입력창 색상 설정
  // ===========================================================================
  const commonInputStyle = {
    // [수정 포인트] 입력창을 클릭했을 때 라벨 색상
    "& label.Mui-focused": { color: "#8D6E63" },
    "& .MuiOutlinedInput-root": {
      // [수정 포인트] 입력창 테두리 색상
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
      {/* 5-1. 팝업창 제목 */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* [수정 포인트] 제목 텍스트 */}
        비밀번호 찾기
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 5-2. 안내 문구 */}
          <Typography variant="body2" color="text.secondary">
            {/* [수정 포인트] 안내 메시지 (<br/>은 줄바꿈입니다) */}
            가입하신 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.
            
            {/* 쿨타임 중일 때만 보이는 빨간 경고 문구 */}
            {isCoolingDown && (
              <span style={{ color: "#d32f2f", display: "block", marginTop: "8px", fontWeight: "bold" }}>
                {/* [수정 포인트] 재전송 제한 경고 메시지 */}
                ⚠️ 보안을 위해 메일 재발송은 1분 간격으로 가능합니다.
              </span>
            )}
          </Typography>

          {/* 5-3. 이메일 입력칸 */}
          <TextField
            label="이메일" // [수정 포인트] 입력칸 이름
            type="email" fullWidth variant="outlined" value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
            }} 
            error={emailError}
            // [수정 포인트] 이메일 형식이 틀렸을 때 나오는 에러 메시지
            helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
            sx={commonInputStyle}
          />
          
          {/* 5-4. 메일 보내기 버튼 */}
          <Button 
            variant="contained" size="large" fullWidth onClick={handleSendEmail}
            disabled={isCoolingDown} // 쿨타임 중이면 클릭 불가
            sx={{ 
              fontWeight: "bold",
              py: 1.5, 
              bgcolor: "#8D6E63", 
              "&:hover": { bgcolor: "#6D4C41" },
              
              // 버튼이 비활성화(클릭 불가) 되었을 때의 색상
              "&.Mui-disabled": {
                bgcolor: "#D7CCC8",
                color: "#5D4037"
              }
            }}
          >
            {/* [수정 포인트] 버튼 글씨: 대기 중일 때는 '초'가 보이고, 평소엔 '메일 보내기' */}
            {isCoolingDown ? `${timeLeft}초 후 재전송 가능` : "메일 보내기"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}