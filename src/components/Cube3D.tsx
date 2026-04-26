
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CubeState, COLOR_MAP, FaceName } from '../utils/cubeLogic';
import { FACELET_MAPPINGS } from '../utils/mapping';

interface CubieState {
  id: number;
  initialPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  currentQuat: THREE.Quaternion;
}

interface Cube3DProps {
  cubeState: CubeState;
  onFaceletClick: (face: FaceName, index: number) => void;
  solution: string[];
  isSolving: boolean;
  solveSpeed: number;
  onSolveComplete: () => void;
  onMoveComplete: (move: string) => void;
}

const CUBIE_SIZE = 0.95;

export default function Cube3D({ 
  cubeState, 
  onFaceletClick, 
  solution, 
  isSolving, 
  solveSpeed,
  onSolveComplete,
  onMoveComplete
}: Cube3DProps) {
  // 27 cubies
  const cubiesRef = useRef<CubieState[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Animation state
  const [animatingMove, setAnimatingMove] = useState<string | null>(null);
  const [moveQueue, setMoveQueue] = useState<string[]>([]);
  const rotationProgress = useRef(0);
  const activeCubiesIndices = useRef<number[]>([]);

  // Initialize cubies
  useEffect(() => {
    if (cubiesRef.current.length === 0) {
      const cubies: CubieState[] = [];
      let id = 0;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            cubies.push({
              id: id++,
              initialPos: new THREE.Vector3(x, y, z),
              currentPos: new THREE.Vector3(x, y, z),
              currentQuat: new THREE.Quaternion(),
            });
          }
        }
      }
      cubiesRef.current = cubies;
    }
  }, []);

  // Update move queue when solution changes
  useEffect(() => {
    if (isSolving && solution.length > 0) {
      setMoveQueue([...solution]);
    }
  }, [isSolving, solution]);

  // Handle move processing
  useEffect(() => {
    if (moveQueue.length > 0 && !animatingMove) {
      const nextMove = moveQueue[0];
      setAnimatingMove(nextMove);
      setMoveQueue(prev => prev.slice(1));
      rotationProgress.current = 0;
      
      // Identify cubies to rotate
      const moveType = nextMove[0];
      const indices: number[] = [];
      cubiesRef.current.forEach((c, idx) => {
        const p = c.currentPos;
        let match = false;
        if (moveType === 'U' && Math.round(p.y) === 1) match = true;
        if (moveType === 'D' && Math.round(p.y) === -1) match = true;
        if (moveType === 'L' && Math.round(p.x) === -1) match = true;
        if (moveType === 'R' && Math.round(p.x) === 1) match = true;
        if (moveType === 'F' && Math.round(p.z) === 1) match = true;
        if (moveType === 'B' && Math.round(p.z) === -1) match = true;
        
        if (match) indices.push(idx);
      });
      activeCubiesIndices.current = indices;
    } else if (moveQueue.length === 0 && !animatingMove && isSolving) {
      // Done solving
      onSolveComplete();
    }
  }, [moveQueue, animatingMove, isSolving, onSolveComplete, solveSpeed]); // solveSpeed added to dependencies

  useFrame((state, delta) => {
    if (animatingMove && activeCubiesIndices.current.length > 0) {
      const duration = solveSpeed / 1000;
      const step = delta / duration;
      rotationProgress.current += step;

      if (rotationProgress.current >= 1) {
        // Finish move
        const move = animatingMove;
        setAnimatingMove(null);
        rotationProgress.current = 0;
        activeCubiesIndices.current = [];
        
        // This triggers App state update, which re-renders Cube3D with new colors
        onMoveComplete(move);
      }
    }
  });

  const getMoveRotation = (move: string | null) => {
    if (!move) return new THREE.Quaternion();
    
    const moveType = move[0];
    const modifier = move.substring(1);
    let totalAngle = Math.PI / 2;
    if (modifier === "'") totalAngle = -Math.PI / 2;
    if (modifier === '2') totalAngle = Math.PI;

    if (moveType === 'U' || moveType === 'R' || moveType === 'F') {
      totalAngle *= -1;
    }

    const progress = Math.min(rotationProgress.current, 1);
    const currentAngle = totalAngle * progress;

    const axis = new THREE.Vector3();
    if (moveType === 'U' || moveType === 'D') axis.set(0, 1, 0);
    if (moveType === 'L' || moveType === 'R') axis.set(1, 0, 0);
    if (moveType === 'F' || moveType === 'B') axis.set(0, 0, 1);

    return new THREE.Quaternion().setFromAxisAngle(axis, currentAngle);
  };

  if (cubiesRef.current.length === 0) return null;

  return (
    <group ref={groupRef}>
      {cubiesRef.current.map((cubie) => (
        <Cubie 
          key={cubie.id}
          cubie={cubie}
          isRotating={activeCubiesIndices.current.includes(cubie.id)}
          rotationQuat={getMoveRotation(animatingMove)}
          cubeState={cubeState}
          onFaceletClick={onFaceletClick}
        />
      ))}
    </group>
  );
}

