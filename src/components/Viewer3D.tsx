import React, { Suspense, useLayoutEffect, useRef, useMemo } from "react"; 
import { Canvas, useLoader } from "@react-three/fiber"; 
import { OrbitControls, ContactShadows, Environment, Text, Line } from "@react-three/drei"; 
import { STLLoader } from "three-stdlib"; 
import * as THREE from "three";

// 1. Props 정의
interface Viewer3DProps {
  size: number;
  thickness: number;
  height: number;
  type?: string;
  focusedParam: string | null;
  stlUrl?: string | null; 
  
  bladeThick?: number;
  bladeDepth?: number;
  supportThick?: number;
  supportDepth?: number;
  baseThick?: number;
  baseDepth?: number;
  gap?: number;
  wallOffset?: number;
  wallExtrude?: number;
}

// 2. 치수선 컴포넌트
const DimensionLine = ({ start, end, label, color = "#333", offset = 0 }: any) => {
  const midPoint = new THREE.Vector3().addVectors(new THREE.Vector3(...start), new THREE.Vector3(...end)).multiplyScalar(0.5);
  
  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={1.5} dashed={false} />
      <Line points={[[start[0] - 0.5, start[1], start[2]], [start[0] + 0.5, start[1], start[2]]]} color={color} lineWidth={1} />
      <Line points={[[end[0] - 0.5, end[1], end[2]], [end[0] + 0.5, end[1], end[2]]]} color={color} lineWidth={1} />
      <Text
        position={[midPoint.x + 1.5 + offset, midPoint.y, midPoint.z]}
        fontSize={0.8}
        color={color}
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#fff"
      >
        {label}
      </Text>
    </group>
  );
};

// 3. [수정됨] 스마트 비주얼 가이드 (eval 제거 및 Props 추가)
function VisualGuide({ 
  param, sizeCm,
  // 높이 관련
  bladeDepth = 12, supportDepth = 3, baseDepth = 2.0, wallExtrude = 2.0,
  // 두께 관련 (이 부분이 빠져서 에러가 났었습니다)
  bladeThick, supportThick, baseThick, gap, wallOffset
}: any) {
  
  if (!param) return null;

  // 값 조회를 위한 안전한 매핑 테이블
  const values: Record<string, any> = {
    bladeThick, bladeDepth,
    supportThick, supportDepth,
    baseThick, baseDepth,
    gap, wallOffset, wallExtrude
  };

  // 현재 포커스된 파라미터의 값 가져오기
  const currentValue = values[param];

  // mm -> cm 변환
  const toCm = (v: number) => (Number(v) || 0) / 10;
  
  const bD = toCm(bladeDepth);
  const sD = toCm(supportDepth);
  const baD = toCm(baseDepth);
  const wExtrudeCm = toCm(wallExtrude);
  const totalHeight = baD + sD + bD;
  const guideX = sizeCm / 2 + 2; 

  const baseTop = baD;
  const supportTop = baD + sD;
  const bladeTop = baD + sD + bD;

  return (
    <group>
      {/* === 높이(Depth) 관련 가이드 === */}
      {(param.includes('base') && param.includes('Depth')) && (
        <DimensionLine start={[guideX, 0, 0]} end={[guideX, baseTop, 0]} label={`Base: ${baseDepth}mm`} color="#9e9e9e" />
      )}
      {(param.includes('support') && param.includes('Depth')) && (
        <DimensionLine start={[guideX, baseTop, 0]} end={[guideX, supportTop, 0]} label={`Support: ${supportDepth}mm`} color="#ff9800" />
      )}
      {(param.includes('blade') && param.includes('Depth')) && (
        <DimensionLine start={[guideX, supportTop, 0]} end={[guideX, bladeTop, 0]} label={`Blade: ${bladeDepth}mm`} color="#e91e63" />
      )}
      {(param.includes('wall') && param.includes('Extrude')) && (
        <DimensionLine start={[guideX - 2, 0, 0]} end={[guideX - 2, wExtrudeCm, 0]} label={`Wall: ${wallExtrude}mm`} color="#2196f3" />
      )}

      {/* === 두께/간격(Thickness/Gap) 관련 가이드 === */}
      
      {/* 간격 (Gap) */}
      {(param === 'gap') && (
         <group position={[0, totalHeight + 2, 0]}>
           <Text fontSize={1} color="#333" outlineWidth={0.1} outlineColor="white">
             {`Gap: ${gap}mm`}
           </Text>
           <Text position={[0, -1, 0]} fontSize={0.6} color="#666">(스탬프와 커터 사이 거리)</Text>
         </group>
      )}

      {/* 두께 (Thickness) 및 Offset */}
      {(param.includes('Thick') || param.includes('Offset')) && (
        <group position={[0, totalHeight + 2, 0]}>
           <Text fontSize={1} color="#e91e63" outlineWidth={0.1} outlineColor="white">
             {/* 안전하게 가져온 값 표시 */}
             {`Thickness: ${currentValue || '?'}mm`}
           </Text>
           <Text position={[0, -1, 0]} fontSize={0.6} color="#666">(노즐 크기 고려)</Text>
         </group>
      )}
    </group>
  );
}

// 4. 모델 컴포넌트
function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useLayoutEffect(() => {
    geometry.center(); 
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (box) {
      const zOffset = -box.min.z;
      geometry.translate(0, 0, zOffset); 
    }
    if (meshRef.current) {
        meshRef.current.geometry = geometry;
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#ff5c8d" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

// 5. 메인 뷰어
export default function Viewer3D(props: Viewer3DProps) {
  // props에서 모든 값을 분해해서 VisualGuide로 전달해야 합니다.
  const { 
    size, height, stlUrl, focusedParam,
    bladeThick, bladeDepth, 
    supportThick, supportDepth, 
    baseThick, baseDepth,
    gap, wallOffset, wallExtrude,
  } = props;
  
  const sizeCm = size / 10; 
  const heightCm = height / 10;

  return (
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
            <meshBasicMaterial color="#ff8fa3" wireframe transparent opacity={0.2} />
          </mesh>
        )}
        
        {/* 모든 파라미터를 명시적으로 전달 */}
        <VisualGuide 
          param={focusedParam} 
          sizeCm={sizeCm}
          bladeDepth={bladeDepth}
          supportDepth={supportDepth}
          baseDepth={baseDepth}
          wallExtrude={wallExtrude}
          // 에러 원인이었던 누락된 props들 추가
          bladeThick={bladeThick}
          supportThick={supportThick}
          baseThick={baseThick}
          gap={gap}
          wallOffset={wallOffset}
        />

        <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={50} blur={2} far={4} />
      </Suspense>

      <gridHelper args={[500, 20, 0xffcdd2, 0xe0e0e0]} position={[0, 0, 0]} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} /> 
    </Canvas>
  );
}