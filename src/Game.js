import { Game } from 'boardgame.io/core';
import { isMyPiece, getCellInfo, isInOwnCastle, canCaptureOutOfOwnCastle, canCapture, canCaptureScan } from './functions.js';

const pieces = {
    BLACK_KNIGHT: 'BK',
    BLACK_PAWN: 'BP',
    WHITE_KNIGHT: 'WK',
    WHITE_PAWN: 'WP',
};

const basicOffsets = [
    -7, // up
    7,  // down
    -1,  // left
    1,   // right
    -6, // up right
    -8, // up left
    8,  // down right
    6,  // down left
];

function getCellsSetup() {
    let cells = Array(91).fill(null);
    let disabledCells = [0, 1, 2, 4, 5, 6, 7, 8, 12, 13, 14, 20, 70, 76, 77, 78, 82, 83, 84, 85, 86, 88, 89, 90];
    let blackKnights = [23, 25];
    let blackPawns = [29, 30, 31, 32, 33];
    let whiteKnights = [65, 67];
    let whitePawns = [57, 58, 59, 60, 61];
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
                let canStartCharge = canCapture(mockProps, destinationGridID);
                G.canCaptureThisTurn = G.canCaptureThisTurn || canStartCharge;
                G.missedKnightsCharge = G.missedKnightsCharge || canStartCharge;
            }

            // keep track of all involved grid positions (for highlight)
            if (G.movePositions.length === 0) {
                // on every move besides the first, the destinationGridID will become the new pieceGridID
                // so we only need to add it here one time
                G.movePositions.push(pieceGridID);
            }
            if (destCellInfo.capturedGridID !== false) {
                G.movePositions.push(destCellInfo.capturedGridID);
            }
            G.movePositions.push(destinationGridID);

            G.movingPieceGridID = destinationGridID;
            G.mustLeaveCastle = isInOwnCastle(mockProps);
        },
        submitTurn(G, ctx) {
            let mockProps = {G: G, playerID: ctx.currentPlayer};
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
            if (G.moveType !== 'Basic' && canCapture(mockProps, G.movingPieceGridID)) {
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
            if (canEndTurn) {
                ctx.events.endTurn();
            }
        }
    },

    flow: {
        endTurn: false,
        endPhase: false,
        onTurnBegin: (G, ctx) => {
            let mockProps = {G: G, playerID: ctx.currentPlayer};
            G.moveType = false;
            G.capturesThisTurn = 0;
            G.movingPieceGridID = null; // will keep track of the piece that's being moved so no other piece may be moved once it starts moving
            G.jumpPositions = [];
            G.canCaptureThisTurn = canCaptureScan(mockProps);
            G.missedKnightsCharge = false;
            G.mustCaptureError = false;
            G.mustLeaveCastle = isInOwnCastle(mockProps);
            G.canCaptureOutOfOwnCastle = canCaptureOutOfOwnCastle(mockProps);
            G.canCaptureOutOfCastleThisTurn = canCaptureOutOfOwnCastle(mockProps); // in case the player wants to do a knight's charge out of their castle
            G.movePositions = []; // for highlighting the final move for the other player
        },
        onTurnEnd: (G, ctx) => {
            let wcA = G.cells[87];
            let bcA = G.cells[3];
            let blackPieces = [pieces.BLACK_PAWN, pieces.BLACK_KNIGHT];
            let whitePieces = [pieces.WHITE_PAWN, pieces.WHITE_KNIGHT];
            G.lastTurnPositions = G.movePositions.slice(); // for highlighting the final move for the other player
            if (whitePieces.includes(bcA)) {
                // white has taken over the black castle and wins!
                ctx.events.endGame({ winner: "0" })
            }
            if (blackPieces.includes(wcA)) {
                // black has taken over the white castle and wins!
                ctx.events.endGame({ winner: "1" })
            }

            let countBlackPieces = G.cells.filter(obj => blackPieces.includes(obj)).length;
            let countWhitePieces = G.cells.filter(obj => whitePieces.includes(obj)).length;

            if (countBlackPieces <= 1 && countWhitePieces <= 1) { // DRAWWWWW
                ctx.events.endGame({ winner: false });
            } else if (countBlackPieces < 1 && countWhitePieces >= 2) {
                ctx.events.endGame({ winner: "0" });
            } else if (countWhitePieces < 1 && countBlackPieces >= 2) {
                ctx.events.endGame({ winner: "1" });
            }
        },
    },
});

export default CamelotGame;
export { pieces, basicOffsets };
