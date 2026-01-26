// src/pages/PasswordResetPage.tsx
import { useState } from "react";
import { Container, Paper, Typography, TextField, Button, Stack } from "@mui/material";

interface PasswordResetPageProps {
  onResetSuccess: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
  // ⭐️ [중요] 부모로부터 토큰을 받음
  accessToken: string; 
}

export default function PasswordResetPage({ onResetSuccess, showSnackbar, accessToken }: PasswordResetPageProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword || newPassword === "") {
        setError(true);
        showSnackbar("비밀번호가 일치하지 않습니다.", "error");
        return;
    }

    if (!accessToken) {
        showSnackbar("인증 토큰이 없습니다. 링크를 다시 확인해주세요.", "error");
        return;
    }

    try {
      // ⭐️ [설계서 준수] POST 요청 + 헤더에 토큰 + 바디에 비번
      const response = await fetch("https://cookie-cutter-server.onrender.com/password/reset", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar(data.message || "비밀번호가 성공적으로 변경되었습니다.", "success");
        onResetSuccess();
      } else {
        showSnackbar(data.detail || "비밀번호 변경에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error("Reset error:", error);
      showSnackbar("서버 통신 중 오류가 발생했습니다.", "error");
    }
  };

  const commonInputStyle = {
    "& label.Mui-focused": { color: "#8D6E63" },
    "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#8D6E63" } }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 15 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "#5D4037" }}>
          새 비밀번호 설정
        </Typography>
        <Stack spacing={3} sx={{ mt: 3 }}>
          <TextField
            label="새 비밀번호" type="password" fullWidth
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            sx={commonInputStyle}
          />
          <TextField
            label="비밀번호 확인" type="password" fullWidth
            value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(false); }}
            error={error} helperText={error ? "비밀번호가 일치하지 않습니다." : ""}
            sx={commonInputStyle}
          />
          <Button 
            variant="contained" size="large" fullWidth onClick={handleResetPassword}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#8D6E63", "&:hover": { bgcolor: "#6D4C41" } }}
          >
            변경 완료
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}