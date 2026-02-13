import { Suspense, useLayoutEffect, useRef, useState, useMemo } from "react"; 
import { Canvas, useLoader } from "@react-three/fiber"; 
import { OrbitControls, Environment, Text, Line } from "@react-three/drei"; 
import { STLLoader } from "three-stdlib"; 
import * as THREE from "three";

/**
 * =============================================================================
 * ★ [수정 가이드 - 자주 찾는 곳] ★
 * =============================================================================
 * 1. 3D 모델(쿠키커터) 색상 바꾸기
 * -> [3]번 영역의 meshStandardMaterial color="#4D3C20" 수정
 * * 2. 배경색(회색) 바꾸기
 * -> [4]번 영역의 color attach="background" args={["#f0f2f5"]} 수정
 * * 3. 오른쪽 위 '조작 가이드' 문구 바꾸기
 * -> [4]번 영역 맨 아래 <div style=...> 안의 한글 텍스트 수정
 * =============================================================================
 */

// =============================================================================
// [1] Props 인터페이스
// =============================================================================
interface Viewer3DProps {
  size: number;
  height: number;
  stlUrl?: string | null;
}

// =============================================================================
// [2] 헬퍼 컴포넌트: 치수선 (길이 표시하는 선과 숫자)
// =============================================================================
function DimensionLine({ 
  start, end, label, 
  textOffset = [0, 0, 0], 
  textRotation = [0, 0, 0] 
}: { 
  start: [number, number, number], 
  end: [number, number, number], 
  label: string, 
  textOffset?: [number, number, number],
  textRotation?: [number, number, number] 
}) {
  // 선의 중간 지점 계산
  const midPoint = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ] as [number, number, number];

  const textPosition = [
    midPoint[0] + textOffset[0],
    midPoint[1] + textOffset[1],
    midPoint[2] + textOffset[2]
  ] as [number, number, number];

  return (
    <group>
      {/* 선 그리기 */}
      <Line 
        points={[start, end]} 
        color="black" // 치수선 색상
        lineWidth={1} // 선 두께
      />
      {/* 치수 숫자(텍스트) 표시 */}
      <Text
        position={textPosition}
        color="black"         // 글자 색상
        fontSize={4}          // 글자 크기
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.2}    // 글자 테두리 두께 (잘 보이게 하려고 넣음)
        outlineColor="white"  // 글자 테두리 색상
        rotation={textRotation} 
      >
        {label}
      </Text>
    </group>
  );
}

// =============================================================================
// [3] STL 모델 로더 (3D 파일 불러오기 & 크기 측정)
// =============================================================================
function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);
  const [bbox, setBbox] = useState<{ min: THREE.Vector3, max: THREE.Vector3 } | null>(null);

  // 3D 모델의 중심을 맞추고 크기를 계산하는 로직
  useLayoutEffect(() => {
    geometry.center(); 
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (box) {
      const zOffset = -box.min.z;
      geometry.translate(0, 0, zOffset);
      geometry.computeBoundingBox();
      setBbox({ min: box.min, max: box.max });
    }
    if (meshRef.current) {
        meshRef.current.geometry = geometry;
    }
  }, [geometry]);

  // 치수선 위치 계산
  const dimensions = useMemo(() => {
    if (!bbox) return null;
    const width = bbox.max.x - bbox.min.x;
    const height = bbox.max.y - bbox.min.y;
    const padding = 5; // 3D모델과 치수선 사이의 간격 (숫자가 클수록 멀어짐)

    return {
      widthText: `${width.toFixed(1)} mm`, // 단위 표시 (mm)
      heightText: `${height.toFixed(1)} mm`,
      widthLine: {
        start: [bbox.min.x, bbox.min.y - padding, 0],
        end: [bbox.max.x, bbox.min.y - padding, 0]
      },
      heightLine: {
        start: [bbox.min.x - padding, bbox.min.y, 0],
        end: [bbox.min.x - padding, bbox.max.y, 0]
      }
    };
  }, [bbox]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* 3D 모델 렌더링 부분 */} 
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        {/* [수정 포인트] 쿠키커터 재질 및 색상 */}
        <meshStandardMaterial 
          color="#4D3C20"   // 쿠키커터 색상
          roughness={0.4}     // 거칠기 (0~1)
          metalness={0.1}     // 금속성 (0~1, 높으면 쇠처럼 보임)
        />
      </mesh>


      {/* 치수선 표시 (계산된 값이 있을 때만 보임) */}
      {dimensions && (
        <>
          {/* 1. 가로 길이 */}
          <DimensionLine 
            start={dimensions.widthLine.start as [number, number, number]} 
            end={dimensions.widthLine.end as [number, number, number]} 
            label={dimensions.widthText} 
            textOffset={[0, -5, 0]} 
            textRotation={[0, 0, 0]} 
          />
          
          {/* 2. 세로 길이 */}
          <DimensionLine 
            start={dimensions.heightLine.start as [number, number, number]} 
            end={dimensions.heightLine.end as [number, number, number]} 
            label={dimensions.heightText} 
            textOffset={[-5, 0, 0]}
            textRotation={[0, 0, Math.PI / 2]}
          />
        </>
      )}
    </group>
  );
}

