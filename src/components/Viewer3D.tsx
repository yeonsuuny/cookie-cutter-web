import { Suspense, useLayoutEffect, useRef } from "react"; 
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

// 3. 스마트 비주얼 가이드
function VisualGuide({ 
  param, sizeCm,
  bladeDepth = 12, supportDepth = 3, baseDepth = 2.0, wallExtrude = 2.0,
  bladeThick, supportThick, baseThick, gap, wallOffset
}: any) {
  
  if (!param) return null;

  const values: Record<string, any> = {
    bladeThick, bladeDepth,
    supportThick, supportDepth,
    baseThick, baseDepth,
    gap, wallOffset, wallExtrude
  };

  const currentValue = values[param];
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
      {(param === 'gap') && (
         <group position={[0, totalHeight + 2, 0]}>
           <Text fontSize={1} color="#333" outlineWidth={0.1} outlineColor="white">
             {`Gap: ${gap}mm`}
           </Text>
           <Text position={[0, -1, 0]} fontSize={0.6} color="#666">(스탬프와 커터 사이 거리)</Text>
         </group>
      )}
      {(param.includes('Thick') || param.includes('Offset')) && (
        <group position={[0, totalHeight + 2, 0]}>
           <Text fontSize={1} color="#e91e63" outlineWidth={0.1} outlineColor="white">
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
      <meshStandardMaterial color="#4D3C20" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

// 5. 메인 뷰어
export default function Viewer3D(props: Viewer3DProps) {
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
              <meshBasicMaterial color="#ff8fa3" wireframe transparent opacity={0.2} />
            </mesh>
          )}
          
          <VisualGuide 
            param={focusedParam} 
            sizeCm={sizeCm}
            bladeDepth={bladeDepth}
            supportDepth={supportDepth}
            baseDepth={baseDepth}
            wallExtrude={wallExtrude}
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

      {/* 마우스 조작 가이드 안내 문구 */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 100, // [수정됨] 이 부분이 핵심입니다. 맨 앞으로 가져옵니다.
        
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