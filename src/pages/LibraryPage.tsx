// src/pages/LibraryPage.tsx
import React, { useState } from "react";
import { 
  Box, Container, Typography, Grid, Paper, IconButton, Menu, MenuItem 
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // 점 3개 아이콘
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface LibraryPageProps {
  savedItems: File[];
  onDelete: (index: number) => void;
  onEdit: (file: File) => void;
}

export default function LibraryPage({ savedItems, onDelete, onEdit }: LibraryPageProps) {
  // 메뉴 관련 상태
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const open = Boolean(anchorEl);

  // 메뉴 열기
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  // 메뉴 닫기
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
  };

  // 수정 클릭
  const handleEditClick = () => {
    if (selectedIndex !== null) {
      onEdit(savedItems[selectedIndex]);
    }
    handleClose();
  };

  // 삭제 클릭
  const handleDeleteClick = () => {
    if (selectedIndex !== null) {
      onDelete(selectedIndex);
    }
    handleClose();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9f9f9", pt: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          작업 보관함
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          총 {savedItems.length}개의 저장된 모델이 있습니다.
        </Typography>

        <Grid container spacing={3}>
          {savedItems.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 5, textAlign: "center", color: "#999" }}>
                아직 저장된 작업물이 없습니다. 이미지를 업로드해보세요!
              </Paper>
            </Grid>
          )}

          {savedItems.map((file, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 240, 
                  position: "relative",
                  display: "flex", 
                  flexDirection: "column",
                  alignItems: "center", 
                  justifyContent: "space-between",
                  overflow: "hidden",
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6 }
                }}
              >
                {/* 점 3개 메뉴 버튼 */}
                <IconButton
                  onClick={(e) => handleMenuClick(e, index)}
                  sx={{ 
                    position: "absolute", top: 8, right: 8, 
                    bgcolor: "rgba(255,255,255,0.8)",
                    "&:hover": { bgcolor: "white" }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>

                {/* 이미지 미리보기 */}
                <Box 
                  component="img"
                  src={URL.createObjectURL(file)} 
                  alt={file.name}
                  sx={{ width: "100%", height: 150, objectFit: "contain", mb: 2 }}
                />
                
                <Box sx={{ width: "100%", textAlign: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 팝업 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{ elevation: 3, sx: { minWidth: 120 } }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <MenuItem onClick={handleEditClick} sx={{ gap: 1 }}>
            <EditIcon fontSize="small" /> 수정하기
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ gap: 1, color: "error.main" }}>
            <DeleteIcon fontSize="small" /> 삭제하기
          </MenuItem>
        </Menu>

      </Container>
    </Box>
  );
}