// =============================================================================
// [4] 메인 뷰어 컴포넌트 (배경, 조명, 카메라 설정)
// =============================================================================
export default function Viewer3D(props: Viewer3DProps) {
  const { size, height, stlUrl } = props;
  const sizeCm = size / 10; 
  const heightCm = height / 10;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* 3D 캔버스 (여기가 3D 화면입니다) */}
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>

        {/* [수정 포인트] 배경색 설정 */}
        {/* args={["#f0f2f5"]} 안의 색상 코드를 바꾸면 배경색이 바뀝니다. */}
        <color attach="background" args={["#f0f2f5"]} />

        {/* 조명 설정 (너무 어두우면 intensity 숫자를 올리세요) */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />

        {/* 도시 배경 반사 효과 (질감을 살려줌) */}
        <Environment preset="city" />

        <Suspense fallback={null}>
          {stlUrl ? (
             <STLModel url={stlUrl} />
          ) : (
            // STL 파일이 없을 때 보여주는 임시 박스 (투명한 갈색 박스)
            <mesh position={[0, heightCm / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[sizeCm, sizeCm, heightCm]} />
              <meshBasicMaterial color="#4D3C20" wireframe transparent opacity={0.2} />
            </mesh>
          )}
        </Suspense>
        
        {/* 바닥 모눈종이 (그리드) */}
        {/* args=[크기, 칸수, 중심선색, 그리드색] */}
        <gridHelper args={[500, 20, 0xe0e0e0, 0xe0e0e0]} position={[0, 0, 0]} />
        {/* 마우스 컨트롤 (회전, 줌 등) */}
        <OrbitControls makeDefault /> 
      </Canvas>

      {/* =======================================================================
          [UI] 조작 가이드 (오른쪽 위 설명 박스)
          ======================================================================= */}
      <div style={{
        position: "absolute", top: 20, right: 20, zIndex: 100, 
        backgroundColor: "rgba(255, 255, 255, 0.8)", // 박스 배경색 (0.8은 투명도)
        backdropFilter: "blur(4px)",                   // 배경 흐림 효과
        padding: "10px 14px", fontSize: "15px", borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: "#555",
        pointerEvents: "none", lineHeight: "1.6", userSelect: "none"
      }}>
        {/* 제목 텍스트 */}
        <div style={{ fontWeight: "bold", marginBottom: "4px", color: "#333" }}> 3D 뷰어 조작</div>

        {/* 설명 목록 */}
        <div>• <b>좌클릭</b> : 회전</div>
        <div>• <b>우클릭</b> : 화면 이동</div>
        <div>• <b>휠</b> 스크롤 : 확대/축소</div>
      </div>
    </div>
  );
}