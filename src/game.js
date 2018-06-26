import React from "react";

import Board from "./board";
import { randomItems } from "./utils";

const NUM_ROW = 20;
const NUM_COLUMN = 10;

const EMPTY = 0;
const CUBE = 1;
const STICK = 2;
const TSHAPE = 3;
const LSHAPE = 4;
const LSHAPE_R = 5;
const LIGHTING = 6;
const LIGHTING_R = 7;

const DIR = {
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1]
};

const DEG = {
  ZERO: 0,
  NIGHTY: 1,
  REVERSE: 2,
  REVERSE_NIGHTY: 3
};
export const PIECE = {
  [EMPTY]: {
    name: "empty"
  },
  [CUBE]: {
    shape: {
      [DEG.ZERO]: [[0, 0], [0, 1], [1, 1], [1, 0]],
      [DEG.NIGHTY]: [[0, 0], [0, 1], [1, 1], [1, 0]],
      [DEG.REVERSE]: [[0, 0], [0, 1], [1, 1], [1, 0]],
      [DEG.REVERSE_NIGHTY]: [[0, 0], [0, 1], [1, 1], [1, 0]]
    },
    name: "cube"
  },
  [STICK]: {
    shape: {
      [DEG.ZERO]: [[0, -1], [0, 0], [0, 1], [0, 2]],
      [DEG.NIGHTY]: [[-2, 0], [-1, 0], [0, 0], [1, 0]],
      [DEG.REVERSE]: [[-1, -1], [-1, 0], [-1, 1], [-1, 2]],
      [DEG.REVERSE_NIGHTY]: [[-2, 1], [-1, 1], [0, 1], [1, 1]]
    },
    name: "stick"
  },
  [TSHAPE]: {
    shape: {
      [DEG.ZERO]: [[1, 0], [1, -1], [1, 1], [0, 0]],
      [DEG.NIGHTY]: [[1, 0], [2, 0], [1, 1], [0, 0]],
      [DEG.REVERSE]: [[1, 0], [1, -1], [1, 1], [2, 0]],
      [DEG.REVERSE_NIGHTY]: [[1, 0], [2, 0], [1, -1], [0, 0]]
    },
    name: "tshape"
  },
  [LSHAPE]: {
    shape: {
      [DEG.ZERO]: [[0, -1], [1, -1], [1, 0], [1, 1]],
      [DEG.NIGHTY]: [[0, 0], [1, 0], [2, 0], [0, 1]],
      [DEG.REVERSE]: [[1, 0], [1, -1], [1, 1], [2, 1]],
      [DEG.REVERSE_NIGHTY]: [[0, 0], [1, 0], [2, 0], [2, -1]]
    },
    name: "lshape"
  },
  [LSHAPE_R]: {
    shape: {
      [DEG.ZERO]: [[1, -1], [1, 0], [1, 1], [0, 1]],
      [DEG.NIGHTY]: [[0, 0], [1, 0], [2, 0], [2, 1]],
      [DEG.REVERSE]: [[1, 0], [1, -1], [1, 1], [2, -1]],
      [DEG.REVERSE_NIGHTY]: [[0, 0], [1, 0], [2, 0], [0, -1]]
    },
    name: "lshape-r"
  },
  [LIGHTING]: {
    shape: {
      [DEG.ZERO]: [[0, -1], [0, 0], [1, 0], [1, 1]],
      [DEG.NIGHTY]: [[0, 0], [0, 1], [1, 0], [-1, 1]],
      [DEG.REVERSE]: [[0, -1], [0, 0], [1, 0], [1, 1]],
      [DEG.REVERSE_NIGHTY]: [[0, 0], [0, 1], [1, 0], [-1, 1]]
    },
    name: "lighting"
  },
  [LIGHTING_R]: {
    shape: {
      [DEG.ZERO]: [[0, 1], [0, 0], [1, 0], [1, -1]],
      [DEG.NIGHTY]: [[0, 0], [0, -1], [1, 0], [-1, -1]],
      [DEG.REVERSE]: [[0, 1], [0, 0], [1, 0], [1, -1]],
      [DEG.REVERSE_NIGHTY]: [[0, 0], [0, -1], [1, 0], [-1, -1]]
    },
    center: [0, 0],
    name: "lighting-r"
  }
};

export default class Game extends React.PureComponent {
  constructor(props) {
    super(props);
    this.timer = null;
  }

  state = {
    playing: true,
    grid: Array(NUM_ROW)
      .fill(null)
      .map(e => Array(NUM_COLUMN).fill(EMPTY)),

    piece: null,
    piecePos: null,
    pieceDeg: null
  };

  gameStart = () => {
    this.timer = setInterval(this.gameLoop, 300);
    window.addEventListener("keydown", this.controller);
    this.placeNewPiece();
  };

  gameEnd = () => {};

