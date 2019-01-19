import React from 'react';

import BlackKnight from './pieces/BlackKnight.png';
import WhiteKnight from './pieces/WhiteKnight.png';
import BlackPawn from './pieces/BlackPawn.png';
import WhitePawn from './pieces/WhitePawn.png';

class CamelotBoard extends React.Component {
    onClick(id) {
        let cellContent = this.props.G.cells[id];
        if (cellContent === false) {
            return;
        }
        this.props.moves.clickCell(id);
    }

    getCellStyle(row, col) {
        let isOdd = false;
        if (row % 2 === 0) {
            isOdd = col % 2 === 0;
        } else {
            isOdd = col % 2 === 1;
        }
        return {
            position: 'relative',
            width: cellSize,
            height: cellSize,
            backgroundColor: isOdd ? evenColor : oddColor,
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
                if (cellContent === 'BK') {
                    pieceImg = <img alt="Black Knight" style={pieceStyle} src={BlackKnight}/>;
                } else if (cellContent === 'WK') {
                    pieceImg = <img alt="White Knight" style={pieceStyle} src={WhiteKnight}/>;
                } else if (cellContent === 'BP') {
                    pieceImg = <img alt="Black Pawn" style={pieceStyle} src={BlackPawn}/>;
                } else if (cellContent === 'WP') {
                    pieceImg = <img alt="White Pawn" style={pieceStyle} src={WhitePawn}/>;
                }

                cells.push(
                    <td key={gridID} style={this.getCellStyle(i, j)} onClick={ () => this.onClick(gridID) }>
                        <span style={labelStyle}>{gridColLetter} {gridRowNumber}</span>
                        {pieceImg}
                    </td>
                )
            }
            tbody.push(<tr key={"row-" + i}>{cells}</tr>);
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <table cellSpacing="0" id="board">
                    <tbody>{tbody}</tbody>
                </table>
            </div>
        );
    }
}

export default CamelotBoard;

const oddColor = '#ce9c4b'
const evenColor = '#e0c18f'
const cellSize = '55px';

const pieceStyle = {
    width: '100%',
    height: '100%',
}
const labelStyle = {
    position: 'absolute',
    top: '2px',
    left: '2px',
    fontSize: '8px',
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
    fontFamily: 'monospace',
}
