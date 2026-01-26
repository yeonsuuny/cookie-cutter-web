// src/pages/PasswordResetPage.tsx
import { useState, useEffect } from "react";
import { Container, Paper, Typography, TextField, Button, Stack, Box } from "@mui/material";

interface PasswordResetPageProps {
  onResetSuccess: () => void; // 비밀번호 변경 완료 후 로그인 화면으로 이동 등 처리
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function PasswordResetPage({ onResetSuccess, showSnackbar }: PasswordResetPageProps) {
  const [accessToken, setAccessToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);

  // ⭐️ [API 설계서 5.2] 토큰 추출 및 URL 세탁 로직 반영
  useEffect(() => {
    // 1. URL의 해시(#) 부분 가져오기
    const hash = window.location.hash;
    
    // 2. access_token 추출
    // 해시의 첫 글자(#)를 떼고 파싱
    const params = new URLSearchParams(hash.substring(1)); 
    const token = params.get("access_token");

    if (token) {
      // 3. 토큰을 State에 저장
      setAccessToken(token);
      
      // 4. (보안) 주소창에서 토큰 흔적 지우기
      window.history.replaceState(null, "", window.location.pathname);
    } else {
        showSnackbar("유효하지 않은 접근이거나 토큰이 만료되었습니다.", "error");
    }
  }, [showSnackbar]);

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
      // ⭐️ [API 설계서 2] 비밀번호 변경 요청
      const response = await fetch("https://cookie-cutter-server.onrender.com/password/reset", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            // [API 설계서] Authorization 헤더에 토큰 포함
            "Authorization": `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ 
            new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // [API 설계서 4.1] 성공
        showSnackbar(data.message || "비밀번호가 성공적으로 변경되었습니다.", "success");
        onResetSuccess(); // 메인으로 이동
      } else {
        // [API 설계서 4.2] 실패
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

  // 토큰이 없으면 빈 화면 혹은 에러 메시지(여기서는 렌더링하되 버튼 동작 안 함)
  if (!accessToken) return (
      <Box sx={{ mt: 20, textAlign: "center" }}>
          <Typography variant="h6" color="error">유효하지 않은 링크입니다.</Typography>
      </Box>
  );

  return (
    <Container maxWidth="xs" sx={{ mt: 15 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "#5D4037" }}>
          새 비밀번호 설정
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          새로운 비밀번호를 입력해주세요.
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="새 비밀번호" type="password" fullWidth
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            sx={commonInputStyle}
          />
          <TextField
            label="비밀번호 확인" type="password" fullWidth
            value={confirmPassword} onChange={(e) => {
                setConfirmPassword(e.target.value);
                if(error) setError(false);
            }}
            error={error}
            helperText={error ? "비밀번호가 일치하지 않습니다." : ""}
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