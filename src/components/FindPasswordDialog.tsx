// src/components/FindPasswordDialog.tsx
import { useState, useEffect } from "react"; // ⭐️ useEffect 추가
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  // ⭐️ [추가] 쿨타임 관련 상태
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // ⭐️ [추가] 타이머 로직
  useEffect(() => {
    let timer: number | undefined; // NodeJS.Timeout 타입 호환용

    if (isCoolingDown && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // 시간이 다 되면 쿨타임 해제
      setIsCoolingDown(false);
    }

    return () => clearInterval(timer);
  }, [isCoolingDown, timeLeft]);

  const handleSendEmail = async () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }

    // ⭐️ [보호] 혹시라도 버튼이 활성화되어 있어도 쿨타임 중이면 함수 종료
    if (isCoolingDown) return;

    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          redirect_url: window.location.origin 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("재설정 이메일이 발송되었습니다. 메일함을 확인해주세요!", "success");
        
        // ⭐️ [변경] 성공 시 창을 닫지 않고 쿨타임 시작 (UX 선택 사항)
        // 백엔드 요청대로 "1분을 기다려야 함"을 인지시키기 위해 창을 닫지 않는 것이 좋을 수 있습니다.
        // 만약 창을 닫고 싶다면 onClose()를 호출하되, 
        // 쿨타임 로직은 이 컴포넌트가 언마운트되면 사라지므로 
        // "전송 완료" 메시지만 띄우고 창을 닫는 것이 일반적이긴 합니다.
        // 여기서는 "버튼 비활성화"를 보여주기 위해 창을 유지하고 안내 메시지를 띄우는 방식으로 구현했습니다.
        
        setIsCoolingDown(true);
        setTimeLeft(60); // 60초 설정
        
        // 이메일 입력창은 비워주거나 유지할 수 있습니다. (여기선 유지하여 오타 수정 가능하게 함)
      } else {
        showSnackbar(data.detail || "이메일 발송에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error("Reset password request error:", error);
      showSnackbar("서버 통신 중 오류가 발생했습니다.", "error");
    }
  };

  // ⭐️ [추가] 다이얼로그가 닫혔다 열릴 때 상태 초기화 여부 결정
  // (필요 시 주석 해제: 다이얼로그 닫으면 타이머 리셋하려면 아래 코드 사용)
  /*
  useEffect(() => {
    if (!open) {
      // setIsCoolingDown(false);
      // setTimeLeft(0);
    }
  }, [open]);
  */

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        비밀번호 찾기
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            가입하신 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.
            {/* ⭐️ [추가] 안내 문구 */}
            {isCoolingDown && (
              <span style={{ color: "#d32f2f", display: "block", marginTop: "8px", fontWeight: "bold" }}>
                ⚠️ 보안을 위해 메일 재발송은 1분 간격으로 가능합니다.
              </span>
            )}
          </Typography>

          <TextField
            label="이메일" type="email" fullWidth variant="outlined" value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
            }} 
            error={emailError}
            helperText={emailError ? "올바른 이메일 형식이 아닙니다." : ""}
            sx={commonInputStyle}
            // ⭐️ [선택] 쿨타임 중에는 이메일 수정도 막으려면 disabled={isCoolingDown} 추가
          />
          
          <Button 
            variant="contained" size="large" fullWidth onClick={handleSendEmail}
            // ⭐️ [핵심] 쿨타임 중이면 버튼 비활성화
            disabled={isCoolingDown}
            sx={{ 
              fontWeight: "bold", py: 1.5, 
              bgcolor: "#8D6E63", 
              "&:hover": { bgcolor: "#6D4C41" },
              // 비활성화 상태 스타일 (MUI 기본값 덮어쓰기 필요 시)
              "&.Mui-disabled": {
                bgcolor: "#D7CCC8",
                color: "#5D4037"
              }
            }}
          >
            {/* ⭐️ [핵심] 텍스트 변경 로직 */}
            {isCoolingDown ? `${timeLeft}초 후 재전송 가능` : "메일 보내기"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}