import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Paper, Slider, Button, Typography, Divider,
  Input, Stack, ToggleButton, ToggleButtonGroup, InputBase, CircularProgress,
  IconButton
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Viewer3D from "../components/Viewer3D";
import ParameterGuide from "../components/ParameterGuide";

export interface EditorSettings {
  type: string;
  size: number | string;
  minThickness: number | string;
  bladeThick: number | string;
  bladeDepth: number | string;
  supportThick: number | string;
  supportDepth: number | string;
  baseThick: number | string;
  baseDepth: number | string;
  gap: number | string;
  stampProtrusion: number | string;
  stampDepression: number | string;
  wallOffset: number | string;
  wallExtrude: number | string;
}
// =============================================================================
// [1] 재사용 가능한 입력 컴포넌트
// =============================================================================
const DualInputControl = ({
  label, leftLabel, leftVal, setLeft, rightLabel, rightVal, setRight,
  onKeyDown, onLeftFocus, onRightFocus, onHelpClick
}: any) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
      <Typography fontWeight={600} fontSize="1.0rem">{label}</Typography>
      {onHelpClick && (
        <IconButton size="small" onClick={onHelpClick} sx={{ color: '#bdbdbd', p: 0.5, "&:hover": { color: "#424242" } }}>
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>

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

const SingleInputControl = ({
  label, subLabel, value, setValue, onKeyDown, onFocus, onHelpClick
}: any) => (
  <Box sx={{ mb: 2 }}>
    {label && (
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
        <Typography fontWeight={600} fontSize="0.9rem">{label}</Typography>
        {onHelpClick && (
          <IconButton size="small" onClick={onHelpClick} sx={{ color: '#bdbdbd', p: 0.5, "&:hover": { color: "#424242" } }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    )}
    <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{subLabel}</Typography>
      <InputBase value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKeyDown} onFocus={onFocus} type="number" fullWidth sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }} />
    </Box>
  </Box>
);

interface EditorPageProps {
  file: File | null;
  itemName?: string;
  onFileChange?: (file: File) => void;
  onConversionComplete?: (stlFile: File) => void;
  initialSettings?: EditorSettings;
  onSettingsChange?: (settings: EditorSettings) => void;
}

// =============================================================================
// [2] 메인 페이지 컴포넌트
// =============================================================================
export default function EditorPage({
  file,
  itemName,
  onFileChange,
  onConversionComplete,
  initialSettings,
  onSettingsChange
}: EditorPageProps) {

  // ---------------------------------------------------------------------------
  // 2-1. 상태(State) 관리
  // ---------------------------------------------------------------------------

  const [stlUrl, setStlUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("업데이트 중...");

  const [type, setType] = useState<string>(initialSettings?.type ?? "both");
  const [size, setSize] = useState<number | string>(initialSettings?.size ?? 90);
  const [minThickness, setMinThickness] = useState<number | string>(initialSettings?.minThickness ?? 0.6);

  const [bladeThick, setBladeThick] = useState<number | string>(initialSettings?.bladeThick ?? 0.7);
  const [bladeDepth, setBladeDepth] = useState<number | string>(initialSettings?.bladeDepth ?? 20.0);
  const [supportThick, setSupportThick] = useState<number | string>(initialSettings?.supportThick ?? 1.3);
  const [supportDepth, setSupportDepth] = useState<number | string>(initialSettings?.supportDepth ?? 10.0);
  const [baseThick, setBaseThick] = useState<number | string>(initialSettings?.baseThick ?? 2.0);
  const [baseDepth, setBaseDepth] = useState<number | string>(initialSettings?.baseDepth ?? 2.0);

  const [gap, setGap] = useState<number | string>(initialSettings?.gap ?? 1.0);

  const [stampProtrusion, setStampProtrusion] = useState<number | string>(initialSettings?.stampProtrusion ?? 5.0);
  const [stampDepression, setStampDepression] = useState<number | string>(initialSettings?.stampDepression ?? 2.0);
  const [wallOffset, setWallOffset] = useState<number | string>(initialSettings?.wallOffset ?? 2.0);
  const [wallExtrude, setWallExtrude] = useState<number | string>(initialSettings?.wallExtrude ?? 2.0);

  const prevFileRef = useRef<File | null>(null);
  const [helpOption, setHelpOption] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);


  // ---------------------------------------------------------------------------
  // 2-2. 이벤트 핸들러
  // ---------------------------------------------------------------------------

  const handleHelpClick = (option: string) => (event: React.MouseEvent<HTMLElement>) => {
    if (helpOption === option && anchorEl) {
      setHelpOption(null);
      setAnchorEl(null);
    } else {
      setHelpOption(option);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseHelp = () => {
    setHelpOption(null);
    setAnchorEl(null);
  };

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

  // [추가] 서버 통신 없이, 현재 화면에 만들어져 있는 모델(stlUrl)을 바로 다운로드
  const handleDownloadClick = () => {
    if (!stlUrl) {
      alert("모델이 생성되지 않았습니다. 잠시만 기다려주세요.");
      return;
    }

    // [수정] 우선순위: 1.수정한이름 -> 2.원본파일이름
    const originalName = itemName || file?.name || "model";
    
    // [핵심] 뒤에 .png, .jpg가 붙어있으면 떼버립니다.
    const cleanName = originalName.replace(/\.[^/.]+$/, "");
    
    const a = document.createElement("a");
    a.href = stlUrl; // 이미 만들어진 URL 사용
    a.download = `${cleanName}.stl`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // [새로 추가할 함수]
  const handleApplyClick = () => {
    // 1. 현재 설정값을 부모(App.tsx)에 저장
    if (onSettingsChange) {
      const currentSettings: EditorSettings = {
        type, size, minThickness,
        bladeThick, bladeDepth,
        supportThick, supportDepth,
        baseThick, baseDepth,
        gap,
        stampProtrusion, stampDepression,
        wallOffset, wallExtrude
      };
      onSettingsChange(currentSettings);
    }

    // 2. 모델 생성 시작
    setLoadingText("변경 사항을 적용 중...");
    generateModel(false);
  };

  // ---------------------------------------------------------------------------
  // 2-3. 핵심 로직
  // ---------------------------------------------------------------------------
  const generateModel = useCallback(async (isDownload: boolean = false) => {
    if (!file) return;

    setIsLoading(true);

    try {
      let outputOption = 1;
      if (type === 'cutter') outputOption = 2;
      if (type === 'stamp') outputOption = 3;

      const ringConfig = [];

      if (type !== 'cutter') {
        ringConfig.push({ thickness: Number(wallOffset), height: Number(wallExtrude) });
      } else {
        ringConfig.push({ thickness: 0, height: 0 });
      }
      if (type === 'both' || type == 'cutter') {
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
      
      const originalName = itemName || file.name;
      const cleanName = originalName.replace(/\.[^/.]+$/, "");
      
      const fileName = `${cleanName}.stl`; // 보관함에 저장될 파일명

      const stlFile = new File([blob], fileName, { type: "model/stl" });

      if (onConversionComplete) {
        onConversionComplete(stlFile);
      }

      if (isDownload) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cleanName}.stl`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

    } catch (error) {
      console.error("Error generating STL:", error);
      if (isDownload) alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [file, type, size, minThickness, bladeThick, bladeDepth, supportThick, supportDepth, baseThick, baseDepth, gap, stampProtrusion, stampDepression, wallOffset, wallExtrude]);

  useEffect(() => {
    if (file && prevFileRef.current !== file) {
      prevFileRef.current = file;
      setLoadingText("모델 생성 중입니다...\n약 1분만 기다려주세요!🍪");
      generateModel(false);
    }
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

        <ParameterGuide
          activeOption={helpOption}
          anchorEl={anchorEl}
          onClose={handleCloseHelp}
        />

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

        {file && (
          <Paper sx={{ position: "absolute", top: 16, left: 16, p: 1, px: 2, bgcolor: "rgba(255,255,255,0.8)" }}>
            현재 편집 중: {itemName || file.name}
          </Paper>
        )}
      </Box>

      {/* [오른쪽 영역] 컨트롤 패널 */}
      <Paper elevation={4} sx={{ width: 360, bgcolor: "white", zIndex: 10, display: "flex", flexDirection: "column", p: 3, overflowY: "auto" }}>

        {/* 섹션 1: 기본 설정 */}
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
                <Slider value={getSafeNumber(minThickness, 0.6)} min={0.2} max={1.2} step={0.1} onChange={handleSliderChange} sx={{ color: "#5D4037" }} />
                <Box sx={{ bgcolor: "#EFEBE9", p: 1.5, borderRadius: 2, mt: 1 }}>
                  <Typography variant="caption" display="block" sx={{ lineHeight: 1.4, fontSize: "0.85rem" }}>
                    💡 <strong>출력물 보호 기능</strong><br />
                    설정값보다 얇은 선은 자동으로 이 두께로 보정됩니다. 선이 너무 얇아 출력이 끊기거나 부러지는 것을 방지합니다.
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 섹션 2: 스탬프 설정 */}
        {(type === 'both' || type === 'stamp') && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" fontSize="1.4rem" sx={{ mb: 2, color: "#333" }}>스탬프</Typography>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom fontWeight={600} fontSize="1.0rem" sx={{ mb: 1 }}>높이 설정</Typography>

              <Stack spacing={1.5}>

                {/* 돌출부 */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: "#f5f5f5", p: 1, px: 1.5, borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>돌출부 높이 (mm)</Typography>
                    <IconButton size="small" onClick={handleHelpClick('stampProtrusion')} sx={{ color: '#bdbdbd', p: 0.5, "&:hover": { color: "#424242" } }}>
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <InputBase
                    value={stampProtrusion} onChange={(e) => setStampProtrusion(e.target.value)} type="number" sx={{ width: 60, fontWeight: "bold", textAlign: "right", fontSize: "1.2rem", color: "#333" }} onKeyDown={handleEnterMove}
                  />
                </Stack>

                {/* 함몰부 */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: "#f5f5f5", p: 1, px: 1.5, borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>함몰부 높이 (mm)</Typography>
                    <IconButton size="small" onClick={handleHelpClick('stampDepression')} sx={{ color: '#bdbdbd', p: 0.5, "&:hover": { color: "#424242" } }}>
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <InputBase
                    value={stampDepression} onChange={(e) => setStampDepression(e.target.value)} type="number" sx={{ width: 60, fontWeight: "bold", textAlign: "right", fontSize: "1.2rem", color: "#333" }} onKeyDown={handleEnterMove}
                  />
                </Stack>

              </Stack>
            </Box>

            <DualInputControl label="내벽"
              leftLabel="Offset (mm)" leftVal={wallOffset} setLeft={setVal(setWallOffset)}
              rightLabel="Extrude (mm)" rightVal={wallExtrude} setRight={setVal(setWallExtrude)}
              onKeyDown={handleEnterMove}
              onHelpClick={handleHelpClick('wall')}
            />
          </Box>
        )}

        {/* 섹션 3: 간격 설정 */}
        {(type === 'both') && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" fontSize="1.4rem" sx={{ color: "#333" }}>스탬프와 커터 사이 간격</Typography>
                <IconButton size="small" onClick={handleHelpClick('gap')} sx={{ color: '#bdbdbd', "&:hover": { color: "#424242" } }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <SingleInputControl label="" subLabel="Distance (mm)" value={gap} setValue={setVal(setGap)} onKeyDown={handleEnterMove} />
            </Box>
            <Divider sx={{ mb: 3 }} />
          </>
        )}

        {/* 섹션 4: 커터 설정 */}
        {(type === 'both' || type === 'cutter') && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" fontSize="1.4rem" sx={{ mb: 2, color: "#333" }}>커터</Typography>
            <DualInputControl label="칼날"
              leftLabel="Thickness (mm)" leftVal={bladeThick} setLeft={setVal(setBladeThick)}
              rightLabel="Depth (mm)" rightVal={bladeDepth} setRight={setVal(setBladeDepth)}
              onKeyDown={handleEnterMove}
              onHelpClick={handleHelpClick('blade')}
            />
            <DualInputControl label="지지대"
              leftLabel="Thickness (mm)" leftVal={supportThick} setLeft={setVal(setSupportThick)}
              rightLabel="Depth (mm)" rightVal={supportDepth} setRight={setVal(setSupportDepth)}
              onKeyDown={handleEnterMove}
              onHelpClick={handleHelpClick('support')}
            />
            <DualInputControl label="바닥"
              leftLabel="Thickness (mm)" leftVal={baseThick} setLeft={setVal(setBaseThick)}
              rightLabel="Depth (mm)" rightVal={baseDepth} setRight={setVal(setBaseDepth)}
              onKeyDown={handleEnterMove}
              onHelpClick={handleHelpClick('base')}
            />
          </Box>
        )}

        {/* 하단 버튼 영역 */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={handleApplyClick}
            disabled={isLoading}
            sx={{
              bgcolor: "#FF6F00", py: 1.5, fontWeight: "bold", mb: 2,
              "&:hover": { bgcolor: "#E65100" },
              "&.Mui-disabled": { bgcolor: "#FFE0B2", color: "#fff" }
            }}
          >
            설정 적용 및 미리보기
          </Button>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleDownloadClick}
            
            disabled={isLoading} // 로딩 중(초기 생성 중)일 때는 버튼 못 누르게
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