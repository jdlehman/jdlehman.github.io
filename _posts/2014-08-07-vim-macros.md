---
layout: post
tags: vim
---

One of the big advantages I find to using vim as my editor is the ability to record and replay macros. The recording of a macro begins when `q` is pressed followed by any other key, which specifies what register the macro is to be stored in. If we use `qq` the macro will be stored in register `q`, whereas `qt` will store the macro in register `t`. Once the recording is started, all keystrokes are stored into the specified register. Pressing `q` again will stop the recording. To "playback" the macro, which will just execute the contents of the register as if you were pressing the keystrokes yourself, type `@` followed by the register in which you stored the macro. `@@` will playback the most recently played macro.

I find that a good baseline for when a macro might be useful is for repetitious editing or reformatting that cannot easily be accomplished using visual block mode. For example, given the following Ruby method, let's say I wanted to modify the additional method calls to use parenthesis.

```ruby
def my_method
  run_something arg1, arg2
  run_something2 arg1
  run_something3 arg1, arg2, arg3
  # etc...
end
```

To do this we can start on the first line of the method (not the definition) and press `qq` to being recording our macro to register `q`. We can type `^wi(A)` followed by `q` to stop the recording, where `` is the escape character. Now we can execute `@q` on each line we want to modify to be wrapped in parenthesis to get the following result.

```ruby
def my_method
  run_something (arg1, arg2)
  run_something2 (arg1)
  run_something3 (arg1, arg2, arg3)
  # etc...
end
```

Let's break down the macro as it looks like gibberish when pasting the contents of the register as I did above.

- `^` takes our cursor to the beginning of the line. This ensures that we always start from the same location and follows the principle of generalizing a macro as much as possible to optimize the potential for reuse.
- `w` jumps to the next word, which happens to be the beginning of our first argument
- `i(` goes into insert mode and writes an open parenthesis then escapes back into normal mode
- `A)` goes into insert mode at the end of the line and inserts a closing parenthesis before escaping back into normal mode

When we break the macro down, it is actually really simple. Another thing we could have doe is typed `j` before we stopped recording which would have taken us to the next line of code automatically. Then we could have used a single command, `3@q`, instead of 3 separate commands to do the same amount of work.

I already mentioned the notion of generalizing a macro to allow for its reuse. I think this is where macros can really shine. Every now and then you might create a macro that you would actually find useful in your everyday development. What do you do? You can simply create a mapping in your `vimrc` to run this macro such that it will always be available for use even if the original register you recorded it in is overwritten eventually. In your `vimrc` paste your macro in with `"qp`, where `q` is the register you used to record the macro. We are halfway there, simply add a mapping in front of this pasted content like, `nnoremap <leader>(`. The final result looking like:

```vim
nnoremap <leader>( ^wi(A)
```

Now our old macro turned mapping will run whenever we type `<leader>(` in normal mode.
