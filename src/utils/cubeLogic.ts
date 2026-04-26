
export type Color = 'white' | 'yellow' | 'red' | 'orange' | 'blue' | 'green';

export const COLORS: Color[] = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];

export const COLOR_MAP: Record<Color, string> = {
  white: '#ffffff',
  yellow: '#ffff00',
  red: '#ff0000',
  orange: '#ffa500',
  blue: '#0000ff',
  green: '#00ff00',
};

// Faces order for many solvers: U, R, F, D, L, B
export type FaceName = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export interface CubeState {
  U: Color[];
  R: Color[];
  F: Color[];
  D: Color[];
  L: Color[];
  B: Color[];
}

export const INITIAL_STATE: CubeState = {
  U: Array(9).fill('white'),
  R: Array(9).fill('red'),
  F: Array(9).fill('green'),
  D: Array(9).fill('yellow'),
  L: Array(9).fill('orange'),
  B: Array(9).fill('blue'),
};

export const COLOR_TO_FACE_CHAR: Record<Color, string> = {
  white: 'U',
  yellow: 'D',
  red: 'R',
  orange: 'L',
  green: 'F',
  blue: 'B',
};

// ... (keep existing imports)
export function applyMoveToState(state: CubeState, move: string): CubeState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeState;
  const moveType = move[0] as FaceName;
  const modifier = move.substring(1);
  const turns = modifier === '2' ? 2 : (modifier === "'" ? 3 : 1);

  for (let t = 0; t < turns; t++) {
    const tempState = JSON.parse(JSON.stringify(newState)) as CubeState;
    
    // Rotate face itself
    newState[moveType][0] = tempState[moveType][6];
    newState[moveType][1] = tempState[moveType][3];
    newState[moveType][2] = tempState[moveType][0];
    newState[moveType][3] = tempState[moveType][7];
    newState[moveType][5] = tempState[moveType][1];
    newState[moveType][6] = tempState[moveType][8];
    newState[moveType][7] = tempState[moveType][5];
    newState[moveType][8] = tempState[moveType][2];

    // Rotate sides
    if (moveType === 'U') {
      // F -> L, L -> B, B -> R, R -> F (Top row: 0,1,2)
      newState.L[0] = tempState.F[0]; newState.L[1] = tempState.F[1]; newState.L[2] = tempState.F[2];
      newState.B[0] = tempState.L[0]; newState.B[1] = tempState.L[1]; newState.B[2] = tempState.L[2];
      newState.R[0] = tempState.B[0]; newState.R[1] = tempState.B[1]; newState.R[2] = tempState.B[2];
      newState.F[0] = tempState.R[0]; newState.F[1] = tempState.R[1]; newState.F[2] = tempState.R[2];
    } else if (moveType === 'D') {
      // F -> R, R -> B, B -> L, L -> F (Bottom row: 6,7,8)
      newState.R[6] = tempState.F[6]; newState.R[7] = tempState.F[7]; newState.R[8] = tempState.F[8];
      newState.B[6] = tempState.R[6]; newState.B[7] = tempState.R[7]; newState.B[8] = tempState.R[8];
      newState.L[6] = tempState.B[6]; newState.L[7] = tempState.B[7]; newState.L[8] = tempState.B[8];
      newState.F[6] = tempState.L[6]; newState.F[7] = tempState.L[7]; newState.F[8] = tempState.L[8];
    } else if (moveType === 'L') {
      // U -> F, F -> D, D -> B, B -> U (Left col)
      // U:0,3,6 -> F:0,3,6 -> D:0,3,6 -> B:8,5,2
      newState.F[0] = tempState.U[0]; newState.F[3] = tempState.U[3]; newState.F[6] = tempState.U[6];
      newState.D[0] = tempState.F[0]; newState.D[3] = tempState.F[3]; newState.D[6] = tempState.F[6];
      newState.B[8] = tempState.D[0]; newState.B[5] = tempState.D[3]; newState.B[2] = tempState.D[6];
      newState.U[0] = tempState.B[8]; newState.U[3] = tempState.B[5]; newState.U[6] = tempState.B[2];
    } else if (moveType === 'R') {
      // U -> B, B -> D, D -> F, F -> U (Right col)
      // U:2,5,8 -> B:6,3,0 -> D:2,5,8 -> F:2,5,8
      newState.B[6] = tempState.U[2]; newState.B[3] = tempState.U[5]; newState.B[0] = tempState.U[8];
      newState.D[2] = tempState.B[6]; newState.D[5] = tempState.B[3]; newState.D[8] = tempState.B[0];
      newState.F[2] = tempState.D[2]; newState.F[5] = tempState.D[5]; newState.F[8] = tempState.D[8];
      newState.U[2] = tempState.F[2]; newState.U[5] = tempState.F[5]; newState.U[8] = tempState.F[8];
    } else if (moveType === 'F') {
      // U -> R, R -> D, D -> L, L -> U
      // U:6,7,8 -> R:0,3,6 -> D:2,1,0 -> L:8,5,2
      newState.R[0] = tempState.U[6]; newState.R[3] = tempState.U[7]; newState.R[6] = tempState.U[8];
      newState.D[2] = tempState.R[0]; newState.D[1] = tempState.R[3]; newState.D[0] = tempState.R[6];
      newState.L[8] = tempState.D[2]; newState.L[5] = tempState.D[1]; newState.L[2] = tempState.D[0];
      newState.U[6] = tempState.L[8]; newState.U[7] = tempState.L[5]; newState.U[8] = tempState.L[2];
    } else if (moveType === 'B') {
      // U -> L, L -> D, D -> R, R -> U
      // U:0,1,2 -> L:6,3,0 -> D:8,7,6 -> R:2,5,8
      newState.L[6] = tempState.U[0]; newState.L[3] = tempState.U[1]; newState.L[0] = tempState.U[2];
      newState.D[8] = tempState.L[6]; newState.D[7] = tempState.L[3]; newState.D[6] = tempState.L[0];
      newState.R[2] = tempState.D[8]; newState.R[5] = tempState.D[7]; newState.R[8] = tempState.D[6];
      newState.U[0] = tempState.R[2]; newState.U[1] = tempState.R[5]; newState.U[2] = tempState.R[8];
    }
  }

  return newState;
}

