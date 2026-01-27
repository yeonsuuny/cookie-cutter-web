// src/components/Header.tsx
import React from 'react';
import './Header.css';

interface HeaderProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onUploadClick: () => void;
  onLibraryClick: () => void;
  isLoggedIn: boolean;
  onLogoutClick: () => void;
  isCompact?: boolean;
  isTransparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, onSignUpClick, onUploadClick, onLibraryClick,
  isLoggedIn, onLogoutClick,
  isCompact = false,
  isTransparent = false
  }) => {
  
  const woodSignUrl = "/tree.png";
  const boxLogoUrl = "/Group 5.svg";
  const bearCookieUrl = "/upload1.png";   // 업로드용
  const catCookieUrl = "/shop1.png";     // 샵용
  const rabbitCookieUrl = "/storage1.png"; // 보관함용

  return (
    <header className={`site-header ${isCompact ? 'compact' : ''} ${isTransparent ? 'transparent' : ''}`}>
      
      <div className="auth-buttons">
        {isLoggedIn ? (
          <button onClick={onLogoutClick} className="auth-btn">로그아웃</button>
        ) : (
          <>
            {onLoginClick && <button onClick={onLoginClick} className="auth-btn">로그인</button>}
            {onSignUpClick && <button onClick={onSignUpClick} className="auth-btn signup-btn">가입</button>}
          </>
        )}
      </div>

      <div className="header-container">
        
        {/* 로고 영역 클릭 시 새로고침 */}
        <div className="logo-area" onClick={() => window.location.reload()}>
          
          {isCompact ? (
            // 🟥 [Case A] 에디터 화면(슬림)일 때 -> '박스 로고' 1개 보여주기
            <img 
              src={boxLogoUrl} 
              alt="3DLIGHT Logo" 
              className="box-logo" 
            />
          ) : (
            <div className="wood-logo-wrapper">
              <img src={woodSignUrl} alt="3DLIGHT 나무간판" className="wood-sign-img" />
              <span className="wood-sign-text">3DLIGHT</span>
            </div>
          )}

        </div>

        <nav className="nav-menu">
          {/* ✅ threebox 배경 */}
          <img className="nav-threebox" src="/threebox.png" alt="menu background" />

          <ul>
            {/* 1. 업로드 (곰돌이) */}
            <li onClick={onUploadClick} className="cookie-btn">
              <img src={bearCookieUrl} alt="곰돌이 쿠키" />
              <span className="cookie-text">업로드</span>
            </li>

            {/* 2. 샵 (고양이) */}
            <li onClick={() => window.open('https://smartstore.naver.com/3dlight', '_blank')} className="cookie-btn">
              <img src={catCookieUrl} alt="고양이 쿠키" />
              <span className="cookie-text">샵</span>
            </li>

            {/* 3. 보관함 (토끼) */}
            <li onClick={onLibraryClick} className="cookie-btn">
              <img src={rabbitCookieUrl} alt="토끼 쿠키" />
              <span className="cookie-text">보관함</span>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;