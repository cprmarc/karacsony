export enum GamePhase {
  SETUP,
  DRAWING,
  FINISHED
}

export interface Player {
  id: string;
  name: string;
}

export interface DrawingPair {
  drawerId: string;
  targetId: string;
}

export interface PoemResponse {
  text: string;
}
