---
layout: post
title: "Recover a dropped Git stash"
tags:
  - git
keywords:
  - git
  - stash
---

Have you ever accidentally drop something from your stash in Git? Luckily it is not actually gone forever. There are a couple strategies for getting it back.

<!--more-->

## From Commit Hash

Whenever you drop something from your stash, it will confirm you dropped it and print the commit hash.

```sh
git stash drop
Dropped refs/stash@{0} (666d927cfc3062887b45eb8cb63b121b5ae68c8e)
```

If you have not closed your terminal yet you should be able to find the hash in your history and use it to get back to your lost commit.

```sh
# apply dangling commit
git stash apply 666d927cfc3062887b45eb8cb63b121b5ae68c8e

# or just check it out
git checkout 666d927cfc3062887b45eb8cb63b121b5ae68c8e
```

## File System Consistency Check

If you have already closed your terminal or cannot find the lost commit's hash, you can use `git fsck`. `git fsck` (file system consistency check) is a tool to verify the connectivity and validity of objects in git's database. Just running `git fsck` without any arguments will show some diagnostic results including dangling commits.

You will want to run `git fsck --no-reflogs` to make sure that commits only reachable via the reflog are not considered reachable. The commit for the dropped stash is among the dangling commits logged, but unless your git repository is brand new you will notice there are probably several dangling commits and a lot of other noise being logged by `git fsck`.

We pipe the output awk to only log the hashes of the dangling commits.

```sh
git fsck --no-reflogs | awk '/dangling commit/ {print $3}'
```

This still might produce a number of hashes. To better determine which hash corresponds to the commit you dropped from the stash, you can pass the hashes to `git log` or `git show` to get more information.

```sh
git show --oneline $(git fsck --no-reflogs | awk '/dangling commit/ {print $3}')
# or
git log --graph --oneline --decorate $(git fsck --no-reflogs | awk '/dangling commit/ {print $3}')
```

## Git Repository Browser (GUI tool)

You can also get the dangling commit hashes like the above strategy, but send them to [`gitk`](https://git-scm.com/docs/gitk) to open them in the git repository browser, which is a GUI tool.

```sh
gitk --all $(git fsck --no-reflogs | awk '/dangling commit/ {print $3}')
```
