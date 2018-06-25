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

export const Tetris = {
  [EMPTY]: {
    name: ""
  },
  [CUBE]: {
    shape: [[0, 0], [0, 1], [1, 1], [1, 0]],
    name: "cube"
  },
  [STICK]: {
    shape: [[0, 0], [0, -1], [0, 1], [0, 2]],
    name: "stick"
  },
  [TSHAPE]: {
    shape: [[0, 0], [0, -1], [0, 1], [1, 0]],
    name: "tshape"
  },
  [LSHAPE]: {
    shape: [[0, -1], [1, -1], [1, 0], [1, 1]],
    name: "lshape"
  },
  [LSHAPE_R]: {
    shape: [[1, -1], [1, 0], [1, 1], [0, 1]],
    name: "lshape-r"
  },
  [LIGHTING]: {
    shape: [[0, -1], [0, 0], [1, 0], [1, 1]],
    name: "lighting"
  },
  [LIGHTING_R]: {
    shape: [[0, 1], [0, 0], [1, 0], [1, -1]],
    name: "lighting-r"
  }
};

const DIR = {
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1]
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

    currentTetris: null,
    currentTetrisPos: null
  };

  gameStart = () => {
    this.timer = setInterval(this.gameLoop, 300);
    window.addEventListener("keydown", this.controller);
    this.placeNewTetris();
  };

  gameEnd = () => {};

  controller = e => {
    const DIRMap = {
      37: DIR.LEFT,
      39: DIR.RIGHT,
      40: DIR.DOWN
    };

    const direction = DIRMap[e.keyCode];
    if (direction)
      if (!this.tetrisEnded(this.state.currentTetrisPos, direction)) {
        this.updateTetris(
          this.state.currentTetrisPos,
          this.state.currentTetris,
          direction
        );
      }
  };

  gameLoop = () => {
    if (this.tetrisEnded(this.state.currentTetrisPos, DIR.DOWN)) {
      this.placeNewTetris();
    } else {
      this.updateTetris(
        this.state.currentTetrisPos,
        this.state.currentTetris,
        DIR.DOWN
      );
    }
  };

  placeNewTetris = () => {
    // select one cube
    const tetris = randomItems(Object.keys(Tetris).slice(1));
    const shift = Math.floor((NUM_COLUMN - 1) / 2);
    const positions = Tetris[tetris].shape.map(([i, j]) => [i, j + shift]);
    this.updateTetris(positions, tetris, [0, 0]);
  };

  updateTetris = (positions, tetris, direction, cb = () => {}) => {
    const [x, y] = direction;
    const newGrid = [...this.state.grid];
    const nextTetrisPos = [];
    positions.forEach(([i, j]) => {
      newGrid[i][j] = EMPTY;
    });

    positions.forEach(([i, j]) => {
      newGrid[i + x][j + y] = tetris;
      nextTetrisPos.push([i + x, j + y]);
    });

    this.setState(
      {
        grid: newGrid,
        currentTetris: tetris,
        currentTetrisPos: nextTetrisPos
      },
      () => cb()
    );
  };

  tetrisEnded = (positions, direction) => {
    const [x, y] = direction;
    const { grid } = this.state;
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
