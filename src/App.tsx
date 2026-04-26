import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { 
  CubeState, 
  INITIAL_STATE, 
  validateColorCounts, 
  cubeStateToSolverString,
  solverStringToCubeState,
  applyMoveToState,
  Color,
  FaceName
} from './utils/cubeLogic';
import Cube3D from './components/Cube3D';
import UIOverlay from './components/UIOverlay';
// @ts-ignore
import Cube from 'cubejs';

// Initialize solver - this precomputes tables for Kociemba algorithms
// We do it once outside the component
try {
  Cube.initSolver();
} catch (e) {
  console.error('Failed to initialize Cube solver:', e);
}

export default function App() {
  const [cubeState, setCubeState] = useState<CubeState>(INITIAL_STATE);
  const [selectedColor, setSelectedColor] = useState<Color>('white');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [solveSpeed, setSolveSpeed] = useState(500);
  
  const handleFaceletClick = useCallback((face: FaceName, index: number) => {
    if (isSolving) return;
    
    setCubeState(prev => {
      const newFace = [...prev[face]];
      newFace[index] = selectedColor;
      return { ...prev, [face]: newFace };
    });
    setError(null);
  }, [selectedColor, isSolving]);

  const handleReset = () => {
    setCubeState(INITIAL_STATE);
    setSolution([]);
    setError(null);
    setIsSolving(false);
  };

  const handleShuffle = () => {
    const cube = new Cube();
    cube.scramble();
    setCubeState(solverStringToCubeState(cube.asString(), INITIAL_STATE));
    setSolution([]);
    setError(null);
  };

  const handleSolve = () => {
    if (!validateColorCounts(cubeState)) {
      setError('❌ Defect Cube (Invalid Color Counts)');
      return;
    }

    // Check if centers are unique
    const centers = [cubeState.U[4], cubeState.R[4], cubeState.F[4], cubeState.D[4], cubeState.L[4], cubeState.B[4]];
    const uniqueCenters = new Set(centers);
    if (uniqueCenters.size < 6) {
      setError('❌ Defect Cube (Duplicate Centers)');
      return;
    }

    try {
      const solverStr = cubeStateToSolverString(cubeState);
      
      const solvedString = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
      if (solverStr === solvedString) {
          setError('Cube is already solved!');
          return;
      }

      const cube = Cube.fromString(solverStr);
      const solutionStr = cube.solve();
      
      if (solutionStr) {
        setSolution(solutionStr.split(' ').filter((s: string) => s.length > 0));
        setIsSolving(true);
        setError(null);
      } else {
        setError('❌ Defect Cube (Impossible State)');
      }
    } catch (e) {
      console.error(e);
      setError('❌ Defect Cube (Impossible State)');
    }
  };

  const handleMoveComplete = useCallback((move: string) => {
    setCubeState(prev => {
      const solverStr = cubeStateToSolverString(prev);
      const cube = Cube.fromString(solverStr);
      cube.move(move);
      return solverStringToCubeState(cube.asString(), prev);
    });
  }, []);

  const onSolveComplete = () => {
    setIsSolving(false);
    setSolution([]);
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0a0f] text-slate-100 overflow-hidden font-sans">
      <div className="absolute inset-0">
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={40} />
          <OrbitControls 
            enablePan={false} 
            minDistance={4} 
            maxDistance={12}
            makeDefault
            rotateSpeed={0.5}
          />
          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
          
          <Cube3D 
            cubeState={cubeState} 
            onFaceletClick={handleFaceletClick}
            solution={solution}
            isSolving={isSolving}
            solveSpeed={solveSpeed}
            onSolveComplete={onSolveComplete}
            onMoveComplete={handleMoveComplete}
          />
          
          <Environment preset="night" />
        </Canvas>
      </div>

      <UIOverlay 
        cubeState={cubeState}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        onSolve={handleSolve}
        onReset={handleReset}
        onShuffle={handleShuffle}
        isSolving={isSolving}
        error={error}
        solveSpeed={solveSpeed}
        setSolveSpeed={setSolveSpeed}
        solution={solution}
      />
    </div>
  );
}
