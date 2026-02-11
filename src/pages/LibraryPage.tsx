// LibraryPage.tsx 전체 코드 (복사해서 덮어쓰세요)
import React, { useState } from "react";
import {
  Box, Container, Typography, Paper, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText, Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  TextField, DialogActions, Button
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'; // 이름 변경 아이콘
import DownloadIcon from "@mui/icons-material/Download";

// ----------------------------------------------------------------------
// 1. 타입 정의
// ----------------------------------------------------------------------
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

export interface LibraryItem {
  id: number;
  file: File;
  stlFile?: File;
  name: string;
  date: string;
  settings?: EditorSettings;
}
// ----------------------------------------------------------------------

interface LibraryPageProps {
  savedItems: LibraryItem[];
  onDelete: (id: number) => void;
  onEdit: (item: LibraryItem) => void;
  onRename: (id: number, newName: string) => void; // [추가] 이름 변경 함수 타입 정의
}

export default function LibraryPage({ savedItems, onDelete, onEdit, onRename }: LibraryPageProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  // [추가] 이름 변경 팝업 상태 관리
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");

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

  // [1] 팝업 열림/닫힘 상태 관리
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // [2] 메뉴에서 '삭제하기' 버튼 눌렀을 때 -> 팝업을 엽니다.
  const handleDeleteClick = () => {
    setAnchorEl(null);    // 점 3개 메뉴 닫기
    setIsDeleteOpen(true); // "진짜 삭제할까요?" 팝업 열기
  };

  // [3] 팝업에서 '삭제' 버튼 눌렀을 때 -> 실제 데이터를 지웁니다.
  const handleDeleteConfirm = () => {
    if (selectedItem) {
      onDelete(selectedItem.id); // 부모 컴포넌트에 삭제 요청
    }
    setIsDeleteOpen(false); // 팝업 닫기
    setSelectedItem(null);  // 선택 해제
  };

  const handleEdit = () => {
    if (selectedItem) onEdit(selectedItem);
    handleClose();
  };

  // [추가] 이름 변경 메뉴 클릭 시
  const handleRenameClick = () => {
    if (selectedItem) {
      setNewName(selectedItem.name); // 현재 이름 가져오기
      setIsRenameOpen(true);         // 팝업 열기
      setAnchorEl(null);             // 메뉴만 닫기 (selectedItem은 유지!)
    }
  };

  // [추가] 이름 변경 저장 시
  const handleRenameSave = () => {
    if (selectedItem && newName.trim()) {
      onRename(selectedItem.id, newName); // 이름 변경 실행
      setIsRenameOpen(false);             // 팝업 닫기
      setSelectedItem(null);              // [중요] 작업이 다 끝난 뒤에 선택 해제
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9f9f9", pt: 4, pb: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#333" }}>
          작업 보관함
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          총 {savedItems.length}개의 저장된 모델이 있습니다.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",  // 모바일: 1개
              sm: "repeat(2, 1fr)",  // 태블릿: 2개
              md: "repeat(4, 1fr)",  // PC: 4개
            }
          }}
        >
          {savedItems.length === 0 && (
            <Paper sx={{ gridColumn: "1 / -1", p: 6, textAlign: "center", color: "#888", borderRadius: 4, bgcolor: "#f0f0f0" }}>
              <Typography variant="h6">아직 저장된 작업이 없어요.</Typography>
              <Typography variant="body2">새로운 이미지를 업로드해서 나만의 쿠키 커터를 만들어보세요!</Typography>
            </Paper>
          )}

          {savedItems.map((item) => (
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
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
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

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                {item.stlFile ? (
                  <Chip label="STL 변환됨" color="primary" size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
                ) : (
                  <Chip label="이미지 원본" variant="outlined" size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
                )}
              </Box>
            </Paper>
          ))}
        </Box>

        {/* 메뉴 리스트 */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleEdit}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>편집하기</ListItemText>
          </MenuItem>

          {/* [추가] 이름 변경 메뉴 아이템 */}
          <MenuItem onClick={handleRenameClick}>
            <ListItemIcon><DriveFileRenameOutlineIcon fontSize="small" /></ListItemIcon>
            <ListItemText>이름 변경</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleDownloadStl}>
            <ListItemIcon><DownloadIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="STL 다운로드" />
          </MenuItem>

          <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>삭제하기</ListItemText>
          </MenuItem>
        </Menu>

        {/* [추가] 이름 변경 다이얼로그 (팝업창) */}
        <Dialog open={isRenameOpen} onClose={() => setIsRenameOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>이름 변경</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="파일 이름"
              type="text"
              fullWidth
              variant="standard"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSave(); }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsRenameOpen(false)}>취소</Button>
            <Button onClick={handleRenameSave} variant="contained" color="primary">변경</Button>
          </DialogActions>
        </Dialog>

        {/* [추가] 삭제 확인 팝업창 UI */}
        <Dialog
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
        >
          <DialogTitle>작업 삭제</DialogTitle>
          <DialogContent>
            <DialogContentText>
              정말로 <strong>{selectedItem?.name}</strong>을(를) 삭제하시겠습니까?<br />
              삭제된 파일은 복구할 수 없습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteOpen(false)}>취소</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
              삭제
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}