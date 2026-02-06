import React from 'react';
import { Paper, Typography, Box, Popper, Fade, ClickAwayListener } from '@mui/material';

// 가이드 내용 정의
const GUIDE_CONTENT: Record<string, { title: string; desc: React.ReactNode; color: string }> = {
  blade: {
    title: "칼날",
    desc: "쿠키 반죽을 자르는 가장 윗부분입니다. Offset은 두께, Extrude는 높이입니다.",
    color: "#607D8B" 
  },
  wall: {
    title: "내벽",
    desc: "쿠키 모양을 잡아주는 테두리입니다. Offset은 두께, Extrude는 높이입니다.",
    color: "#7B1FA2" 
  },
  base: {
    title: "바닥",
    desc: <>커터 전체를 지탱하는 밑판입니다.<br /> Offset은 두께, Extrude는 높이입니다.</>,
    color: "#607D8B" 
  },
  support: {
    title: "지지대",
    desc: "칼날과 바닥을 연결해주는 중간 층입니다. Offset은 두께, Extrude는 높이입니다.",
    color: "#607D8B" 
  },
  stampProtrusion: {
    title: "돌출부 높이",
    desc: "기준면보다 위로 튀어나오는 부분입니다.",
    color: "#9C27B0" 
  },
  stampDepression: {
    title: "함몰부 높이",
    desc: "기준면보다 아래로 들어가는 부분입니다.",
    color: "#7B1FA2" // 보라색 계열로 조금 다르게
  },
  gap: {
    title: "간격",
    desc: "스탬프와 커터 사이의 틈입니다.",
    color: "#EE7B3D"
  }
};

interface ParameterGuideProps {
  activeOption: string | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function ParameterGuide({ activeOption, anchorEl, onClose }: ParameterGuideProps) {
  const open = Boolean(anchorEl && activeOption);
  const content = activeOption ? GUIDE_CONTENT[activeOption] : null;

  if (!content) return null;

  return (
    <Popper 
      open={open} 
      anchorEl={anchorEl} 
      placement="right-start" 
      transition
      style={{ zIndex: 1300 }}
      modifiers={[{ name: 'offset', options: { offset: [0, 10] } }]}
    >
      {({ TransitionProps }) => (
        // ✨ ClickAwayListener로 감싸서 바깥 클릭 시 닫히게 함
        <ClickAwayListener onClickAway={onClose}>
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={6}
              sx={{
                width: 300, // 설명 모달 창 전체 너비
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.98)',
                borderLeft: `5px solid ${content.color}`,
                ml: 1
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: content.color, mb: 1, fontSize: '1.0rem' }}>
                {content.title}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1.4, mb: 1, fontSize: '0.9rem', color: '#424242' }}>
                {content.desc}
              </Typography>
              
              <Box sx={{ width: '100%', height: 190, bgcolor: '#fff', borderRadius: 1, overflow: 'hidden', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <img 
                   src={`/guides/${activeOption}.png`} 
                   alt={content.title}
                   style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                   onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                 />
              </Box>
            </Paper>
          </Fade>
        </ClickAwayListener>
      )}
    </Popper>
  );
}