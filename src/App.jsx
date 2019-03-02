import React from 'react';

import { Client } from 'boardgame.io/react';

import CamelotGame from './Game.js'
import CamelotBoard from './Board.jsx'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"

import HomePage from './Home.jsx'
import shortid from 'shortid'

const CamelotClient = Client({
    game: CamelotGame,
    board: CamelotBoard,
    debug: false,
    multiplayer: { server: process.env.REACT_APP_SERVER },
});

const App = () => (
    <Router>
        <div>
            <Route path="/" exact component={HomePage} />
            <Route path="/play/:id?/:player?" render={ ({match}) => {
                if (typeof match.params.id === 'undefined' || !shortid.isValid(match.params.id)) {
                    return <HomePage />
                }
                let playerID = ''
                if (match.params.player === 'white') {
                    playerID = '0'
                } else if (match.params.player === 'black') {
                    playerID = '1'
                } else if (typeof match.params.player !== 'undefined') {
                    return null
                }
                return <CamelotClient gameID={match.params.id} playerID={playerID} />
            }} />
        </div>
    </Router>
)

export default App;
