// src/App.tsx
import React, { useState, useRef, useEffect } from "react";
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

  const headerFileInputRef = useRef<HTMLInputElement>(null);

  // 1. 앱 실행 시 로그인 여부 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      console.log("자동 로그인 되었습니다.");
    }
  }, []);

  // 2. 로그인 여부 체크 함수
  const checkLogin = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다. 먼저 로그인해주세요!"); 
      setIsLoginOpen(true); 
      return false; 
    }
    return true; 
  };

  // ⭐️ [추가] 로그아웃 처리 함수
  const handleLogout = () => {
    // 1. 저장된 토큰 삭제
    localStorage.removeItem("accessToken");
    // 2. 로그인 상태 끄기
    setIsLoggedIn(false);
    // 3. (선택사항) 첫 화면으로 이동 및 상태 초기화
    setCurrentPage("landing");
    setCurrentFile(null);
    
    alert("로그아웃 되었습니다.");
  };

  const handleStartWithFile = (file: File) => {
    if (!checkLogin()) return;
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
        return <LandingPage onStart={handleStartWithFile} onCheckLogin={checkLogin}/>;
    }
  };

  return (
    <>
      <input type="file" hidden ref={headerFileInputRef} accept="image/*" onChange={handleHeaderFileChange} />

      {/* ⭐️ [수정] Header에 로그인 상태와 로그아웃 함수 전달 */}
      <Header 
        onLoginClick={() => setIsLoginOpen(true)} 
        onSignUpClick={() => setIsSignUpOpen(true)}
        onUploadClick={handleHeaderUploadClick} 
        onLibraryClick={handleLibraryClick}
        
        isLoggedIn={isLoggedIn}       // ✅ 추가됨
        onLogoutClick={handleLogout}  // ✅ 추가됨
      />

      <LoginDialog 
        open={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }}
        onLoginSuccess={() => setIsLoggedIn(true)}
      />
      <SignUpDialog open={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />

      {renderPage()}
    </>
  );
}