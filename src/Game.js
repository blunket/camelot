import { Game } from 'boardgame.io/core';
import { isMyPiece, getCellInfo, isInOwnCastle, canCaptureOutOfOwnCastle, canCapture, canCaptureScan, canMoveScan, gridIDToLabel } from './functions.js';
import shortid from 'shortid';

const pieces = {
    BLACK_KNIGHT: 'BK',
    BLACK_PAWN: 'BP',
    WHITE_KNIGHT: 'WK',
    WHITE_PAWN: 'WP',
};

const basicOffsets = [
    -12, // up
    12,  // down
    -1,  // left
    1,   // right
    -11, // up right
    -13, // up left
    13,  // down right
    11,  // down left
];

function getCellsSetup() {
    let cells = Array(192).fill(null);
    let disabledCells = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 35, 156, 167, 168, 169, 178, 179, 180, 181, 182, 183, 184, 187, 188, 189, 190, 191];
    let blackKnights = [62, 69, 75, 80];
    let blackPawns = [63, 64, 65, 66, 67, 68, 76, 77, 78, 79];
    let whiteKnights = [111, 116, 122, 129];
    let whitePawns = [112, 113, 114, 115, 123, 124, 125, 126, 127, 128];
    for (let i = 0; i < disabledCells.length; i++) {
        cells[disabledCells[i]] = false;
    }
    for (let i = 0; i < blackKnights.length; i++) {
        cells[blackKnights[i]] = pieces.BLACK_KNIGHT;
    }
    for (let i = 0; i < blackPawns.length; i++) {
        cells[blackPawns[i]] = pieces.BLACK_PAWN;
    }
    for (let i = 0; i < whiteKnights.length; i++) {
        cells[whiteKnights[i]] = pieces.WHITE_KNIGHT;
    }
    for (let i = 0; i < whitePawns.length; i++) {
        cells[whitePawns[i]] = pieces.WHITE_PAWN;
    }
    return cells;
}

