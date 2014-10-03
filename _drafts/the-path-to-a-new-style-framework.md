---
layout: post
title: "The Path to a New Style Framework"
tags:
  - sass
  - css
---

This blog post is inspired by a few [talks](http://slides.com/jonathanlehman/an-adventure-in-style#/) I have given recently about the process to creating CustomInk's new style framework and the decisions involved in the process.

Now as a disclaimer to everything that will follow, the current framework has been doing its job and doing it well for the past 5 years. The inevitable truth is that the web has changed, technology has changed, and CustomInk has changed in those 5 years. The previous style framework was not designed with knowledge of these changes, nor could it be. However, the issue is not with the inevitable, it is the fact that the old framework was too heavy handed and not flexible enough to change and evolve in the ways we needed.

# The Problem

The existing homegrown style framework at CustomInk is dated. It is very opinionated and made too many assumptions without providing "escape hatches" to handle unforeseen situations or use cases that may arise.

The pain points had become substantial enough that it was clear that something had to be done.

  * over opinionated with no "escape hatches" -- made too many assumptions (cant guarantee assumptions hold in the future)
-- monolithic, cyclic layout references in rails, forces layouts on you (too oppinionated, hard to update/maintain)

# Choices, Choices, Choices
* Existing frameworks
  * Bootstrap, Foundation, etc
* Build something new
-- Building something new has maintenance and more work, but will fit perfectly. what happens when it goes bad?
-- Using existing frameworks is easy to get going, but might bring in a lot of source that is not needed, how easy is it to extend? what if it is no longer maintained?

# StyleBitz
* We decided to roll our own (StyleBitz)
* Use Bourbon, Susy, and Breakpoint-Sass as a basis -- rather than building everything from scratch we use predefined tools
* Goals
  * Provide the basic building blocks -- minimal, do not add things until there is pain, a reason. do not add things by speculation
  * Easily extendable -- no namespacing
  * Provide just tools, or tools + base styles -- does not generate any css by default, no cost of bringing in
  * Provide with Bower and Ruby Gems
-- normalize.css
-- Bourbon (rather than compass), provides a lot of functions, helps handle
-- susy grid framework (more like math library)
-- breakpoint to manage media queries simply
-- with susy and breakpoint we were able to create the notion of layouts with different grid settings

# Inspiration
* BASSCSS -- minimalism wins (image)
* Bootstrap, Foundation
* Susy -- for sass structure

# Decisions
* So many decisions
* how do we provide access to our assets -- package managers
* code organization
* naming semantics and style
* rems, ems, and px??

# Usability
* Bower
* Ruby Gem
* Rails Engine
-- how will we provide our assets?

# rems, ems, and px
* rems, ems, and px
-- rems, sass helpers to convert, px for absolutely sized content, ems for within components (so components can size on their own), em breakpoints

# Code Organization
* architecture -- folder structure
* semantic syntax/ coding style

# Semantic Syntax
* namespacing "sb-"
* BEM vs SUIT
* multi-class vs single-class -- keep css flat, more performant, easier to read/understand and extend

# Documentation
* living style guide
* code docs -- inline comments first then extractd to actual docs
-- conveying decisions to team

# Issues
* Compass -- compass versioning, stomps on SASS_PATH
* Architecture before defined styles established
* Premature optimization -- over meta-ization
* Discovered issues when building actual pages -- cannot create a good tool/framework in a lab. needs to be taken to the field from the beginning and developed based on need

# Down the Rabbit Hole
* Be careful...
* vertical rhythm
* modular scale
* responsive typography

# Links to talk slides

# Other resources
