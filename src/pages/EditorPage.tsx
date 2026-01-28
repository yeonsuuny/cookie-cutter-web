import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Paper, Slider, Button, Typography, Divider,
  Input, Stack, ToggleButton, ToggleButtonGroup, InputBase, CircularProgress
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import Viewer3D from "../components/Viewer3D";

// =============================================================================
// [1] 재사용 가능한 입력 컴포넌트 (UI 헬퍼)
// - 디자인 수정이 필요하면 이 부분만 고치면 전체 입력창에 반영됩니다.
// =============================================================================
const DualInputControl = ({
  label, leftLabel, leftVal, setLeft, rightLabel, rightVal, setRight, onKeyDown, onLeftFocus, onRightFocus
}: any) => (
  <Box sx={{ mb: 2 }}>
    <Typography gutterBottom fontWeight={600} fontSize="1.0rem" sx={{ mb: 1 }}>{label}</Typography>
    <Stack direction="row" spacing={1.5}>
      {/* 왼쪽 입력창 */}
      <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 1.5, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{leftLabel}</Typography>
        <InputBase value={leftVal} onChange={(e) => setLeft(e.target.value)} onKeyDown={onKeyDown} onFocus={onLeftFocus} type="number" fullWidth sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }} />
      </Box>
      {/* 오른쪽 입력창 */}
      <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 1.5, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{rightLabel}</Typography>
        <InputBase value={rightVal} onChange={(e) => setRight(e.target.value)} onKeyDown={onKeyDown} onFocus={onRightFocus} type="number" fullWidth sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }} />
      </Box>
    </Stack>
  </Box>
);

const SingleInputControl = ({ label, subLabel, value, setValue, onKeyDown, onFocus
 }: any) => (
  <Box sx={{ mb: 2 }}>
    <Typography gutterBottom fontWeight={600} fontSize="0.9rem" sx={{ mb: 1 }}>{label}</Typography>
    <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{subLabel}</Typography>
      <InputBase value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKeyDown} onFocus={onFocus} type="number" fullWidth sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }} />
    </Box>
  </Box>
);

interface EditorPageProps {
  file: File | null;
  onFileChange?: (file: File) => void;
}

