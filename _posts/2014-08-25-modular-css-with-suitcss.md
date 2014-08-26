---
layout: post
title: "Modular CSS with SUIT CSS"
tags:
  - css
  - sass
---

Structuring CSS is hard. I have worked on many projects where the CSS was just an afterthought, a hack to get the page to look a particular way. With the increasing interest in frontend tools and development, these days are behind us.

Ask yourself the question, "how and why do we apply structure to the code we write?" Now you might wonder, why don't we apply these same rules and considerations to the CSS (and Sass) that we write? There is no reason to skimp on our style architecture. One way we can bring clarity and structure is by writing modular CSS with the [SUIT CSS](http://suitcss.github.io/) convention.

## SUIT CSS Introduction

Let's dive right into it. The basic structure of SUIT is as follows:

```css
.namespace-ComponentName-descendantName--modifierName.is-stateName {}

.u-utilityName {}
```

It might look weird at first as it is different than the CSS you have written in the past, but bear with me, it's purpose will become clear. This is not necessarily what each of your class declarations will look like, but is meant to serve as a guide and reference to writing semantic SUIT CSS. Each declaration you make will probably contain parts of the structure above.

### Breaking it down
- **namespace**
  - The `namespace` is optional and allows you to write CSS that will not conflict with any other libraries. This is written in camel case.
- **ComponentName**
  - The `ComponentName` is your top level component such as `Form`. This is written in pascal case.
- **descendantName**
  - The `descendantName` is a part of your component that is applying styles on the components behalf. Your `Form` component might have a `group` descendant, `Form-group`. This is written in camel case and follows the base component with a `-`.
- **modifierName**
  - The `modifierName` is a presentation class that modifies the base class in some way. Ex: `Form--small`, `Form--large`, `Btn--primary`, etc. This is written in camel case and follows the base component with a `--`.
- **is-stateName**
  - The `is-stateName` represents the current state of the element (if any). Ex: `is-disabled`, `is-active`, etc. This is written in camel case and is unlike the previous examples as it is a separate class added to an element.
- **u-utilityName**
  - The `u-utilityName` is the odd one. The utility class does not apply to a single component, but is general enough in nature that it can add styling to just about any component. Ex: `u-inlineBlock`, `u-floatRight`, `u-clearfix`, etc. [BASSCSS](http://www.basscss.com/) has many good example utility classes (though not written in a strict SUIT CSS syntax).

## A Practical Example

Let's get some SUIT under our belts with an actual example. We will build out the "awesome box" component.

```sass
// sass
.my-AwesomeBox {
  background-color: blue;
  border: 1px solid black;
  margin: 1rem;
  width: 250px;
  // .my-AwesomeBox--small
  &--small {
    width: 100px;
  }
  // .my-AwesomeBox-title
  &-title {
    font-size: 1rem;
    color: white;
    // .my-AwesomeBox--large
    &--large {
      font-size: 2rem;
    }
  }
  // .my-AwesomeBox.is-selected
  &.is-selected {
    background-color: red;
  }
}

.my-u-center {
  text-align: center;
}
```

```css
/* generated css */
.my-AwesomeBox {
  background-color: blue;
  border: 1px solid black;
  margin: 1rem;
  width: 250px;
}
.my-AwesomeBox--small {
  width: 100px;
}
.my-AwesomeBox-title {
  font-size: 1rem;
  color: white;
}
.my-AwesomeBox-title--large {
  font-size: 2rem;
}
.my-AwesomeBox.is-selected {
  background-color: red;
}

.my-u-center {
  text-align: center;
}
```

[Play with this example on Sassmeister](http://sassmeister.com/gist/a166888f44271c291c80)

## Why?

While it might feel strange at first glance, give SUIT a shot (or at least another modular CSS variant like [BEM](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)). Writing CSS/Sass in this manner provides a number of great benefits:
- Consistency and structure
  - This is much better than a hodgepodge of arbitrary CSS randomly strung about with no semantic meaning
  - Anyone can enter the project and easily understand and contribute
- Separation of concerns
- Promotes reuse of code by creating the building blocks for the site with components
- [Semantic syntax](http://nicolasgallagher.com/about-html-semantics-front-end-architecture/)
- Composable and extendable CSS
  - Modularity makes it easy to extend components and compose components to get the sum of their parts
  - This is particularly useful for building style frameworks as it allows users of the framework to easily make it their own without fighting the framework
