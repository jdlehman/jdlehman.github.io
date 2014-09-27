---
layout: post
tags: vim
---

Vim's defaults are rather dated. Without syntax highlighting, line numbers, or a variety of other defaults found in most modern editors, the initial headache is always configuring these basic settings before starting with Vim. Despite the obvious visual settings, there are a number of Vim defaults that are not apparent when you first start learning Vim, or even after you have been using Vim for a while if you were fortunate enough not to run into an issue. For that reason, it took me a while to realize that I was continually fighting with Vim's default working directory.

<!--more-->

## Vim's Default Working Directory

By default Vim uses the directory that you opened Vim in as the default working directory. You can check the current working directory by running the command, `pwd` (print working directory). Honestly, I don't believe this is a bad default. It makes a lot of sense if you open Vim and stay in that project directory for the entirety of your working session, but it begins to breakdown with fairly typical use cases.

## Why does it matter?

Before we jump into the cases where the default working directory breaks down, why do we even care what Vim uses as the current working directory? The working directory is used for any Vim action that needs to know about the current file structure such as searching and file/directory based commands. This not only includes built in file searching solutions like Vim's `find` or `grep` commands, but also search plugins like [CtrlP](https://github.com/kien/ctrlp.vim), [Command-T](https://github.com/wincent/command-t), and [fzf](https://github.com/junegunn/fzf). If you use any sort of file search or fuzzy search, the working directory affects the outcome of the search. It determines where the searching begins (in combination with the path variable).

## Where it breaks down

Any of the following cases will prevent you from searching the entire file structure of your desired project.

- You open Vim with a nested file/folder within your project.
- You open Vim at your project's root, but navigate to another project in the file explorer.

While these cases are general, I found them to be extremely common cases that made it frustrating to move around my projects via fuzzy searches and filename searches, which is my normal workflow for jumping between files that are not already in hidden buffers.

## A simple solution

A simple way to get around this is to manually change the working directory.

```vim
" change the working directory to the directory of the currently open file
cd %:p:h
" change the working directory only for the current window
lcd %:p:h
" change the working directory to an explicit directory
lcd ~/projects/myproject
```

You can even use an autocommand to automatically change the working directory for you whenever a buffer is entered.

```vim
autocmd BufEnter * silent! lcd %:p:h
```

I found that while this solution can work, it is very limited. I do not always want my working directory to be the directory of the file I am currently editing. If this is nested in a project, it does not help me search on files outside of that nested directory. The alternative, setting the working directory explicitly, is too manual of a process for my liking. There has to be a better way.

## A more robust solution

Before I get to the Vimscript, let's outline some rules for a desirable working directory. I want to make use of autocommands so that the working directory changes automatically rather than being a manual process. I also normally work in Git projects, so let's set the working directory to the root of the Git project if we are within a Git project, otherwise use the directory of the currently open file. Lastly, I want to follow symlinks into their actual directories. This is especially useful for my dotfiles that are in a Git repo, but symlinked to my home directory.

First let's figure out a way to follow symlinks.

```vim
" follow symlinked file
function! FollowSymlink()
  let current_file = expand('%:p')
  " check if file type is a symlink
  if getftype(current_file) == 'link'
    " if it is a symlink resolve to the actual file path
    "   and open the actual file
    let actual_file = resolve(current_file)
    silent! execute 'file ' . actual_file
  end
endfunction
```

The only caveat with this approach is that we will need to use `w!` instead of just `w` to save the file for the first time. One extra keystroke is a worthwhile trade off to me. Otherwise I would have to use the file explorer or `netrw` to find the actual file, which would take much longer.

Now we can use another function to set the working directory for us. It will use the Git project root if it is in a Git project otherwise it will just use the current file's directory.

```vim
" set working directory to git project root
" or directory of current file if not git project
function! SetProjectRoot()
  " default to the current file's directory
  lcd %:p:h
  let git_dir = system("git rev-parse --show-toplevel")
  " See if the command output starts with 'fatal' (if it does, not in a git repo)
  let is_not_git_dir = matchstr(git_dir, '^fatal:.*')
  " if git project, change local directory to git project root
  if empty(is_not_git_dir)
    lcd `=git_dir`
  endif
endfunction
```

Now that we have the two pieces we need, we can use these functions in an autocommand to automatically change the working directory for us, we won't even have to think about it, it will just work.

```vim
" follow symlink and set working directory
autocmd BufRead *
  \ call FollowSymlink() |
  \ call SetProjectRoot()
```

## The Final Problem

You can take the above solution, and it will work in ALMOST every case. The good news is that after a few frustrating months of using a nearly ideal solution, I have finally figured out the missing piece.

The issue with what we have written so far is that the working directory will not be updated when navigating the file system with `netrw`, Vim's built in (and buggy) file explorer. The problem is that `netrw` does not get a `BufRead` event. In fact, pretty much every autocommand event I tried did not work in `netrw`. I got around this for a while, by configuring `netrw` with `let g:netrw_keepdir=0`. This global setting will keep the working directory the same as the browsing directory while we are using `netrw`, which is ultimately half of our solution. It still will not respect our Git project directories in the manner we would like.

After a lot of research and failed attempts I finally found a way to debug autocommands. `set debugger=9` will echo the autocommand events that are registered as well as any functions that are called by these events. The only autocommand that seemed to get called in `netrw` is the `CursorMoved` event. Therefore we can hook into this to enable our working directory to remain up to date even in `netrw`. If anyone knows of another autocommand that `netrw` listens to, I would love to know!

```vim
" netrw: follow symlink and set working directory
autocmd CursorMoved *
  " short circuit for non-netrw files
  \ if &filetype == 'netrw' |
  \   call FollowSymlink() |
  \   call SetProjectRoot() |
  \ endif
```

Be sure to set `debugger` back to 0 otherwise you will find that your productivity has come to a halt because of all of the event logging. Stay tuned as the Vim `debugger` is likely to become the topic of another blog post.
