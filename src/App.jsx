import React from 'react';

import { Client } from 'boardgame.io/react';

import CamelotGame from './Game.js'
import CamelotBoard from './Board.jsx'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const CamelotClient = Client({
    game: CamelotGame,
    board: CamelotBoard,
    debug: false,
    multiplayer: { server: process.env.REACT_APP_SERVER },
});

const App = () => (
    <Router>
        <div>
            <Route path="/" exact render={ () => (
                <div style={{ padding: '10px' }}>
                    <Link to="/white">Play as white.</Link>
                    <br />
                    <Link to="/black">Play as black.</Link>
                    <br />
                    <Link to="/spectate">Spectate.</Link>
                </div>
            )} />
            <Route path="/spectate" render={ () => (
                <CamelotClient />
            )} />
            <Route path="/white" render={ () => (
                <CamelotClient playerID="0" />
            )} />
            <Route path="/black" render={ () => (
                <CamelotClient playerID="1" />
            )} />
        </div>
    </Router>
)

export default App;
