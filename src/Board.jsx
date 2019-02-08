import React from 'react';

import BlackKnight from './pieces/BlackKnight.png';
import WhiteKnight from './pieces/WhiteKnight.png';
import BlackPawn from './pieces/BlackPawn.png';
import WhitePawn from './pieces/WhitePawn.png';
import CastleIcon from './img/castle.png';

import { pieces } from './Game.js'

import { getCellInfo } from './functions.js'

class CamelotBoard extends React.Component {
    state = {
        chosenPiece: null,
        cellLabels: false,
        manualFlipBoard: false,
    }

    undoClick() {
        this.setState({ chosenPiece: null });
        this.props.undo();
    }

    submitTurnClick() {
        this.setState({ chosenPiece: null });
        this.props.moves.submitTurn();
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
            if (moving !== null) {
                this.setState({ chosenPiece: moving });
            } else {
                if (!cellInfo.isSelected) {
                    this.setState({ chosenPiece: gridID });
                } else {
                    this.setState({ chosenPiece: null });
                }
            }
        } else if (cellInfo.isLegalOption) {
            this.props.moves.movePiece(this.state.chosenPiece, gridID);
            this.setState({ chosenPiece: gridID });
        }
    }

    getCellStyle(gridID) {
        let cellInfo = getCellInfo(this.props, this.state.chosenPiece, gridID);
        let inLastTurn = this.props.G.lastTurnPositions.includes(gridID);

        let bg = cellInfo.isDarkSquare ? evenColor : oddColor;
        let isMyTurn = this.props.ctx.currentPlayer === this.props.playerID;
        let amISpectating = this.props.playerID !== "0" && this.props.playerID !== "1";
        let boxShadow = 'none';
        let zIndex = '0';
        let cursor = (isMyTurn && cellInfo.isMyPiece) ? 'pointer' : 'default';
        if (cellInfo.isSelected && !this.props.ctx.gameover) {
            bg = chosenColor;
            cursor = 'pointer';
            zIndex = '2';
        } else if (cellInfo.isLegalOption && !this.props.ctx.gameover) {
            cursor = 'pointer';
            bg = legalColor;
        } else if (inLastTurn && this.props.G.movePositions.length === 0) {
            if (isMyTurn || amISpectating) {
                bg = cellInfo.isDarkSquare ? highlightEvenColor : highlightOddColor;
                if (this.props.G.lastTurnPositions[0] === gridID) {
                    boxShadow = '0px 0px 4px 0px rgba(0, 0, 0, 0.5)';
                    zIndex = '1';
                }
            }
        } else if (!isMyTurn && this.props.G.movePositions.includes(gridID)) {
            // the other player and spectators can see the move highlighted as it's happening
            bg = cellInfo.isDarkSquare ? highlightEvenColor : highlightOddColor;
            if (this.props.G.movePositions[0] === gridID) {
                boxShadow = '0px 0px 4px 0px rgba(0, 0, 0, 0.5)';
                zIndex = '1';
            }
        }

        return {
            textAlign: 'center',
            verticalAlign: 'middle',
            position: 'relative',
            width: cellSize,
            height: cellSize,
            backgroundColor: bg,
            outline: (cellInfo.isSelected && !this.props.ctx.gameover ? '2px solid #ff0' : 'none'),
            zIndex: zIndex,
            cursor: cursor,
            boxShadow: boxShadow
        };
    }

    render() {
        let isMyTurn = this.props.playerID === this.props.ctx.currentPlayer;
        let amISpectating = this.props.playerID !== "0" && this.props.playerID !== "1";
        let tbody = [];
        for (let i = 0; i < 7; i++) {
            let cells = [];
            for (let j = 0; j < 5; j++) {
                let gridID = (5 * i) + j;
                let cellContent = this.props.G.cells[gridID];

                if (cellContent === false) { // not on the actual game board--disabled/white cells
                    cells.push(<td key={gridID} style={{ width: cellSize, height: cellSize }}></td>);
                    continue;
                }

                let gridColLetter = ['A','B','C','D','E','F','G','H','I','J','K','L'][j];
                let gridRowNumber = 7 - i;

                let pieceImg = null;
                if (cellContent === pieces.BLACK_KNIGHT) {
                    pieceImg = <img alt="Black Knight" style={pieceStyle} src={BlackKnight}/>;
                } else if (cellContent === pieces.WHITE_KNIGHT) {
                    pieceImg = <img alt="White Knight" style={pieceStyle} src={WhiteKnight}/>;
                } else if (cellContent === pieces.BLACK_PAWN) {
                    pieceImg = <img alt="Black Pawn" style={pieceStyle} src={BlackPawn}/>;
                } else if (cellContent === pieces.WHITE_PAWN) {
                    pieceImg = <img alt="White Pawn" style={pieceStyle} src={WhitePawn}/>;
                } else {
                    if ([2, 32].includes(gridID)) {
                        pieceImg = <img alt="Castle" style={castleStyle} src={CastleIcon}/>;
                    }
                }

                let label = this.state.cellLabels ? <span style={labelStyle}>{gridColLetter} {gridRowNumber}</span> : null;
                cells.push(
                    <td key={gridID} style={this.getCellStyle(gridID)} onClick={ () => this.onClick(gridID) }>
                        {label}
                        {pieceImg}
                    </td>
                )
            }
            if ((!this.state.manualFlipBoard && this.props.playerID === "1") || (this.state.manualFlipBoard && this.props.playerID !== "1")) {
                cells.reverse();
            }
            tbody.push(<tr key={"row-" + i}>{cells}</tr>);
        }
        if ((!this.state.manualFlipBoard && this.props.playerID === "1") || (this.state.manualFlipBoard && this.props.playerID !== "1")) {
            tbody.reverse();
        }

        let messageDiv = null;
        if (this.props.ctx.gameover) {
            let winner = this.props.ctx.gameover.winner;
            if (winner === false) {
                messageDiv = <div style={messageDivStyle}><span style={{ color: '#c60' }}>GAME OVER! It's a draw!</span></div>
            } else {
                if (winner === "0") {
                    messageDiv = <div style={messageDivStyle}><span style={{ color: '#0a0' }}>GAME OVER! White wins!</span></div>
                } else {
                    messageDiv = <div style={messageDivStyle}><span style={{ color: '#0a0' }}>GAME OVER! Black wins!</span></div>
                }
            }
        } else {
            if (this.props.G.mustCaptureError && isMyTurn) {
                if (this.props.G.capturesThisTurn === 0) {
                    if (this.props.G.missedKnightsCharge) {
                        messageDiv = <div style={messageDivStyle}><span style={{ color: '#c00' }}>Your Knight missed a Knight's Charge opportunity along this path. Please undo if necessary and try again.</span></div>
                    } else if (this.props.G.canCaptureOutOfCastleThisTurn) {
                        messageDiv = <div style={messageDivStyle}><span style={{ color: '#c00' }}>You must capture out of your Castle this turn. Please undo if necessary and try again.</span></div>
                    } else {
                        messageDiv = <div style={messageDivStyle}><span style={{ color: '#c00' }}>You must capture this turn. Please undo if necessary and try again.</span></div>
                    }
                } else {
                    messageDiv = <div style={messageDivStyle}><span style={{ color: '#c00' }}>You must continue capturing until no more captures are possible.</span></div>
                }
            }
        }
        let capturedPiecesString = '';
        for (var i = 0; i < this.props.G.capturedPieces.length; i++) {
            let p = this.props.G.capturedPieces[i];
            if (p === pieces.WHITE_KNIGHT) {
                capturedPiecesString += '♘';
            } else if (p === pieces.WHITE_PAWN) {
                capturedPiecesString += '♙';
            } else if (p === pieces.BLACK_KNIGHT) {
                capturedPiecesString += '♞';
            } else if (p === pieces.BLACK_PAWN) {
                capturedPiecesString += '♟️';
            }
        }
        if (amISpectating) {
            let whoseTurnDiv = <div style={messageDivStyle}>{this.props.ctx.currentPlayer === "0" ? "White's Turn" : "Black's Turn"}</div>
            if (this.props.ctx.gameover) {
                whoseTurnDiv = messageDiv;
            }
            return (
                <div style={gameWrapStyle}>
                    <table cellSpacing="0" id="board">
                        <tbody>{tbody}</tbody>
                    </table>
                    {whoseTurnDiv}
                    <div style={capturedPiecesStyle}>
                        Captured Pieces: {capturedPiecesString ? capturedPiecesString : 'None'}
                    </div>
                    <div style={buttonWrapStyle}>
                        <button onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) } style={toggleLabelsStyle}>Toggle Labels</button>
                        <button onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) } style={toggleLabelsStyle}>Flip Board</button>
                    </div>
                </div>
            );
        }
        let canSubmit = isMyTurn && !messageDiv && this.props.G.moveType !== false;
        let buttonsDiv = (
            <div style={buttonWrapStyle}>
                <button onClick={ () => this.undoClick() } style={undoStyle} disabled={!isMyTurn || this.props.G.movePositions.length === 0}>Undo</button>
                <button onClick={ () => this.submitTurnClick() }
                    style={canSubmit ? buttonActiveStyle : buttonStyle}
                    disabled={!canSubmit}>Submit Turn</button>
                <button onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) } style={toggleLabelsStyle}>Toggle Labels</button>
                <button onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) } style={toggleLabelsStyle}>Flip Board</button>
            </div>
        );
        let whoseTurnDiv = <div style={messageDivStyle}>{isMyTurn ? "My Turn" : "Opponent's Turn"}</div>
        if (this.props.ctx.gameover) {
            whoseTurnDiv = null;
            buttonsDiv = (
                <div style={buttonWrapStyle}>
                    <button onClick={ () => this.props.reset() } style={buttonStyle}>Reset Game</button>
                    <button onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) } style={toggleLabelsStyle}>Toggle Labels</button>
                    <button onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) } style={toggleLabelsStyle}>Flip Board</button>
                </div>
            );
        }
        return (
            <div style={gameWrapStyle}>
                <table cellSpacing="0" id="board">
                    <tbody>{tbody}</tbody>
                </table>
                {messageDiv ? messageDiv : whoseTurnDiv}
                <div style={capturedPiecesStyle}>
                    Captured Pieces: {capturedPiecesString ? capturedPiecesString : 'None'}
                </div>
                {buttonsDiv}
            </div>
        );
    }
}

