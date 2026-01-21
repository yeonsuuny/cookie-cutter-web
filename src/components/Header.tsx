import React from 'react';
import './Header.css';

interface HeaderProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onUploadClick: () => void;
  onLibraryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, 
  onSignUpClick, 
  onUploadClick, 
  onLibraryClick 
}) => {
  const logoChars: string[] = ['3', 'D', 'L', 'I', 'G', 'H', 'T'];
  const bearImageUrl = "/bear_cookie.png";

  return (
    <header className="site-header">
      
      {/* ⭐️ [수정] 버튼들을 여기로 꺼냈습니다! (상자 밖으로 탈출) */}
      <div className="auth-buttons">
        {onLoginClick && <button onClick={onLoginClick} className="auth-btn">로그인</button>}
        {onSignUpClick && <button onClick={onSignUpClick} className="auth-btn signup-btn">가입</button>}
      </div>

      {/* 가운데 정렬 상자 (이제 여기엔 곰돌이랑 메뉴만 남음) */}
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