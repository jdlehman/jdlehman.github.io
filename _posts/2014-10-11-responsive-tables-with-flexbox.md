---
layout: post
title: "Responsive Tables with Flexbox"
postClass: ResponsiveTablePost
tags:
  - css
  - sass
  - html
keywords:
  - responsive
  - flexbox
  - code snippet
  - example
---

HTML tables can be frustrating to use. They require a lot of boilerplate and nested HTML to solve such a simple problem. Let's explore an alternative approach using divs and [Flexbox](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Flexible_boxes). This will give us the benefit of being able to create responsive tables that look great on all screen sizes.

<!--more-->

First off, the solution will be written with [Sass](http://sass-lang.com/) in a modular fashion using [SUIT CSS](/2014/08/25/modular-css-with-suitcss/). We will use a few Sass libraries to aid us in our task. [Bourbon](http://bourbon.io/) for help generating the necessary Flexbox CSS vendor prefixes, and [Breakpoint](http://breakpoint-sass.com/) to help with our media queries. If you prefer to work in CSS, feel free to copy the generated CSS from the links to the [Sassmeister](http://sassmeister.com/gist/b38aca96fc6024a28514) examples.

All we need is 3 basic classes to construct our `Table` component. First, we need the `Table` class, which will use Flexbox to make all its children (rows) flow by column. Next we need a `Table-row` class, which will use Flexbox to make all its children (row items/ columns) flow by row without wrapping. Finally, we need the `Table-row-item` class, which is essentially a cell in the table component. Now all we need is a `Table-header` class that we can add to any row element to give it the styling of a header. Given these criteria, we can write the HTML and Sass for our component as shown below.

<div class="Table">
  <div class="Table-row Table-header">
    <div class="Table-row-item">Header1</div>
    <div class="Table-row-item">Header2</div>
    <div class="Table-row-item">Header3</div>
    <div class="Table-row-item">Header4</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item" data-header="Header1">row1 col1</div>
    <div class="Table-row-item" data-header="Header2">row1 col2</div>
    <div class="Table-row-item" data-header="Header3">row1 col3</div>
    <div class="Table-row-item" data-header="Header4">row1 col4</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item" data-header="Header1">row2 col1</div>
    <div class="Table-row-item" data-header="Header2">row2 col2</div>
    <div class="Table-row-item" data-header="Header3">row2 col3</div>
    <div class="Table-row-item" data-header="Header4">row2 col4</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item" data-header="Header1">row3 col1</div>
    <div class="Table-row-item" data-header="Header2">row3 col2</div>
    <div class="Table-row-item" data-header="Header3">row3 col3</div>
    <div class="Table-row-item" data-header="Header4">row3 col4</div>
  </div>
</div>

```html
<div class="Table">
  <div class="Table-row Table-header">
    <div class="Table-row-item">Header1</div>
    <div class="Table-row-item">Header2</div>
    <div class="Table-row-item">Header3</div>
    <div class="Table-row-item">Header4</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item" data-header="Header1">row1 col1</div>
    <div class="Table-row-item" data-header="Header2">row1 col2</div>
    <div class="Table-row-item" data-header="Header3">row1 col3</div>
    <div class="Table-row-item" data-header="Header4">row1 col4</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item" data-header="Header1">row2 col1</div>
    <div class="Table-row-item" data-header="Header2">row2 col2</div>
    <div class="Table-row-item" data-header="Header3">row2 col3</div>
    <div class="Table-row-item" data-header="Header4">row2 col4</div>
  </div>
</div>
```

```sass
@import "bourbon/bourbon";
@import "breakpoint";

.Table {
  $dark-color: #f2f2f2;
  $light-color: #ffffff;
  $md: 500px;

  @include display(flex);
  @include flex-flow(column nowrap);
  @include justify-content(space-between);
  border: 1px solid $dark-color;
  font-size: 1rem;
  margin: 0.5rem;
  line-height: 1.5;

  // .Table-header
  &-header {
    display: none;
    @include breakpoint($md) {
      font-weight: 700;
      background-color: $dark-color;
    }
  }
  // .Table-row
  &-row {
    width: 100%;
    &:nth-of-type(even) { background-color: $dark-color; }
    &:nth-of-type(odd) { background-color: $light-color; }
    @include breakpoint($md) {
      @include display(flex);
      @include flex-flow(row nowrap);
      &:nth-of-type(even) { background-color: $light-color; }
      &:nth-of-type(odd) { background-color: $dark-color; }
    }
    // .Table-row-item
    &-item {
      @include display(flex);
      @include flex-flow(row nowrap);
      @include flex-grow(1);
      @include flex-basis(0);
      @include word-wrap;
      padding: 0.5em;
      word-break: break-word;
      &:before {
        content: attr(data-header);
        width: 30%;
        font-weight: 700;
      }
      @include breakpoint($md) {
        border: 1px solid #fff;
        padding: 0.5em;
        &:before { content: none; }
      }
    }
  }
}
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/b38aca96fc6024a28514)

Given this implementation, we can easily create responsive tables. Each row simply splits the number of items into it, into equal columns. This gives us the flexibility to create tables with rows that have disparate numbers of columns. However, this same benefit also has a shortcoming.

The problem with our table component is that every column is the same width. What happens if we have columns that contain data that we want to be wider or smaller in relation to the other columns? Luckily, Flexbox also makes this concern easy to implement. We can simply add some utility classes to set the Flexbox grow rate for different columns.

<div class="Table">
  <div class="Table-row Table-header">
    <div class="Table-row-item u-Flex-grow2">Long Header1</div>
    <div class="Table-row-item">Header2</div>
    <div class="Table-row-item">Header3</div>
    <div class="Table-row-item">Header4</div>
    <div class="Table-row-item u-Flex-grow3">Longer Header5</div>
    <div class="Table-row-item">Header6</div>
    <div class="Table-row-item">Header7</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item u-Flex-grow2" data-header="Header1">row1 col1</div>
    <div class="Table-row-item" data-header="Header2">row1 col2</div>
    <div class="Table-row-item" data-header="Header3">row1 col3</div>
    <div class="Table-row-item" data-header="Header4">row1 col4</div>
    <div class="Table-row-item u-Flex-grow3" data-header="Header5">row1 col5</div>
    <div class="Table-row-item" data-header="Header6">row1 col6</div>
    <div class="Table-row-item" data-header="Header7">row1 col7</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item u-Flex-grow2" data-header="Header1">row2 col1</div>
    <div class="Table-row-item" data-header="Header2">row2 col2</div>
    <div class="Table-row-item" data-header="Header3">row2 col3</div>
    <div class="Table-row-item" data-header="Header4">row2 col4</div>
    <div class="Table-row-item u-Flex-grow3" data-header="Header5">row2 col5</div>
    <div class="Table-row-item" data-header="Header6">row2 col6</div>
    <div class="Table-row-item" data-header="Header7">row2 col7</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item u-Flex-grow2" data-header="Header1">row3 col1</div>
    <div class="Table-row-item" data-header="Header2">row3 col2</div>
    <div class="Table-row-item" data-header="Header3">row3 col3</div>
    <div class="Table-row-item" data-header="Header4">row3 col4</div>
    <div class="Table-row-item u-Flex-grow3" data-header="Header5">row3 col5</div>
    <div class="Table-row-item" data-header="Header6">row3 col6</div>
    <div class="Table-row-item" data-header="Header7">row3 col7</div>
  </div>
</div>

```sass
// generate Flexbox grow-rate utility classes
@for $i from 1 through 10 {
  .u-Flex-grow#{$i} {
    @include flex-grow($i);
  }
}
```

```html
<div class="Table">
  <div class="Table-row Table-header">
    <div class="Table-row-item u-Flex-grow2">Long Header1</div>
    <div class="Table-row-item">Header2</div>
    <div class="Table-row-item">Header3</div>
    <div class="Table-row-item">Header4</div>
    <div class="Table-row-item u-Flex-grow3">Longer Header5</div>
    <div class="Table-row-item">Header6</div>
    <div class="Table-row-item">Header7</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item u-Flex-grow2" data-header="Header1">row1 col1</div>
    <div class="Table-row-item" data-header="Header2">row1 col2</div>
    <div class="Table-row-item" data-header="Header3">row1 col3</div>
    <div class="Table-row-item" data-header="Header4">row1 col4</div>
    <div class="Table-row-item u-Flex-grow3" data-header="Header5">row1 col5</div>
    <div class="Table-row-item" data-header="Header6">row1 col6</div>
    <div class="Table-row-item" data-header="Header7">row1 col7</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item u-Flex-grow2" data-header="Header1">row2 col1</div>
    <div class="Table-row-item" data-header="Header2">row2 col2</div>
    <div class="Table-row-item" data-header="Header3">row2 col3</div>
    <div class="Table-row-item" data-header="Header4">row2 col4</div>
    <div class="Table-row-item u-Flex-grow3" data-header="Header5">row2 col5</div>
    <div class="Table-row-item" data-header="Header6">row2 col6</div>
    <div class="Table-row-item" data-header="Header7">row2 col7</div>
  </div>
  <div class="Table-row">
    <div class="Table-row-item u-Flex-grow2" data-header="Header1">row3 col1</div>
    <div class="Table-row-item" data-header="Header2">row3 col2</div>
    <div class="Table-row-item" data-header="Header3">row3 col3</div>
    <div class="Table-row-item" data-header="Header4">row3 col4</div>
    <div class="Table-row-item u-Flex-grow3" data-header="Header5">row3 col5</div>
    <div class="Table-row-item" data-header="Header6">row3 col6</div>
    <div class="Table-row-item" data-header="Header7">row3 col7</div>
  </div>
</div>
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/de4eab2113204729ea50)
