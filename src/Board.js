import React from 'react';

import BlackKnight from './pieces/BlackKnight.png';
import WhiteKnight from './pieces/WhiteKnight.png';
import BlackPawn from './pieces/BlackPawn.png';
import WhitePawn from './pieces/WhitePawn.png';

import { pieces } from './Game.js'

import { getCellInfo } from './functions.js'

class CamelotBoard extends React.Component {
    state = {
        chosenPiece: null,
        cellLabels: false,
    }

    undoClick() {
        this.setState({ chosenPiece: null });
        this.props.undo();
    }

    redoClick() {
        this.setState({ chosenPiece: null });
        this.props.redo();
    }

    endTurnClick() {
        this.setState({ chosenPiece: null });
        this.props.events.endTurn();
    }

    onClick(gridID) {
        if (this.props.ctx.currentPlayer !== this.props.playerID) {
            return;
        }
        let cellInfo = getCellInfo(this.props, this.state.chosenPiece, gridID)
        let cellContent = this.props.G.cells[gridID];
        if (cellContent === false) {
            return;
        }
        if (cellInfo.isMyPiece) {
            let moving = this.props.G.movingPieceGridID;
            let moveType = this.props.G.moveType;
            if (moving !== null && moving !== gridID && moveType !== 'Basic') {
                this.setState({ chosenPiece: moving });
            } else {
                if (!cellInfo.isSelected) {
                    this.setState({ chosenPiece: gridID });
                } else {
                    this.setState({ chosenPiece: null });
                }
            }
        } else if (cellInfo.isLegalOption) {
            this.setState({ chosenPiece: null });
            this.props.moves.movePiece(this.state.chosenPiece, gridID);
        }
    }

    getCellStyle(gridID) {
        let cellInfo = getCellInfo(this.props, this.state.chosenPiece, gridID);

        let bg = cellInfo.isDarkSquare ? evenColor : oddColor;

        if (cellInfo.isSelected) {
            bg = chosenColor;
        } else if (cellInfo.isLegalOption) {
            bg = legalColor;
        }

        let isMyTurn = this.props.ctx.currentPlayer === this.props.playerID;
        return {
            position: 'relative',
            width: cellSize,
            height: cellSize,
            backgroundColor: bg,
            outline: (cellInfo.isSelected ? '2px solid #ff0' : 'none'),
            zIndex: (cellInfo.isSelected ? '1' : '0'),
            cursor: (isMyTurn && (cellInfo.isMyPiece || cellInfo.isLegalOption) ? 'pointer' : 'default')
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

                let label = this.state.cellLabels ? <span style={labelStyle}>{gridColLetter} {gridRowNumber}</span> : null;
                cells.push(
                    <td key={gridID} style={this.getCellStyle(gridID)} onClick={ () => this.onClick(gridID) }>
                        {label}
                        {pieceImg}
                    </td>
                )
            }
            if (this.props.playerID === "1") {
                cells.reverse();
            }
            tbody.push(<tr key={"row-" + i}>{cells}</tr>);
        }
        if (this.props.playerID === "1") {
            tbody.reverse();
        }
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '40vw', float: 'left' }}>
                <table cellSpacing="0" id="board">
                    <tbody>{tbody}</tbody>
                </table>
                <div style={buttonsStyle}>
                    <button onClick={ () => this.undoClick() } style={undoRedoStyle}>Undo</button>
                    <button onClick={ () => this.endTurnClick() } style={endTurnButtonStyle}>Submit Turn</button>
                    <button onClick={ () => this.redoClick() } style={undoRedoStyle}>Redo</button>
                    <button onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) } style={undoRedoStyle}>Toggle Labels</button>
                </div>
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

const buttonsStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
}
const endTurnButtonStyle = {
    width: '200px',
    height: '50px',
    backgroundColor: '#d0d0d0',
    border: '1px solid #ccc',
    borderRadius: '3px',
    cursor: 'pointer',
    margin: '0px 10px'
}
const undoRedoStyle = {
    width: '80px',
    height: '50px',
    backgroundColor: '#d0d0d0',
    border: '1px solid #ccc',
    borderRadius: '3px',
    cursor: 'pointer',
    margin: '0px 10px'
}
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
