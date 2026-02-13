import React, { useState, useMemo } from "react";
import {
  Box, Container, Typography, Paper, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText, Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  TextField, DialogActions, Button, InputAdornment, FormControl, Select
} from "@mui/material";
// 아이콘 불러오기 (아이콘을 바꾸고 싶으면 여기서 이름을 바꿔야 합니다.)
import MoreVertIcon from "@mui/icons-material/MoreVert"; // 점 3개 메뉴
import DeleteIcon from "@mui/icons-material/Delete";     // 삭제하기 버튼 (쓰레기통)
import EditIcon from "@mui/icons-material/Edit";         // 편집하기 버튼 (연필)
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'; // 이름 변경 버튼
import DownloadIcon from "@mui/icons-material/Download"; // 다운로드 버튼
import SearchIcon from '@mui/icons-material/Search';     // 파일 검색칸 (돋보기)
import { Alert, AlertTitle } from '@mui/material';

// =============================================================================
// [1] 데이터 타입 정의
// =============================================================================
// 저장된 파일이 어떤 정보를 가지고 있는지 정의하는 약속
export interface EditorSettings {
  type: string; size: number | string; minThickness: number | string;
  bladeThick: number | string; bladeDepth: number | string;
  supportThick: number | string; supportDepth: number | string;
  baseThick: number | string; baseDepth: number | string;
  gap: number | string; stampProtrusion: number | string;
  stampDepression: number | string; wallOffset: number | string;
  wallExtrude: number | string;
}

export interface LibraryItem {
  id: number;
  file: File;
  stlFile?: File;
  name: string;
  date: string; // 수정 날짜
  settings?: EditorSettings; // 작업했던 설정값들
}

interface LibraryPageProps {
  savedItems: LibraryItem[];
  onDelete: (id: number) => void;
  onEdit: (item: LibraryItem) => void;
  onRename: (id: number, newName: string) => void;
}

