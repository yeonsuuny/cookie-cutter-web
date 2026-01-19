// src/App.tsx
import React, { useState, useRef } from "react";
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
  
  // ⭐️ 1. 로그인 상태 관리 (false: 비로그인, true: 로그인됨)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const headerFileInputRef = useRef<HTMLInputElement>(null);

  // ⭐️ 2. 로그인 여부 체크 함수 (가드 역할)
  const checkLogin = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다. 먼저 로그인해주세요!"); // 경고 메시지
      setIsLoginOpen(true); // 로그인 창 열기
      return false; // 통과 실패
    }
    return true; // 통과 성공
  };

  // [랜딩페이지/업로드] 파일 받아서 시작하는 함수
  const handleStartWithFile = (file: File) => {
    // ⭐️ 여기서 체크! 로그인이 안 되어 있으면 함수 종료
    if (!checkLogin()) return;

    setCurrentFile(file);
    setLibraryItems((prev) => [...prev, file]);
    setCurrentPage("editor");
  };

  // [헤더] 업로드 버튼 클릭
  const handleHeaderUploadClick = () => {
    // ⭐️ 여기서 체크!
    if (!checkLogin()) return;

    if (currentPage === "editor") {
      const confirm = window.confirm("현재 작업 중인 내용이 저장되지 않았을 수 있습니다. \n새로운 파일을 여시겠습니까?");
      if (!confirm) return;
    }
    headerFileInputRef.current?.click();
  };

  // [헤더] 보관함 클릭
  const handleLibraryClick = () => {
    // ⭐️ 여기서 체크!
    if (!checkLogin()) return;
    
    setCurrentPage("library");
  };

  // ... (기존 파일 변경 핸들러, 삭제 핸들러 등은 동일) ...
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
        // 랜딩 페이지에서도 파일 업로드 시 handleStartWithFile이 호출되므로 
        // 위에서 만든 checkLogin 로직이 자동으로 적용됩니다.
        return <LandingPage onStart={handleStartWithFile} onCheckLogin={checkLogin}/>;
    }
  };

  return (
    <>
      <input type="file" hidden ref={headerFileInputRef} accept="image/*" onChange={handleHeaderFileChange} />

      <Header 
        onLoginClick={() => setIsLoginOpen(true)} 
        onSignUpClick={() => setIsSignUpOpen(true)}
        onUploadClick={handleHeaderUploadClick} 
        onLibraryClick={handleLibraryClick} // ⭐️ 수정된 핸들러 연결
      />

      <LoginDialog 
        open={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }}
        // ⭐️ 3. 로그인 성공 시 상태를 true로 바꿔주는 함수 전달
        onLoginSuccess={() => setIsLoggedIn(true)}
      />
      <SignUpDialog open={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />

      {renderPage()}
    </>
  );
}