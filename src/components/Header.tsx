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
}

const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, onSignUpClick, onUploadClick, onLibraryClick,
  isLoggedIn, onLogoutClick,
  isCompact = false 
}) => {
  // ✅ 1. 홈 화면용: 곰돌이 7마리 데이터 (복구!)
  const logoChars: string[] = ['3', 'D', 'L', 'I', 'G', 'H', 'T'];
  const bearImageUrl = "/bear_cookie.png";
  
  // ✅ 2. 에디터 화면용: 박스 로고 이미지
  // (아직 이미지가 없다면 임시로 텍스트나 다른 이미지를 넣어도 됩니다)
  const boxLogoUrl = "/Group 5.svg"; 

  return (
    <header className={`site-header ${isCompact ? 'compact' : ''}`}>
      
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
            // 🟩 [Case B] 홈 화면(기본)일 때 -> '곰돌이 7마리' 보여주기
            logoChars.map((char, index) => (
              <div key={index} className="bear-wrapper">
                <img src={bearImageUrl} alt="곰돌이 쿠키" className="bear-img" />
                <span className="bear-text">{char}</span>
              </div>
            ))
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