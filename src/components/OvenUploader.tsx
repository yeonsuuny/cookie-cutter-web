import React, { useState } from 'react';
import './OvenUploader.css';

interface OvenUploaderProps {
  onFileSelected: (file: File) => void; // 부모에게 파일을 전달하는 함수
}

export default function OvenUploader({ onFileSelected }: OvenUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 오븐 이미지 경로 (public 폴더에 넣어주세요!)
  const OVEN_IMG_URL = "/oven.png"; 

  // 파일 처리 함수
  const handleFile = (file: File) => {
    // 1. 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 2. 부모(LandingPage)에게 파일 전달
    onFileSelected(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // 드래그 앤 드롭 시각 효과 관리
  const handleDragEnter = () => setIsDragging(true);
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    // 여기서 e.preventDefault()는 상위 컴포넌트나 input이 처리하지만 
    // 시각 효과를 끄기 위해 추가
    setIsDragging(false);
  };

  return (
    <div 
      className={`oven-wrapper ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 1층: 미리보기 (오븐 속) */}
      <div className="oven-preview-area">
        {preview ? (
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          <p className="placeholder-msg">
            {isDragging ? "놓으세요!" : "이미지를 쏙 넣어주세요!"}
          </p>
        )}
      </div>

      {/* 2층: 오븐 껍데기 */}
      <img src={OVEN_IMG_URL} alt="Oven" className="oven-frame-img" />

      {/* 3층: 투명한 기능 버튼 */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden-file-input"
        onChange={handleChange}
      />
    </div>
  );
}