// src/components/FindPasswordDialog.tsx
import { useState } from "react";
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

  const handleSendEmail = async () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }

    try {
      // ⭐️ [API 설계서 1] 비밀번호 재설정 메일 발송
      // redirect_url: 메일 내 링크 클릭 시 이동할 프론트엔드 주소 (현재 사이트 도메인)
      const response = await fetch("https://cookie-cutter-server.onrender.com/password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          redirect_url: window.location.origin // 예: http://localhost:5173
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // [API 설계서 4.1] 성공 시 메시지
        showSnackbar("재설정 이메일이 발송되었습니다. 메일함을 확인해주세요!", "success");
        onClose();
        setEmail(""); // 입력창 초기화
      } else {
        // [API 설계서 4.2] 실패 시 메시지
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
          />
          
          <Button 
            variant="contained" size="large" fullWidth onClick={handleSendEmail}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#8D6E63", "&:hover": { bgcolor: "#6D4C41" } }}
          >
            메일 보내기
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}