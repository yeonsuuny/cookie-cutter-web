import React, { useState } from 'react';
import './OvenUploader.css';

interface OvenUploaderProps {
  onFileSelected: (file: File) => void; 
}

export default function OvenUploader({ onFileSelected }: OvenUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 오븐 이미지 경로
  const OVEN_IMG_URL = "/oven.png"; 

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelected(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragEnter = () => setIsDragging(true);
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`oven-wrapper ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="smoke-container">
        {/* 연기 효과 (그대로 유지) */}
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

      {/* 1층: 미리보기 영역 (여기를 수정했습니다!) */}
      <div className="oven-preview-area">
        {preview ? (
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          <div className="upload-guide">
            <span className="guide-button">이미지 업로드</span>
            <p className="guide-desc">파일을 드래그하거나 클릭하세요</p>
          </div>
        )}
      </div>

      {/* 2층: 오븐 껍데기 */}
      <img src={OVEN_IMG_URL} alt="Oven" className="oven-frame-img" />

      {/* 3층: 투명 버튼 */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden-file-input"
        onChange={handleChange}
      />
    </div>
  );
}