import React from "react";
import PropTypes from "prop-types";
import { PIECE } from "./game";

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

  render() {
    return (
      <div className="board">
        {this.props.grid.map((row, rowIdx) => (
          <div className="row">{this.renderRow(rowIdx)}</div>
        ))}
      </div>
    );
  }
}
