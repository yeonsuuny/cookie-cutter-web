import { Suspense, useLayoutEffect, useRef, useState, useMemo } from "react"; 
import { Canvas, useLoader } from "@react-three/fiber"; 
import { OrbitControls, Environment, Text, Line } from "@react-three/drei"; 
import { STLLoader } from "three-stdlib"; 
import * as THREE from "three";

// =============================================================================
// [1] Props 인터페이스 정의
// =============================================================================
interface Viewer3DProps {
  size: number;
  height: number;
  stlUrl?: string | null;
}

// =============================================================================
// [2] 헬퍼 컴포넌트: 치수선
// =============================================================================
function DimensionLine({ 
  start, end, label, 
  textOffset = [0, 0, 0], 
  // 기본값: 회전 없음 (그룹이 이미 누워있으므로 0이면 바닥에 딱 붙음)
  textRotation = [0, 0, 0] 
}: { 
  start: [number, number, number], 
  end: [number, number, number], 
  label: string, 
  textOffset?: [number, number, number],
  textRotation?: [number, number, number] 
}) {
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
      <Line points={[start, end]} color="black" lineWidth={1} />
      <Text
        position={textPosition}
        color="black"
        fontSize={4}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.2}
        outlineColor="white"
        rotation={textRotation} 
      >
        {label}
      </Text>
    </group>
  );
}

// =============================================================================
// [3] STL 모델 로더 (치수 계산 로직 포함)
// =============================================================================
function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);
  const [bbox, setBbox] = useState<{ min: THREE.Vector3, max: THREE.Vector3 } | null>(null);

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

  const dimensions = useMemo(() => {
    if (!bbox) return null;
    const width = bbox.max.x - bbox.min.x;
    const height = bbox.max.y - bbox.min.y;
    const padding = 5; 

    return {
      widthText: `${width.toFixed(1)} mm`,
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
    // ✨ 이 그룹이 이미 -90도 누워있기 때문에, 안쪽 텍스트는 0도여야 바닥에 붙습니다.
    <group rotation={[-Math.PI / 2, 0, 0]}> 
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#4D3C20" roughness={0.4} metalness={0.1} />
      </mesh>

      {dimensions && (
        <>
          {/* 1. 가로 길이 (Width) */}
          <DimensionLine 
            start={dimensions.widthLine.start as [number, number, number]} 
            end={dimensions.widthLine.end as [number, number, number]} 
            label={dimensions.widthText} 
            textOffset={[0, -5, 0]} 
            // [수정] 회전 0: 바닥에 평평하게 붙어서 정방향으로 보임
            textRotation={[0, 0, 0]} 
          />
          
          {/* 2. 세로 길이 (Height) */}
          <DimensionLine 
            start={dimensions.heightLine.start as [number, number, number]} 
            end={dimensions.heightLine.end as [number, number, number]} 
            label={dimensions.heightText} 
            textOffset={[-5, 0, 0]}
            // [수정] Z축만 90도 회전: 바닥에 붙은 채로 글자만 세로로 돌아감
            textRotation={[0, 0, Math.PI / 2]}
          />
        </>
      )}
    </group>
  );
}

// =============================================================================
// [4] 메인 뷰어 컴포넌트
// =============================================================================
export default function Viewer3D(props: Viewer3DProps) {
  const { size, height, stlUrl } = props;
  const sizeCm = size / 10; 
  const heightCm = height / 10;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>
        <color attach="background" args={["#f0f2f5"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        <Environment preset="city" />

        <Suspense fallback={null}>
          {stlUrl ? (
             <STLModel url={stlUrl} />
          ) : (
            <mesh position={[0, heightCm / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[sizeCm, sizeCm, heightCm]} />
              <meshBasicMaterial color="#4D3C20" wireframe transparent opacity={0.2} />
            </mesh>
          )}
        </Suspense>

        <gridHelper args={[500, 20, 0xe0e0e0, 0xe0e0e0]} position={[0, 0, 0]} />
        <OrbitControls makeDefault /> 
      </Canvas>

      <div style={{
        position: "absolute", top: 20, right: 20, zIndex: 100, 
        backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(4px)",
        padding: "10px 14px", fontSize: "15px", borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: "#555",
        pointerEvents: "none", lineHeight: "1.6", userSelect: "none"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "4px", color: "#333" }}> 3D 뷰어 조작</div>
        <div>• <b>좌클릭</b> : 회전</div>
        <div>• <b>우클릭</b> : 화면 이동</div>
        <div>• <b>휠</b> 스크롤 : 확대/축소</div>
      </div>
    </div>
  );
}