function Cubie({ cubie, isRotating, rotationQuat, cubeState, onFaceletClick }: { 
  cubie: CubieState; 
  isRotating: boolean;
  rotationQuat: THREE.Quaternion;
  cubeState: CubeState;
  onFaceletClick: (face: FaceName, index: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      if (isRotating) {
        const finalQuat = rotationQuat.clone().multiply(cubie.currentQuat);
        meshRef.current.quaternion.copy(finalQuat);
        
        const rotatedPos = cubie.currentPos.clone().applyQuaternion(rotationQuat);
        meshRef.current.position.copy(rotatedPos);
      } else {
        meshRef.current.quaternion.copy(cubie.currentQuat);
        meshRef.current.position.copy(cubie.currentPos);
      }
    }
  });

  // Calculate face colors based on its CURRENT position in the grid
  // This works because finalizeMove resets pieces to identity orientation 
  // after the move is processed by cubejs.
  const getFaceColors = () => {
    const colors = Array(6).fill('black');
    
    FACELET_MAPPINGS.forEach(m => {
      if (
        Math.round(m.pos[0]) === Math.round(cubie.currentPos.x) &&
        Math.round(m.pos[1]) === Math.round(cubie.currentPos.y) &&
        Math.round(m.pos[2]) === Math.round(cubie.currentPos.z)
      ) {
        const colorValue = cubeState[m.face][m.index];
        const hex = COLOR_MAP[colorValue];
        
        // Match normals to Three.js BoxGeometry face index
        if (m.normal[0] === 1) colors[0] = hex; // Right
        if (m.normal[0] === -1) colors[1] = hex; // Left
        if (m.normal[1] === 1) colors[2] = hex; // Top
        if (m.normal[1] === -1) colors[3] = hex; // Bottom
        if (m.normal[2] === 1) colors[4] = hex; // Front
        if (m.normal[2] === -1) colors[5] = hex; // Back
      }
    });

    return colors;
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (isRotating) return; // Prevent clicking while animating

    const materialIndex = e.face.materialIndex;
    
    // Since finalizeMove resets pieces to identity, 
    // the geometry side indices now directly map to World Normals
    const sideMap = [
      { normal: [1, 0, 0] },  // 0: +X
      { normal: [-1, 0, 0] }, // 1: -X
      { normal: [0, 1, 0] },  // 2: +Y
      { normal: [0, -1, 0] }, // 3: -Y
      { normal: [0, 0, 1] },  // 4: +Z
      { normal: [0, 0, -1] }  // 5: -Z
    ];
    
    const worldNormal = sideMap[materialIndex].normal;

    const hitMapping = FACELET_MAPPINGS.find(m => 
      m.normal[0] === worldNormal[0] &&
      m.normal[1] === worldNormal[1] &&
      m.normal[2] === worldNormal[2] &&
      Math.round(m.pos[0]) === Math.round(cubie.currentPos.x) &&
      Math.round(m.pos[1]) === Math.round(cubie.currentPos.y) &&
      Math.round(m.pos[2]) === Math.round(cubie.currentPos.z)
    );

    if (hitMapping) {
      onFaceletClick(hitMapping.face, hitMapping.index);
    }
  };

  return (
    <mesh 
      ref={meshRef} 
      onPointerDown={handlePointerDown}
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
      {getFaceColors().map((c, i) => (
        <meshStandardMaterial 
          key={i} 
          attach={`material-${i}`} 
          color={c} 
          roughness={0.2}
          metalness={0.1}
        />
      ))}
    </mesh>
  );
}
