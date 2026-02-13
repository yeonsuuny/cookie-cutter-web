import React, { useState } from 'react';
import './OvenUploader.css';

/**
 * OvenUploader
 * - 오븐 그림 위에 파일을 "드래그&드롭"하거나 "클릭"해서 이미지 업로드하는 컴포넌트
 */

// =============================================================================
// [1] 데이터 규칙 정의
// =============================================================================
interface OvenUploaderProps {
  // 부모 컴포넌트(LandingPage)에게 "파일이 들어왔어요!"라고 알려주는 메신저 함수
  onFileSelected: (file: File) => void; 
}

export default function OvenUploader({ onFileSelected }: OvenUploaderProps) {
  // ---------------------------------------------------------------------------
  // [2] 설정 및 상태
  // ---------------------------------------------------------------------------

  // 허용할 파일 형식 (나중에 svg 등을 추가하고 싶으면 여기만 수정하면 됩니다)
  const VALID_TYPES = ["image/png", "image/jpeg", "image/jpg"];

  // 오븐 프레임 이미지 경로
  const OVEN_IMG_URL = "/oven.png";

  // 화면의 변화를 기억하는 변수들
  const [preview, setPreview] = useState<string | null>(null); // 미리보기 이미지 주소
  const [isDragging, setIsDragging] = useState(false);         // 드래그 중인지 여부


  // ---------------------------------------------------------------------------
  // [3] 핵심 로직: 파일 처리
  // ---------------------------------------------------------------------------

  /**
   * [기능] 파일이 유효한지 검사하고, 미리보기를 만든 뒤, 부모에게 전달합니다.
   * 클릭해서 넣든, 드래그해서 넣든 결국 이 함수가 실행됩니다.
   */
  const processFile = (file: File) => {
    // 1. 파일 형식 검사 (PNG, JPG가 아니면 무시)
    const isFileTypeValid = VALID_TYPES.includes(file.type);
    const isFileNameValid = /\.(png|jpg|jpeg)$/i.test(file.name);

    if (!isFileTypeValid && !isFileNameValid) {
        alert("이미지 파일(PNG, JPG)만 넣어주세요.");
        return;
    }

    // 2. 미리보기 생성 (파일을 읽어서 화면에 보여줌)
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string); // 다 읽었으면 미리보기 변수에 저장
    };
    reader.readAsDataURL(file);
    
    // 3. 부모 컴포넌트로 파일 전달 (실제 업로드 준비)
    onFileSelected(file);
  };


  // ---------------------------------------------------------------------------
  // [4] 이벤트 핸들러: 클릭 & 드래그
  // ---------------------------------------------------------------------------

  // [상황 A] 사용자가 클릭해서 파일을 선택했을 때
  const handleClickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // (중요) 같은 파일을 다시 선택해도 작동하도록 입력값을 초기화합니다.
    e.target.value = ""; 
  };

  // [상황 B] 파일이 오븐 위로 들어왔을 때
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true); // 오븐 색깔이나 테두리를 변경하기 위해 신호 켬
  };

  // [상황 C] 파일이 오븐 밖으로 나갔을 때
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false); // 신호 끔
  };

  // [상황 D] 파일을 오븐 위에 떨궜을 때
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();  // 브라우저가 이미지를 새 탭으로 여는 것을 막음
    e.stopPropagation(); // 이벤트가 다른 곳으로 퍼지는 것을 막음
    
    setIsDragging(false); // 드래그 종료

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
        processFile(droppedFile);
    }
  };

  // [상황 E] 드래그 중일 때 커서 모양 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // 파일이 아니면 '금지' 표시를 띄웁니다.
    e.dataTransfer.dropEffect = "copy"; 
  };


  // ---------------------------------------------------------------------------
  // [5] 화면 그리기
  // ---------------------------------------------------------------------------
  return (
    <div 
      className={`oven-wrapper ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      
      {/* [Layer 1] 연기 효과
        오븐 뒤나 안쪽에서 피어오르는 연기를 표현하는 단순 HTML 조각들입니다.
        움직임은 CSS 파일에 정의되어 있습니다.
      */}
      <div className="smoke-container">
        <span className="smoke s-1"></span>
        <span className="smoke s-2"></span>
        <span className="smoke s-3"></span>
        <span className="smoke s-4"></span>
        <span className="smoke s-5"></span>
        <span className="smoke s-6"></span>
        <span className="smoke s-7"></span>
        <span className="smoke s-8"></span>
        <span className="smoke s-9"></span>
      </div>

      {/* [Layer 2] 오븐 내부 (미리보기 화면) */}
      <div className="oven-preview-area">
        {preview ? (
          // 2-1. 파일이 선택되었을 때: 이미지 보여주기
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          // 2-2. 파일이 없을 때: 안내 문구 보여주기
          <div className="upload-guide">
            <span className="guide-button">이미지 업로드</span>
            <p className="guide-desc">파일을 드래그하거나 클릭하세요</p>
          </div>
        )}
      </div>

      {/* [Layer 3] 오븐 프레임 (껍데기 이미지) */}
      <img src={OVEN_IMG_URL} alt="Oven Frame" className="oven-frame-img" />

      {/* [Layer 4] 투명 버튼 (Hidden Input)
        이 input 태그가 오븐 전체를 투명하게 덮고 있습니다.
        사용자가 오븐 어디를 누르든 실제로는 이 input이 클릭되어 파일 창이 뜹니다.
      */}
      <input 
        type="file" 
        accept=".png, .jpg, .jpeg" 
        className="hidden-file-input"
        onChange={handleClickUpload}
      />
    </div>
  );
}