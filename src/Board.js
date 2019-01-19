import React from 'react';

import BlackKnight from './pieces/BlackKnight.png';
import WhiteKnight from './pieces/WhiteKnight.png';
import BlackPawn from './pieces/BlackPawn.png';
import WhitePawn from './pieces/WhitePawn.png';

import { pieces } from './Game.js'

class CamelotBoard extends React.Component {
    state = {
        chosenPiece: null
    }

    onClick(id) {
        let cellContent = this.props.G.cells[id];
        if (cellContent === false) {
            return;
        }
        if (this.isMyPiece(id)) {
            this.setState({ chosenPiece: id });
        }
        // this.props.moves.clickCell(id);
    }

    isMyPiece(id) {
        let cellContent = this.props.G.cells[id];
        switch (cellContent) {
            case pieces.WHITE_KNIGHT:
            case pieces.WHITE_PAWN:
                return this.props.playerID === "0"
            case pieces.BLACK_KNIGHT:
            case pieces.BLACK_PAWN:
                return this.props.playerID === "1"
            default:
                return false;
        }
    }

    getCellStyle(gridID, row, col) {
        let isOdd = false;
        if (row % 2 === 0) {
            isOdd = col % 2 === 0;
        } else {
            isOdd = col % 2 === 1;
        }
        let bg = isOdd ? evenColor : oddColor;
        if (gridID === this.state.chosenPiece) {
            bg = chosenColor;
        }
        return {
            position: 'relative',
            width: cellSize,
            height: cellSize,
            backgroundColor: bg,
            outline: (gridID === this.state.chosenPiece ? '2px solid #ff0' : 'none'),
            zIndex: (gridID === this.state.chosenPiece ? '1' : '0'),
        };
    }

    render() {
        let tbody = [];
        for (let i = 0; i < 16; i++) {
            let cells = [];
            for (let j = 0; j < 12; j++) {
                let gridID = (12 * i) + j;
                let cellContent = this.props.G.cells[gridID];

                if (cellContent === false) { // not on the actual game board--disabled/white cells
                    cells.push(<td key={gridID} style={{ width: cellSize, height: cellSize }}></td>);
                    continue;
                }

                let gridColLetter = ['A','B','C','D','E','F','G','H','I','J','K','L'][j];
                let gridRowNumber = 16 - i;

                let pieceImg = null;
                if (cellContent === pieces.BLACK_KNIGHT) {
                    pieceImg = <img alt="Black Knight" style={pieceStyle} src={BlackKnight}/>;
                } else if (cellContent === pieces.WHITE_KNIGHT) {
                    pieceImg = <img alt="White Knight" style={pieceStyle} src={WhiteKnight}/>;
                } else if (cellContent === pieces.BLACK_PAWN) {
                    pieceImg = <img alt="Black Pawn" style={pieceStyle} src={BlackPawn}/>;
                } else if (cellContent === pieces.WHITE_PAWN) {
                    pieceImg = <img alt="White Pawn" style={pieceStyle} src={WhitePawn}/>;
                }

                cells.push(
                    <td key={gridID} style={this.getCellStyle(gridID, i, j)} onClick={ () => this.onClick(gridID) }>
                        <span style={labelStyle}>{gridColLetter} {gridRowNumber}</span>
                        {pieceImg}
                    </td>
                )
            }
            tbody.push(<tr key={"row-" + i}>{cells}</tr>);
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '40vw', float: 'left' }}>
                <table cellSpacing="0" id="board">
                    <tbody>{tbody}</tbody>
                </table>
            </div>
        );
    }
}

export default CamelotBoard;

const oddColor = '#ce9c4b';
const evenColor = '#e0c18f';
const chosenColor = '#cb0';
const legalColor = '#9c9';
const cellSize = '45px';

const pieceStyle = {
    width: '90%',
    height: '90%',
};
const labelStyle = {
    position: 'absolute',
    top: '2px',
    left: '2px',
    fontSize: '8px',
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
    fontFamily: 'monospace',
};
