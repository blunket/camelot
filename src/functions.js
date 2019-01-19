import { pieces } from './Game.js'
import { basicOffsets } from './Game.js'

export function isMyPiece(props, gridID) {
    switch (props.G.cells[gridID]) {
        case pieces.WHITE_KNIGHT:
        case pieces.WHITE_PAWN:
            return props.playerID === "0"
        case pieces.BLACK_KNIGHT:
        case pieces.BLACK_PAWN:
            return props.playerID === "1"
        default:
            return false;
    }
}

export function getCellInfo(props, chosenPiece, gridID) {
    let isDarkSquare = false;
    let cellContent = props.G.cells[gridID];
    let row = Math.floor(gridID / 12);
    let col = gridID % 12;

    if (row % 2 === 0) {
        isDarkSquare = col % 2 === 0;
    } else {
        isDarkSquare = col % 2 === 1;
    }
    let isSelected = gridID === chosenPiece;
    let isLegalOption = false;
    let isJumpOption = false;
    let capturedGridID = false;
    if (chosenPiece !== null && !isSelected) {
        for (var i = 0; i < basicOffsets.length; i++) {
            if (cellContent !== null) {
                continue;
            }
            let adjacentGridID = chosenPiece + basicOffsets[i];
            let adjacentCellContent = props.G.cells[adjacentGridID];
            if (gridID === chosenPiece + basicOffsets[i]) {
                isLegalOption = true;
            }
            if (adjacentCellContent !== null && gridID === chosenPiece + (2 * basicOffsets[i])) {
                isLegalOption = true;
                isJumpOption = true;
                if (!isMyPiece(props, adjacentGridID)) {
                    capturedGridID = adjacentGridID;
                }
            }
        }
    }

    return {
        isDarkSquare: isDarkSquare,
        cellContent: cellContent,
        isSelected: isSelected,
        isLegalOption: isLegalOption,
        isJumpOption: isJumpOption,
        capturedGridID: capturedGridID,
        isMyPiece: isMyPiece(props, gridID),
        row: row,
        col: col,
    }
}
