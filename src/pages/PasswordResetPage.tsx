import { useState } from "react";
import { Container, Paper, Typography, TextField, Button, Stack } from "@mui/material";

interface PasswordResetPageProps {
  onResetSuccess: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
  accessToken: string; 
}

export default function PasswordResetPage({ onResetSuccess, showSnackbar, accessToken }: PasswordResetPageProps) {
  // ===========================================================================
  // [1] 상태 관리 (입력값 저장)
  // ===========================================================================
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false); // 비밀번호 불일치 에러 상태

  // ===========================================================================
  // [2] 기능 로직 (변경 완료 버튼 클릭 시)
  // ===========================================================================
  const handleResetPassword = async () => {
    // 2-1. 비밀번호 일치 확인
    if (newPassword !== confirmPassword || newPassword === "") {
        setError(true);
        // 불일치 시 에러 메시지
        showSnackbar("비밀번호가 일치하지 않습니다.", "error");
        return;
    }

    // 2-2. 토큰 유무 확인
    if (!accessToken) {
        showSnackbar("인증 토큰이 없습니다. 링크를 다시 확인해주세요.", "error");
        return;
    }

    try {
      // =======================================================================
      // [3] 서버 전송 (백엔드 주소 수정하는 곳)
      // =======================================================================
      // 주소가 바뀌면 따옴표 안의 URL을 수정하세요.
      const response = await fetch("https://cookie-cutter-server.onrender.com/password/reset", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            // 이 토큰이 있어야 서버가 "누가 비밀번호를 바꾸는지" 알 수 있습니다
            "Authorization": `Bearer ${accessToken}` 
        },
        // 사용자가 입력한 새 비밀번호를 서버로 보냅니다
        body: JSON.stringify({ new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // 성공 메시지
        showSnackbar(data.message || "비밀번호가 성공적으로 변경되었습니다.", "success");
        onResetSuccess(); // 성공 후 로그인 화면으로 이동시키는 함수
      } else {
        // 실패 메시지
        showSnackbar(data.detail || "비밀번호 변경에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error("Reset error:", error);
      showSnackbar("서버 통신 중 오류가 발생했습니다.", "error");
    }
  };

  // ===========================================================================
  // [4] 스타일 설정 (입력칸 디자인) - 공통 요소
  // ===========================================================================
  const commonInputStyle = {
    // 입력창 클릭 시 라벨 색상
    "& label.Mui-focused": { color: "#8D6E63" },
    // 입력창 테두리 색상
    "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#8D6E63" } }
  };

  // ===========================================================================
  // [5] UI 렌더링 (화면 구성)
  // ===========================================================================
  return (
    // mt(marigin-top): 화면 위에서부터의 여백 (숫자를 줄이면 위로 올라감)
    <Container maxWidth="xs" sx={{ mt: 15 }}>

      {/* 흰색 배경 박스 */}
      <Paper 
        elevation={3} // 그림자 깊이
        sx={{ p: 4, borderRadius: 3, textAlign: "center" }}
      >
        {/* 제목 텍스트 */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "#5D4037" }}>
          새 비밀번호 설정
        </Typography>

        <Stack spacing={3} sx={{ mt: 3 }}>
          {/* 새 비밀번호 입력창 */}
          <TextField
            label="새 비밀번호" // 라벨 이름
            type="password" fullWidth
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            sx={commonInputStyle}
          />

          {/* 비밀번호 확인 입력창 */}
          <TextField
            label="비밀번호 확인" 
            type="password" fullWidth
            value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(false); }}
            error={error} 
            helperText={error ? "비밀번호가 일치하지 않습니다." : ""} // 에러 메시지
            sx={commonInputStyle}
          />

          {/* 변경 완료 버튼 */}
          <Button 
            variant="contained" size="large" fullWidth onClick={handleResetPassword}
            sx={{ 
              fontWeight: "bold",                     // 글자 굵게
              py: 1.5,                                // 버튼 크기 (세로폭)
              bgcolor: "#8D6E63",                   // 버튼 배경색
              "&:hover": { bgcolor: "#6D4C41" } }}  // 마우스 올렸을 때 색상
          >
            {/* 버튼 글자 */}
            변경 완료
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}