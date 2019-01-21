import { Server } from 'boardgame.io/server';

import CamelotGame from './Game.js'

const server = Server({ games: [CamelotGame] });
server.run(2468);
