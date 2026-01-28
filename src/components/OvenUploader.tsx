import React, { useState } from 'react';
import './OvenUploader.css';

// =============================================================================
// [1] Props 인터페이스 정의
// =============================================================================
interface OvenUploaderProps {
  // 사용자가 파일을 선택했을 때 부모에게 파일 객체를 전달하는 콜백 함수
  onFileSelected: (file: File) => void; 
}

export default function OvenUploader({ onFileSelected }: OvenUploaderProps) {
  // ===========================================================================
  // [2] 상태 관리 (State)
  // ===========================================================================
  const [preview, setPreview] = useState<string | null>(null); // 미리보기 이미지 URL (DataURL)
  const [isDragging, setIsDragging] = useState(false);         // 드래그 중인지 여부 (스타일 변경용)

  const OVEN_IMG_URL = "/oven.png"; // 오븐 프레임 이미지 경로

  // ===========================================================================
  // [3] 파일 처리 로직 (Handlers)
  // ===========================================================================
  
  // [3-1] 파일 읽기 및 미리보기 생성 (공통 함수)
  const handleFile = (file: File) => {
    // PNG 파일 아니면 처리하지 않고 종료
    if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
        return;
    }

    const reader = new FileReader();
    
    // 파일 읽기가 완료되면 미리보기 상태 업데이트
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    
    // 파일을 DataURL 형식으로 읽기 (브라우저에서 바로 보여주기 위함)
    reader.readAsDataURL(file);
    
    // 부모 컴포넌트에 파일 전달
    onFileSelected(file);
  };

  // [3-2] input 태그를 통한 파일 선택 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // ⭐️ 중요: 같은 파일을 다시 선택해도 onChange가 발생하도록 value 초기화
    e.target.value = ""; 
  };

  // ===========================================================================
  // [4] 드래그 앤 드롭 이벤트 핸들러
  // ===========================================================================
  const handleDragEnter = () => setIsDragging(true);  // 파일이 영역 안에 들어옴
  const handleDragLeave = () => setIsDragging(false); // 파일이 영역 밖으로 나감

  // 드래그 오버 시: PNG가 아니면 '금지' 커서 보여주기
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // 기본 동작 방지 (필수)
    
    // 드래그 중인 파일의 타입을 확인
    const item = e.dataTransfer.items?.[0];
    if (item && item.type !== "image/png") {
        // PNG가 아니면 드롭 금지 표시 (커서가 금지 모양으로 변함)
        e.dataTransfer.dropEffect = "none";
    } else {
        // PNG면 복사 표시 (커서가 + 모양 등으로 변함)
        e.dataTransfer.dropEffect = "copy";
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();  // 브라우저 기본 동작(파일 열기) 방지
    e.stopPropagation(); // 이벤트 전파 중단
    setIsDragging(false); // 드래그 상태 해제

    const droppedFile = e.dataTransfer.files?.[0];
    
    // 파일이 있고, PNG인지 검사
    if (droppedFile) {
        if (droppedFile.type !== "image/png" && !droppedFile.name.toLowerCase().endsWith(".png")) {
            return;
        }
        // 통과하면 파일 처리
        handleFile(droppedFile);
    }
  };

  // ===========================================================================
  // [5] UI 렌더링
  // ===========================================================================
  return (
    <div 
      className={`oven-wrapper ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* [5-1] 연기 효과 (장식용) */}
      <div className="smoke-container">
        {/* CSS 애니메이션으로 피어오르는 연기 조각들 */}
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

      {/* [5-2] 미리보기 영역 (오븐 내부) */}
      <div className="oven-preview-area">
        {preview ? (
          // 파일이 선택되었으면 미리보기 이미지 표시
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          // 선택된 파일이 없으면 안내 문구 표시
          <div className="upload-guide">
            <span className="guide-button">이미지 업로드</span>
            <p className="guide-desc">파일을 드래그하거나 클릭하세요</p>
          </div>
        )}
      </div>

      {/* [5-3] 오븐 프레임 이미지 (틀) */}
      <img src={OVEN_IMG_URL} alt="Oven" className="oven-frame-img" />

      {/* [5-4] 실제 파일 입력 (숨김 처리됨) */}
      {/* 오븐 전체를 덮고 있어서 어디를 클릭해도 파일 선택 창이 뜸 */}
      <input 
        type="file" 
        accept=".png" 
        className="hidden-file-input"
        onChange={handleChange}
      />
    </div>
  );
}