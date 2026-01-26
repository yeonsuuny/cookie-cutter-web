// src/App.tsx
import React, { useState, useRef, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material"; 

import Header from "./components/Header";
import LoginDialog from "./components/LoginDialog";
import SignUpDialog from "./components/SignUpDialog";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import LibraryPage from "./pages/LibraryPage";
import { supabase } from "./supabaseClient"; // ⭐️ [추가] Supabase 클라이언트 임포트

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"landing" | "editor" | "library">("landing");
  const [libraryItems, setLibraryItems] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ⭐️ 로그인 하는 동안 파일을 잠시 맡아둘 변수
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

  // ⭐️ [추가] 백엔드와 카카오 토큰 교환하는 함수
  // 1. Supabase에서 받은 access_token을 백엔드로 보냄
  // 2. 백엔드에서 검증 후 서비스 전용 JWT를 발급해줌
  const exchangeKakaoToken = async (supabaseAccessToken: string) => {
    try {
      const response = await fetch("https://cookie-cutter-server.onrender.com/login/sns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          access_token: supabaseAccessToken // API 명세서 변수명 준수
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 백엔드 인증 성공
        console.log("백엔드 로그인 성공(Kakao):", data);
        localStorage.setItem("accessToken", data.access_token); // 토큰 저장
        setIsLoggedIn(true);
        setIsLoginOpen(false); // 로그인 창 닫기
        showSnackbar("카카오 로그인 되었습니다!", "success");

        // ⭐️ [중요] 로그인 전 대기 중이던 파일이 있다면 바로 실행
        if (pendingFile) {
            setCurrentFile(pendingFile);
            setLibraryItems((prev) => [...prev, pendingFile]);
            setCurrentPage("editor");
            setPendingFile(null); // 대기열 비우기
        }

      } else {
        // ❌ 백엔드 인증 실패
        console.error("백엔드 검증 실패:", data);
        showSnackbar(data.detail || "소셜 로그인 검증에 실패했습니다.", "error");
        // 실패 시 Supabase 세션도 꼬이지 않게 로그아웃 처리
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Token exchange error:", error);
      showSnackbar("서버 통신 중 오류가 발생했습니다.", "error");
    }
  };

  useEffect(() => {
    // 1. 기존 로컬 스토리지 토큰 확인 (새로고침 시 유지)
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
    }

    // ⭐️ 2. Supabase 인증 상태 리스너 (카카오 로그인 감지용)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Supabase 로그인은 되었지만, 아직 우리 백엔드 토큰이 없는 경우 (즉, 막 로그인한 상황)
        const localToken = localStorage.getItem("accessToken");
        if (!localToken) { 
           // 백엔드로 교환 요청 보냄
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
  }, [pendingFile]); // pendingFile이 바뀔 때도 최신 상태 참조 (클로저 문제 방지)


  // 단순 로그인 체크 (헤더 버튼용)
  const checkLogin = () => {
    if (!isLoggedIn) {
      showSnackbar("로그인이 필요한 기능입니다. 먼저 로그인해주세요!", "error");
      setIsLoginOpen(true); 
      return false; 
    }
    return true; 
  };

  // ⭐️ [수정] 로그아웃 (Supabase도 같이 로그아웃)
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Supabase 세션 종료
    localStorage.removeItem("accessToken"); // 로컬 토큰 삭제
    setIsLoggedIn(false);
    setCurrentPage("landing");
    setCurrentFile(null);
    showSnackbar("로그아웃 되었습니다.", "success");
  };

  // 파일로 시작하는 함수
  const handleStartWithFile = (file: File) => {
    // 1. 로그인이 안 되어 있다면?
    if (!isLoggedIn) {
      setPendingFile(file); // 파일을 '보류함'에 저장
      showSnackbar("로그인이 필요합니다.", "info");
      setIsLoginOpen(true); // 로그인 창 열기
      return; 
    }

    // 2. 로그인 되어 있으면 바로 시작
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
        return <EditorPage file={currentFile} onFileChange={handleStartWithFile} />;
      case "library":
        return <LibraryPage savedItems={libraryItems} onDelete={handleDeleteItem} onEdit={handleEditItem} />;
      case "landing":
      default:
        return <LandingPage onStart={handleStartWithFile} />; 
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
        isCompact={currentPage == "editor" || currentPage === "library"}
        isTransparent={currentPage === "landing"}
      />

      <LoginDialog 
        open={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }}
        
        // 이메일 로그인 성공 시 로직
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
      />
      
      <SignUpDialog 
        open={isSignUpOpen} 
        onClose={() => setIsSignUpOpen(false)} 
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