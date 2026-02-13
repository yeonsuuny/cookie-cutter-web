import React from 'react';
import './Header.css';

// =============================================================================
// [1] 헤더 설정값 정의
// 부모 컴포넌트(App.tsx 등)에서 이 헤더에게 "이렇게 보여줘"라고 전달하는 명령들입니다.
// =============================================================================
interface HeaderProps {
  // [1-1] 버튼 동작 (클릭하면 실행될 함수들)
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onUploadClick: () => void;
  onLibraryClick: () => void;
  onLogoutClick: () => void;
  
  // [1-2] 화면 상태
  isLoggedIn: boolean;     // 로그인 상태인가요? (true/false)
  isCompact?: boolean;     // 헤더 모양이 [슬림 모드] (에디터/보관함 페이지용)
  isTransparent?: boolean; // 헤더 모양이 [투명 모드] (랜딩 페이지용)
}

const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, onSignUpClick, onUploadClick, onLibraryClick,
  isLoggedIn, onLogoutClick,
  // 값이 전달되지 않았을 때의 기본값 설정
  isCompact = false,
  isTransparent = false
  }) => {
  
  // ===========================================================================
  // [2] 이미지 경로 설정
  // 나중에 아이콘이나 로고 이미지를 바꾸고 싶다면 여기 파일명만 수정하세요! 꼭 public 폴더에 넣으셔야 됩니다!
  // ===========================================================================
  const woodSignUrl = "/tree.png";         // 메인 로고 (나무 간판)
  const boxLogoUrl = "/Group 5.svg";       // 슬림 모드용 로고 (박스형)
  const bearCookieUrl = "/upload1.png";    // 업로드 버튼 아이콘
  const catCookieUrl = "/shop1.png";       // 샵 버튼 아이콘
  const rabbitCookieUrl = "/storage1.png"; // 보관함 버튼 아이콘
  const menuBgUrl = "/threebox.png";       // 메뉴 뒤에 깔리는 나무 판자 배경

  return (
    // [헤더 전체 틀]
    // 상황(isCompact, isTransparent)에 따라 CSS 클래스를 추가해서 모양을 바꿉니다.
    <header className={`site-header ${isCompact ? 'compact' : ''} ${isTransparent ? 'transparent' : ''}`}>
      
      {/* =======================================================================
          [3] 우측 상단 인증 버튼 (로그인 / 가입 / 로그아웃)
          ======================================================================= */}
      <div className="auth-buttons">
        {isLoggedIn ? (
          // 3-1. 로그인 상태일 때 -> '로그아웃' 버튼 표시
          <button onClick={onLogoutClick} className="auth-btn">로그아웃</button>
        ) : (
          // 3-2. 로그아웃 상태일 때 -> '로그인', '가입' 버튼 표시
          <>
            {onLoginClick && <button onClick={onLoginClick} className="auth-btn">로그인</button>}
            {onSignUpClick && <button onClick={onSignUpClick} className="auth-btn signup-btn">가입</button>}
          </>
        )}
      </div>

      <div className="header-container">
        
        {/* =====================================================================
            [4] 로고 영역
            클릭하면 페이지를 새로고침하여 처음으로 돌아갑니다.
            ===================================================================== */}
        <div className="logo-area" onClick={() => window.location.reload()}>
          {isCompact ? (
            // [CASE A] 슬림 모드 (에디터/보관함 페이지)
            <img 
              src={boxLogoUrl} 
              alt="3DLIGHT Logo"
              className="box-logo" // 위치, 크기 조정하려면 .css 가셔서 이 부분을 수정하시면 됩니다
            />
          ) : (
            // [CASE B] 일반 모드 (랜딩 페이지)
            <div className="wood-logo-wrapper">
              <img
                src={woodSignUrl}
                alt="3DLIGHT 나무간판"
                className="wood-sign-img" />
              <span className="wood-sign-text">3DLIGHT</span>
            </div>
          )}
        </div>

        {/* =====================================================================
            [5] 중앙 네비게이션 메뉴 (업로드 / 샵 / 보관함)
            ===================================================================== */}
        <nav className="nav-menu">
          {/* 메뉴 버튼들 뒤에 깔리는 나무 판자 배경 이미지 */}
          <img 
            className="nav-threebox" 
            src={menuBgUrl} 
            alt="menu background" />

          <ul>
            {/* [버튼 1] 업로드 */}
            <li onClick={onUploadClick} className="cookie-btn">
              <img src={bearCookieUrl} alt="업로드 아이콘" />
              <span className="cookie-text">업로드</span>
            </li>

            {/* [버튼 2] 샵 (스마트스토어) 
                ⭐️ 중요: 쇼핑몰 주소가 바뀌면 여기 URL을 수정하세요! 
                window.open( '주소', '_blank' ) -> 새 탭으로 열기 기능입니다.
            */}
            <li onClick={() => window.open('https://smartstore.naver.com/3dlight', '_blank')} className="cookie-btn">
              <img src={catCookieUrl} alt="샵 아이콘" />
              <span className="cookie-text">샵</span> 
            </li>

            {/* [버튼 3] 보관함 */}
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