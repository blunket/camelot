import { Game, INVALID_MOVE } from 'boardgame.io/core';
import { isMyPiece, getCellInfo, canCapture, canCaptureScan } from './functions.js';

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

function IsVictory(cells) {
    return false;
}

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
        }
    },

    moves: {
        movePiece(G, ctx, pieceGridID, destinationGridID) {
            G.mustCaptureError = false;
            let mockProps = {G: G, playerID: ctx.currentPlayer};
            if (G.movingPieceGridID !== null && pieceGridID !== G.movingPieceGridID) { // enforce moving only one piece in a turn
                return INVALID_MOVE;
            }
            if (G.cells[destinationGridID] !== null || !isMyPiece(mockProps, pieceGridID)) { // can only move own pieces onto vacant squares
                return INVALID_MOVE;
            }
            let destCellInfo = getCellInfo(mockProps, pieceGridID, destinationGridID);
            let pieceToMove = G.cells[pieceGridID];
            G.cells[destinationGridID] = pieceToMove;
            G.cells[pieceGridID] = null;
            if (destCellInfo.isJumpOption) {
                G.jumpPositions.push(pieceGridID);
            }
            if (destCellInfo.capturedGridID !== false) {
                G.capturesThisTurn++;
                G.cells[destCellInfo.capturedGridID] = null;
            }
            if (destCellInfo.capturedGridID !== false) {
                G.moveType = 'Capturing';
            } else if (destCellInfo.isJumpOption) {
                G.moveType = 'Jumping';
            } else {
                G.moveType = 'Basic';
            }
            if (G.moveType === 'Jumping' && pieceToMove === pieces.BLACK_KNIGHT || pieceToMove === pieces.WHITE_KNIGHT) {
                // if this is a knight and the knight is jumping, and the knight comes across an opportunity to start capturing,
                // then the knight must begin capturing.
                // We will set a flag here to explain this to the user if needed.
                // We use the OR here because we don't want to accidentally set it back to false if a knight starts jumping around when a capture is possible.
                let canStartCharge = canCapture(mockProps, destinationGridID);
                G.canCaptureThisTurn = G.canCaptureThisTurn || canStartCharge;
                G.missedKnightsCharge = canStartCharge;
            }
            G.movingPieceGridID = destinationGridID;
        },
        submitTurn(G, ctx) {
            let mockProps = {G: G, playerID: ctx.currentPlayer};
            let canEndTurn = true;
            if (G.canCaptureThisTurn && G.capturesThisTurn < 1) {
                G.mustCaptureError = true;
                canEndTurn = false;
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
        },
        endGameIf: (G, ctx) => {
            var ws = IsVictory(G.cells);
            if (ws !== false) {
                return { winner: ctx.currentPlayer };
            }
        }
    },
});

export default CamelotGame;
export { pieces, basicOffsets };