export function solverStringToCubeState(solverStr: string, originalState: CubeState): CubeState {
  const charToColor: Record<string, Color> = {
    'U': originalState.U[4],
    'R': originalState.R[4],
    'F': originalState.F[4],
    'D': originalState.D[4],
    'L': originalState.L[4],
    'B': originalState.B[4],
  };

  const faces: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  const newState = {
    U: Array(9), R: Array(9), F: Array(9), D: Array(9), L: Array(9), B: Array(9)
  } as CubeState;
  
  for (let f = 0; f < 6; f++) {
    const faceName = faces[f];
    for (let i = 0; i < 9; i++) {
        const char = solverStr[f * 9 + i];
        newState[faceName][i] = charToColor[char] || originalState.U[4];
    }
  }
  return newState;
}

export function cubeStateToSolverString(state: CubeState): string {
  // Map each color to the face it currently represents based on center facelets (index 4)
  const colorToFace: Record<string, string> = {};
  
  const centerColors = [
    { face: 'U', color: state.U[4] },
    { face: 'R', color: state.R[4] },
    { face: 'F', color: state.F[4] },
    { face: 'D', color: state.D[4] },
    { face: 'L', color: state.L[4] },
    { face: 'B', color: state.B[4] },
  ];

  // If centers are not unique, the mapping will be broken, but that's an invalid cube state
  centerColors.forEach(cc => {
    colorToFace[cc.color] = cc.face;
  });
  
  const faces: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  return faces.map(f => state[f].map(c => colorToFace[c] || 'U').join('')).join('');
}

export function validateColorCounts(state: CubeState): boolean {
  const counts: Record<string, number> = {};
  COLORS.forEach(c => counts[c] = 0);
  
  Object.values(state).forEach(face => {
    face.forEach(color => {
      counts[color]++;
    });
  });

  return Object.values(counts).every(count => count === 9);
}
