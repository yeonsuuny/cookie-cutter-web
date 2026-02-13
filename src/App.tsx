import React, { useState, useRef, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material"; 
import localforage from "localforage"; // 브라우저 저장소(DB) 관리 라이브러리

// 컴포넌트(화면 조각들) 불러오기
import Header from "./components/Header";
import LoginDialog from "./components/LoginDialog";
import SignUpDialog from "./components/SignUpDialog";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import LibraryPage from "./pages/LibraryPage"; 
import FindPasswordDialog from "./components/FindPasswordDialog"; 
import PasswordResetPage from "./pages/PasswordResetPage";
import { supabase } from "./supabaseClient"; // 로그인 서버 연동

/**
 * =============================================================================
 * ★ [파일 설명: App.tsx] ★ 매우 중요한 코드입니다 !!
 * =============================================================================
 * 이 파일은 웹사이트의 "본체"입니다.
 * 1. 어떤 화면을 보여줄지 결정합니다. (랜딩페이지 vs 에디터 vs 보관함)
 * 2. 로그인 상태를 관리합니다. (로그인했니? 안했니?)
 * 3. 데이터를 관리합니다. (업로드한 파일, 저장된 작업물 등)
 * =============================================================================
 */

// [데이터 타입 정의]
export interface EditorSettings {
  type: string;
  size: number | string;
  minThickness: number | string;
  bladeThick: number | string;
  bladeDepth: number | string;
  supportThick: number | string;
  supportDepth: number | string;
  baseThick: number | string;
  baseDepth: number | string;
  gap: number | string;
  stampProtrusion: number | string;
  stampDepression: number | string;
  wallOffset: number | string;
  wallExtrude: number | string;
}

export interface LibraryItem {
  id: number;
  file: File;
  stlFile?: File;
  name: string;
  date: string;
  settings?: EditorSettings;
}

export default function App() {
  // ===========================================================================
  // [1] 상태 관리
  // ===========================================================================

  // 1-1. 팝업창(모달) 열림/닫힘 상태
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isFindPwOpen, setIsFindPwOpen] = useState(false);
  
  // 1-2. 화면 이동 관리 (현재 보고 있는 페이지)
  // landing(홈), editor(편집), library(보관함), passwordReset(비번변경)
  const [currentPage, setCurrentPage] = useState<"landing" | "editor" | "library" | "passwordReset">("landing");
  const [resetToken, setResetToken] = useState<string>("");

  // 1-3. 데이터 관리 (보관함 아이템, 현재 편집 중인 파일 등)
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null); 

  // 1-4. 로그인 및 알림 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 현재 로그인 상태인가?
  // 로그인하지 않은 상태로 파일을 올렸을 때, 로그인 후 이어서 작업하기 위해 잠시 저장해두는 변수
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // 1-5. 시스템 알림창 상태
  // 화면 하단에 뜨는 검은색 알림창(성공/실패 메시지)을 제어함
  const [snackbarOpen, setSnackbarOpen] = useState(false);    // 알림창이 켜져 있는가?
  const [snackbarMessage, setSnackbarMessage] = useState(""); // 알림창에 띄울 글자
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");
  
  // 1-6. 데이터 로딩 상태
  // 브라우저 저장소(localForage)에서 보관함 데이터를 다 불러왔는지 확인하는 변수
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  // 1-7. HTML 요소 직접 제어
  // 헤더에 있는 '업로드' 버튼을 눌렀을 때, 숨겨져 있는 <input type="file">을 대신 클릭하게 만드는 연결고리
  const headerFileInputRef = useRef<HTMLInputElement>(null);

  // 알림창 띄우기 함수
  const showSnackbar = (message: string, severity: "success" | "error" | "info" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // ===========================================================================
  // [2] 초기화 로직
  // ===========================================================================

  // 2-1. 앱이 켜질 때, 브라우저 저장소에서 보관함 데이터 불러오기
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const savedItems = await localforage.getItem<LibraryItem[]>("my_cookie_library");
        if (savedItems) {
          setLibraryItems(savedItems);
        }
      } catch (err) {
        console.error("보관함 불러오기 실패:", err);
      } finally {
        setIsLibraryLoaded(true);
      }
    };
    loadLibrary();
  }, []);

  // 2-2. 보관함(libraryItems)이 바뀔 때마다 자동으로 저장하기
  useEffect(() => {
    if (isLibraryLoaded) {
      localforage.setItem("my_cookie_library", libraryItems);
    }
  }, [libraryItems, isLibraryLoaded]);

  // 2-3. 카카오톡 로그인 처리 (토크 교환) - 백엔드 로직
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

        // 로그인 전에 올리려던 파일이 있으면 이어서 진행
        if (pendingFile) {
            handleStartWithFile(pendingFile); 
            setPendingFile(null); 
        }
      } else {
        await supabase.auth.signOut();
      }
    } catch (error) { console.error(error); }
  };

  // 2-4. 로그인 상태 유지 및 링크 접속 확인
  useEffect(() => {
    // 비밀번호 재설정 이메일 링크를 통해 접속했는지 확인
    if (window.location.hash && window.location.hash.includes("access_token") && window.location.hash.includes("type=recovery")) {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        if (token) {
            setResetToken(token);
            setCurrentPage("passwordReset"); // 비밀번호 재설정 페이지로 이동
            window.history.replaceState(null, "", window.location.pathname);
            return; 
        }
    }

    // 기존 로그인 토큰이 있다면 로그인 상태로 설정
    const token = localStorage.getItem("accessToken");
    if (token) setIsLoggedIn(true);

    // Supabase 인증 상태 변경 감지
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
  }, []); 

  // ===========================================================================
  // [3] 이벤트 핸들러 (기능 동작 구현)
  // ===========================================================================

  // 로그인 여부 확인 함수
  const checkLogin = () => { 
      if (!isLoggedIn) { 
          setIsLoginOpen(true); // 로그인되어 있지 않으면 로그인 창 표시
          return false; 
      } 
      return true; 
  };

  // 로그아웃 처리
  const handleLogout = async () => { 
      await supabase.auth.signOut(); 
      localStorage.removeItem("accessToken"); 
      setIsLoggedIn(false); 
      setCurrentPage("landing"); // 홈 화면으로 이동
      setCurrentFile(null); 
  };
  
  // !! 파일 업로드 및 작업 시작 (핵심 로직)
  const handleStartWithFile = (file: File) => {
      // 1. 비로그인 상태일 경우 
      if (!isLoggedIn) { 
          setPendingFile(file); // 파일들 임시 변수에 저장
          setIsLoginOpen(true); // 로그인 창 표시
          return; 
      } 

      // 2. 작업 시작 설정
      setCurrentFile(file); 

      // 3. 고유 작업 ID 생성
      const newId = Date.now(); 
      setCurrentId(newId);      

      // 4. 보관함에 새 항목 추가
      const newItem: LibraryItem = {
        id: newId,
        file: file,
        stlFile: undefined,
        name: file.name,
        date: new Date().toLocaleString(),
        settings: undefined 
      };

      setLibraryItems((prev) => [newItem, ...prev]);
      
      // 5. 에디터 페이지로 화면 전환
      setCurrentPage("editor"); 
  };
  
  // 헤더 버튼 동작 연결
  const handleHeaderUploadClick = () => { if (!checkLogin()) return; headerFileInputRef.current?.click(); };
  const handleLibraryClick = () => { if (!checkLogin()) return; setCurrentPage("library"); };
  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleStartWithFile(file); e.target.value = ""; };
  
  // [보관함] 아이템 삭제
  const handleDeleteItem = (id: number) => {
    setLibraryItems((prev) => prev.filter((item) => item.id !== id));
  };

  // [보관함] 이름 변경
  const handleRenameItem = (id: number, newName: string) => {
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  // [보관함] 편집 모드로 진입 (기존 작업 불러오기)
  const handleEditItem = (item: LibraryItem) => { 
    setCurrentId(item.id); 
    setCurrentFile(item.file); 
    setCurrentPage("editor"); // 에디터 화면으로 이동
  };

  // [에디터] STL 변환 완료 시 데이터 업데이트
  const handleStlUpdate = (stlFile: File) => {
    if (!currentId) return;
    setLibraryItems((prev) => 
      prev.map((item) => 
        item.id === currentId ? { ...item, stlFile: stlFile, date: new Date().toLocaleString() } : item
      )
    );
  };

  // [에디터] 설정값 변경 시 데이터 업데이트
  const handleSettingsUpdate = (newSettings: EditorSettings) => {
  if (!currentId) return;
  setLibraryItems((prev) => 
    prev.map((item) => 
      // 해당 아이템의 설정값과 수정 시간을 최신으로 갱신
      item.id === currentId ? { ...item, settings: newSettings, date: new Date().toLocaleString() } : item
    )
  );
};

  // ===========================================================================
  // [4] 화면 렌더링 분기 처리 (Router 역할)
  // ===========================================================================
  // currentPage 변수 값('landing', 'editor' 등)에 따라 
  // 화면 중앙에 보여줄 컴포넌트(페이지)를 결정하는 함수입니다.
  const renderPage = () => {
    switch (currentPage) {

      // 1. 에디터 페이지 (3D 모데링 작업 화면)
      case "editor": 
        const currentItem = libraryItems.find(item => item.id === currentId);
        
        return (
          <EditorPage
            key={currentId} 
            file={currentFile} 
            // 보관함에서 변경한 저장된 이름을 에디터로 보냅니다.
            // 만약 저장된 게 없으면 파일 원래 이름을 보냅니다.
            itemName={currentItem ? currentItem.name : currentFile?.name} 

            onFileChange={(file) => handleStartWithFile(file)} 
            onConversionComplete={handleStlUpdate} 
            initialSettings={currentItem?.settings}
            onSettingsChange={handleSettingsUpdate}
          />
        );

      // 2. 보관함 페이지 (저장된 작업 목록)
      case "library": 
        return (
          <LibraryPage 
            savedItems={libraryItems} 
            onDelete={handleDeleteItem} 
            onEdit={handleEditItem}
            onRename={handleRenameItem} 
          />
        );

      // 3. 비밀번호 재설정 페이지 (이메일 링크 타고 들어왔을 때)
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

      // 4. 랜딩 페이지 (홈 화면) - 기본값
      case "landing":
      default: return <LandingPage onStart={(file) => handleStartWithFile(file)} />;
    }
  };

  // ===========================================================================
  // [5] 최종 UI 렌더링 (HTML 구조)
  // ===========================================================================
  return (
    <>
      {/* 1. 파일 업로드용 숨겨진 Input 
          - 디자인된 '헤더 업로드 버튼'을 누르면, 코드가 몰래 이 input을 클릭시킵니다.
          - accept: 이미지 파일만 선택 가능하게 제한
      */}
      <input type="file" hidden ref={headerFileInputRef} accept=".png, .jpg, .jpeg" onChange={handleHeaderFileChange} />

      {/* 2. 상단 헤더 메뉴 (네비게이션 바) */}
      <Header 
        // 각 버튼을 눌렀을 때 실행할 함수들 연결
        onLoginClick={() => setIsLoginOpen(true)} 
        onSignUpClick={() => setIsSignUpOpen(true)}
        onUploadClick={handleHeaderUploadClick} 
        onLibraryClick={handleLibraryClick}
        isLoggedIn={isLoggedIn}
        onLogoutClick={handleLogout}
        // 작업 중이거나 보관함에서는 헤더를 얇게(compact) 보여줌
        isCompact={currentPage === "editor" || currentPage === "library" || currentPage === "passwordReset"}
        // 홈 화면에서는 배경 이미지 잘 보이게 투명하게 만듬
        isTransparent={currentPage === "landing"}
      />

      {/* 3. 팝업창 모음 (평소에는 숨겨져 있음, open={true} 일 때만 등장) 
          - 로그인, 회원가입, 비번찾기 다이얼로그가 여기 모여 있습니다.
      */}
      <LoginDialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSwitchToSignUp={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }} onLoginSuccess={() => { setIsLoggedIn(true); if (pendingFile) { handleStartWithFile(pendingFile); setPendingFile(null); } }} showSnackbar={showSnackbar} onFindPasswordClick={() => setIsFindPwOpen(true)} />
      <SignUpDialog open={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} showSnackbar={showSnackbar} />
      <FindPasswordDialog open={isFindPwOpen} onClose={() => setIsFindPwOpen(false)} showSnackbar={showSnackbar} />

      {/* 4. 메인 콘텐츠 영역- 위에서 만든 renderPage() 함수가 결정한 화면(에디터/보관함/홈)이 여기에 표시됩니다. */}
      {renderPage()}

      {/* 5. 하단 알림 메시지 - 성공/실패 메시지가 뜨는 박스 */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} // 3초 뒤에 저절로 사라짐
        onClose={handleCloseSnackbar} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // 화면 하단 중앙에 표시
        sx={{ bottom: { xs: 90, sm: 40 } }} // 모바일용
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
}