import { Suspense, useLayoutEffect, useRef } from "react"; 
import { Canvas, useLoader } from "@react-three/fiber"; 
import { OrbitControls, Environment } from "@react-three/drei"; 
import { STLLoader } from "three-stdlib"; 
import * as THREE from "three";

// =============================================================================
// [1] Props 인터페이스 정의
// =============================================================================
interface Viewer3DProps {
  // 기본 설정
  size: number;
  height: number;
  stlUrl?: string | null;      // 변환된 STL 파일 URL
}

// =============================================================================
// [2] 헬퍼 컴포넌트 (모델 로더)
// =============================================================================

// [2-1] STL 모델 로더 및 렌더러
function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // 지오메트리 중심점 조정 (모델이 바닥 정중앙에 오도록)
  useLayoutEffect(() => {
    geometry.center(); 
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (box) {
      const zOffset = -box.min.z;
      geometry.translate(0, 0, zOffset); // Z축 바닥 맞추기
    }
    if (meshRef.current) {
        meshRef.current.geometry = geometry;
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#4D3C20" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

// =============================================================================
// [3] 메인 뷰어 컴포넌트
// =============================================================================
export default function Viewer3D(props: Viewer3DProps) {
  const { 
    size, height, stlUrl
  } = props;
  
  // 3D 씬 스케일 조정 (mm -> cm)
  const sizeCm = size / 10; 
  const heightCm = height / 10;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      
      {/* 3-1. 3D Canvas 영역 */}
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>
        <color attach="background" args={["#f0f2f5"]} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        <Environment preset="city" />

        {/* 모델 렌더링 (Suspense로 로딩 처리) */}
        <Suspense fallback={null}>
          {stlUrl ? (
             <STLModel url={stlUrl} />
          ) : (
            // STL 없을 때 보여줄 임시 와이어프레임 박스
            <mesh position={[0, heightCm / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[sizeCm, sizeCm, heightCm]} />
              <meshBasicMaterial color="#4D3C20" wireframe transparent opacity={0.2} />
            </mesh>
          )}

        </Suspense>

        {/* 유틸리티 (그리드, 카메라 컨트롤) */}
        <gridHelper args={[500, 20, 0xe0e0e0, 0xe0e0e0]} position={[0, 0, 0]} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} /> 
      </Canvas>

      {/* 3-2. HTML UI 오버레이 (조작 가이드) */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 100, 
        
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(4px)",
        padding: "10px 14px",
        fontSize: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        color: "#555",
        pointerEvents: "none", 
        lineHeight: "1.6",
        userSelect: "none"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "4px", color: "#333" }}> 3D 뷰어 조작</div>
        <div>• <b>좌클릭</b> : 회전</div>
        <div>• <b>우클릭</b> : 화면 이동</div>
        <div>• <b>휠</b> 스크롤 : 확대/축소</div>
      </div>
    </div>
  );
}