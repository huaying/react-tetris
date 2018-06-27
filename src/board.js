import React from "react";
import PropTypes from "prop-types";
import { PIECE, GAME_STATUS } from "./constants";

export default class Board extends React.PureComponent {
  static propTypes = {
    grid: PropTypes.array.isRequired
  };

  renderRow = rowIdx => {
    return this.props.grid[rowIdx].map(unit => {
      const cls = `unit ${PIECE[unit].name}`;
      return <div className={cls} />;
    });
  };

  renderPanel = () => {
    if (this.props.gameStatus !== GAME_STATUS.GAMEOVER) return null;
    return <div className="panel">Game Over</div>;
  };

  render() {
    return (
      <div className="board">
        {this.renderPanel()}
        {this.props.grid.map((row, rowIdx) => (
          <div className="row">{this.renderRow(rowIdx)}</div>
        ))}
      </div>
    );
  }
}
