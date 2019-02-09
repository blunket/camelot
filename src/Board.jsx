import React from 'react';

import BlackKnight from './pieces/BlackKnight.png';
import WhiteKnight from './pieces/WhiteKnight.png';
import BlackPawn from './pieces/BlackPawn.png';
import WhitePawn from './pieces/WhitePawn.png';
import CastleIcon from './img/castle.png';

import { pieces } from './Game.js'

import { getCellInfo } from './functions.js'

import './style/board.scss'

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

    getCellStyleClasses(gridID) {
        let cellInfo = getCellInfo(this.props, this.state.chosenPiece, gridID);

        let cellClasses = ['gridCell'];
        if (cellInfo.row % 2 === 0) {
            cellClasses.push(cellInfo.col % 2 === 0 ? 'dark' : 'light')
        } else {
            cellClasses.push(cellInfo.col % 2 === 1 ? 'dark' : 'light')
        }

        let isMyTurn = this.props.ctx.currentPlayer === this.props.playerID;
        let amISpectating = this.props.playerID !== "0" && this.props.playerID !== "1";

        if (cellInfo.isMyPiece) {
            cellClasses.push('isMyPiece');
        }

        if (cellInfo.isSelected && !this.props.ctx.gameover) {
            cellClasses.push('isSelected');
        } else if (cellInfo.isLegalOption && !this.props.ctx.gameover) {
            cellClasses.push('isLegalOption');
        } else if (this.props.G.lastTurnPositions.includes(gridID) && this.props.G.movePositions.length === 0) {
            if (isMyTurn || amISpectating) {
                cellClasses.push('activityHighlight')
                if (this.props.G.lastTurnPositions[0] === gridID) {
                    cellClasses.push('firstActivityHighlight')
                }
            }
        } else if (!isMyTurn && this.props.G.movePositions.includes(gridID)) {
            cellClasses.push('activityHighlight')
            if (this.props.G.movePositions[0] === gridID) {
                cellClasses.push('firstActivityHighlight')
            }
        }

        return cellClasses;
    }

    render() {
        let isMyTurn = this.props.playerID === this.props.ctx.currentPlayer;
        let amISpectating = this.props.playerID !== "0" && this.props.playerID !== "1";
        let tbody = [];
        for (let i = 0; i < 16; i++) {
            let cells = [];
            for (let j = 0; j < 12; j++) {
                let gridID = (12 * i) + j;
                let cellContent = this.props.G.cells[gridID];

                if (cellContent === false) { // not on the actual game board--disabled/white cells
                    cells.push(<td key={gridID} className="gridCell disabled"></td>);
                    continue;
                }

                let gridColLetter = ['a','b','c','d','e','f','g','h','i','j','k','l'][j];
                let gridRowNumber = 16 - i;

                let pieceImg = null;
                if (cellContent === pieces.BLACK_KNIGHT) {
                    pieceImg = <img alt="Black Knight" src={BlackKnight}/>;
                } else if (cellContent === pieces.WHITE_KNIGHT) {
                    pieceImg = <img alt="White Knight" src={WhiteKnight}/>;
                } else if (cellContent === pieces.BLACK_PAWN) {
                    pieceImg = <img alt="Black Pawn" src={BlackPawn}/>;
                } else if (cellContent === pieces.WHITE_PAWN) {
                    pieceImg = <img alt="White Pawn" src={WhitePawn}/>;
                } else {
                    if ([5, 6, 185, 186].includes(gridID)) {
                        pieceImg = <img alt="Castle" className="castleIcon" src={CastleIcon}/>;
                    }
                }

                let label = this.state.cellLabels ? <span className="gridLabel">{gridColLetter}{gridRowNumber}</span> : null;
                cells.push(
                    <td key={gridID} className={this.getCellStyleClasses(gridID).join(' ')} onClick={ () => this.onClick(gridID) }>
                        {label}
                        {pieceImg}
                    </td>
                )
            }
            if ((!this.state.manualFlipBoard && this.props.playerID === "1") || (this.state.manualFlipBoard && this.props.playerID !== "1")) {
                cells.reverse();
            }
            tbody.push(<tr className="boardRow" key={"row-" + i}>{cells}</tr>);
        }
        if ((!this.state.manualFlipBoard && this.props.playerID === "1") || (this.state.manualFlipBoard && this.props.playerID !== "1")) {
            tbody.reverse();
        }

        let messageDiv = null;
        if (this.props.ctx.gameover) {
            let winner = this.props.ctx.gameover.winner;
            if (winner === false) {
                messageDiv = <div className="messageDiv gameover draw">GAME OVER! It's a draw!</div>
            } else {
                if (winner === "0") {
                    messageDiv = <div className="messageDiv gameover whiteWins">GAME OVER! White wins!</div>
                } else {
                    messageDiv = <div className="messageDiv gameover blackWins">GAME OVER! Black wins!</div>
                }
            }
        } else {
            if (this.props.G.mustCaptureError && isMyTurn) {
                if (this.props.G.capturesThisTurn === 0) {
                    if (this.props.G.missedKnightsCharge) {
                        messageDiv = <div className="messageDiv error">Your Knight missed a Knight's Charge opportunity along this path. Please undo if necessary and try again.</div>
                    } else if (this.props.G.canCaptureOutOfCastleThisTurn) {
                        messageDiv = <div className="messageDiv error">You must capture out of your Castle this turn. Please undo if necessary and try again.</div>
                    } else {
                        messageDiv = <div className="messageDiv error">You must capture this turn. Please undo if necessary and try again.</div>
                    }
                } else {
                    messageDiv = <div className="messageDiv error">You must continue capturing until no more captures are possible.</div>
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
            let whoseTurnDiv = <div className="messageDiv">{this.props.ctx.currentPlayer === "0" ? "White's Turn" : "Black's Turn"}</div>
            if (this.props.ctx.gameover) {
                whoseTurnDiv = messageDiv;
            }
            return (
                <div id="gameWrap">
                    <table cellSpacing="0" id="board">
                        <tbody>{tbody}</tbody>
                    </table>
                    {whoseTurnDiv}
                    <div className="capturedPieces">
                        Captured Pieces: {capturedPiecesString ? capturedPiecesString : 'None'}
                    </div>
                    <div className="buttonsWrap">
                        <button className="prefButton" onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) }>Toggle Labels</button>
                        <button className="prefButton" onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) }>Flip Board</button>
                    </div>
                </div>
            );
        }
        let canSubmit = isMyTurn && !messageDiv && this.props.G.moveType !== false;
        let buttonsDiv = (
            <div className="buttonsWrap">
                <button className="undoButton" onClick={ () => this.undoClick() } disabled={!isMyTurn || this.props.G.movePositions.length === 0}>Undo</button>
                <button className="submitTurnButton" onClick={ () => this.submitTurnClick() } disabled={!canSubmit}>Submit Turn</button>
                <button className="prefButton" onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) }>Toggle Labels</button>
                <button className="prefButton" onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) }>Flip Board</button>
            </div>
        );
        let whoseTurnDiv = <div className="messageDiv">{isMyTurn ? "My Turn" : "Opponent's Turn"}</div>
        if (this.props.ctx.gameover) {
            whoseTurnDiv = null;
            buttonsDiv = (
                <div className="buttonsWrap">
                    <button onClick={ () => this.props.reset() }>Reset Game</button>
                    <button className="prefButton" onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) }>Toggle Labels</button>
                    <button className="prefButton" onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) }>Flip Board</button>
                </div>
            );
        }
        return (
            <div id="gameWrap" className={this.props.playerID === "0" ? 'whitePlayer' : 'blackPlayer'}>
                <table className={isMyTurn ? 'isMyTurn' : 'isNotMyTurn'} cellSpacing="0" id="board">
                    <tbody>{tbody}</tbody>
                </table>
                {messageDiv ? messageDiv : whoseTurnDiv}
                <div className="capturedPieces">
                    Captured Pieces: {capturedPiecesString ? capturedPiecesString : 'None'}
                </div>
                {buttonsDiv}
            </div>
        );
    }
}

export default CamelotBoard;