// =============================================================================
// [2] 메인 페이지 컴포넌트
// =============================================================================
export default function EditorPage({ file, onFileChange }: EditorPageProps) {
  
  // ---------------------------------------------------------------------------
  // 2-1. 상태(State) 관리
  // ---------------------------------------------------------------------------
  
  // 뷰어 및 로딩 관련 상태
  const [stlUrl, setStlUrl] = useState<string | null>(null); // 생성된 3D 모델 URL (Blob)
  const [isLoading, setIsLoading] = useState(false);         // 로딩 스피너 표시 여부
  const [loadingText, setLoadingText] = useState("업데이트 중..."); // 상황별 로딩 멘트

  // 전체 설정 (타입, 크기, 두께)
  const [type, setType] = useState<string>("both");          // 'both' | 'cutter' | 'stamp'
  const [size, setSize] = useState<number | string>(90);     // 쿠키커터 전체 크기
  const [minThickness, setMinThickness] = useState<number | string>(0.6); // 최소 두께 보정

  // [상세 설정: 커터 부분] - 칼날, 지지대, 바닥
  const [bladeThick, setBladeThick] = useState<number | string>(0.7);
  const [bladeDepth, setBladeDepth] = useState<number | string>(20.0);
  const [supportThick, setSupportThick] = useState<number | string>(1.3);
  const [supportDepth, setSupportDepth] = useState<number | string>(10.0);
  const [baseThick, setBaseThick] = useState<number | string>(2.0);
  const [baseDepth, setBaseDepth] = useState<number | string>(2.0);

  // [상세 설정: 간격]
  const [gap, setGap] = useState<number | string>(1.0); // 커터와 스탬프 사이 거리

  // [상세 설정: 스탬프 부분]
  const [stampProtrusion, setStampProtrusion] = useState<number | string>(5.0); // 튀어나온 부분 높이
  const [stampDepression, setStampDepression] = useState<number | string>(2.0); // 들어간 부분 높이
  const [wallOffset, setWallOffset] = useState<number | string>(2.0); // 스탬프 외벽 거리
  const [wallExtrude, setWallExtrude] = useState<number | string>(2.0); // 스탬프 외벽 높이

  // 파일 변경 감지용 Ref (불필요한 리렌더링 방지)
  const prevFileRef = useRef<File | null>(null);


  // ---------------------------------------------------------------------------
  // 2-2. 이벤트 핸들러 (입력 처리, 유틸리티)
  // ---------------------------------------------------------------------------
  
  // 엔터키 입력 시 다음 칸으로 포커스 이동 (UX 편의성)
  const handleEnterMove = (e: React.KeyboardEvent<any>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputs = Array.from(document.querySelectorAll("input[type='number']"));
      const currentIndex = inputs.indexOf(e.currentTarget as HTMLInputElement);

      if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
        (inputs[currentIndex + 1] as HTMLElement).focus();
        if ((inputs[currentIndex + 1] as HTMLElement).tagName === "INPUT") {
           (inputs[currentIndex + 1] as HTMLInputElement).select();
        }
      }
    }
  };

  // 단순 상태 변경 핸들러들
  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: string | null) => { if (newType) setType(newType); };
  const handleSliderChange = (_: Event, val: number | number[]) => setMinThickness(val as number);
  const handleInputChange = (e: React.ChangeEvent<any>, setter: React.Dispatch<React.SetStateAction<number | string>>) => setter(e.target.value);
  const setVal = (setter: React.Dispatch<React.SetStateAction<number | string>>) => (val: string) => setter(val);
  
  // 숫자 변환 시 NaN 방지용 헬퍼
  const getSafeNumber = (val: number | string, def: number) => { const n = Number(val); return isNaN(n) ? def : n; };

  // '새로운 파일 업로드' 버튼 처리
  const handleNewFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && onFileChange) {
      onFileChange(selectedFile);
    }
  };
 
  // ---------------------------------------------------------------------------
  // 2-3. 핵심 로직: 모델 생성 및 API 통신
  // - 서버로 데이터를 보내고 STL 파일을 받아오는 가장 중요한 부분입니다.
  // ---------------------------------------------------------------------------
  const generateModel = useCallback(async (isDownload: boolean = false) => {
    if (!file) return;

    // 미리보기 모드일 때만 로딩 화면 표시 (다운로드 시에는 백그라운드 처리)
    if (!isDownload) setIsLoading(true);

    try {
      // (1) 모드에 따른 옵션 번호 매핑 (서버 약속)
      let outputOption = 1; // Both
      if (type === 'cutter') outputOption = 2;
      if (type === 'stamp') outputOption = 3;

      // (2) ring_config 배열 생성
      // 서버가 요구하는 순서대로 두께와 높이 정보를 배열에 담습니다.
      // 순서: [스탬프, 간격, 칼날, 지지대, 바닥] (Type에 따라 다름)
      const ringConfig = [];

      if (type !== 'cutter') {
        ringConfig.push({ thickness: Number(wallOffset), height: Number(wallExtrude) });
      } else {
        ringConfig.push({ thickness: 0, height: 0 });
      }
      if (type === 'both' || type == 'cutter') {
        ringConfig.push({ thickness: Number(gap), height: 0 }); // 간격은 높이 0
      }
      if (type !== 'stamp') {
        ringConfig.push({ thickness: Number(bladeThick), height: Number(bladeDepth) });
        ringConfig.push({ thickness: Number(supportThick), height: Number(supportDepth) });
        ringConfig.push({ thickness: Number(baseThick), height: Number(baseDepth) });
      }

      // (3) 서버로 보낼 최종 JSON 객체 구성
      const optionObj = {
        target_size: Number(size),
        min_thickness: Number(minThickness),
        stamp_height_high: Number(stampProtrusion),
        stamp_height_low: Number(stampDepression),
        output_option: outputOption,
        ring_config: ringConfig
      };

      // (4) FormData 생성 (파일 + JSON 옵션)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("options_str", JSON.stringify(optionObj));

      // (5) API 요청 전송
      const response = await fetch("https://cookie-cutter-server.onrender.com/generate", {
        method: "POST",
        body: formData,
      });

      // 에러 처리
      if (!response.ok) {
        const errorData = await response.json();
        if (isDownload) alert(`생성 실패: ${errorData.detail || '알 수 없는 오류'}`);
        return;
      }

      // (6) 성공 시 Blob 데이터 처리 (URL 생성)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setStlUrl(url); // 뷰어 업데이트

      // 다운로드 모드라면 브라우저 강제 다운로드 실행
      if (isDownload) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `cookie_cutter_${Date.now()}.stl`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
     
    } catch (error) {
      console.error("Error generating STL:", error);
      if (isDownload) alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      if (!isDownload) setIsLoading(false);
    }
  }, [file, type, size, minThickness, bladeThick, bladeDepth, supportThick, supportDepth, baseThick, baseDepth, gap, stampProtrusion, stampDepression, wallOffset, wallExtrude]);


  // ---------------------------------------------------------------------------
  // 2-4. 효과(Effect): 파일 변경 감지
  // - 이미지가 바뀌면 사용자가 버튼을 누르지 않아도 자동으로 모델을 1회 생성합니다.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (file && prevFileRef.current !== file) {
      prevFileRef.current = file;
      setLoadingText("모델 생성 중입니다...\n약 1분만 기다려주세요!🍪");
      generateModel(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);


  // ---------------------------------------------------------------------------
  // 2-5. 화면 렌더링 (UI Structure)
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 72px)", bgcolor: "#f5f5f5" }}>
     
      {/* [왼쪽 영역] 3D 뷰어 & 로딩 오버레이 */}
      <Box sx={{ flex: 1, position: "relative", bgcolor: "#e0e0e0" }}>
        
        <Viewer3D
          size={getSafeNumber(size, 90)}
          height={getSafeNumber(bladeDepth, 12)}
          stlUrl={stlUrl}
        />
       
        {/* 로딩 중일 때 뜨는 흐린 배경과 텍스트 */}
        {isLoading && (
          <Box sx={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(5px)", 
            zIndex: 200 
          }}>
            <CircularProgress size={60} sx={{ color: "#FF6F00", mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" color="text.secondary" sx={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
              {loadingText}
            </Typography>
          </Box>
        )}

        {/* 현재 파일명 표시 라벨 */}
        {file && (
          <Paper sx={{ position: "absolute", top: 16, left: 16, p: 1, px: 2, bgcolor: "rgba(255,255,255,0.8)" }}>
             현재 편집 중: {file.name}
          </Paper>
        )}
      </Box>

      {/* [오른쪽 영역] 컨트롤 패널 (설정값 입력) */}
      <Paper elevation={4} sx={{ width: 360, bgcolor: "white", zIndex: 10, display: "flex", flexDirection: "column", p: 3, overflowY: "auto" }}>
       
        {/* 섹션 1: 기본 설정 (타입, 크기, 보호옵션) */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" fontSize="1.4rem" sx={{ mb: 2 }}>기본 설정</Typography>
          <ToggleButtonGroup value={type} exclusive onChange={handleTypeChange} fullWidth size="small" sx={{ mb: 3 }}>
            <ToggleButton value="both">커터&스탬프</ToggleButton>
            <ToggleButton value="cutter">커터</ToggleButton>
            <ToggleButton value="stamp">스탬프</ToggleButton>
          </ToggleButtonGroup>

          <Stack spacing={3}>
            <Box>
              <Typography gutterBottom fontWeight={600} fontSize="0.9rem">전체 크기 (mm)</Typography>
              <Input value={size} fullWidth type="number" onChange={(e) => handleInputChange(e, setSize)} onKeyDown={handleEnterMove} />
            </Box>
           
            {/* 커터 전용이 아닐 때만 최소 두께 옵션 표시 */}
            {type !== 'cutter' && (
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography gutterBottom fontWeight={600} fontSize="0.9rem">최소 선 두께 (mm)</Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">{minThickness} mm</Typography>
                </Stack>
                <Slider value={getSafeNumber(minThickness, 0.6)} min={0.2} max={1.2} step={0.1} onChange={handleSliderChange} sx={{ color: "#5D4037" }} />
                <Box sx={{ bgcolor: "#EFEBE9", p: 1.5, borderRadius: 2, mt: 1 }}>
                  <Typography variant="caption" display="block" sx={{ lineHeight: 1.4, fontSize: "0.85rem"}}>
                    💡 <strong>출력물 보호 기능</strong><br/>
                    설정값보다 얇은 선은 자동으로 이 두께로 보정됩니다. 선이 너무 얇아 출력이 끊기거나 부러지는 것을 방지합니다.
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 섹션 2: 스탬프 설정 (조건부 렌더링) */}
        {(type === 'both' || type === 'stamp') && (
          <Box sx={{ mb: 3 }}>
             <Typography variant="h5" fontWeight="bold" fontSize="1.4rem" sx={{ mb: 2, color: "#333" }}>스탬프</Typography>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom fontWeight={600} fontSize="1.0rem" sx={{ mb: 1 }}>높이 설정</Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: "#f9f9f9", p: 1, px: 1.5, borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">돌출부 높이 (mm)</Typography>
                  <InputBase value={stampProtrusion} onChange={(e) => setStampProtrusion(e.target.value)} type="number" sx={{ width: 60, fontWeight: "bold", textAlign: "right" }} onKeyDown={handleEnterMove} />
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: "#f9f9f9", p: 1, px: 1.5, borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">함몰부 높이 (mm)</Typography>
                  <InputBase value={stampDepression} onChange={(e) => setStampDepression(e.target.value)} type="number" sx={{ width: 60, fontWeight: "bold", textAlign: "right" }} onKeyDown={handleEnterMove} />
                </Stack>
              </Stack>
            </Box>
            <DualInputControl label="내벽"
              leftLabel="Offset (mm)" leftVal={wallOffset} setLeft={setVal(setWallOffset)} 
              rightLabel="Extrude (mm)" rightVal={wallExtrude} setRight={setVal(setWallExtrude)} 
              onKeyDown={handleEnterMove} />
          </Box>
        )}

        {/* 섹션 3: 간격 설정 (Both일 때만) */}
        {(type === 'both') && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" fontSize="1.4rem" sx={{ mb: 2, color: "#333" }}>스탬프와 커터 사이 간격</Typography>
              <SingleInputControl subLabel="Distance (mm)" value={gap} setValue={setVal(setGap)} onKeyDown={handleEnterMove} />
            </Box>
            <Divider sx={{ mb: 3 }} />
          </>
        )}

        {/* 섹션 4: 커터 설정 (조건부 렌더링) */}
        {(type === 'both' || type === 'cutter') && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" fontSize="1.4rem" sx={{ mb: 2, color: "#333" }}>커터</Typography>
            <DualInputControl label="칼날"
              leftLabel="Thickness (mm)" leftVal={bladeThick} setLeft={setVal(setBladeThick)} 
              rightLabel="Depth (mm)" rightVal={bladeDepth} setRight={setVal(setBladeDepth)} 
              onKeyDown={handleEnterMove} />
            <DualInputControl label="지지대"
              leftLabel="Thickness (mm)" leftVal={supportThick} setLeft={setVal(setSupportThick)} 
              rightLabel="Depth (mm)" rightVal={supportDepth} setRight={setVal(setSupportDepth)} 
              onKeyDown={handleEnterMove} />
            <DualInputControl label="바닥"
              leftLabel="Thickness (mm)" leftVal={baseThick} setLeft={setVal(setBaseThick)} 
              rightLabel="Depth (mm)" rightVal={baseDepth} setRight={setVal(setBaseDepth)} 
              onKeyDown={handleEnterMove} />
          </Box>
        )}

        {/* 하단 버튼 영역 */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          {/* 설정 적용 버튼 */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setLoadingText("변경 사항 적용 중...");
              generateModel(false);
            }}
            disabled={isLoading}
            sx={{
              bgcolor: "#FF6F00", py: 1.5, fontWeight: "bold", mb: 2,
              "&:hover": { bgcolor: "#E65100" },
              "&.Mui-disabled": { bgcolor: "#FFE0B2", color: "#fff" }
            }}
          >
            설정 적용 및 미리보기
          </Button>

          {/* 다운로드 버튼 */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => generateModel(true)}
            disabled={isLoading}
            sx={{
              bgcolor: "#5D4037", py: 1.5, fontWeight: "bold", mb: 2,
              "&:hover": { bgcolor: "#4E342E" },
              "&.Mui-disabled": { bgcolor: "#A1887F", color: "#EFEBE9" }
            }}
          >
            STL 파일 다운로드
          </Button>

          <Button
            component="label"
            fullWidth
            variant="outlined"
            size="large"
            disabled={isLoading}
            sx={{
                py: 1.5,
                fontWeight: "bold",
                color: "#8D6E63",
                borderColor: "#8D6E63",
                "&:hover": {
                  borderColor: "#5D4037",
                  color: "#5D4037",
                  bgcolor: "#FFF3E0"
                }
              }}
          >
            새로운 파일 업로드
            <input
              type="file"
              hidden
              accept=".png"
              onChange={handleNewFileUpload}
            />
          </Button>
        </Box>

      </Paper>
    </Box>
  );
}