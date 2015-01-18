---
layout: post
title: "Profiling Vim"
tags:
  - vim
keywords:
  - vimscript
  - profiling
  - performance
  - speed
---

Now that you have mastered [debugging in Vim](/2014/10/31/debugging-vim/) and gotten all of your Vimscript working as expected, you might be wondering about the performance of those functions? What are the bottlenecks of your Vimscript functions? How long exactly does it take Vim to startup and what is the time breakdown for it to source each of the files and plugins that it needs? How do all those plugins you included in your `.vimrc` affect Vim's load time or performance? If you said yes to any of those questions, you are in luck, Vim provides a profiling command for getting timing information related to your Vimscript's performance.

<!--more-->

## Profiling Startup Time

The simplest profiling you can begin with is to get a breakdown of Vim's startup process. You can use the `startuptime` flag when starting Vim to generate a log file with timestamps on how long it takes Vim to start up and source its various files and plugins.

```sh
# Stores results in a file called vim.log
vim --startuptime vim.log
```

This will produce a log file similar to following. The total time for my [Vim setup](https://github.com/jdlehman/dotfiles/tree/master/vim) to startup is 57.952 milliseconds to give you some sort of reference point. How long does yours take?

```sh
# Example statuptime output

times in msec
 clock   self+sourced   self:  sourced script
 clock   elapsed:              other lines

000.008  000.008: --- VIM STARTING ---
000.077  000.069: Allocated generic buffers
000.360  000.283: locale set
000.364  000.004: clipboard setup
000.373  000.009: window checked
000.815  000.442: inits 1
000.821  000.006: parsing arguments
000.822  000.001: expanding arguments
003.446  002.624: shell init
003.714  000.268: Termcap init
003.731  000.017: inits 2
003.849  000.118: init highlight
005.193  000.972  000.972: sourcing /Users/me/.vim/autoload/plug.vim
007.167  000.022  000.022: sourcing /usr/local/share/vim/vim74/ftoff.vim
007.942  000.042  000.042: sourcing /Users/me/.vim/plugged/vim-mustache-handlebars/ftdetect/mustache.vim

...
```

## Profiling Vimscript Functions/Files

While getting information on Vim's startup might be interesting, startup only happens when we first launch Vim and while a slow startup time might be annoying, what affects getting work done more is the actual performance while Vim is running. To measure this performance, Vim's `profile` command allows us to log time spent executing functions and/or scripts.

The first thing you must do before profiling anything is to tell Vim to start profiling and to set the file to log output to. As with anything related to profiling, you will use the `profile` command, passing it arguments for your intended purpose.

```vimscript
" start profiler and log output to output.log
profile start output.log
```

Note that you can always pause profiling with `profile pause` and start it again with `profile continue`.

### Profiling Functions

To begin profiling a function (or multiple functions) you can use the `profile func` command that takes a regular expression pattern to specify the function or functions that you want to profile. `*` will profile all functions, but be warned you will have quite a bit of output to sift through. It is important to note that you can use the `profile func` command multiple times; each time will add another function to the list of functions being profiled. This holds true of the `profile file` command as well.

```vimscript
" begin profiling a function called CloseBuffer
profile func CloseBuffer
```

### Profiling Files

To begin profiling a file, you can use the `profile file` command that also takes a regular expression pattern to specify the file or files that you want to profile. You should note that profiling only starts when the file is loaded AFTER running the `profile` command. This means that using a `profile` command within the script file will not work as intended.

```vimscript
" begin profiling a file called myfile.vim
profile file myfile.vim
" you can source the file manually to get the profiler to pick it up
source myfile.vim
```

It is important to note that `profile file file.vim` will only profile the script `file.vim`. If there are functions within `file.vim` that you would also like to be profiled, you can use the `profile! file` command (notice the added exclamation point).

### Removing Profiles

To remove a file or function from being profiled (perhaps you are finished profiling it and wish to stop logging profile output for it) you can use the `profdel` command.

```vimscript
" stop profiling all files and functions
profdel *
" stop profiling files matching the regex
profdel file file1.vim
" stop profiling functions matching the regex
profdel func myfunc
```

### Sample Profile Output

The following is sample profiling output for the function `CloseHiddenBuffers()`.

```sh
FUNCTION  CloseHiddenBuffers()
Called 2 times
Total time:   0.023797
 Self time:   0.023308

count  total (s)   self (s)
                                " store ids of visible buffers
    2              0.000017     let visible_buffers = {}
    4              0.000030     for tab_id in range(1, tabpagenr('$'))
    4              0.000015       for buffer_id in tabpagebuflist(tab_id)
    2              0.000013         let visible_buffers[buffer_id] = 1
    2              0.000005       endfor
    2              0.000001     endfor
                            
                                " close buffers that are not in visible dictionary
   31              0.000093     for buffer_id in range(1, bufnr('$'))
   29              0.000184       if bufloaded(buffer_id) && !has_key(visible_buffers, buffer_id)
   18   0.023249   0.022760         execute 'bd ' . buffer_id
   18              0.000057       endif
   29              0.000025     endfor

FUNCTIONS SORTED ON TOTAL TIME
count  total (s)   self (s)  function
    2   0.023797   0.023308  CloseHiddenBuffers()

FUNCTIONS SORTED ON SELF TIME
count  total (s)   self (s)  function
    2   0.023797   0.023308  CloseHiddenBuffers()
```

You will notice that the output provides a breakdown of how long it took to execute each line in the function as well as cumulative timings and counts for the number of times the function or lines in the function were called. The "total" time is the time spent in the function while the "self" time does not include time spent in:
  - other user defined functions
  - sourced scripts
  - executed autocommands
  - external commands like shell commands

### Gotchas

- Time waiting for user input is not counted.
- Accuracy is based on the `gettimeofday()` system function, which may be accurate to 1/100 of a second.
- Profiling is done for each line. If you have multiple commands on a line that you would like to profile, you must split the line into multiple lines to get profiling information for the individual commands.
- You might notice that the timings do not add up perfectly. This is due to overhead in Vim.
- The "self" time is incorrect when a function is called recursively (calls itself).
- Functions that are deleted with the `delfunc` command before Vim exits will not produce profiling information in the profile log.
