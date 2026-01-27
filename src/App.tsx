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
  
  // ⭐️ [중요] 토큰을 저장해둘 변수 (시계 오류/새로고침 방지용)
  const [resetToken, setResetToken] = useState<string>("");

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
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // 카카오 토큰 교환
  const exchangeKakaoToken = async (supabaseAccessToken: string) => {
    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/login/sns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: supabaseAccessToken }),
      });
      const data = await response.json();
      if (response.ok) {
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
        await supabase.auth.signOut();
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    // ⭐️ [수정됨] 토큰이 있고, 동시에 "type=recovery"라는 표시가 있을 때만 재설정 페이지로 이동
    // 카카오 로그인은 type=recovery가 없으므로 이 조건문에 걸리지 않음!
    if (
        window.location.hash && 
        window.location.hash.includes("access_token") && 
        window.location.hash.includes("type=recovery") 
    ) {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");

        if (token) {
            setResetToken(token);
            setCurrentPage("passwordReset");
            // 주소창 청소
            window.history.replaceState(null, "", window.location.pathname);
            return; // ⭐️ 중요: 여기서 함수 종료 (아래 로그인 로직과 섞이지 않게)
        }
    }

    const token = localStorage.getItem("accessToken");
    if (token) setIsLoggedIn(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const localToken = localStorage.getItem("accessToken");
        if (!localToken) await exchangeKakaoToken(session.access_token);
      }
      if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        localStorage.removeItem("accessToken");
      }
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, [pendingFile]); 

  // ... (나머지 핸들러 함수들 기존과 동일) ...
  const checkLogin = () => { if (!isLoggedIn) { setIsLoginOpen(true); return false; } return true; };
  const handleLogout = async () => { await supabase.auth.signOut(); localStorage.removeItem("accessToken"); setIsLoggedIn(false); setCurrentPage("landing"); setCurrentFile(null); };
  const handleStartWithFile = (file: File) => { if (!isLoggedIn) { setPendingFile(file); setIsLoginOpen(true); return; } setCurrentFile(file); setLibraryItems((prev) => [...prev, file]); setCurrentPage("editor"); };
  const handleHeaderUploadClick = () => { if (!checkLogin()) return; headerFileInputRef.current?.click(); };
  const handleLibraryClick = () => { if (!checkLogin()) return; setCurrentPage("library"); };
  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleStartWithFile(file); e.target.value = ""; };
  const handleDeleteItem = (index: number) => setLibraryItems((prev) => prev.filter((_, i) => i !== index));
  const handleEditItem = (file: File) => { setCurrentFile(file); setCurrentPage("editor"); };

  const renderPage = () => {
    switch (currentPage) {
      case "editor": return <EditorPage file={currentFile} onFileChange={(file) => handleStartWithFile(file)} />; 
      case "library": return <LibraryPage savedItems={libraryItems} onDelete={handleDeleteItem} onEdit={handleEditItem} />;
      
      // ⭐️ [변경] 추출한 토큰(resetToken)을 props로 전달
      case "passwordReset":
        return (
            <PasswordResetPage 
                showSnackbar={showSnackbar}
                accessToken={resetToken} 
                onResetSuccess={() => {
                    setCurrentPage("landing");
                    setIsLoginOpen(true); 
                }} 
            />
        );
      case "landing":
      default: return <LandingPage onStart={(file) => handleStartWithFile(file)} />;
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
      <LoginDialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSwitchToSignUp={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }} onLoginSuccess={() => { setIsLoggedIn(true); if (pendingFile) { setCurrentFile(pendingFile); setLibraryItems((prev) => [...prev, pendingFile]); setCurrentPage("editor"); setPendingFile(null); } }} showSnackbar={showSnackbar} onFindPasswordClick={() => setIsFindPwOpen(true)} />
      <SignUpDialog open={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} showSnackbar={showSnackbar} />
      <FindPasswordDialog open={isFindPwOpen} onClose={() => setIsFindPwOpen(false)} showSnackbar={showSnackbar} />
      {renderPage()}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ bottom: { xs: 90, sm: 40 } }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
}