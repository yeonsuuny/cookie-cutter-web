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
          <ul>
            <li onClick={onUploadClick}>업로드</li>
            <li onClick={() => window.open('https://smartstore.naver.com/3dlight', '_blank')}>샵</li>
            <li onClick={onLibraryClick}>보관함</li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;