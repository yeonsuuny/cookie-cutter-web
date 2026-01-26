// src/components/LoginDialog.tsx
import { useState } from "react";
// 1. Box 추가됨 👇
import { Dialog, DialogTitle, DialogContent, TextField, Button, Stack, IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { supabase } from "../supabaseClient";

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onLoginSuccess?: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
  onFindPasswordClick: () => void;
}

// 2. onFindPasswordClick 추가됨 👇
export default function LoginDialog({ 
  open, onClose, onSwitchToSignUp, onLoginSuccess, showSnackbar, onFindPasswordClick 
}: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);

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

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError(true); 
      showSnackbar("올바른 이메일 형식을 입력해주세요.", "error"); 
      return; 
    }
    
    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access_token);
        if (onLoginSuccess) onLoginSuccess();
        onClose(); 
      } else {
        showSnackbar(data.detail || "이메일 또는 비밀번호가 틀렸습니다.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar("서버와 통신 중 오류가 발생했습니다.", "error");
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
        로그인
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
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
          
          <Button 
            variant="contained" size="large" fullWidth onClick={handleLogin}
            sx={{ fontWeight: "bold", py: 1.5, bgcolor: "#8D6E63", "&:hover": { bgcolor: "#6D4C41" } }}
          >
            로그인
          </Button>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleKakaoLogin}
            sx={{
              fontWeight: "bold",
              py: 1.5,
              bgcolor: "#FEE500", 
              color: "#000000",   
              "&:hover": { bgcolor: "#E6CF00" },
              mb: 1
            }}
          >
            카카오톡으로 시작하기
          </Button>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" 
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => { onClose(); onFindPasswordClick(); }} 
            >
              비밀번호를 잊으셨나요?
            </Typography>

            <Typography variant="body2" color="text.secondary" 
              sx={{ cursor: "pointer", textDecoration: "underline" }}
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