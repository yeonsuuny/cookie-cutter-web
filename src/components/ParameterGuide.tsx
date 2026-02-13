import React from 'react';
import { Paper, Typography, Box, Popper, Fade, ClickAwayListener } from '@mui/material';

/**
 * =============================================================================
 * ★ [필독: 수정 가이드] ★
 * =============================================================================
 * 1. 설명 글이나 색깔을 바꾸고 싶다면?
 * -> 아래 [1]번 GUIDE_CONTENT 안에 있는 내용을 수정하세요.
 * * 2. 말풍선(박스)의 크기나 배경색을 바꾸고 싶다면?
 * -> 아래 [3]번 UI 렌더링 영역의 sx={{ ... }} 부분을 수정하세요.
 * * 3. 이미지는 어디서 바꾸나요?
 * -> 프로젝트 폴더 중 [public] -> [guides] 폴더 안에
 * blade.png, wall.png 같은 이름으로 그림 파일을 넣으면 자동으로 바뀝니다. 꼭 !! 파일 이름 지키셔야 합니다
 * =============================================================================
 */

// =============================================================================
// [1] (물음표 누르면 나오는) 가이드 내용 설정 (텍스트 & 색상 수정)
// =============================================================================
// 여기서 'blade', 'wall' 같은 영어 이름은 시스템 ID이므로 수정하지 마세요.
// 따옴표("") 안의 한글 내용과 색상 코드만 수정하시면 됩니다.
const GUIDE_CONTENT: Record<string, { title: string; desc: React.ReactNode; color: string }> = {
  blade: {
    title: "칼날", // 굵은 제목
    // 설명 내용 (<br />은 줄바꿈입니다)
    desc: <>반죽을 실제로 자르는 부분입니다.<br /> Thickness은 두께, Depth는 높이입니다.</>,
    color: "#607D8B" // 왼쪽 테두리 색상
  },
  wall: {
    title: "내벽",
    desc: "스탬프의 가장자리를 감싸는 외곽 테두리입니다. Offset은 두께, Extrude는 높이입니다.",
    color: "#7B1FA2" 
  },
  base: {
    title: "바닥",
    desc: <>커터 전체를 지탱하는 밑판입니다.<br /> Thickness은 두께, Depth는 높이입니다.</>,
    color: "#607D8B" 
  },
  support: {
    title: "지지대",
    desc: "칼날과 바닥을 연결해주는 중간 층입니다. Thickness은 두께, Depth는 높이입니다.",
    color: "#607D8B" 
  },
  stampProtrusion: {
    title: "돌출부 높이",
    desc: "무늬가 반죽에 찍히는 부분의 깊이입니다.",
    color: "#9C27B0" 
  },
  stampDepression: {
    title: "함몰부 높이",
    desc: "무늬들 사이를 이어주며 스탬프의 바닥이 되는 평면의 높이입니다.",
    color: "#7B1FA2"
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
  // [2] 로직 처리
  // 팝업이 열려야 하는지 판단하는 코드
  const open = Boolean(anchorEl && activeOption);
  const content = activeOption ? GUIDE_CONTENT[activeOption] : null;

  if (!content) return null;

  return (
    // Popper: 설명 박스 위치를 잡아주는 기능
    <Popper 
      open={open} 
      anchorEl={anchorEl} 
      placement="right-start" // 설명 박스 위치 (오른쪽 시작점)
      transition
      style={{ zIndex: 1300 }} 
      modifiers={[{ name: 'offset', options: { offset: [0, 10] } }]} // 위치 미세 조정 [가로, 세로]
    >
      {({ TransitionProps }) => (
        // ClickAwayListener: 설명 박스 바깥을 클릭하면 닫히게 하는 기능
        <ClickAwayListener onClickAway={onClose}>
          <Fade {...TransitionProps} timeout={200}>

            {/* =======================================================================
               [3] UI 디자인 (설명 박스 모양 수정)
               ======================================================================= */}
            <Paper
              elevation={6} // 그림자 깊이 (숫자가 클수록 그림자가 진해짐)
              sx={{
                width: 340, // 설명 박스 전체 가로 너비 (더 넓게 하려면 숫자를 키우세요)
                p: 2,       // 안쪽 여백
                borderRadius: 2, // 모서리 둥글기 (숫자를 키우면 더 둥글어짐)
                bgcolor: 'rgba(255, 255, 255, 0.98)', // 배경색 (0.98이 투명도)
                borderLeft: `5px solid ${content.color}`, // 왼쪽의 굵은 컬러 바 (두께 5px)
                ml: 1 // ml(margin-left): 왼쪽 여백
              }}
            >
              {/* 3-1. 제목 텍스트 */}
              <Typography 
                variant="subtitle2" 
                fontWeight="bold" 
                sx={{ 
                  color: content.color, // 위에서 테두리 색으로 정한 색상을 따라감 (변경하고 싶으시면 색상 코드 넣으시면 됩니다)
                  mb: 1,                // mb(margin-bottom): 아래쪽 여백
                  fontSize: '1.0rem'    // 제목 글자 크기
                }}
              >
                {content.title}
              </Typography>

              {/* 3-2. 설명 텍스트 */}
              <Typography 
                variant="caption" 
                display="block" 
                color="text.secondary" 
                sx={{ 
                  lineHeight: 1.4,    // 줄 간격 (숫자가 클스록 줄 사이가 벌어짐)
                  mb: 1, 
                  fontSize: '0.9rem', // 설명 글자 크기
                  color: '#424242'  // 설명 글자 색상
                }}
              >
                {content.desc}
              </Typography>
              
              {/* ===========================================================================
                  [3-3] 이미지 영역 (현재 설정: 'gap'일 때는 이미지 숨김)
                  ===========================================================================
                  ★ [수정 가이드: 'gap'에도 이미지를 넣고 싶다면?]
                  현재는 아래 첫 줄의 코드 때문에 'gap' 항목일 때는 이미지가 안 보입니다.
                  만약 나중에 'gap'에도 이미지를 넣고 싶다면,
                  
                  1. 바로 아래 줄의 {activeOption !== 'gap' && (  <-- 이 줄을 지우고
                  2. 저~ 아래 닫는 괄호 )}                        <-- 이 줄도 같이 지워주세요.
                  
                  그러면 조건 없이 항상 이미지가 보이게 됩니다.
              */}
              {activeOption !== 'gap' && (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 190, // 이미지 박스 높이
                    bgcolor: '#fff', 
                    borderRadius: 1, 
                    overflow: 'hidden', 
                    border: '1px solid #eee', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}
                >
                  {/* [이미지 경로 설명]
                      /guides/ 폴더 안에 있는 파일명(blade.png 등)을 불러옵니다.
                      이미지를 바꾸려면 코드를 수정하지 말고 이미지 파일을 교체하세요.
                   */}
                   <img 
                     src={`/guides/${activeOption}.png`} 
                     alt={content.title}
                     style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                     onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                   />
                </Box>
              )} {/* <--- [수정 가이드] gap 이미지를 넣고 싶으면 이 줄(닫는 괄호)도 같이 지워야 합니다! */}
            </Paper>
          </Fade>
        </ClickAwayListener>
      )}
    </Popper>
  );
}