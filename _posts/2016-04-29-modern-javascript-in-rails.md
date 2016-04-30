---
layout: post
title: "Modern JavaScript in Rails"
tags:
  - javascript
  - rails
keywords:
  - rails
  - javascript
  - browserify-rails
  - es2015
  - es6
---

Over the past year, JavaScript has matured quite a bit with the [latest additions](https://github.com/lukehoban/es6features) to the spec in ES2015/ES6. With these improvements, JS tooling has also benefited and tools like [`babel`](https://babeljs.io/) allow developers begin writing ES2015, even before browsers fully support it. Meanwhile, Ruby on Rails, where [CoffeeScript](http://coffeescript.org/) is still the de facto frontend language, has been slow to acknowledge and utilize these improvements. Rather than waiting on Rails, how can we get access to these new JS features today?

<!--more-->

There are several strategies for adding modern JavaScript tooling to the Rails stack, with each technique somewhere on the spectrum of following the "Rails way" to completely removing sprockets and the asset pipeline from the process in favor of tools like [`webpack`](https://webpack.github.io/) from the JS community. While, I highly recommend `webpack` as a build tool, this article will focus on incorporating new JS tooling while still utilizing sprockets and the asset pipeline. This will be the path of least resistance and probably the easiest way to get ES2015 support into Rails, but I encourage you to play with these tools and find the solution that works BEST for your use case.

## Adding Support for ES2015/ES6

For those of you that like to speed ahead, I have tried to include most of the steps as bullets with the surrounding text providing details and context.

You can also check out the example repository on [Github](https://github.com/jdlehman/modern-js-rails-example) and step through my commits.

### Setup

First we will need the [`browserify-rails`](https://github.com/browserify-rails/browserify-rails) gem in conjunction with [`babel`](https://babeljs.io/). Other gems exist to add ES2015 support to the asset pipeline, but most do not support modules or require additional setup to get modules working. We will use `browserify` as it will give us module support and provides an easy means of adding plugins like `babel` to handle compiling our ES2015 JS.

- Add `gem 'browserify-rails'` to your `Gemfile` and run `bundle install` to install it.

`browserify-rails` hooks into the asset pipeline, but shells out to `browserify` to handle the actual transformation of our JS. This is how Rails' default CoffeeScript support also works. As you may have guessed, this means we also need `browserify`. We are going to use [NPM](https://www.npmjs.com/) to manage our JS dependencies. One advantage of this is that we will also be able to use our new JS module support from `browserify` to import node modules for use in our app. Say goodbye to vendored JS assets that are hard to maintain and update!

- Run `npm init`. This will create your `package.json` file that manages your JS dependencies. Think of it like the JS equivalent of your Ruby `Gemfile`.

Now that we have our file, lets install the dependencies we will need.

- Run `npm install --save browserify browserify-incremental babelify babel-preset-es2015`

This will install these dependencies to the `node_modules` folder. You should add this folder to your `.gitignore` so that you do not check in these dependencies to source control. You will have to run `npm install` (similar to `bundle install`) if you pull down this repo on another machine or update the `package.json` file.

`babelify` is a `browserify` plugin to transform our ES2015 code to browser compliant ES5, and `babel-preset-es2015` is a `babel` plugin. You can also add other `browserify` or `babel` plugins for even more functionality, but we will concentrate on getting our minimal setup working.

### Configuration

Let's create a `browserify` folder inside of `app/assets/javascripts`. This will be the folder where all of our ES2015 JS will live. Having this folder makes it easy to see what JS files support ES2015 and modules. This isolation also means that our setup won't affect any of our existing JS files, so there is nothing to port (at least right away). You can gradually port existing JS (or CoffeeScript) to ES2015 JS by converting and moving files to the `browserify` folder. Once everything is in the `browserify` folder, you will no longer need the `browserify` folder and can point `browserify` to compile the `javascripts` folder instead. Speaking of which, let's look at how we configure `browserify-rails`.

Inside of `config/application.rb`, let's add the following:

```ruby
# config/application.rb

# here you can configure the command run by browserify
# you can add other babel plugins by installing them and including them in the array with es2015
config.browserify_rails.commandline_options = '-t [ babelify --presets [ es2015 ] ]'
# this will turn on sourcemaps for development RAILS_ENV
config.browserify_rails.source_map_environments << 'development'
# this tells browserify what paths/files it needs to be concerned with
# we will just use node_modules and the browserify folder we just created
config.browserify_rails.paths = [
  lambda { |p| p.start_with?(Rails.root.join('node_modules').to_s) },
  lambda { |p| p.start_with?(Rails.root.join('app/assets/javascripts/browserify').to_s) },
]
```

That is all of the setup we will need to get ES2015 support. Now we can see how we can begin leveraging our new super powers.

### Usage

Thanks to our previous setup steps, we can now write ES2015 JS in our `browserify` folder (or whatever folders you have browserify watching).

```js
// app/assets/javascripts/browserify/dog.js

export default class Dog {
  bark() {
    return 'WOOF!';
  }
}
```

We can also make use of ES2015 modules. This let's us explicitly `import` and `export` our dependencies, meaning we will no longer have to rely on script order or magic globals that we assume (and hope) are already defined.

```js
// app/assets/javascripts/browserify/logger.js
import Dog from './dog';

const dog = new Dog();

console.log(dog.bark());
```

Additionally, we can require these files into our top level sprockets manifests (browswerify will already have compiled them).

```js
// app/assets/javascripts/application.js

//= require 'browserify/logger'
```

Based on the above code, pages that include `application.js` will print `WOOF!` to the console. Note that this is a trivial example and you can build much more complex functionality in ES2015.

An added benefit of this setup is that you can `import` modules that you have installed with `npm`. Say goodbye to vendoring JS assets!

## Linting

Having already set up a modern JS build system in our Rails app, we can begin to focus on other tools to help our productivity. We will use [`eslint`](http://eslint.org/) to lint our JavaScript. Linting is useful to help us find potential errors and to keep our code style consistent. I highly recommend getting a plugin for your editor that will visualize the `eslint` violations.

First we need to install the linting plugins we will need.

- `npm install --save eslint babel-eslint`

Next we need to set up our `eslint` configuration, which lives in `.eslintrc.js`. You can check out the [docs](http://eslint.org/docs/user-guide/configuring) to help you configure your rules. Check out the [airbnb style guide](https://github.com/airbnb/javascript) for a popular JS style guide.

```js
// .eslintrc.js
module.exports = {
  "ecmaFeatures": {
    "modules": true,
    "experimentalObjectRestSpread": true
  },

  "parser": "babel-eslint",

  "env": {
    "es6": true
  },

  "rules": {
    "accessor-pairs": 2,
    "arrow-spacing": [2, { "before": true, "after": true }],
    "block-spacing": [2, "always"],
    // ...
  }
}
```

We can also create a script in our `package.json` file so that it will lint for us when we call `npm run lint` in the console.

```json
// package.json
{
  // ...
  "scripts": {
    "lint: "$(npm bin)/eslint ./app/assets/javascripts/browserify"
  }
}
```

This linting setup will help ensure that typos and errors do not make their way to production. You might want to make sure there are no linting errors before committing code. It is easy to include this in a continuous integration setup and prevent deploys when linting or tests fail. Speaking of testing...

## Testing

We are almost done! Let's get some ES2015 JS testing in place and take advantage of being able to import and test specific modules. First, we will install [`mocha`](https://mochajs.org/) as our test runner and [`expect`](https://github.com/mjackson/expect) as our assertion library. I am using these libraries as an example, you can easily use others based on your preference.

- `npm install --save mocha expect babel-core`

We can create a `test/javascripts` folder to put our JS tests in. Before we actually set up our tests, let's make sure we are linting our tests by reconfiguring our `package.json`

```json
// package.json
{
  // ...
  "scripts": {
    "lint:src": "$(npm bin)/eslint ./app/assets/javascripts/browserify",
    "lint:test": "$(npm bin)/eslint ./test/javascripts",
    "lint": "npm run lint:src && npm run lint:test"
  }
}
```

Now `npm run lint` will lint our source and test JavaScript files. While we are still in our package file, let's set up our test script so we can use `npm test` to run our JavaScript tests.

```json
// package.json
{
  // ...
  "scripts": {
    // ...
    "test": "NODE_PATH=$NODE_PATH:$PWD/test/javascripts:$PWD/app/assets/javascripts/browserify $(npm bin)/mocha -R dot --compilers js:babel-core/register --recursive ./test/javascripts"
  }
}
```

You will notice the long bit modifying the `NODE_PATH`. This will allow us to import as if our `browserify` folder is our current folder. Essentially we are adding the `browserify` folder to the paths we use to resolve JS imports. This will make imports less verbose in our tests.

Let's begin leveraging these tools and write a simple test for our `Dog` class.

```js
import expect from 'expect';
import Dog from 'dog';

describe('Dog', () => {
  let dog;
  beforeEach(() => {
    dog = new Dog();
  });

  it('#bark should return WOOF!', () => {
    expect(animal.bark()).toEqual('WOOF!');
  });
});
```

If you try to run the tests now, you will get some errors. There is one last thing we need to set up, our Babel config in `.babelrc`.

```json
// .babelrc
{
  "presets": ["es2015"]
}
```

Now you are all set to start writing ES2015 JS in your Rails app! Let me know how it worked out for you.

## Heroku

When deploying to [Heroku](https://www.heroku.com/), make sure to include the nodejs build pack BEFORE your Ruby buildpack. All your node dependencies will need to be installed before the assets are precompiled. See the docs for more on [configuring buildpacks](https://devcenter.heroku.com/articles/buildpacks). You will also want to make sure you specify the version of node and npm you want to use on Heroku. You can do this with the `engines` config in your `package.json`.

```json
// package.json
{
  // ...
  "engines": {
    "node": "5.10.x",
    "npm": "3.8.x"
  }
}
```

## Using React

Adding [React](https://facebook.github.io/react/) to this configuration is also pretty simple. First, you need to install your new dependencies. Other than React and ReactDOM we will pull down the `babel` preset for React, which will compile the JSX for us, the `eslint` React plugin, which will gives us more [rules](https://github.com/yannickcr/eslint-plugin-react) we can use for our React components, and finally [`enzyme`](http://airbnb.io/enzyme/), a nice testing library for React from airbnb.

- `npm install --save react react-dom babel-preset-react enzyme eslint-plugin-react`

Next we need to set up our React `babel` plugin:

```json
// .babelrc
{
  "presets": ["es2015", "react"]
}
```

```ruby
# config/application.rb
config.browserify_rails.commandline_options = '-t [ babelify --presets [ es2015 react ] ]'
```

And now you are all set to create some React components!