export default CamelotBoard;

const oddColor = '#ce9c4b';
const evenColor = '#e0c18f';
const highlightOddColor = '#ee9c4b';
const highlightEvenColor = '#ffc18f';
const chosenColor = '#cb0';
const legalColor = '#9c9';
const cellSize = '60px';

const gameWrapStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px'
}
const messageDivStyle = {
    textAlign: 'center',
    width: '500px',
    margin: '10px 0px 0px',
    fontWeight: 'bold',
}
const capturedPiecesStyle = {
    textAlign: 'center',
    width: '100%',
    maxWidth: '700px',
    margin: '10px 0px 10px',
    color: '#444',
}
const buttonWrapStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    margin: '10px 0px',
}
const buttonStyle = {
    width: '200px',
    height: '50px',
    backgroundColor: '#d0d0d0',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    margin: '0px 10px'
}
const buttonActiveStyle = Object.assign({}, buttonStyle, { backgroundColor: legalColor })
const undoStyle = Object.assign({}, buttonStyle, { width: '80px' })
const toggleLabelsStyle = Object.assign({}, buttonStyle, { width: '120px' })
const pieceStyle = {
    width: '80%',
    height: '80%',
};
const castleStyle = {
    width: '75%',
    height: '75%',
    filter: 'invert(.8) drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.25)) sepia(70%)'
};
const labelStyle = {
    position: 'absolute',
    top: '2px',
    left: '2px',
    fontSize: '8px',
    color: 'rgba(0, 0, 0, 0.3)',
    fontWeight: 'bold',
    fontFamily: 'monospace',
};
