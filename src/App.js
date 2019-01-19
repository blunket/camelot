import React from 'react';

import { Client } from 'boardgame.io/react';

import CamelotGame from './Game.js'
import CamelotBoard from './Board.js';

const CamelotClient = Client({
    game: CamelotGame,
    board: CamelotBoard,
    multiplayer: { local: true },
});

const App = () => (
    <div>
        <CamelotClient playerID="0" />
        <CamelotClient playerID="1" />
    </div>
)

export default App;
