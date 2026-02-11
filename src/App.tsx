import React, { useState, useRef, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material"; 
import localforage from "localforage"; 

import Header from "./components/Header";
import LoginDialog from "./components/LoginDialog";
import SignUpDialog from "./components/SignUpDialog";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import LibraryPage from "./pages/LibraryPage"; 
import FindPasswordDialog from "./components/FindPasswordDialog"; 
import PasswordResetPage from "./pages/PasswordResetPage";
import { supabase } from "./supabaseClient"; 

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
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isFindPwOpen, setIsFindPwOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState<"landing" | "editor" | "library" | "passwordReset">("landing");
  const [resetToken, setResetToken] = useState<string>("");

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const [currentId, setCurrentId] = useState<number | null>(null); 

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");
  
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  const headerFileInputRef = useRef<HTMLInputElement>(null);

  const showSnackbar = (message: string, severity: "success" | "error" | "info" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

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

  useEffect(() => {
    if (isLibraryLoaded) {
      localforage.setItem("my_cookie_library", libraryItems);
    }
  }, [libraryItems, isLibraryLoaded]);

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
            handleStartWithFile(pendingFile); 
            setPendingFile(null); 
        }
      } else {
        await supabase.auth.signOut();
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (window.location.hash && window.location.hash.includes("access_token") && window.location.hash.includes("type=recovery")) {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        if (token) {
            setResetToken(token);
            setCurrentPage("passwordReset");
            window.history.replaceState(null, "", window.location.pathname);
            return; 
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
  }, []); 

  const checkLogin = () => { if (!isLoggedIn) { setIsLoginOpen(true); return false; } return true; };
  const handleLogout = async () => { await supabase.auth.signOut(); localStorage.removeItem("accessToken"); setIsLoggedIn(false); setCurrentPage("landing"); setCurrentFile(null); };
  
  const handleStartWithFile = (file: File) => { 
      if (!isLoggedIn) { 
          setPendingFile(file); 
          setIsLoginOpen(true); 
          return; 
      } 
      setCurrentFile(file); 

      const newId = Date.now(); 
      setCurrentId(newId);      

      const newItem: LibraryItem = {
        id: newId,
        file: file,
        stlFile: undefined,
        name: file.name,
        date: new Date().toLocaleString(),
        settings: undefined 
      };

      setLibraryItems((prev) => [newItem, ...prev]); 
      setCurrentPage("editor"); 
  };
  
  const handleHeaderUploadClick = () => { if (!checkLogin()) return; headerFileInputRef.current?.click(); };
  const handleLibraryClick = () => { if (!checkLogin()) return; setCurrentPage("library"); };
  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleStartWithFile(file); e.target.value = ""; };
  
  const handleDeleteItem = (id: number) => {
    setLibraryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRenameItem = (id: number, newName: string) => {
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  const handleEditItem = (item: LibraryItem) => { 
    setCurrentId(item.id); 
    setCurrentFile(item.file); 
    setCurrentPage("editor"); 
  };

  const handleStlUpdate = (stlFile: File) => {
    if (!currentId) return;
    setLibraryItems((prev) => 
      prev.map((item) => 
        item.id === currentId ? { ...item, stlFile: stlFile, date: new Date().toLocaleString() } : item
      )
    );
  };

  const handleSettingsUpdate = (newSettings: EditorSettings) => {
  if (!currentId) return;
  setLibraryItems((prev) => 
    prev.map((item) => 
      // data -> date 로 오타 수정!
      item.id === currentId ? { ...item, settings: newSettings, date: new Date().toLocaleString() } : item
    )
  );
};

  const renderPage = () => {
    switch (currentPage) {
      case "editor": 
        const currentItem = libraryItems.find(item => item.id === currentId);
        
        return (
          <EditorPage
            key={currentId} 
            file={currentFile} 
            // [추가] 보관함에 저장된 이름(name)을 에디터로 보냅니다.
            // 만약 저장된 게 없으면(새 파일) 파일 원래 이름을 보냅니다.
            itemName={currentItem ? currentItem.name : currentFile?.name} 

            onFileChange={(file) => handleStartWithFile(file)} 
            onConversionComplete={handleStlUpdate} 
            initialSettings={currentItem?.settings}
            onSettingsChange={handleSettingsUpdate}
          />
        );
      case "library": 
        return (
          <LibraryPage 
            savedItems={libraryItems} 
            onDelete={handleDeleteItem} 
            onEdit={handleEditItem}
            onRename={handleRenameItem} 
          />
        );
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
      <input type="file" hidden ref={headerFileInputRef} accept=".png, .jpg, .jpeg" onChange={handleHeaderFileChange} />
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
      <LoginDialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSwitchToSignUp={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }} onLoginSuccess={() => { setIsLoggedIn(true); if (pendingFile) { handleStartWithFile(pendingFile); setPendingFile(null); } }} showSnackbar={showSnackbar} onFindPasswordClick={() => setIsFindPwOpen(true)} />
      <SignUpDialog open={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} showSnackbar={showSnackbar} />
      <FindPasswordDialog open={isFindPwOpen} onClose={() => setIsFindPwOpen(false)} showSnackbar={showSnackbar} />
      {renderPage()}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ bottom: { xs: 90, sm: 40 } }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
}