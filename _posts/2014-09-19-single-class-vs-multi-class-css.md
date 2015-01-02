---
layout: post
title: "Single Class vs. Multi Class CSS"
tags:
  - sass
  - css
keywords:
  - single class
  - multi class
  - style
  - architecture
  - structure
  - composition
---

As I have mentioned previously in my post on [Modular CSS](/2014/08/25/modular-css-with-suitcss/), structuring Sass/CSS is hard. One of the best ways to determine how clean and well structured the resulting CSS within a project is, is to take a look at the markup being used in project. Overly nested elements typically mean overly nested CSS and if you find it difficult to discern the purpose of the classes on those elements, the CSS itself is probably not semantically written. To add insult to injury, the more classes we add to each element, the harder it becomes to read. What if there was a better way? What if we could just write a single class that provides all the styling we need for a given element?

<!--more-->

## Single Class CSS

Let's give the single class approach a try. To keep it simple we will style a button (for the purposes of this example we will use [SUIT CSS](/2014/08/25/modular-css-with-suitcss/) to give our CSS semantic meaning). We will assume that we might have different types of buttons, or modifications of the same button, so let's write a single class for each type of button we may want on our website.

First let's model the HTML we would like to generate, and then build the CSS around that model.

```html
<button class="Btn">Just a Button</button>
<button class="Btn--disabled">Disabled Button</button>
<button class="Btn-secondary">Secondary Button</button>
<button class="Btn-secondary--disabled">Secondary Disabled Button</button>
```

Wow, that keeps the DOM very clean, and by using SUIT, our classes are very semantic and easy to understand.

```css
.Btn {
  background-color: blue;
  border-radius: 5px;
  color: white;
  padding: 0.5rem;
}

.Btn--disabled {
  background-color: grey;
  border-radius: 5px;
  color: white;
  padding: 0.5rem;
}

.Btn-secondary {
  background-color: white;
  border-radius: 5px;
  color: blue;
  padding: 0.5rem;
}

.Btn-secondary--disabled {
  background-color: light-grey;
  border-radius: 5px;
  color: blue;
  padding: 0.5rem;
}
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/ad10c8d57ac2807bcfc8)

The CSS we have written is awfully repetitive. We can improve this by using a preprocessor like Sass.

```sass
%Btn-base {
  border-radius: 5px;
  padding: 0.5rem;
}

@mixin ColoredBtn($color, $background-color) {
  @extend %Btn-base;
  color: $color;
  background-color: $background-color;
}

.Btn {
  @include ColoredBtn(white, blue);
  // .Btn--disabled
  &--disabled {
    @include ColoredBtn(white, grey);
  }
  // .Btn-secondary
  &-secondary {
    @include ColoredBtn(blue, white);
  }
  // .Btn-secondary--disabled
  &-secondary--disabled {
    @include ColoredBtn(blue, light-grey);
  }
}
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/b36147e990969e8ce40d)

While the Sass ends up being a lot cleaner than the equivalent CSS, let's further evaluate this single class approach. So far it is quite appealing, but how does it hold up in a non-trivial example?

You may have already noticed one of the chinks in the single class armor, `.Btn-secondary--disabled`. At first you may be pleased, and even feel clever at how easily we were able to compose our styles with Sass into the easy to use package of a single class. The potential problem is what if we have more classes that can be composed? We will have to create a single class to represent each of these compositions. If we want to be add a modifier that controls the button's size, we will end up with permutations like `.Btn-secondary--small--disabled` and `.Btn-secondary--large--disabled`. Or maybe it is `.Btn-secondary--disabled--large`? We either will have to remember the order of all of our modifiers, or generate even more CSS by representing each ordering with the same CSS. The single class approach is starting to lose its appeal. The alternative approach is to compose our styles with multiple classes via the multi class approach.

## Multi Class CSS

Rather than using a single class to represent all the styles for each element, we can use multiple classes in concert to get the desired effect. We will continue to use the button example from above. Again, the first thing we will start with is our HTML, which we can use as a contract for the CSS we write.

```html
<button class="Btn">Just a Button</button>
<button class="Btn Btn--disabled">Disabled Button</button>
<button class="Btn Btn-secondary">Secondary Button</button>
<button class="Btn Btn-secondary Btn--disabled">Secondary Disabled Button</button>
```

Based on this HTML, the multi class Sass would be as follows.

```sass
.Btn {
  background-color: blue;
  border-radius: 5px;
  color: white;
  padding: 0.5rem;
  // .Btn-secondary
  &-secondary {
    background-color: white;
    color: blue;
  }
  // .Btn--disabled
  &--disabled {
    background-color: grey;
  }
}
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/5d97c03de86bd194a007)

The first thing you will notice about the multi class approach is that there is significantly less Sass required. This is because we do not need to generate the CSS for each combination of styles we might need. Instead we can just create the smallest pieces and compose them to get any combination of styles we desire.

Multi class CSS lends itself well to writing semantic, modular CSS. If the composability doesn't win you over just look at the difference in the generated CSS from our two Sass examples.

### Single Class Generated CSS

```css
.Btn, .Btn--disabled, .Btn-secondary, .Btn-secondary--disabled {
  border-radius: 5px;
  padding: 0.5rem;
}

.Btn {
  color: white;
  background-color: blue;
}
.Btn--disabled {
  color: white;
  background-color: grey;
}
.Btn-secondary {
  color: blue;
  background-color: white;
}
.Btn-secondary--disabled {
  color: blue;
  background-color: light-grey;
}
```

### Multi Class Generated CSS

```css
.Btn {
  background-color: blue;
  border-radius: 5px;
  color: white;
  padding: 0.5rem;
}
.Btn-secondary {
  background-color: white;
  color: blue;
}
.Btn--disabled {
  background-color: grey;
}
```

## Conclusion

Both the Sass and generated CSS are simpler and more concise in this trivial example. Imagine how many more single classes would need to be generated for a large web application, a class for each possible combination of style groupings. This would grow at an exponential rate, and become unmanageable rather quickly. Its multi class equivalent would generate the minimal pieces and enable the user to combine these classes in a number of ways in the DOM, a much more flexible approach. Single classes would also be very difficult to extend, which would be terrible in any application and even more so in a CSS framework.

Though a single class approach may be tempting at first glance, reconsider before you make the leap. A multi class approach will pay off in the long run and will help enable you to write simple, but powerful classes to accomplish any styling need you may have.

## Further Reading

I highly recommend this [article](http://nicolasgallagher.com/about-html-semantics-front-end-architecture/) on HTML semantics by Nicolas Gallagher, which takes a look at semantic CSS, including the multi class vs single class issue.