const CamelotGame = Game({
    setup: () => {
        let cells = getCellsSetup();
        return {
            cells: cells,
            whiteCastleMoves: 0,
            blackCastleMoves: 0,
            lastTurnPositions: [],
            capturedPieces: [],
            gameTurnNotation: [],
            gameTurnMovedPieces: [],
            moveablePieces: [],
        }
    },

    moves: {
        movePiece(G, ctx, pieceGridID, destinationGridID) {
            G.mustCaptureError = false;
            let mockProps = {G: G, playerID: ctx.currentPlayer};
            if (G.movingPieceGridID !== null && pieceGridID !== G.movingPieceGridID) { // enforce moving only one piece in a turn
                return;
            }
            if (G.cells[destinationGridID] !== null || !isMyPiece(mockProps, pieceGridID)) { // can only move own pieces onto vacant squares
                return;
            }
            let destCellInfo = getCellInfo(mockProps, pieceGridID, destinationGridID);
            if (!destCellInfo.isLegalOption) {
                return;
            }
            let pieceToMove = G.cells[pieceGridID];
            G.cells[destinationGridID] = pieceToMove;
            G.cells[pieceGridID] = null;
            if (destCellInfo.isJumpOption) {
                G.jumpPositions.push(pieceGridID);
            }
            if (destCellInfo.capturedGridID !== false) {
                G.capturesThisTurn++;
                G.capturedPieces.push(G.cells[destCellInfo.capturedGridID]);
                G.cells[destCellInfo.capturedGridID] = null;
            }
            if (destCellInfo.capturedGridID !== false) {
                G.moveType = 'Capturing';
            } else if (destCellInfo.isJumpOption) {
                G.moveType = 'Jumping';
            } else {
                G.moveType = 'Basic';
            }
            if (G.moveType === 'Jumping' && (pieceToMove === pieces.BLACK_KNIGHT || pieceToMove === pieces.WHITE_KNIGHT)) {
                // if this is a knight and the knight is jumping, and the knight comes across an opportunity to start capturing,
                // then the knight must begin capturing.
                // We will set a flag here to explain this to the user if needed.
                // We use the OR here because we don't want to accidentally set these back to false if they were ever previously set.
                let canStartCharge = canCapture(mockProps, G.cells, destinationGridID);
                G.canCaptureThisTurn = G.canCaptureThisTurn || canStartCharge;
                G.missedKnightsCharge = G.missedKnightsCharge || canStartCharge;
            }
            if (ctx.currentPlayer === "0") {
                if ((pieceGridID === 5 && destinationGridID === 6) || (pieceGridID === 6 && destinationGridID === 5)) {
                    G.whiteCastleMoves++;
                }
            } else {
                if ((pieceGridID === 185 && destinationGridID === 186) || (pieceGridID === 186 && destinationGridID === 185)) {
                    G.blackCastleMoves++;
                }
            }

            // keep track of all involved grid positions (for highlight)
            if (G.movePositions.length === 0) {
                // on every move besides the first, the destinationGridID will become the new pieceGridID
                // so we only need to add it here one time
                G.thisTurnNotationString += gridIDToLabel(pieceGridID).label.toUpperCase();
                G.movePositions.push(pieceGridID);
            }
            if (destCellInfo.capturedGridID !== false) {
                G.movePositions.push(destCellInfo.capturedGridID);
                G.thisTurnNotationString += 'x\u200B'; // this unicode character is a zero-width space. it's useful so the browser knows it's okay to wrap text after an "x" in the notation
            } else {
                G.thisTurnNotationString += '-';
            }
            G.movePositions.push(destinationGridID);
            G.thisTurnNotationString += gridIDToLabel(destinationGridID).label.toUpperCase();

            G.movingPieceGridID = destinationGridID;
            G.mustLeaveCastle = isInOwnCastle(mockProps);

            let canEndTurn = true;
            if (G.canCaptureThisTurn) {
                if (G.mustLeaveCastle && G.canCaptureOutOfOwnCastle && G.capturesThisTurn < 1) {
                    G.mustCaptureError = true;
                    canEndTurn = false;
                    G.captureOutOfCastle = true;
                } else {
                    if (G.capturesThisTurn < 1) {
                        G.mustCaptureError = true;
                        canEndTurn = false;
                    }
                }
            }
            // need to check for *current* possible captures
            let movingPiece = G.cells[G.movingPieceGridID];
            if (G.moveType !== 'Basic' && canCapture(mockProps, G.cells, G.movingPieceGridID)) {
                if (movingPiece === pieces.BLACK_KNIGHT || movingPiece === pieces.WHITE_KNIGHT) {
                    // if it's a knight there's no excuse
                    G.mustCaptureError = true;
                    canEndTurn = false;
                } else {
                    if (G.moveType === 'Capturing') {
                        // if it's a pawn, and it was capturing, it must continue capturing now
                        // but if it wasn't already capturing then it was jumping, and it just happened to land here
                        G.mustCaptureError = true;
                        canEndTurn = false;
                    }
                }
            }
            G.canEndTurn = canEndTurn;
        },
    },

    flow: {
        endGame: true,
        endTurn: true,
        endPhase: false,
        onTurnBegin: (G, ctx) => {
            let mockProps = {G: G, playerID: ctx.currentPlayer};
            G.moveType = false;
            G.capturesThisTurn = 0;
            G.movingPieceGridID = null; // will keep track of the piece that's being moved so no other piece may be moved once it starts moving
            G.jumpPositions = [];
            G.canCaptureThisTurn = G.mustCaptureError = canCaptureScan(mockProps);
            G.missedKnightsCharge = false;
            G.mustLeaveCastle = isInOwnCastle(mockProps);
            G.canCaptureOutOfOwnCastle = canCaptureOutOfOwnCastle(mockProps);
            G.canCaptureOutOfCastleThisTurn = canCaptureOutOfOwnCastle(mockProps); // in case the player wants to do a knight's charge out of their castle
            G.movePositions = []; // for highlighting the final move for the other player
            G.thisTurnNotationString = '';
            G.canEndTurn = false;
            G.moveablePieces = canMoveScan(mockProps);

            //When a player cannot move, the game ends.
            //If the opponent has 2 or more pieces, the opponent wins.
            //If the opponent has less than 2 pieces, the game is a stalemate/draw.
            if (G.moveablePieces.length === 0) {
                let blackPieces = [pieces.BLACK_PAWN, pieces.BLACK_KNIGHT];
                let whitePieces = [pieces.WHITE_PAWN, pieces.WHITE_KNIGHT];
                if (ctx.currentPlayer === "0"){
                    let countBlackPieces = G.cells.filter(obj => blackPieces.includes(obj)).length;
                    if (countBlackPieces >= 2){
                        ctx.events.endGame({ rematchCode: shortid.generate(), winner: "1" });
                    } else {
                        ctx.events.endGame({ rematchCode: shortid.generate(), winner: false });
                    }
                } else {
                    let countWhitePieces = G.cells.filter(obj => whitePieces.includes(obj)).length;
                    if (countWhitePieces >= 2){
                        ctx.events.endGame({ rematchCode: shortid.generate(), winner: "0" });
                    } else {
                        ctx.events.endGame({ rematchCode: shortid.generate(), winner: false });
                    }
                }
            }
        },
        onTurnEnd: (G, ctx) => {
            let wcA = G.cells[185];
            let wcB = G.cells[186];
            let bcA = G.cells[5];
            let bcB = G.cells[6];
            let blackPieces = [pieces.BLACK_PAWN, pieces.BLACK_KNIGHT];
            let whitePieces = [pieces.WHITE_PAWN, pieces.WHITE_KNIGHT];
            G.lastTurnPositions = G.movePositions.slice(); // for highlighting the final move for the other player
            if (whitePieces.includes(bcA) && whitePieces.includes(bcB)) {
                // white has taken over the black castle and wins!
                ctx.events.endGame({ rematchCode: shortid.generate(), winner: "0" })
            }
            if (blackPieces.includes(wcA) && blackPieces.includes(wcB)) {
                // black has taken over the white castle and wins!
                ctx.events.endGame({ rematchCode: shortid.generate(), winner: "1" })
            }

            let countBlackPieces = G.cells.filter(obj => blackPieces.includes(obj)).length;
            let countWhitePieces = G.cells.filter(obj => whitePieces.includes(obj)).length;

            if (countBlackPieces <= 1 && countWhitePieces <= 1) { // DRAWWWWW
                ctx.events.endGame({ rematchCode: shortid.generate(), winner: false });
            } else if (countBlackPieces < 1 && countWhitePieces >= 2) {
                ctx.events.endGame({ rematchCode: shortid.generate(), winner: "0" });
            } else if (countWhitePieces < 1 && countBlackPieces >= 2) {
                ctx.events.endGame({ rematchCode: shortid.generate(), winner: "1" });
            }

            G.gameTurnMovedPieces.push(G.cells[G.movingPieceGridID])
            G.gameTurnNotation.push(G.thisTurnNotationString);
        },
    },
});

export default CamelotGame;
export { pieces, basicOffsets };