// =============================================================================
// [2] 메인 컴포넌트
// =============================================================================
export default function LibraryPage({ savedItems, onDelete, onEdit, onRename }: LibraryPageProps) {
  // [상태 관리] 팝업창 열림/닫힘, 선택된 아이템 등
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false); // 이름 변경 창
  const [newName, setNewName] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // 삭제 확인 창

  // [검색 및 정렬 기능]
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [sortBy, setSortBy] = useState("latest");   // 정렬 기준

  // ===========================================================================
  // [3] 필터링 & 정렬 로직
  // ===========================================================================
  // 사용자가 검색어를 입력하거나 정렬 순서를 바꾸면 자동으로 목록을 다시 정렬
  const filteredItems = useMemo(() => {
    // 1. 검색어로 필터링
    let items = [...savedItems].filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. 선택한 기준대로 정렬
    return items.sort((a, b) => {
      // 2-1. 이름순 정렬
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // 2-2. 최근 수정순
      if (sortBy === "latest") {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return timeB - timeA; // 최신 수정이 위로
      }
      // 2-3. 오래된 업로드순
      if (sortBy === "oldest") {
        return a.id - b.id; // 가장 작은 ID가 위로
      }
      return 0;
    });
  }, [savedItems, searchTerm, sortBy]);

  const open = Boolean(anchorEl);

  // ===========================================================================
  // [4] 기능 함수들 (버튼 클릭 시 동작)
  // ===========================================================================

  // 메뉴 열기 (점 3개 버튼 클릭 시)
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: LibraryItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  // 메뉴 닫기
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // STL 다운로드 기능
  const handleDownloadStl = () => {
    if (selectedItem && selectedItem.stlFile) {
      // 브라우저에서 파일을 다운로드하게 만드는 코드
      const fileBlob = selectedItem.stlFile as any;
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = selectedItem.name.replace(/\.[^/.]+$/, "");
      a.download = `${cleanName}.stl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // 보관함에서 "이미지 원본" 이라고 뜨는 파일을 다운로드 하면 생기는 팝업 문구
      alert("변환된 STL 파일이 없습니다. [편집하기]에서 변환을 완료하고 저장해주세요.");
    }
    handleClose();
  };

  // 삭제 기능
  const handleDeleteClick = () => {
    setAnchorEl(null);
    setIsDeleteOpen(true); // 삭제 확인 팝업 띄우기
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) onDelete(selectedItem.id); // 진짜 삭제 실행
    setIsDeleteOpen(false);
    setSelectedItem(null);
  };

  // 편집 모드로 이동
  const handleEdit = () => {
    if (selectedItem) onEdit(selectedItem);
    handleClose();
  };

  // 이름 변경 기능
  const handleRenameClick = () => {
    if (selectedItem) {
      setNewName(selectedItem.name);
      setIsRenameOpen(true);
      setAnchorEl(null);
    }
  };

  const handleRenameSave = () => {
    if (selectedItem && newName.trim()) {
      onRename(selectedItem.id, newName);
      setIsRenameOpen(false);
      setSelectedItem(null);
    }
  };

  // ===========================================================================
  // [5] UI 렌더링 (화면 구성)
  // ===========================================================================
  return (
    // 전체 배경
    <Box 
      sx={{ 
        minHeight: "100vh", 
        bgcolor: "#f9f9f9", // 배경색
        pt: 4,                // 위에랑 얼마나 떨어질지
        pb: 8                 // 밑에랑 얼마나 떨어질지
      }}
    >
      <Container maxWidth="xl">
        {/* 페이지 제목 */}
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#333" }}>
          작업 보관함
        </Typography>

        {/* 데이터 저장 안내 경고문 */}
        <Alert
          severity="info"
          sx={{
            mb: 4, borderRadius: 3, bgcolor: "#F8F7F2", color: "#454545",
            border: "1px solid #E8E6E0", "& .MuiAlert-icon": { color: "#FFA000" }
          }}
        >
          <AlertTitle sx={{ fontWeight: "bold" }}>데이터 저장 안내</AlertTitle>
          {/* 안내 문구 */}
          모든 작업물은 사용 중인 <strong>브라우저 내부</strong>에만 저장됩니다.
          기기를 변경하거나 브라우저 쿠키를 삭제할 경우 데이터가 사라질 수 있으니, 중요한 파일은 반드시 <strong>STL로 다운로드</strong>하여 보관해 주세요!
        </Alert>

        {/* [5-1] 검색창 및 정렬 필터 */}
        <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          {/* 검색 입력칸 */}
          <TextField
            placeholder="이름 검색..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              flexGrow: 1, minWidth: "200px",
              "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" }
            }}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "text.disabled" }} /></InputAdornment>),
            }}
          />
          {/* 정렬 선택 박스 (최신순 등) */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ borderRadius: 3, bgcolor: "white" }}
            >
              <MenuItem value="latest">최근 수정순</MenuItem>
              <MenuItem value="oldest">오래된 업로드순</MenuItem>
              <MenuItem value="name">이름 가나다순</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 검색 결과 개수 표시 */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
          {searchTerm ? `검색 결과: ${filteredItems.length}개` : `전체 모델: ${savedItems.length}개`}
        </Typography>

        {/* [5-2] 아이템 목록 그리드 */}
        <Box
          sx={{
            display: "grid",
            gap: 3, // 카드 사이 간격

            // 화면 크기에 따라 가로로 몇 개 보여줄지 설정
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)", // 모바일: 1줄에 1개
              sm: "repeat(2, 1fr)", // 태블릿: 1줄에 2개
              md: "repeat(4, 1fr)", // PC: 1줄에 4개
            }
          }}
        >
          {/* 결과가 없을 때 보여주는 안내 박스 */}
          {filteredItems.length === 0 && (
            <Paper sx={{ gridColumn: "1 / -1", p: 6, textAlign: "center", color: "#888", borderRadius: 4, bgcolor: "#f0f0f0" }}>
              <Typography variant="h6">
                {searchTerm ? "검색 결과가 없습니다." : "아직 저장된 작업이 없어요."}
              </Typography>
              <Typography variant="body2">
                {searchTerm ? "다른 이름으로 검색해보세요!" : "새로운 이미지를 업로드해서 나만의 쿠키 커터를 만들어보세요!"}
              </Typography>
            </Paper>
          )}

          {/* 카드 반복 생성 구역 */}
          {/* filteredItems 안에 있는 개수만큼 자동으로 카드를 찍어냅니다. */}
          {filteredItems.map((item) => (
            <Paper
              key={item.id}
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 4,
                position: "relative",
                transition: "0.3s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* 점 3개 메뉴 버튼 */}
              <IconButton
                onClick={(e) => handleMenuClick(e, item)}
                sx={{ position: "absolute", top: 10, right: 10, bgcolor: "rgba(255,255,255,0.9)", zIndex: 10 }}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              {/* 썸네일 이미지 영역 */}
              <Box
                sx={{
                  height: 140, // 크기
                  bgcolor: "#eee",
                  borderRadius: 3,
                  mb: 2,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {item.file && (
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt={item.name}
                    style={{ 
                      width: "90%", // 썸네일 박스에 이미지가 얼만큼 보일 건지
                      height: "90%", // 썸네일 박스에 이미지가 얼만큼 보일 건지
                      objectFit: "contain" }}
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                )}
              </Box>
              
              {/* 파일 이름 */}
              <Typography variant="subtitle1" fontWeight="bold" noWrap title={item.name}>
                {item.name}
              </Typography>
              
              {/* 날짜 정보 */}
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                  업로드: {new Date(item.id).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                  최근 수정: {item.date}
                </Typography>
              </Box>
              
              {/* STL 변환 여부 뱃지 */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 1 }}>
                {item.stlFile ? (
                  <Chip label="STL 변환됨" color="primary" size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
                ) : (
                  <Chip label="이미지 원본" variant="outlined" size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
                )}
              </Box>
            </Paper>
          ))}
        </Box>

        {/* =======================================================================
            [팝업창 모음] (메뉴, 이름변경, 삭제확인)
            ======================================================================= */}

        {/* 점 3개 눌렀을 때 나오는 메뉴 리스트 */}    
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleEdit}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>편집하기</ListItemText></MenuItem>
          <MenuItem onClick={handleRenameClick}><ListItemIcon><DriveFileRenameOutlineIcon fontSize="small" /></ListItemIcon><ListItemText>이름 변경</ListItemText></MenuItem>
          <MenuItem onClick={handleDownloadStl}><ListItemIcon><DownloadIcon fontSize="small" color="primary" /></ListItemIcon><ListItemText primary="STL 다운로드" /></MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}><ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon><ListItemText>삭제하기</ListItemText></MenuItem>
        </Menu>
        
        {/* 이름 변경 팝업창 */}
        <Dialog open={isRenameOpen} onClose={() => setIsRenameOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>이름 변경</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="파일 이름" type="text" fullWidth variant="standard" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSave(); }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsRenameOpen(false)}>취소</Button>
            <Button onClick={handleRenameSave} variant="contained" color="primary">변경</Button>
          </DialogActions>
        </Dialog>
        
        {/* 삭제 확인 팝업창 */}
        <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
          <DialogTitle>작업 삭제</DialogTitle>
          <DialogContent><DialogContentText>정말로 <strong>{selectedItem?.name}</strong>을(를) 삭제하시겠습니까?<br />삭제된 파일은 복구할 수 없습니다.</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteOpen(false)}>취소</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>삭제</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}