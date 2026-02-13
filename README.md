diff --git a/README.md b/README.md
index b51d1990e19681b0318afcf2cd614c9ff1d0858e..c954d6eb2bde46ba6afddef899bb66f482fb966d 100644
--- a/README.md
+++ b/README.md
@@ -1,79 +1,123 @@
-# 🍪 쿠키커터 웹 서비스 (인수인계 가이드)
+# 🍪 Cookie-Cutter Web 인수인계 README
 
-이 문서는 **쿠키커터 3D 변환 웹 서비스**의 유지보수 및 수정을 담당하실 분을 위한 가이드입니다.
-프로젝트의 구조, 주요 기능의 위치, 그리고 자주 수정해야 할 포인트들을 정리했습니다.
+> 목적: **담당자가 “어디를 고치면 되는지”를 1~2분 안에 찾을 수 있도록** 만든 운영 문서
 
 ---
 
-## 1. 프로젝트 실행 방법
+## 0) 빠른 시작 (처음 받은 날)
 
-이 프로젝트는 `React (Vite)` 환경에서 실행됩니다.
+```bash
+npm install
+npm run dev
+```
 
-1. **패키지 설치**: `npm install`
-2. **로컬 실행**: `npm run dev` (http://localhost:5173 접속)
-3. **빌드(배포용)**: `npm run build`
+- 기본 개발 주소: `http://localhost:5173`
+- 배포용 빌드: `npm run build`
 
 ---
 
-## 2. 주요 수정 포인트 (가장 많이 찾게 될 곳)
-
-수정 요청이 들어왔을 때, 어디를 열어봐야 할지 정리했습니다.
-
-### 🎨 디자인 & 텍스트 수정
-* **헤더 (로고, 메뉴 위치, 배경색)**
-    * 파일: `src/components/Header.tsx`, `src/styles/Header.css`
-    * 설명: 로고 위치 조절, 메뉴 간격, 슬림 모드 색상 변경 등은 CSS 파일에서 수정합니다.
-* **랜딩 페이지 (메인 화면 문구)**
-    * 파일: `src/pages/LandingPage.tsx`
-    * 설명: "나만의 쿠키커터 만들기" 같은 메인 멘트나 배경 이미지를 수정할 수 있습니다.
-* **전체 폰트 & 기본 배경색**
-    * 파일: `src/index.css`
-    * 설명: 웹사이트 전체에 적용되는 폰트나 배경색(흰색)을 관리합니다.
-
-### ⚙️ 기능 수정
-* **3D 뷰어 (배경색, 모델 색상, 조작 가이드)**
-    * 파일: `src/components/Viewer3D.tsx`
-    * 설명: 3D 모델의 색상(`#4D3C20`)이나 뷰어 배경색(`#f0f2f5`), 오른쪽 위 조작 설명 문구를 수정합니다.
-* **에디터 (설정값 범위, 기본값)**
-    * 파일: `src/pages/EditorPage.tsx`
-    * 설명: 두께, 높이 등의 **초기값(0.7mm 등)**을 수정하거나, STL 생성 서버 주소를 변경할 때 수정합니다.
-* **보관함 (저장 안내 문구, 목록 개수)**
-    * 파일: `src/pages/LibraryPage.tsx`
-    * 설명: "브라우저에 저장됩니다" 경고 문구를 수정하거나, 한 줄에 보여줄 카드 개수를 조절합니다.
-
-### 🔐 로그인 & 서버 연결
-* **로그인 서버(Supabase) 설정**
-    * 파일: `src/supabaseClient.ts`
-    * 설명: 나중에 Supabase 프로젝트가 바뀌면 여기서 `URL`과 `Key`만 갈아끼우면 됩니다.
-* **STL 변환 서버 (Python 백엔드)**
-    * 위치: `src/pages/EditorPage.tsx` (fetch 주소 확인)
-    * 설명: 현재는 `https://cookie-cutter-server.onrender.com`을 사용 중입니다. 백엔드 주소가 바뀌면 여기서 수정하세요.
+## 1) 수정 요청별 “바로 여기” 맵
+
+아래 표만 보면 대부분의 수정 포인트를 바로 찾을 수 있습니다.
+
+| 수정 요청 | 우선 확인 파일 | 같이 보면 좋은 파일 |
+|---|---|---|
+| 상단 로고/메뉴/헤더 높이 변경 | `src/components/Header.tsx` | `src/components/Header.css`, `src/App.tsx` |
+| 랜딩 문구/버튼/배경 이미지 변경 | `src/pages/LandingPage.tsx` | `src/pages/LandingPage.css` |
+| 전체 폰트/기본 배경/전역 스타일 변경 | `src/index.css` | `src/main.tsx` |
+| 3D 뷰어 색상/카메라/조작 UX 변경 | `src/components/Viewer3D.tsx` | `src/pages/EditorPage.tsx` |
+| 파라미터 기본값/범위(두께·높이 등) 변경 | `src/pages/EditorPage.tsx` | `src/components/ParameterGuide.tsx` |
+| 보관함 카드/이름변경/삭제 UI 변경 | `src/pages/LibraryPage.tsx` | `src/App.tsx` |
+| 로그인·회원가입·비밀번호 찾기 모달 문구/동작 변경 | `src/components/LoginDialog.tsx` | `src/components/SignUpDialog.tsx`, `src/components/FindPasswordDialog.tsx` |
+| 비밀번호 재설정 페이지 변경 | `src/pages/PasswordResetPage.tsx` | `src/App.tsx` |
+| Supabase 프로젝트 교체 | `src/supabaseClient.ts` | (없음) |
+| 백엔드 API 주소 변경 (STL/로그인 연동) | `src/pages/EditorPage.tsx` | `src/App.tsx` |
+
+---
+
+## 2) 진짜 자주 바꾸는 값만 따로 모음
+
+### 2-1. 서버 주소
+- STL 생성/변환 서버 주소: 주로 `src/pages/EditorPage.tsx`
+- 소셜 로그인 토큰 교환 주소: `src/App.tsx`
+
+> 백엔드 도메인이 바뀌면 위 2곳을 먼저 검색하세요.
+
+### 2-2. 로그인 연동 키
+- Supabase URL/Key: `src/supabaseClient.ts`
+
+### 2-3. 보관함 저장 방식
+- 브라우저 저장소(IndexedDB, `localforage`) 사용
+- 관련 핵심 로직: `src/App.tsx`
+
+---
+
+## 3) 페이지 흐름 (문제 추적용)
+
+앱의 화면 전환은 `src/App.tsx`에서 상태(`currentPage`)로 관리합니다.
+
+- `landing` → 랜딩 페이지
+- `editor` → 편집/3D 화면
+- `library` → 보관함
+- `passwordReset` → 비밀번호 재설정
+
+즉, “버튼 눌렀는데 화면이 안 넘어간다” 같은 이슈는 **거의 App.tsx에서 시작**하면 됩니다.
 
 ---
 
-## 3. 폴더 구조 설명
+## 4) 폴더 구조(핵심만)
 
+```text
 src/
-├── components/          # 재사용 가능한 조각들 (헤더, 팝업창, 3D 뷰어 등)
-│   ├── Header.tsx       # 상단 메뉴바
-│   ├── Viewer3D.tsx     # 3D 모델 보여주는 화면
-│   └── ...Dialog.tsx    # 로그인, 회원가입 팝업창
-├── pages/               # 화면 단위 (페이지)
-│   ├── LandingPage.tsx  # 홈 화면
-│   ├── EditorPage.tsx   # 편집 & 3D 변환 화면
-│   ├── LibraryPage.tsx  # 작업 보관함 화면
-│   └── PasswordReset... # 비밀번호 찾기 화면
-├── App.tsx              # [중요] 페이지 이동(라우팅)과 전체 데이터 관리
-├── main.tsx             # 앱 실행 진입점
-└── supabaseClient.ts    # 로그인 서버 설정 파일
-
-
-## 4. 주의사항 (Tip)
-
-1. **데이터 저장 방식**: 이 웹사이트는 사용자의 작업물을 **브라우저 내부 저장소(IndexedDB)**에 저장합니다. 사용자가 인터넷 기록(쿠키/캐시)을 삭제하면 작업물이 날아갈 수 있다는 점을 꼭 안내해주세요.
-2. **슬림 헤더 모드**: 에디터와 보관함 페이지에서는 헤더가 얇아집니다(`compact` 모드). 이 설정은 `App.tsx`에서 관리합니다.
-3. **App.css**: 이 파일은 초기 예제 파일이므로 비워두거나 삭제해도 괜찮습니다.
+├─ components/        # 재사용 UI/기능 컴포넌트
+├─ pages/             # 페이지 단위 컴포넌트
+├─ App.tsx            # 화면 전환, 로그인 상태, 보관함 데이터의 중심
+├─ main.tsx           # 앱 진입점
+├─ index.css          # 전역 스타일
+└─ supabaseClient.ts  # Supabase 설정
+```
+
+---
+
+## 5) 수정할 때 추천 루틴 (담당자용)
+
+1. **요청 유형 먼저 분류**: 디자인 / 기능 / 서버연동 / 로그인
+2. **위 표(1번)에서 파일 1~2개만 먼저 열기**
+3. 검색 키워드로 빠르게 이동
+   - API: `onrender`, `fetch`, `accessToken`
+   - 보관함: `localforage`, `libraryItems`
+   - 라우팅/화면전환: `currentPage`
+4. 수정 후 최소 검증
+   - `npm run build` (타입/빌드 오류 확인)
+   - 주요 플로우 수동 확인(로그인, 업로드, 보관함)
+
+---
+
+## 6) 운영 중 자주 발생하는 이슈
+
+- **"저장한 작업물이 사라졌어요"**
+  - 원인: 브라우저 저장소 삭제(쿠키/캐시 정리) 시 데이터가 지워질 수 있음
+  - 안내: 중요한 결과물은 STL 파일로 별도 백업 권장
+
+- **"로그인은 됐는데 기능이 일부 안 돼요"**
+  - 점검: `localStorage`의 토큰, `src/App.tsx` 인증 상태 처리, 백엔드 URL
+
+- **"헤더가 페이지마다 달라요"**
+  - 정상: 에디터/보관함에서 compact 모드를 사용
+  - 점검 위치: `src/App.tsx`, `src/components/Header.tsx`
+
+---
+
+## 7) README를 계속 유효하게 유지하는 규칙
+
+- 파일 이동/이름 변경 시 **표(1번)부터 즉시 업데이트**
+- 새 기능 추가 시 아래 형식으로 1줄 추가
+  - `요청 유형 | 우선 확인 파일 | 같이 보면 좋은 파일`
+- 인수인계 목표는 “설명 길이”가 아니라 **탐색 속도**
 
 ---
 
-*인수인계 관련 문의사항이 있다면 언제든 연락주세요!*
\ No newline at end of file
+필요하면 다음 담당자용으로 `CHANGELOG.md`까지 분리해서,
+- README = “어디를 고칠지 찾는 문서”
+- CHANGELOG = “무엇이 바뀌었는지 기록 문서”
+로 역할을 나누는 걸 추천합니다.