  controller = e => {
    const { piece, piecePos, pieceDeg } = this.state;
    const DIRMap = {
      37: DIR.LEFT,
      39: DIR.RIGHT,
      40: DIR.DOWN
    };

    // Key Left, Right: move
    const direction = DIRMap[e.keyCode];
    if (direction)
      if (!this.pieceEnded(piece, piecePos, pieceDeg, direction)) {
        this.updatePiece(piece, piecePos, pieceDeg, direction);
      }

    // Key Up: rorate
    if (e.keyCode === 38) {
      this.rotatePiece(piece, piecePos, pieceDeg);
    }

    // Key Space: drop
    if (e.keyCode === 32) {
      this.dropPiece(piece, piecePos, pieceDeg);
      this.gameLoop();
      window.clearInterval(this.timer);
      this.timer = setInterval(this.gameLoop, 300);
    }
  };

  gameLoop = () => {
    const { piece, piecePos, pieceDeg } = this.state;
    if (this.pieceEnded(piece, piecePos, pieceDeg, DIR.DOWN)) {
      this.lineCleanCheck();
      this.placeNewPiece();
    } else {
      this.updatePiece(piece, piecePos, pieceDeg, DIR.DOWN);
    }
  };

  lineCleanCheck = () => {
    const { grid } = this.state;
    const lines = grid.filter(
      line =>
        line.some(unit => unit !== EMPTY) && !line.every(unit => unit !== EMPTY)
    );
    const newGrid = Array(NUM_ROW)
      .fill(null)
      .map(e => Array(NUM_COLUMN).fill(EMPTY));

    let newGridLineIdx = NUM_ROW - 1;
    lines.reverse().forEach(line => {
      newGrid[newGridLineIdx--] = [...line];
    });

    this.setState(prevState => ({
      grid: newGrid
    }));
  };

  placeNewPiece = () => {
    const piece = randomItems(Object.keys(PIECE).slice(1));
    const shift = Math.floor((NUM_COLUMN - 1) / 2);
    this.updatePiece(piece, [0, shift], DEG.ZERO, [0, 0]);
  };

  getPiecePositions = (piece, position, degree) => {
    return PIECE[piece].shape[degree].map(([i, j]) => [
      i + position[0],
      j + position[1]
    ]);
  };

  getTunedPositions = (piece, position, degree) => {
    let positions = null;
    let prev_pos = [];
    while (true) {
      if (prev_pos.toString() === position.toString()) break;
      prev_pos = [...position];
      positions = this.getPiecePositions(piece, position, degree);
      for (let idx = 0; idx < positions.length; idx++) {
        const [i, j] = positions[idx];
        if (i < 0) position = [position[0] + 1, position[1]];
        if (i >= NUM_ROW) position = [position[0] - 1, position[1]];
        if (j < 0) position = [position[0], position[1] + 1];
        if (j >= NUM_COLUMN) position = [position[0], position[1] - 1];
      }
    }
    return [position, positions];
  };

  updatePiece = (piece, position, degree, direction, cb = () => {}) => {
    const [x, y] = direction;
    const newGrid = [...this.state.grid];
    const positions = this.getPiecePositions(piece, position, degree);
    positions.forEach(([i, j]) => (newGrid[i][j] = EMPTY));
    positions.forEach(([i, j]) => (newGrid[i + x][j + y] = piece));

    this.setState(
      {
        grid: newGrid,
        piece,
        pieceDeg: degree,
        piecePos: [position[0] + x, position[1] + y]
      },
      () => cb()
    );
  };

  rotatePiece = (piece, position, degree, cb = () => {}) => {
    const newGrid = [...this.state.grid];
    const nextDeg = (degree + 1) % Object.keys(DEG).length;
    const positions = this.getPiecePositions(piece, position, degree);
    const [newPosition, newPositions] = this.getTunedPositions(
      piece,
      position,
      nextDeg
    );

    positions.forEach(([i, j]) => (newGrid[i][j] = EMPTY));
    newPositions.forEach(([i, j]) => (newGrid[i][j] = piece));

    this.setState(
      {
        piecePos: newPosition,
        pieceDeg: nextDeg,
        grid: newGrid
      },
      () => cb()
    );
  };

  dropPiece = (piece, position, degree) => {
    const positions = this.getPiecePositions(piece, position, degree);
    const { grid } = this.state;
    let dist = 0;
    let next = 0;

    const shouldEnded = ([i, j]) => {
      return (
        i + next >= NUM_ROW ||
        (!positions.map(p => p.toString()).includes([i + next, j].toString()) &&
          grid[i + next][j] !== EMPTY)
      );
    };

    while (true) {
      next = dist + 1;
      const end = positions.some(shouldEnded);
      if (!end) dist += 1;
      else break;
    }
    this.updatePiece(piece, position, degree, [dist, 0]);
  };

  pieceEnded = (piece, position, degree, direction) => {
    const [x, y] = direction;
    const { grid } = this.state;
    const positions = this.getPiecePositions(piece, position, degree);
    return positions.some(
      ([i, j]) =>
        i + x < 0 ||
        i + x >= NUM_ROW ||
        j + y < 0 ||
        j + y >= NUM_COLUMN ||
        (!positions
          .map(p => p.toString())
          .includes([i + x, j + y].toString()) &&
          grid[i + x][j + y] !== EMPTY)
    );
  };

  render() {
    return (
      <React.Fragment>
        <Board grid={this.state.grid} />
        <div className="start" onClick={this.gameStart}>
          Start
        </div>
      </React.Fragment>
    );
  }
}
