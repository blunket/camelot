# Contributing / Workflow:

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
