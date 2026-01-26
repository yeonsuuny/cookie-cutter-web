// src/App.tsx
import React, { useState, useRef, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material"; 

import Header from "./components/Header";
import LoginDialog from "./components/LoginDialog";
import SignUpDialog from "./components/SignUpDialog";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import LibraryPage from "./pages/LibraryPage";
import FindPasswordDialog from "./components/FindPasswordDialog"; 
import PasswordResetPage from "./pages/PasswordResetPage";
import { supabase } from "./supabaseClient"; 

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isFindPwOpen, setIsFindPwOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"landing" | "editor" | "library" | "passwordReset">("landing");
  const [libraryItems, setLibraryItems] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");

  const headerFileInputRef = useRef<HTMLInputElement>(null);

  const showSnackbar = (message: string, severity: "success" | "error" | "info" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const exchangeKakaoToken = async (supabaseAccessToken: string) => {
    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/login/sns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          access_token: supabaseAccessToken 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("백엔드 로그인 성공(Kakao):", data);
        localStorage.setItem("accessToken", data.access_token); 
        setIsLoggedIn(true);
        setIsLoginOpen(false); 
        showSnackbar("카카오 로그인 되었습니다!", "success");

        if (pendingFile) {
            setCurrentFile(pendingFile);
            setLibraryItems((prev) => [...prev, pendingFile]);
            setCurrentPage("editor");
            setPendingFile(null); 
        }

      } else {
        console.error("백엔드 검증 실패:", data);
        showSnackbar(data.detail || "소셜 로그인 검증에 실패했습니다.", "error");
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Token exchange error:", error);
      showSnackbar("서버 통신 중 오류가 발생했습니다.", "error");
    }
  };

  useEffect(() => {
    // ⭐️ [수정됨] 잘못된 텍스트 제거 완료
    // 앱이 로드될 때 URL에 hash(#)가 있고 access_token을 포함하면 비밀번호 변경 페이지로 이동
    if (window.location.hash && window.location.hash.includes("access_token")) {
        setCurrentPage("passwordReset");
    }

    // 1. 기존 로컬 스토리지 토큰 확인
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
    }

    // 2. Supabase 인증 상태 리스너
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const localToken = localStorage.getItem("accessToken");
        if (!localToken) { 
           await exchangeKakaoToken(session.access_token);
        }
      }
      
      if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        localStorage.removeItem("accessToken");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pendingFile]); 


  const checkLogin = () => {
    if (!isLoggedIn) {
      showSnackbar("로그인이 필요한 기능입니다. 먼저 로그인해주세요!", "error");
      setIsLoginOpen(true); 
      return false; 
    }
    return true; 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); 
    localStorage.removeItem("accessToken"); 
    setIsLoggedIn(false);
    setCurrentPage("landing");
    setCurrentFile(null);
    showSnackbar("로그아웃 되었습니다.", "success");
  };

  const handleStartWithFile = (file: File) => {
    if (!isLoggedIn) {
      setPendingFile(file); 
      showSnackbar("로그인이 필요합니다.", "info");
      setIsLoginOpen(true); 
      return; 
    }

    setCurrentFile(file);
    setLibraryItems((prev) => [...prev, file]);
    setCurrentPage("editor");
  };

  const handleHeaderUploadClick = () => {
    if (!checkLogin()) return;
    if (currentPage === "editor") {
      const confirm = window.confirm("현재 작업 중인 내용이 저장되지 않았을 수 있습니다. \n새로운 파일을 여시겠습니까?");
      if (!confirm) return;
    }
    headerFileInputRef.current?.click();
  };

  const handleLibraryClick = () => {
    if (!checkLogin()) return;
    setCurrentPage("library");
  };

  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleStartWithFile(file);
    e.target.value = ""; 
  };
  
  const handleDeleteItem = (index: number) => setLibraryItems((prev) => prev.filter((_, i) => i !== index));
  const handleEditItem = (file: File) => { setCurrentFile(file); setCurrentPage("editor"); };

  const renderPage = () => {
    switch (currentPage) {
      case "editor":
        return <EditorPage file={currentFile} onFileChange={(file) => handleStartWithFile(file)} />; 
      case "library":
        return <LibraryPage savedItems={libraryItems} onDelete={handleDeleteItem} onEdit={handleEditItem} />;
      case "passwordReset":
        return (
            <PasswordResetPage 
                showSnackbar={showSnackbar}
                onResetSuccess={() => {
                    setCurrentPage("landing");
                    setIsLoginOpen(true); 
                }} 
            />
        );
      case "landing":
      default:
        return <LandingPage onStart={(file) => handleStartWithFile(file)} />;
    }
  };

  return (
    <>
      <input type="file" hidden ref={headerFileInputRef} accept="image/*" onChange={handleHeaderFileChange} />

      <Header 
        onLoginClick={() => setIsLoginOpen(true)} 
        onSignUpClick={() => setIsSignUpOpen(true)}
        onUploadClick={handleHeaderUploadClick} 
        onLibraryClick={handleLibraryClick}
        isLoggedIn={isLoggedIn}
        onLogoutClick={handleLogout}
        isCompact={currentPage === "editor" || currentPage === "library" || currentPage === "passwordReset"}
        isTransparent={currentPage === "landing"}
      />

      <LoginDialog 
        open={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          
          if (pendingFile) {
            setCurrentFile(pendingFile);
            setLibraryItems((prev) => [...prev, pendingFile]);
            setCurrentPage("editor");
            setPendingFile(null); 
          } 
        }}
        showSnackbar={showSnackbar}
        onFindPasswordClick={() => setIsFindPwOpen(true)}
      />
      
      <SignUpDialog 
        open={isSignUpOpen} 
        onClose={() => setIsSignUpOpen(false)} 
        showSnackbar={showSnackbar}
      />

      <FindPasswordDialog 
        open={isFindPwOpen}
        onClose={() => setIsFindPwOpen(false)}
        showSnackbar={showSnackbar}
      />
      
      {renderPage()}

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
        sx={{ bottom: { xs: 90, sm: 40 } }} 
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ 
            minWidth: '400px', 
            borderRadius: '50px',
            fontWeight: 'bold',   
            boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
            
            bgcolor: snackbarSeverity === "success" ? "#43996B" : "#FFF0F0", 
            color: snackbarSeverity === "success" ? "#fff" : "#5D4037",

            "& .MuiAlert-message": {
              padding: 0,
              width: "100%",
              textAlign: "center",
              lineHeight: "1.5",
              whiteSpace: "nowrap",
            },
            "& .MuiAlert-icon": {
              padding: 0,
              marginRight: "12px", 
              display: "flex",
              alignItems: "center",
              fontSize: "1.4rem"
            },
            "& .MuiAlert-action": {
              padding: 0,
              marginLeft: "12px",
              display: "flex",
              alignItems: "center"
            }
          }}
          icon={snackbarSeverity === "success" ? "🍪" : "⚠️"}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}