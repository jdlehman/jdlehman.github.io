---
layout: post
title: "JavaScript Function Memoization"
tags:
  - javascript
  - performance
keywords:
  - js
  - memoization
  - function
  - example
  - code
---

In this post I am going to walk through when you might want to use memoization for your JavaScript functions and how you can easily memoize any function. Before we can go much further, let's define what memoization is.

<!--more-->

## What is memoization?

Memoization is an optimization technique where expensive function calls are cached such that the result can be immediately returned the next time the function is called with the same arguments. This method of optimization is not unique to JavaScript and is quite common in many programming languages. It is especially useful in recursive functions as calls are more likely to call with the same arguments while recursing. Take a recursive `factorial` function for example:

```javascript
function factorial(num) {
  if(num === 1) { return 1 };
  return num * factorial(num - 1);
}
```
If we call `factorial(3)`, the function calls `factorial(3)`, `factorial(2)`, and `factorial(1)` will be called. If we memoize this function, another call to `factorial(3)` will not need to recurse, it can simply return the result that it has cached. The real benefit is if we call `factorial(4)`, we will short circuit our recursion, because `factorial(3)` is already cached, so we do not need to recurse any further, we can just use that result.

## Sounds great, sign me up!

We can simply create a `memoize` function that takes another function and modifies it to memoize calls.

```javascript
function memoize(func) {
  var cache = {};
  return function() {
    var key = JSON.stringify(arguments);
    if(cache[key]) {
      return cache[key];
    }
    else {
      var val = func.apply(this, arguments);
      cache[key] = val;
      return val;
    }
  };
}
```

Now we can easily memoize any pure function, like our `factorial` function.

```javascript
var factorial = memoize(function(num) {
  console.log('working for factorial(' + num + ')');
  if(num === 1) { return 1 };
  return num * factorial(num - 1);
});

// first call
console.log(factorial(3));
//=> working for factorial(3)
//=> working for factorial(2)
//=> working for factorial(1)
//=> 6

// successive calls
console.log(factorial(3)); //=> 6
console.log(factorial(3)); //=> 6

// short circuit higher factorial calls
console.log(factorial(4));
//=> working for factorial(4)
//=> 24
```

