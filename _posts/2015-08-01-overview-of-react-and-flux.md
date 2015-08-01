---
layout: post
title: "Overview of React and Flux"
tags:
  - javascript
  - react
  - flux
keywords:
  - javascript
  - react
  - flux
  - js
  - overview
---

This will be the first in a series of posts covering React and Flux. The goal of this particular one is to provide a high level overview before we dig into the specifics, so don't worry if you feel a bit lost as I will likely gloss over many details. There are some resources at the bottom of this post geared towards those getting started and like I mentioned future posts are on the way.

<!--more-->

## React

[React](https://facebook.github.io/react/) is a library by Facebook that describes itself as a "JavaScript library for building user interfaces". Essentially React is the view layer of your application. While the [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) spec is still just a draft, libraries like React allow you to begin building your web applications with similar composable pieces. Though it is not trying to replicate the web component specifications as much as [Polymer](https://www.polymer-project.org/1.0/), React provides lifecycle hooks like `componentDidMount` as well as the ability to nest React components, attach handlers, and manage state. One of the most compelling things about React is its implementation of a "virtual DOM", an abstraction over the DOM. The key function (and only one that is required to be defined in every React element) is the `render` function. This function specifies the virtual DOM representation that React will render for you.

The primary benefit of the virtual DOM abstraction is that React optimizes performance under the hood by only re-rendering nodes in the tree that have actually changed rather than re-rendering the entire component or tree of components. This means you can worry less about optimizing for performance and just focus on what is being rendered. The best way to understand what will be rendered is to just pretend that each change causes the entire React component tree to be re-rendered, that is treat each render like it is the first. This is conceptually what happens, but without all of the work of actually rendering everything since React is smart enough to only render the changes.

Another benefit to this abstraction is that since the `render` function returns a representation of the virtual DOM rather than the actual DOM, React can render to other targets than just the DOM. [React Native](https://facebook.github.io/react-native/) renders to native iOS components, and there are other implementations in the works to render to things Android, [canvas](https://github.com/Flipboard/react-canvas), and [WebGL](https://github.com/Izzimach/react-three).

The last high level concept to cover is how React manages state. You can pass in properties to any React component (called `props` and accessible via `this.props`), which are immutable data that can be rendered or used by the component to determine what to render. React components also have `state`, accessible via `this.state`, which is meant to be used for the internal mutable state of the component. It is a bit difficult at first to understand when to use `props` versus `state`, but essentially any state that might change during the component's lifetime would use the mutable `state`. These would be data like whether the component is selected, the quantity on a quantity selector, data in form fields, etc. The `props` contain state that does not change (that is, immutable data) during the life of the component instance. This might include data like the type of a component and other configuration data that you might use to initialize a component. Another unique difference between `state` and `props` is that `state` is private and is set up by the component itself when it is initialized, while `props` are passed into a component from a parent component higher up in the tree.

## Where React falls short

The pain point that comes up once you start building something larger and more complex with React is how components communicate. The only way that this can happen with vanilla React is to pass down callback functions as `props` for the children to call, but this gets complicated very quickly and does not seem ideal if you want to speak to an ancestor several levels up because you have to pass it through all the intermediary components. Since React is just a library that focuses on the view layer, it can be used within another MVC framework or another architecture pattern entirely. In our case we will investigate Facebook's solution to this and other problems that are not solved by React alone: Flux.

## Flux

The [Flux](https://facebook.github.io/flux/) pattern is an unidirectional data flow architecture. Before we get into what the unidirectional data flow means, let's look at the pieces the pattern specifies. First off, I refer to this as a "pattern" rather than a "library" because Facebook has released in detail how they apply this pattern in conjunction with React, but they have only provided the code for a single piece of the puzzle: the [dispatcher](https://github.com/facebook/flux/blob/master/src/Dispatcher.js). It is important to note that this pattern can be used without React, though I will focus on its usage with React.

<img src="https://facebook.github.io/flux/img/flux-simple-f8-diagram-1300w.png" class="jl-Image">

First let's start with actions. Actions are just POJOs that have two parts: an action type and data. The action type is a constant string, and the data are any information that might be needed about the action that just occurred in order to change state. Actions are typically fired to trigger a change, typically by something like a click handler in a React component.

All actions must go through the singleton dispatcher, which is the central hub that all data must pass through before state can be changed. This is what ensures the unidirectional data flow; all data must flow in a single direction, the direction the diagram above indicates. Views cannot be updated directly by an action, but instead must go through the dispatcher and make changes in the stores that are later reflected by the views. This means that an action that changes data in the application will not have the problem of cascading changes and potential race conditions. Instead everything must run through a dispatcher singleton that queues up actions and dispatches them one at a time. This is the core purpose of the dispatcher: to queue up actions one at a time and send each action to the stores that are subscribed to it.

Stores are where application state resides. This should be state that needs to be shared and communicated among components. All other state should be stored in each component's internal `state`. Stores like actions are also just POJOs that hold data. They subscribe to actions using the action type constants mentioned earlier. This means multiple stores can subscribe to the same action. The action handlers receive the data contained in the action and can use it to update their state. At this point stores can emit a change event that the views (React components) which use its data are subscribed to. Best practice is to pass store data into components that require it as `props`. This will tell the React components to re-render, which React will handle.

An analogy to help make it easier to understand the relationship between all the parts of Flux is that of delivering mail. Actions are like the actual letters, containing the data. The store is like a mailbox holding a collection of mail (data). The dispatcher is like the mailman and delivers the mail to the mailboxes. The views (React components) are like the customers that can check the mailboxes for data they are interested in.

There are many benefits to Flux and its unidirectional data flow. First of all, it is easy to record and replay the state of an application since all actions must pass through the dispatcher one at a time. This facet also makes debugging exceptionally pleasant as the dispatcher can be listened to and, logging the action type and data that are being passed through make finding where bugs are occurring much easier. This usually helps triangulate where the actual bug is located. Lastly, since every action follows the same flow, it is very easy to get up to speed on a Flux application. Once you can follow one flow through the application you can follow any of them.

## Further Reading

* React
  * [Removing User Interface Complexity, or Why React is Awesome](http://jlongster.com/Removing-User-Interface-Complexity,-or-Why-React-is-Awesome)
  * [Comprehensive Guide to Building Apps with React](http://tylermcginnis.com/reactjs-tutorial-a-comprehensive-guide-to-building-apps-with-react/)
  * [Egghead.io React Tutorial Videos](https://egghead.io/series/react-fundamentals)
  * [React Cheatsheet](http://ricostacruz.com/cheatsheets/react.html)
* Flux
  * [What the Flux?](http://jonathancreamer.com/what-the-flux/)
  * [Flux for Stupid People](http://blog.andrewray.me/flux-for-stupid-people/)
  * [Egghead.io Flux Tutorial Videos](https://egghead.io/series/react-flux-architecture)
* Further Reading
  * [Smart and Dumb Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
  * [Container Components](https://medium.com/@learnreact/container-components-c0e67432e005)
