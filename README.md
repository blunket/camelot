# PlayCamelot.com

The best place to play Camelot. Second only to playing with a physical board, in person.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Quickstart:

1. Clone the repo and move into the folder: `git clone https://github.com/blunket/camelot.git && cd camelot`
2. Install dependencies and wait ages: `yarn`
3. Copy the `.env` file to a new file called `.env.local` (exact name) and change variables there as necessary. Changes to this file will require restarting/rebuilding the app.
4. Start a dev build: `yarn start`
5. Start the game server (probably in a new terminal/cli window) with `node -r esm ./src/server.js`

In development mode, the app will automatically rebuild and reload **as** you edit the source.<br>
You will also see any lint errors in the console. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Production Build:

`yarn build` will build the app for production to the `build` folder.
