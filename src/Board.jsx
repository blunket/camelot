import React from 'react';

import BlackKnight from './pieces/BlackKnight.png';
import WhiteKnight from './pieces/WhiteKnight.png';
import BlackPawn from './pieces/BlackPawn.png';
import WhitePawn from './pieces/WhitePawn.png';
import CastleIcon from './img/castle.png';

import { pieces } from './Game.js'

import { getCellInfo, gridIDToLabel } from './functions.js'

import './style/board.scss'

class CamelotBoard extends React.Component {
    state = {
        chosenPiece: null,
        cellLabels: false,
        manualFlipBoard: false,
        mobileMenuOpen: false,
        windowHeight: window.innerHeight,
        chosenPiecePositions: [], // merely for re-highlighting the selected piece after undo
    }

    updateWindowHeight() {
        this.setState({ windowHeight: window.innerHeight });
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateWindowHeight.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowHeight.bind(this));
    }

    undoClick() {
        this.props.undo();
        if (this.state.chosenPiecePositions.length === 1) {
            this.setState({ chosenPiece: null, chosenPiecePositions: [] });
        } else {
            this.setState({
                chosenPiece: this.state.chosenPiecePositions[this.state.chosenPiecePositions.length - 1],
                chosenPiecePositions: this.state.chosenPiecePositions.slice(0, -1)
            });
        }
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
            this.setState({
                chosenPiecePositions: [...this.state.chosenPiecePositions, this.state.chosenPiece],
                chosenPiece: gridID
            });
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

                let label = this.state.cellLabels ? <span className="gridLabel">{gridIDToLabel(gridID).label}</span> : null;
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
                        messageDiv = <div className="messageDiv">This Knight must make a Knight's Charge along this route.</div>
                    } else if (this.props.G.canCaptureOutOfCastleThisTurn) {
                        messageDiv = <div className="messageDiv">You must capture out of your Castle this turn.</div>
                    } else {
                        messageDiv = <div className="messageDiv">You must capture this turn.</div>
                    }
                } else {
                    messageDiv = <div className="messageDiv">You must continue capturing.</div>
                }
            }
        }
        let capturedPiecesIcons = [];
        for (var i = 0; i < this.props.G.capturedPieces.length; i++) {
            let p = this.props.G.capturedPieces[i];
            if (p === pieces.BLACK_KNIGHT) {
                capturedPiecesIcons.push(<img key={capturedPiecesIcons.length} alt="Black Knight" src={BlackKnight}/>);
            } else if (p === pieces.WHITE_KNIGHT) {
                capturedPiecesIcons.push(<img key={capturedPiecesIcons.length} alt="White Knight" src={WhiteKnight}/>);
            } else if (p === pieces.BLACK_PAWN) {
                capturedPiecesIcons.push(<img key={capturedPiecesIcons.length} alt="Black Pawn" src={BlackPawn}/>);
            } else if (p === pieces.WHITE_PAWN) {
                capturedPiecesIcons.push(<img key={capturedPiecesIcons.length} alt="White Pawn" src={WhitePawn}/>);
            }
        }

        let moveList = [];
        for (let n = this.props.G.gameTurnNotation.length - 1; n >= 0; n--) {
            let movedPiece = this.props.G.gameTurnMovedPieces[n];
            let pieceImg;
            if (movedPiece === pieces.BLACK_KNIGHT) {
                pieceImg = <img alt="Black Knight" src={BlackKnight}/>;
            } else if (movedPiece === pieces.WHITE_KNIGHT) {
                pieceImg = <img alt="White Knight" src={WhiteKnight}/>;
            } else if (movedPiece === pieces.BLACK_PAWN) {
                pieceImg = <img alt="Black Pawn" src={BlackPawn}/>;
            } else if (movedPiece === pieces.WHITE_PAWN) {
                pieceImg = <img alt="White Pawn" src={WhitePawn}/>;
            }
            moveList.push(<li key={n}>{pieceImg} {this.props.G.gameTurnNotation[n]}</li>)
        }

        let movingPiece = this.props.G.cells[this.props.G.movingPieceGridID];
        let movingPieceImg;
        if (movingPiece === pieces.BLACK_KNIGHT) {
            movingPieceImg = <img alt="Black Knight" src={BlackKnight}/>;
        } else if (movingPiece === pieces.WHITE_KNIGHT) {
            movingPieceImg = <img alt="White Knight" src={WhiteKnight}/>;
        } else if (movingPiece === pieces.BLACK_PAWN) {
            movingPieceImg = <img alt="Black Pawn" src={BlackPawn}/>;
        } else if (movingPiece === pieces.WHITE_PAWN) {
            movingPieceImg = <img alt="White Pawn" src={WhitePawn}/>;
        }

        if (amISpectating) {
            let whoseTurnDiv = <div className="messageDiv">{this.props.ctx.currentPlayer === "0" ? "White's Turn" : "Black's Turn"}</div>
            if (this.props.ctx.gameover) {
                whoseTurnDiv = messageDiv;
            }
            return (
            <div id="bodyWrap" className={ this.state.mobileMenuOpen ? 'menuOpen' : 'menuClosed' }>
                <button onClick={ () => this.setState({ mobileMenuOpen: !this.state.mobileMenuOpen }) } id="mobileMenuButton">
                    <div></div>
                    <div></div>
                    <div></div>
                </button>
                <div style={{height: this.state.windowHeight}} id="sideBar">
                    <h1>PlayCamelot.com</h1>
                    <p>You are <strong>spectating</strong>.</p>
                    <p>{this.props.ctx.currentPlayer === "0" ? "White's Turn" : "Black's Turn"}</p>
                    <div className="capturedPieces">
                        Captured Pieces:
                        <div className="capturedPiecesIcons">
                            {capturedPiecesIcons.length > 0 ? capturedPiecesIcons : 'None'}
                        </div>
                    </div>
                    <div className="gameTurnNotation">
                        Moves:
                        <ol reversed>
                            {this.props.ctx.gameover ? null : (
                                <li>{movingPieceImg} {this.props.G.thisTurnNotationString}</li>
                            )}
                            {moveList}
                        </ol>
                    </div>
                    <div className="buttons">
                        <button onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) }>Toggle Labels</button>
                        <button onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) }>Flip Board</button>
                    </div>
                </div>
                <div id="gameWrap" style={{height: this.state.windowHeight}} className={this.props.playerID === "0" ? 'whitePlayer' : 'blackPlayer'}>
                    <table className="isNotMyTurn spectating" cellSpacing="0" id="board">
                        <tbody>{tbody}</tbody>
                    </table>
                    {whoseTurnDiv}
                </div>
            </div>
            );
        }
        let canSubmit = isMyTurn && this.props.G.canEndTurn;
        let buttonsDiv = (
            <div className="buttonsWrap">
                <button className="undoButton" onClick={ () => this.undoClick() } disabled={!isMyTurn || this.props.G.movePositions.length === 0}>Undo</button>
                <button className="submitTurnButton" onClick={ () => this.submitTurnClick() } disabled={!canSubmit}>Submit Turn</button>
            </div>
        );
        let whoseTurnDiv = <div className="messageDiv">{isMyTurn ? "My Turn" : "Opponent's Turn"}</div>
        if (this.props.ctx.gameover) {
            whoseTurnDiv = null;
            buttonsDiv = (
                <div className="buttonsWrap">
                    <button onClick={ () => this.props.reset() }>Reset Game</button>
                    <button onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) }>Toggle Labels</button>
                    <button onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) }>Flip Board</button>
                </div>
            );
        }
        return (
            <div id="bodyWrap" className={ this.state.mobileMenuOpen ? 'menuOpen' : 'menuClosed' }>
                <button onClick={ () => this.setState({ mobileMenuOpen: !this.state.mobileMenuOpen }) } id="mobileMenuButton">
                    <div></div>
                    <div></div>
                    <div></div>
                </button>
                <div style={{height: this.state.windowHeight}} id="sideBar">
                    <h1>PlayCamelot.com</h1>
                    <p>Playing as <strong>{this.props.playerID === "0" ? 'White' : 'Black'}</strong>.</p>
                    <p>{isMyTurn ? "My Turn" : "Opponent's Turn"}</p>
                    <div className="capturedPieces">
                        Captured Pieces:
                        <div className="capturedPiecesIcons">
                            {capturedPiecesIcons.length > 0 ? capturedPiecesIcons : 'None'}
                        </div>
                    </div>
                    <div className="gameTurnNotation">
                        Moves:
                        <ol reversed>
                            {this.props.ctx.gameover ? null : (
                                <li>{movingPieceImg} {this.props.G.thisTurnNotationString}</li>
                            )}
                            {moveList}
                        </ol>
                    </div>
                    <div className="buttons">
                        <button onClick={ () => this.setState({ cellLabels: !this.state.cellLabels }) }>Toggle Labels</button>
                        <button onClick={ () => this.setState({ manualFlipBoard: !this.state.manualFlipBoard }) }>Flip Board</button>
                    </div>
                </div>
                <div id="gameWrap" style={{height: this.state.windowHeight}} className={this.props.playerID === "0" ? 'whitePlayer' : 'blackPlayer'}>
                    <table className={isMyTurn ? 'isMyTurn' : 'isNotMyTurn'} cellSpacing="0" id="board">
                        <tbody>{tbody}</tbody>
                    </table>
                    {messageDiv ? messageDiv : whoseTurnDiv}
                    {buttonsDiv}
                </div>
            </div>
        );
    }
}

export default CamelotBoard;
