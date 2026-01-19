import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Box, Paper, Slider, Button, Typography, Divider, 
  Input, Stack, ToggleButton, ToggleButtonGroup, InputBase, CircularProgress 
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh'; // 아이콘 추가
import Viewer3D from "../components/Viewer3D"; 

// === 상단 헬퍼 컴포넌트들 (변경 없음) ===
const DualInputControl = ({ 
  label, leftLabel, leftVal, setLeft, rightLabel, rightVal, setRight, onKeyDown, onLeftFocus, onRightFocus
}: any) => (
  <Box sx={{ mb: 2 }}>
    <Typography gutterBottom fontWeight={600} fontSize="1.0rem" sx={{ mb: 1 }}>{label}</Typography>
    <Stack direction="row" spacing={1.5}>
      <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 1.5, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{leftLabel}</Typography>
        <InputBase value={leftVal} onChange={(e) => setLeft(e.target.value)} onKeyDown={onKeyDown} onFocus={onLeftFocus} type="number" fullWidth sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }} />
      </Box>
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

// === 메인 컴포넌트 ===
export default function EditorPage({ file, onFileChange }: EditorPageProps) {
  // === 상태 관리 ===
  const [stlUrl, setStlUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [type, setType] = useState<string>("both");
  const [size, setSize] = useState<number | string>(90);
  const [minThickness, setMinThickness] = useState<number | string>(0.6);

  // 커터
  const [bladeThick, setBladeThick] = useState<number | string>(0.7);
  const [bladeDepth, setBladeDepth] = useState<number | string>(20.0);
  const [supportThick, setSupportThick] = useState<number | string>(1.3);
  const [supportDepth, setSupportDepth] = useState<number | string>(10.0);
  const [baseThick, setBaseThick] = useState<number | string>(2.0);
  const [baseDepth, setBaseDepth] = useState<number | string>(2.0);

  // 간격
  const [gap, setGap] = useState<number | string>(1.0);

  // 스탬프
  const [stampProtrusion, setStampProtrusion] = useState<number | string>(5.0);
  const [stampDepression, setStampDepression] = useState<number | string>(2.0);
  const [wallOffset, setWallOffset] = useState<number | string>(2.0);
  const [wallExtrude, setWallExtrude] = useState<number | string>(2.0);

  const [focusedParam, setFocusedParam] = useState<string | null>(null);

  // 이전 파일명을 기억하기 위한 Ref
  const prevFileRef = useRef<File | null>(null);

  // === 이벤트 핸들러들 ===
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

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: string | null) => { if (newType) setType(newType); };
  const handleSliderChange = (_: Event, val: number | number[]) => setMinThickness(val as number);
  const handleInputChange = (e: React.ChangeEvent<any>, setter: React.Dispatch<React.SetStateAction<number | string>>) => setter(e.target.value);
  const setVal = (setter: React.Dispatch<React.SetStateAction<number | string>>) => (val: string) => setter(val);
  const getSafeNumber = (val: number | string, def: number) => { const n = Number(val); return isNaN(n) ? def : n; };

  const handleNewFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && onFileChange) {
      onFileChange(selectedFile); 
    }
  };
  
  const handleFocus = (paramName: string) => () => {
    setFocusedParam(paramName);
  };

  // 모델 생성 함수
  const generateModel = useCallback(async (isDownload: boolean = false) => {
    if (!file) return;

    // 미리보기(다운로드X)일 때만 로딩 표시
    if (!isDownload) setIsLoading(true);

    try {
      let outputOption = 1; 
      if (type === 'cutter') outputOption = 2;
      if (type === 'stamp') outputOption = 3;

      const ringConfig = [];

      if (type !== 'cutter') {
        ringConfig.push({ thickness: Number(wallOffset), height: Number(wallExtrude) });
      }
      if (type === 'both') {
        ringConfig.push({ thickness: Number(gap), height: 0 });
      }
      if (type !== 'stamp') {
        ringConfig.push({ thickness: Number(bladeThick), height: Number(bladeDepth) });
        ringConfig.push({ thickness: Number(supportThick), height: Number(supportDepth) });
        ringConfig.push({ thickness: Number(baseThick), height: Number(baseDepth) });
      }

      const optionObj = {
        target_size: Number(size),
        min_thickness: Number(minThickness),
        stamp_height_high: Number(stampProtrusion),
        stamp_height_low: Number(stampDepression),
        output_option: outputOption,
        ring_config: ringConfig
      };

      const formData = new FormData();
      formData.append("file", file); 
      formData.append("options_str", JSON.stringify(optionObj)); 

      const response = await fetch("https://cookie-cutter-server.onrender.com/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (isDownload) alert(`생성 실패: ${errorData.detail || '알 수 없는 오류'}`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setStlUrl(url); 

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


  // ⭐ [수정됨] 파일이 '새로' 바뀌었을 때만 자동 실행 (수치 변경 시에는 실행 안 함)
  useEffect(() => {
    if (file && prevFileRef.current !== file) {
      prevFileRef.current = file;
      generateModel(false); // 초기 로딩 (미리보기)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]); // 다른 수치(size 등)가 바뀌어도 useEffect는 실행되지 않음!


  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 72px)", bgcolor: "#f5f5f5" }}>
      
      {/* 3D 뷰어 */}
      <Box sx={{ flex: 1, position: "relative", bgcolor: "#e0e0e0" }}>
        <Viewer3D 
          size={getSafeNumber(size, 90)} 
          thickness={getSafeNumber(minThickness, 0.6)} 
          height={getSafeNumber(bladeDepth, 12)}
          type={type}
          focusedParam={focusedParam}
          stlUrl={stlUrl} 
          
          bladeThick={getSafeNumber(bladeThick, 0.7)}
          bladeDepth={getSafeNumber(bladeDepth, 20.0)}
          supportThick={getSafeNumber(supportThick, 1.3)}
          supportDepth={getSafeNumber(supportDepth, 10.0)}
          baseThick={getSafeNumber(baseThick, 2.0)}
          baseDepth={getSafeNumber(baseDepth, 2.0)}
          gap={getSafeNumber(gap, 1.0)}
          wallOffset={getSafeNumber(wallOffset, 2.0)}
          wallExtrude={getSafeNumber(wallExtrude, 2.0)}
        />
        
        {isLoading && (
          <Box sx={{ 
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.7)", zIndex: 20
          }}>
            <CircularProgress size={60} sx={{ color: "#ff8fa3", mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" color="text.secondary">
              업데이트 중...
            </Typography>
          </Box>
        )}

        {file && (
          <Paper sx={{ position: "absolute", top: 16, left: 16, p: 1, px: 2, bgcolor: "rgba(255,255,255,0.8)" }}>
             현재 편집 중: {file.name}
          </Paper>
        )}
      </Box>

      {/* 컨트롤 패널 */}
      <Paper elevation={4} sx={{ width: 360, bgcolor: "white", zIndex: 10, display: "flex", flexDirection: "column", p: 3, overflowY: "auto" }}>
        
        {/* ... (중간 입력 컨트롤들은 기존과 동일) ... */}
        
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
            
            {type !== 'cutter' && (
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography gutterBottom fontWeight={600} fontSize="0.9rem">최소 선 두께 (mm)</Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">{minThickness} mm</Typography>
                </Stack>
                <Slider value={getSafeNumber(minThickness, 0.6)} min={0.2} max={1.2} step={0.1} onChange={handleSliderChange} sx={{ color: "#ff8fa3" }} />
              </Box>
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

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
              leftLabel="Offset (mm)" leftVal={wallOffset} setLeft={setVal(setWallOffset)} onLeftFocus={handleFocus('wallOffset')}
              rightLabel="Extrude (mm)" rightVal={wallExtrude} setRight={setVal(setWallExtrude)} onRightFocus={handleFocus('wallExtrude')} onKeyDown={handleEnterMove} />
          </Box>
        )}

        {(type === 'both') && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" fontSize="1.4rem" sx={{ mb: 2, color: "#333" }}>스탬프와 커터 사이 간격</Typography>
              <SingleInputControl subLabel="Distance (mm)" value={gap} setValue={setVal(setGap)} onFocus={handleFocus('gap')} onKeyDown={handleEnterMove} />
            </Box>
            <Divider sx={{ mb: 3 }} />
          </>
        )}

        {(type === 'both' || type === 'cutter') && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" fontSize="1.4rem" sx={{ mb: 2, color: "#333" }}>커터</Typography>
            <DualInputControl label="칼날" 
              leftLabel="Thickness (mm)" leftVal={bladeThick} setLeft={setVal(setBladeThick)} onLeftFocus={handleFocus('bladeThick')}
              rightLabel="Depth (mm)" rightVal={bladeDepth} setRight={setVal(setBladeDepth)} onRightFocus={handleFocus('bladeDepth')} onKeyDown={handleEnterMove} />
            <DualInputControl label="지지대" 
              leftLabel="Thickness (mm)" leftVal={supportThick} setLeft={setVal(setSupportThick)} onLeftFocus={handleFocus('supportThick')}
              rightLabel="Depth (mm)" rightVal={supportDepth} setRight={setVal(setSupportDepth)} onRightFocus={handleFocus('supportDepth')} onKeyDown={handleEnterMove} />
            <DualInputControl label="바닥" 
              leftLabel="Thickness (mm)" leftVal={baseThick} setLeft={setVal(setBaseThick)} onLeftFocus={handleFocus('baseThick')}
              rightLabel="Depth (mm)" rightVal={baseDepth} setRight={setVal(setBaseDepth)} onRightFocus={handleFocus('baseDepth')} onKeyDown={handleEnterMove} />
          </Box>
        )}

        <Box sx={{ mt: "auto", pt: 2 }}>
          {/* ⭐ [추가됨] 설정 적용 및 미리보기 갱신 버튼 */}
          <Button 
            fullWidth 
            variant="contained" 
            color="primary"
            size="large" 
            startIcon={<RefreshIcon />} // 아이콘 추가
            onClick={() => generateModel(false)} // false: 다운로드 안 하고 보기만 함
            disabled={isLoading}
            sx={{ 
              bgcolor: "#ff5c8d", py: 1.5, fontWeight: "bold", mb: 2, 
              "&:hover": { bgcolor: "#e04f7a" },
              "&.Mui-disabled": { bgcolor: "#ffb2c9", color: "#fff" } 
            }}
          >
            설정 적용 및 미리보기
          </Button>

          {/* 다운로드 버튼 */}
          <Button 
            fullWidth 
            variant="contained" 
            size="large" 
            onClick={() => generateModel(true)} // true: 다운로드 진행
            disabled={isLoading}
            sx={{ 
              bgcolor: "#213547", py: 1.5, fontWeight: "bold", mb: 2, 
              "&:hover": { bgcolor: "#1a2c3d" },
              "&.Mui-disabled": { bgcolor: "#546e7a", color: "#e0e0e0" } 
            }}
          >
            STL 파일 다운로드
          </Button>

          <Button 
            component="label" 
            fullWidth 
            variant="outlined" 
            color="secondary"
            size="large"
            disabled={isLoading} 
            sx={{ py: 1.5, fontWeight: "bold" }}
          >
            새로운 파일 업로드
            <input 
              type="file" 
              hidden 
              accept=".png,.jpg,.jpeg,.svg" 
              onChange={handleNewFileUpload} 
            />
          </Button>
        </Box>

      </Paper>
    </Box>
  );
}