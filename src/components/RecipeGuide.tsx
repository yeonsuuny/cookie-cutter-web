import { Dialog, IconButton, Typography, Box, Stack } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface RecipeGuideProps {
  open: boolean;
  onClose: () => void;
}

/**
 * =============================================================================
 * ★ [필독: 수정 가이드 - 가장 자주 찾는 곳] ★
 * =============================================================================
 * 1. 글씨나 그림을 바꾸고 싶다면?
 * -> 아래 [2]번 'steps' 리스트 안의 내용을 수정하세요.
 * * 2. 팝업창 배경 이미지를 바꾸고 싶다면?
 * -> 아래 [4]번 UI 렌더링 영역의 backgroundImage 부분을 찾으세요.
 * =============================================================================
 */

// =============================================================================
// [1] 폰트(글씨체) 설정
// =============================================================================
const handFont = {
  fontFamily: "'Jua', sans-serif", // 사용할 폰트 이름
  color: '#5d4037',              // 기본 글자 색상
};

export default function RecipeGuide({ open, onClose }: RecipeGuideProps) {
  
  // ===========================================================================
  // [2] 데이터 리스트 (여기를 고치면 화면 내용이 바뀝니다)
  // ===========================================================================
  // 순서대로 1번, 2번... 단계가 화면에 표시됩니다.
  // 단계를 추가하고 싶으면 { ... }, 중괄호 덩어리를 복사해서 맨 뒤에 붙여넣으세요.
  const steps = [
    {
      id: 1, // 순서 번호 (중복되지만 않게 적으시면 됩니다)
      title: "1. 업로드", // 굵은 제목
      // 설명 부분 (<br />은 줄바꿈입니다)
      desc: <>원하는 이미지 파일을 업로드 합니다<br />PNG, JPG 파일만 가능해요!</>,
      imgSrc: "/judang_upload.png", // public 폴더 안에 있는 이미지 파일명 (이미지를 변경하면 여기 파일명 부분도 수정해주셔야 합니다)
      imgWidth: '155px'             // 그림(이미지)의 크기 
    },
    {
      id: 2,
      title: "2. 커스텀",
      desc: "3D 모델 사이즈를 수정합니다",
      imgSrc: "/judang_settings.png",
      imgWidth: '145px' 
    },
    {
      id: 3,
      title: "3. 다운로드",
      desc: <>수정된 모델을 STL 파일로<br />다운받습니다</>,
      imgSrc: "/judang_download.png",
      imgWidth: '145px' 
    },
    {
      id: 4,
      title: "4. 굽기", 
      desc: "완성된 쿠키 커터로 쿠키를 구워봐요!",
      imgSrc: "/judang_cooking.png",
      imgWidth: '150px' 
    }
  ];

  // ===========================================================================
  // [3] UI 렌더링 (화면 디자인)
  // ===========================================================================
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      // 3-1. 팝업창 전체 틀 디자인 (배경화면 설정)
      PaperProps={{
        style: {
          backgroundImage: `url("/popup2.png")`, // 배경 이미지 파일명 (public 폴더 기준)
          backgroundSize: '100% 100%', 
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          
          // 팝업창 크기
          width: '600px',  // 가로 너비
          height: '800px', // 세로 높이

          // 안쪽 여백 (순서대로: 위, 오른쪽, 아래, 왼쪽)
          // 배경 이미지 안의 '종이' 그림 위치에 맞춰서 글자를 밀어넣는 역할입니다.
          padding: '80px 40px 40px 40px',
          boxSizing: 'border-box'
        }
      }}
    >
      {/* 3-2. 닫기 버튼 (X 아이콘) */}
      <IconButton
        onClick={onClose}
        sx={{ 
          position: 'absolute', // 위치를 내 맘대로 지정하겠다는 정의
          top: '85px',          // 위에서 얼마나 떨어질지
          right: '65px',        // 오른쪽에서 얼마나 떨어질지
          color: '#8d6e63'    // x 버튼 색상
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* 3-3. 내용물 전체를 감싸는 상자 */}
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '40px' }}>
        
        {/* [제목 텍스트] */}
        <Typography variant="h5" sx={{ ...handFont, fontSize: '1.8rem', mb: 2, fontWeight: 'bold' }}>
         3🍪LIGHT RECIPE
        </Typography>

        {/* [리스트 영역] (내용이 많으면 스크롤 생김) */}
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: '450px', 
            flexGrow: 1, 
            overflowY: 'auto',
            paddingRight: '10px',

            // 스크롤바 디자인 (막대기 색상 등)
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(93, 64, 55, 0.3)", borderRadius: "3px" }
          }}
        >
          {/* 리스트 아이템들의 간격 조절 */}
          <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px', transform: 'translate(28px)' }}>
            
            {/* steps 리스트에 적힌 내용을 하나씩 꺼내서 화면에 뿌려주는 곳 
                여기보다 위쪽 steps 데이터를 수정하는 것이 좋습니다!
            */}
            {steps.map((step, index) => (
              <Box 
                key={step.id}
                sx={{
                  display: 'flex', // 가로로 배치 (글자 - 그림)
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row', 
        
                  // 마지막 아이템이 아니면, 아래쪽에 점선을 그립니다.
                  borderBottom: index === steps.length - 1 ? 'none' : '2px dashed rgba(93, 64, 55, 0.2)',
                  paddingBottom: '10px'
                }}
              >
                {/* 1) 글자 영역 (왼쪽) */}
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  {/* 제목 */}
                  <Typography variant="h6" sx={{ ...handFont, fontSize: '1.4rem' }}>
                    {step.title}
                  </Typography>
                  {/* 설명 */}
                  <Typography variant="body1" sx={{ ...handFont, fontSize: '1.11rem', letterSpacing: '-0.5px', opacity: 0.8 }}>
                    {step.desc}
                  </Typography>
                </Box>

                {/* 2) 그림 영역 (오른쪽) */}
                <Box 
                  component="img"
                  src={step.imgSrc} // 위 steps 데이터에서 적은 이미지 주소
                  alt={step.title}
                  sx={{
                    width: step.imgWidth, // 위 steps 데이터에서 적은 크기
                    height: 'auto',
                    objectFit: 'contain',
                    marginLeft: '15px' 
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}