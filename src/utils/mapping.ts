
import { FaceName } from './cubeLogic';

export interface FaceletMapping {
  face: FaceName;
  index: number;
  pos: [number, number, number];
  normal: [number, number, number];
}

// x: -1 (L) -> 1 (R)
// y: -1 (D) -> 1 (U)
// z: -1 (B) -> 1 (F)

export const FACELET_MAPPINGS: FaceletMapping[] = [
  // U face (y = 1)
  ...[0,1,2,3,4,5,6,7,8].map(i => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return { face: 'U' as FaceName, index: i, pos: [col - 1, 1, row - 1], normal: [0, 1, 0] } as FaceletMapping;
  }),
  // R face (x = 1)
  ...[0,1,2,3,4,5,6,7,8].map(i => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return { face: 'R' as FaceName, index: i, pos: [1, 1 - row, 1 - col], normal: [1, 0, 0] } as FaceletMapping;
  }),
  // F face (z = 1)
  ...[0,1,2,3,4,5,6,7,8].map(i => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return { face: 'F' as FaceName, index: i, pos: [col - 1, 1 - row, 1], normal: [0, 0, 1] } as FaceletMapping;
  }),
  // D face (y = -1)
  ...[0,1,2,3,4,5,6,7,8].map(i => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return { face: 'D' as FaceName, index: i, pos: [col - 1, -1, 1 - row], normal: [0, -1, 0] } as FaceletMapping;
  }),
  // L face (x = -1)
  ...[0,1,2,3,4,5,6,7,8].map(i => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return { face: 'L' as FaceName, index: i, pos: [-1, 1 - row, col - 1], normal: [-1, 0, 0] } as FaceletMapping;
  }),
  // B face (z = -1)
  ...[0,1,2,3,4,5,6,7,8].map(i => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return { face: 'B' as FaceName, index: i, pos: [1 - col, 1 - row, -1], normal: [0, 0, -1] } as FaceletMapping;
  }),
];
