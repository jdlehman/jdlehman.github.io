---
layout: post
title: "Exploring File Changes Over Time"
tags:
  - git
keywords:
  - git
  - github
---

Recently I needed to track down when a particular piece of logic changed in a file. I couldn't remember the date that it changed or any relevant information that might help me find the commit in which it changed. Luckily, git (and GitHub) provide tooling that helped me find what I was looking for.

<!--more-->

## Using Git

Git itself provides functionality to chronologically view commits that have occurred on a particular file or directory.

```sh
git log --follow -p -- pathToFileOrDirectory

# examples
git log --follow -p -- src/helpers
git log --follow -p -- src/helpers/helper1.js
```

If you prefer a GUI utility, you can also use `gitk` to accomplish the same thing:

```sh
gitk pathToFileOrDirectory
```

## Using GitHub

If you happen to host your code on [GitHub](https://github.com/), you can also view the commits on a file or directory over time in their web interface.

Navigate to `https://github.com/USER/REPO/commits/BRANCH_OR_SHA/PATH` where the `PATH_TO_FILE_OR_DIRECTORY` is optional.

*Examples:*
- [https://github.com/jdlehman/switcheroo/commits/master/src/index.js](https://github.com/jdlehman/switcheroo/commits/master/src/index.js)
- [https://github.com/jdlehman/switcheroo/commits/9d97f19/src](https://github.com/jdlehman/switcheroo/commits/9d97f19/src/index.js)
- [https://github.com/jdlehman/switcheroo/commits/master](https://github.com/jdlehman/switcheroo/commits/master)
