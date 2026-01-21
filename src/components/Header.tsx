import React from 'react';
import './Header.css';

interface HeaderProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onUploadClick: () => void;
  onLibraryClick: () => void;
  // ⭐️ interface는 잘 정의되어 있습니다.
  isLoggedIn: boolean;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, 
  onSignUpClick, 
  onUploadClick, 
  onLibraryClick,
  // ⭐️ [수정 1] 여기서 이 두 친구를 꼭 꺼내와야 합니다!
  isLoggedIn,
  onLogoutClick
}) => {
  const logoChars: string[] = ['3', 'D', 'L', 'I', 'G', 'H', 'T'];
  const bearImageUrl = "/bear_cookie.png";

  return (
    <header className="site-header">
      
      {/* ⭐️ [수정 2] 로그인 상태(isLoggedIn)에 따라 버튼 다르게 보여주기 */}
      <div className="auth-buttons">
        {isLoggedIn ? (
          // ✅ 로그인 상태일 때: 로그아웃 버튼
          <button onClick={onLogoutClick} className="auth-btn">로그아웃</button>
        ) : (
          // ❌ 비로그인 상태일 때: 로그인/가입 버튼
          <>
            {onLoginClick && <button onClick={onLoginClick} className="auth-btn">로그인</button>}
            {onSignUpClick && <button onClick={onSignUpClick} className="auth-btn signup-btn">가입</button>}
          </>
        )}
      </div>

      <div className="header-container">
        
        {/* 🐻 곰돌이 로고 영역 */}
        <div className="logo-area" onClick={() => window.location.reload()}>
          {logoChars.map((char, index) => (
            <div key={index} className="bear-wrapper">
              <img src={bearImageUrl} alt="곰돌이 쿠키" className="bear-img" />
              <span className="bear-text">{char}</span>
            </div>
          ))}
        </div>

        {/* 메뉴 영역 */}
        <nav className="nav-menu">
          <ul>
            <li onClick={onUploadClick}>업로드</li>

            <li onClick={() => window.open('https://smartstore.naver.com/3dlight', '_blank')}>
              샵
            </li>

            <li onClick={onLibraryClick}>보관함</li>
          </ul>
        </nav>

      </div>
    </header>
  );
};

export default Header;