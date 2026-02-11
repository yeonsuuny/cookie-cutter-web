import React, { useState, useMemo } from "react";
import {
  Box, Container, Typography, Paper, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText, Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  TextField, DialogActions, Button, InputAdornment, FormControl, Select
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from '@mui/icons-material/Search';
import { Alert, AlertTitle } from '@mui/material';

// ----------------------------------------------------------------------
// 타입 정의
// ----------------------------------------------------------------------
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
  date: string;
  settings?: EditorSettings;
}

interface LibraryPageProps {
  savedItems: LibraryItem[];
  onDelete: (id: number) => void;
  onEdit: (item: LibraryItem) => void;
  onRename: (id: number, newName: string) => void;
}

// ----------------------------------------------------------------------

export default function LibraryPage({ savedItems, onDelete, onEdit, onRename }: LibraryPageProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // 검색 및 정렬 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // [핵심 Logic] 검색 및 정렬 필터링 (방안 B 유지)
  const filteredItems = useMemo(() => {
    let items = [...savedItems].filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return items.sort((a, b) => {
      // 1. 이름순 정렬
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // 2. 최근 수정순 (date 문자열 비교)
      if (sortBy === "latest") {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return timeB - timeA; // 최신 수정이 위로
      }
      // 3. 오래된 업로드순 (최초 생성 ID 비교)
      if (sortBy === "oldest") {
        return a.id - b.id; // 가장 작은 ID가 위로
      }
      return 0;
    });
  }, [savedItems, searchTerm, sortBy]);

  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: LibraryItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDownloadStl = () => {
    if (selectedItem && selectedItem.stlFile) {
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
      alert("변환된 STL 파일이 없습니다. [편집하기]에서 변환을 완료하고 저장해주세요.");
    }
    handleClose();
  };

  const handleDeleteClick = () => {
    setAnchorEl(null);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) onDelete(selectedItem.id);
    setIsDeleteOpen(false);
    setSelectedItem(null);
  };

  const handleEdit = () => {
    if (selectedItem) onEdit(selectedItem);
    handleClose();
  };

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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9f9f9", pt: 4, pb: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#333" }}>
          작업 보관함
        </Typography>

        {/* 안내 문구 (이건 유지할게요!) */}
        <Alert
          severity="info"
          sx={{
            mb: 4, borderRadius: 3, bgcolor: "#F8F7F2", color: "#454545",
            border: "1px solid #E8E6E0", "& .MuiAlert-icon": { color: "#FFA000" }
          }}
        >
          <AlertTitle sx={{ fontWeight: "bold" }}>데이터 저장 안내</AlertTitle>
          모든 작업물은 사용 중인 <strong>브라우저 내부</strong>에만 저장됩니다.
          기기를 변경하거나 브라우저 쿠키를 삭제할 경우 데이터가 사라질 수 있으니, 중요한 파일은 반드시 <strong>STL로 다운로드</strong>하여 보관해 주세요!
        </Alert>

        {/* 검색 및 정렬 바 */}
        <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
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

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
          {searchTerm ? `검색 결과: ${filteredItems.length}개` : `전체 모델: ${savedItems.length}개`}
        </Typography>

        {/* 아이템 그리드 - 디자인 원상복구 완료 */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)", // 원래대로 4개
            }
          }}
        >
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

          {/* [디자인 복구] 원래 사용하시던 카드 디자인입니다 */}
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
              <IconButton
                onClick={(e) => handleMenuClick(e, item)}
                sx={{ position: "absolute", top: 10, right: 10, bgcolor: "rgba(255,255,255,0.9)", zIndex: 10 }}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <Box
                sx={{
                  height: 140,
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
                    style={{ width: "90%", height: "90%", objectFit: "contain" }}
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                )}
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" noWrap title={item.name}>
                {item.name}
              </Typography>

              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                  업로드: {new Date(item.id).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                  최근 수정: {item.date}
                </Typography>
              </Box>

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

        {/* 다이얼로그 및 메뉴 (이전과 동일) */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleEdit}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>편집하기</ListItemText></MenuItem>
          <MenuItem onClick={handleRenameClick}><ListItemIcon><DriveFileRenameOutlineIcon fontSize="small" /></ListItemIcon><ListItemText>이름 변경</ListItemText></MenuItem>
          <MenuItem onClick={handleDownloadStl}><ListItemIcon><DownloadIcon fontSize="small" color="primary" /></ListItemIcon><ListItemText primary="STL 다운로드" /></MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}><ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon><ListItemText>삭제하기</ListItemText></MenuItem>
        </Menu>

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