// src/App.tsx
import React, { useState, useRef, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material"; 

import Header from "./components/Header";
import LoginDialog from "./components/LoginDialog";
import SignUpDialog from "./components/SignUpDialog";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import LibraryPage from "./pages/LibraryPage";

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"landing" | "editor" | "library">("landing");
  const [libraryItems, setLibraryItems] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ⭐️ [추가] 로그인 하는 동안 파일을 잠시 맡아둘 변수
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");

  const headerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      console.log("자동 로그인 되었습니다.");
    }
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error" | "info" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // 단순 로그인 체크 (헤더 버튼용)
  const checkLogin = () => {
    if (!isLoggedIn) {
      showSnackbar("로그인이 필요한 기능입니다. 먼저 로그인해주세요!", "error");
      setIsLoginOpen(true); 
      return false; 
    }
    return true; 
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setCurrentPage("landing");
    setCurrentFile(null);
  };

  // ⭐️ [수정] 파일로 시작하는 함수 (핵심!)
  const handleStartWithFile = (file: File) => {
    // 1. 로그인이 안 되어 있다면?
    if (!isLoggedIn) {
      setPendingFile(file); // ⭐️ 파일을 '보류함'에 저장!
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
    // 헤더 업로드는 파일이 없는 상태에서 누르는 거라 그냥 체크만 함
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
        return <LandingPage onStart={handleStartWithFile} />; // ⭐️ onCheckLogin 삭제 (LandingPage가 신경 안 써도 됨)
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
        
        // ⭐️ [수정] 로그인 성공 시 로직
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          
          // 만약 아까 맡겨둔 파일(pendingFile)이 있다면?
          if (pendingFile) {
            setCurrentFile(pendingFile);
            setLibraryItems((prev) => [...prev, pendingFile]);
            setCurrentPage("editor"); // 바로 에디터로 이동!
            setPendingFile(null);     // 보관함 비우기
          } 
          // 맡겨둔 파일 없으면 그냥 조용히 성공
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