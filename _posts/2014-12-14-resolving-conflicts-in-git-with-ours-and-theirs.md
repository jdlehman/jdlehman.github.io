---
layout: post
title: Resolving Git Merge Conflicts
tags:
  - git
keywords:
  - conflict
  - merge
  - resolve
  - rebase
---

Merge conflicts are no stranger to anyone that uses some form of version control. Git does a great job at auto-merging conflicts, but there are many instances when Git cannot determine what must be done automatically and a manual merge is required. Though this can be a pain at times, Git provides many useful tools to help with more difficult merges. Specifically options like `ours` and `theirs` allow us to tell Git what strategy to use when handling merge conflicts so we do not have to merge them manually.

<!--more-->

Let's assume we have a branch, `branch1`, that has diverged from our master branch. Since `branch1` split from the master branch both `branch1` and `master` have both made changes to the same line of the same file. This means that there will be merge conflicts that Git cannot resolve for us.

## Resolving conflicts in the middle of a rebase

If we are trying to rebase our branch with the new changes in master we might do something like the following.

```sh
git checkout branch1
git rebase master

git diff

# ++<<<<<<< HEAD
# + Master change
# ++=======
# + Branch1 change
# ++>>>>>>> Branch1 branch
```

Notice the output of `git diff`. There might be many conflicts within the file, I am just showing one for brevity. Since this is a rebase, the `HEAD` is the branch we are rebasing with (`master`). If I want to take all of the changes for a file from `branch1`, the current branch, I can run `git checkout --theirs filename`, rather than dealing with it manually. Likewise, if I want to accept all the changes from `master`, the branch with which I am rebasing, I can use `git checkout --ours filename`.

It is important to note that the meaning of `ours` and `theirs` is reversed from its normal meaning when being used for a rebase. This is because rebasing replays the current branch's commits one at a time on top of the branch we want to rebase with. In our case, `branch1`'s commits are being replayed on top of `master`. This makes `master` the "base" branch in this case, which is the reason that `ours` will take the changes from `master` instead of `branch1`.

## Resolving conflicts in the middle of a merge

As noted above, the semantics of `ours` and `theirs` change when being used in a rebase. If we are trying to resolve conflicts in the middle of a merge, we can use `ours` to accept changes from the branch we are currently on and `theirs` to accept changes from the branch we are merging in.

Let's assume that we are trying to perform a merge as follows.

```sh
git checkout master
git merge branch1

git diff

# ++<<<<<<< HEAD
# + Master change
# ++=======
# + Branch1 change
# ++>>>>>>> Branch1 branch
```
This time, the `HEAD` is our current branch, `master`. If we want to accept all the changes for a particular file from our current branch we can use `git checkout --ours filename`. Otherwise, I can accept all the changes from the branch I am merging in using `git checkout --theirs filename`.

## Choosing a merge strategy beforehand

You may have noticed that resolving merge conflicts with `ours` and `theirs` in the middle of a rebase or merge is the same, except that the semantics of what `ours` and `theirs` refer to are different. Both use a flag on `git checkout` to choose what must be done per file. This is very useful if you were not planning on having merge conflicts and they pop up in the middle of a rebase/merge or if you want to use a different strategy depending on the file. This means for one file you could use `ours`, another `theirs`, and another could be done manually.

In instances that you know that you always want to resolve merge conflicts in the same way, you can choose a merge strategy (such as `ours` or `theirs`) before performing the rebase or merge. The default merge strategy is a recursive merge. You can also specify the algorithm to use for a recursive merge (patience, minimal, histogram, or myers), but we will not cover those in this post.

You can choose the merge strategy with the `--strategy <strategy-name>` option, or `-s <strategy-name>` for short.

For example:

```sh
##########
# REBASING
##########

# a rebase that wants to resolve all conflicts
# by taking the current branch's changes
git rebase -s theirs rebase_branch
# a rebase that wants to resolve all conflicts
# with the rebase_branch changes
git rebase -s ours rebase_branch

#########
# MERGING
#########

# a merge that wants to resolve all conflicts
# by taking the current branch's changes
git merge -s ours merge_branch
# a merge that wants to resolve all conflicts
# with the merge_branch changes
git merge -s theirs merge_branch
```

Now you should be able to add the `ours` and `theirs` options to your Git merge resolution arsenal. Whenever you find yourself taking all of the changes from a single branch, that should be your queue to use `ours` or `theirs`. And don't forget that the meaning of `ours` and `theirs` changes within a rebase.