[Play with this example in Babel](https://babeljs.io/repl/#?experimental=true&playground=true&evaluate=true&loose=false&spec=false&code=function%20memoize(func)%20%7B%0A%20%20var%20cache%20%3D%20%7B%7D%3B%0A%20%20return%20function()%20%7B%0A%20%20%20%20var%20key%20%3D%20JSON.stringify(arguments)%3B%0A%20%20%20%20if(cache%5Bkey%5D)%20%7B%0A%20%20%20%20%20%20return%20cache%5Bkey%5D%3B%0A%20%20%20%20%7D%0A%20%20%20%20else%20%7B%0A%20%20%20%20%20%20var%20val%20%3D%20func.apply(this%2C%20arguments)%3B%0A%20%20%20%20%20%20cache%5Bkey%5D%20%3D%20val%3B%0A%20%20%20%20%20%20return%20val%3B%0A%20%20%20%20%7D%0A%20%20%7D%3B%0A%7D%0Avar%20factorial%20%3D%20memoize(%0A%20%20function(num)%20%7B%0A%20%20%20%20console.log('working%20for%20factorial('%20%2B%20num%20%2B%20')')%3B%0A%20%20%20%20if(num%20%3D%3D%3D%201)%20%7B%20return%201%20%7D%3B%0A%20%20%20%20return%20num%20*%20factorial(num%20-%201)%3B%0A%20%20%7D%0A)%3B%0A%0Aconsole.log(factorial(3))%3B%0Aconsole.log(factorial(3))%3B%0Aconsole.log(factorial(4))%3B)

## Advanced usage

Right now we have memoization working by simply wrapping a given function with our `memoization` function. The results are cached for calls with the same arguments. This is great, but what if the arguments are not our only dependencies. What if we are memoizing a method on an object and that method relies on both the arguments AND other properties on the object? How do we account for other dependencies? If we do not do anything different, memoizing a function might actually cause it to produce incorrect values (if the other dependencies have changed). We need a way to invalidate the cache for these dependencies as well.

The good news is that we can easily take other dependencies into account. Earlier you might have been wondering why I am using `JSON.stringify` to create my cache keys, and soon you will see how this helps make it extremely easy to add any number of dependencies in addition to a functions arguments.

Let's say we have a `Person` model with a firstName and lastName as well as a method, `fullName`, that takes an optional argument, title and outputs the person's full name.

```javascript
function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;

  this.memoize = function(func) { ... };

  this.fullName = this.memoize(function(title) {
    return title + ' ' + this.firstName + ' ' + this.lastName;
  });
}
```

All we need to do to memoize this function on the `Person` object, is to update the `memoize` function to take a second argument, `depsFunc`. `depsFunc` will be a function that returns an array of the dependencies. We can then use `depsFunc` as well as `func` to calculate the unique key in our hash.

```javascript
function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;

  this.memoize = function(func, depsFunc) {
    var cache = {};
    return function() {
      var key = JSON.stringify([depsFunc(), arguments]);
      if(cache[key]) {
        return cache[key];
      }
      else {
        var val = func.apply(this, arguments);
        cache[key] = val;
        return val;
      }
    };
  }

  this.fullName = this.memoize(
    // calculation
    function(title) {
      console.log('working...');
      return title + ' ' + this.firstName + ' ' + this.lastName;
    },
    // dependencies
    function() {
      return [this.firstName, this.lastName];
    }.bind(this));
}

// create a new Person
var person = new Person('Jonathan', 'Lehman');

// first call to our memoized function does the work
console.log(person.fullName('Mr.'));
//=> working
//=> Mr. Jonathan Lehman

// successive calls
console.log(person.fullName('Mr.'));
//=> Mr. Jonathan Lehman

// work must be done if dependencies or arguments change

// change arguments
console.log(person.fullName('Mister'));
//=> work
//=> Mister Jonathan Lehman

// change deps
person1.firstName = 'Jon';
console.log(person.fullName('Mr.'));
//=> work
//=> Mr. Jon Lehman
```

[Play with this example in Babel](https://babeljs.io/repl/#?experimental=true&playground=true&evaluate=true&loose=false&spec=false&code=function%20Person(firstName%2C%20lastName)%20%7B%0A%20%20this.firstName%20%3D%20firstName%3B%0A%20%20this.lastName%20%3D%20lastName%3B%0A%20%20%0A%20%20this.memoize%20%3D%20function(func%2C%20depsFunc)%20%7B%0A%20%20%20%20var%20cache%20%3D%20%7B%7D%3B%0A%20%20%20%20return%20function()%20%7B%0A%20%20%20%20%20%20var%20key%20%3D%20JSON.stringify(%5BdepsFunc()%2C%20arguments%5D)%3B%0A%20%20%20%20%20%20if(cache%5Bkey%5D)%20%7B%0A%20%20%20%20%20%20%20%20return%20cache%5Bkey%5D%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20else%20%7B%0A%20%20%20%20%20%20%20%20var%20val%20%3D%20func.apply(this%2C%20arguments)%3B%0A%20%20%20%20%20%20%20%20cache%5Bkey%5D%20%3D%20val%3B%0A%20%20%20%20%20%20%20%20return%20val%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%3B%0A%20%20%7D%0A%20%20%0A%20%20this.fullName%20%3D%20this.memoize(%0A%20%20%20%20%2F%2F%20calculation%0A%20%20%20%20function(title)%20%7B%0A%20%20%20%20%20%20console.log('working...')%3B%0A%20%20%20%20%20%20return%20title%20%2B%20'%20'%20%2B%20this.firstName%20%2B%20'%20'%20%2B%20this.lastName%3B%0A%20%20%20%20%7D%2C%20%0A%20%20%20%20%2F%2F%20dependencies%0A%20%20%20%20function()%20%7B%20%0A%20%20%20%20%20%20return%20%5Bthis.firstName%2C%20this.lastName%5D%3B%20%0A%20%20%20%20%7D.bind(this))%3B%0A%7D%0A%0Avar%20person%20%3D%20new%20Person('Jonathan'%2C%20'Lehman')%3B%0Aconsole.log(person.fullName('Mr.'))%3B%0Aconsole.log(person.fullName('Mr.'))%3B%0Aconsole.log(person.fullName('Mister'))%3B%0Aperson.firstName%20%3D%20'Jon'%3B%0Aconsole.log(person.fullName('Mr.'))%3B)

## Careful, memoization is not a magic bullet

Keep in mind that memoization does not make sense for all function calls. There is a higher memory overhead since we must store our cached results so that we can later recall them as well as an added complexity of using memoization, so it really only makes sense for functions that are computationally expensive.

Also, memoization does not work well for functions that are not pure, that is functions that have side effects. Memoizing only allows us to cache a result, so any other side effects get lost on successive calls. That said, you can get around this constraint, by returning a function that includes your side effects that you will need to execute after getting the result.
