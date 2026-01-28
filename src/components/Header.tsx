import React from 'react';
import './Header.css';

// =============================================================================
// [1] 인터페이스 정의 (Props)
// =============================================================================
interface HeaderProps {
  // 1-1. 이벤트 핸들러
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onUploadClick: () => void;
  onLibraryClick: () => void;
  onLogoutClick: () => void;
  
  // 1-2. 상태 값
  isLoggedIn: boolean;
  isCompact?: boolean;     // 슬림 모드 (에디터/보관함 페이지용)
  isTransparent?: boolean; // 투명 모드 (랜딩 페이지용)
}

const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, onSignUpClick, onUploadClick, onLibraryClick,
  isLoggedIn, onLogoutClick,
  isCompact = false,
  isTransparent = false
  }) => {
  
  // ===========================================================================
  // [2] 이미지 에셋 경로 설정
  // ===========================================================================
  const woodSignUrl = "/tree.png";
  const boxLogoUrl = "/Group 5.svg";
  const bearCookieUrl = "/upload1.png";    // 업로드용
  const catCookieUrl = "/shop1.png";       // 샵용
  const rabbitCookieUrl = "/storage1.png"; // 보관함용

  return (
    // 헤더 컨테이너: 상황(Compact, Transparent)에 따라 클래스 동적 부여
    <header className={`site-header ${isCompact ? 'compact' : ''} ${isTransparent ? 'transparent' : ''}`}>
      
      {/* =======================================================================
          [3] 우측 상단 인증 버튼 영역 (로그인/회원가입/로그아웃)
          ======================================================================= */}
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
        
        {/* =====================================================================
            [4] 로고 영역 (왼쪽) - 클릭 시 새로고침
            ===================================================================== */}
        <div className="logo-area" onClick={() => window.location.reload()}>
          {isCompact ? (
            // [4-1] 슬림 모드일 때: 심플한 '박스 로고' 표시
            <img 
              src={boxLogoUrl} 
              alt="3DLIGHT Logo" 
              className="box-logo" 
            />
          ) : (
            // [4-2] 일반 모드일 때: 귀여운 '나무 간판' 표시
            <div className="wood-logo-wrapper">
              <img src={woodSignUrl} alt="3DLIGHT 나무간판" className="wood-sign-img" />
              <span className="wood-sign-text">3DLIGHT</span>
            </div>
          )}
        </div>

        {/* =====================================================================
            [5] 네비게이션 메뉴 (중앙) - Threebox & 쿠키 버튼들
            ===================================================================== */}
        <nav className="nav-menu">
          {/* 메뉴 배경 (나무 판자 이미지) */}
          <img className="nav-threebox" src="/threebox.png" alt="menu background" />

          <ul>
            {/* [5-1] 업로드 버튼 */}
            <li onClick={onUploadClick} className="cookie-btn">
              <img src={bearCookieUrl} alt="업로드 아이콘" />
              <span className="cookie-text">업로드</span>
            </li>

            {/* [5-2] 샵 버튼 - 네이버 스마트스토어 새 탭 이동 */}
            <li onClick={() => window.open('https://smartstore.naver.com/3dlight', '_blank')} className="cookie-btn">
              <img src={catCookieUrl} alt="샵 아이콘" />
              <span className="cookie-text">샵</span>
            </li>

            {/* [5-3] 보관함 버튼 */}
            <li onClick={onLibraryClick} className="cookie-btn">
              <img src={rabbitCookieUrl} alt="보관함 아이콘" />
              <span className="cookie-text">보관함</span>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;