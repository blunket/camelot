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

## Contributing / Workflow:

First things first: fork the project on GitHub with the fork button :)

Then, **clone your fork**, not the main repo.
You'll want to update your local copy to include the main repo as an "upstream" remote branch. Here's how:

```
git remote add upstream https://github.com/blunket/camelot.git
```

For more info on this, check [this guide](https://help.github.com/articles/configuring-a-remote-for-a-fork/) on configuring a remote for a fork.

Now you are ready to work! For each new issue, create a branch off of `master`. You can name it anything you want that'll be easy for you to identify. For example:

```
git checkout master
git branch task-6-stalemates
git checkout task-6-stalemates
```

Make all changes necessary here, committing as many times as you need. Focus on only one issue per branch (it's easier to review things this way).
When you're done, push your changes (to your fork), then open a pull request through GitHub for code review.
