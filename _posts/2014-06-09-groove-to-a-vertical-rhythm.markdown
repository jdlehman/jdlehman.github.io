---
layout: post
title:  "Groove to a Vertical Rhythm"
date:   2014-06-09
postClass: vertical-rhythm
tags: sass css typography
---

### Background

Grid frameworks are awesome. They solve a number of problems and enable developers to easily create virtually any layout they imagine. Paired with media queries, responsive layouts become more accessible and great experiences at all screen sizes are becoming more common.

Grids allow us to be lazy and not think about all the "complex math" they require. In actuality, grid frameworks are simple. Want to take up 6 columns on a 12 column grid? Set the width to 50%. Add some margins and clearfixes, and BOOM. You have yourself a [simple grid framework](https://github.com/mourner/dead-simple-grid).

The purpose of a grid is to arrange our content in a well organized and define way. As humans, we are better at understanding patterns and organized content, and are more likely to read and retain information from such. Translation: great page organization leads to a better user experience. However, just organizing information on a grid-like structure is not enough. If you put too much content on a page it quickly becomes cluttered and unreadable again. The mere structure of a grid is not enough. Like anything, it must also be used wisely. The emergence of simple designs shows the importance of not only the content, but the white space around it. Readability is end-goal of typographic work.

While grid frameworks are great at organizing content horizontally, they fail miserably at organizing content vertically, that is establishing the vertical rhythm of the page. Like I mentioned earlier, humans intrinsically love patterns, and a strong vertical rhythm furthers the horizontal pattern employed by the grid by creating a vertical pattern.

The simplest analogy to vertical rhythm is the lines on a sheet of loose-leaf paper. You may have noticed by now that this page has dotted lines just like a sheet of paper. Notice how the text fits nicely in each line. The line does not hug the text, but provides a small amount of space, making the text readable and not looked cramped. Notice how each dotted line is the same distance apart, creating our rhythm. I am going to refer to this distance as the base line-height, which is derived from the base font-size, the size of the text you are currently reading.

So it appears that the base font-size fits perfectly in our lines, but what happens when the text is much larger than the base line-height. How can it possibly fit? Scroll up and take a look at the headers. What do you notice? The base line-heights are all the same, but large text takes up a number of FULL lines. The full part is important. In order to preserve vertical rhythm, we must ensure that each element takes up an integer number of lines. If it does not, the vertical rhythm will be off at that point on the page.

It appears the key to vertical rhythm is that all elements must take up a height of `(n * base line-height)` where n is an integer value.

Now we understand what vertical rhythm is and why it is desirable when composing a site's design. But how do we achieve this lofty goal? One way would be to calculate line-heights and font-sizes manually for various elements in your CSS. That does not sound like a lot of fun to me. Let's avoid that tedious work and leverage some [Sass](http://sass-lang.com/) mixins to do the work for us. If you have not used Sass before, I highly recommend playing around with it in [Sassmeister](http://sassmeister.com/). I will link some Sassmeister examples for you to play with as we explore creating vertical rhythm with Sass.

Another thing to note before we continue, is that we will be using rems, root ems. This will allow us to keep our vertical rhythm even if we change the base font-size because everything will scale up.

### Implementation Details

First let's figure out what we need to solve conceptually. We want all of our elements to fit uniformly within our base line-height lines. There are two primary cases:

* when the font-size is *smaller* than the base line-height
* when the font-size is *larger* than the base line-height

Let's gradually build up a Sass solution to handle these cases. First we will need to set up the basis for our vertical rhythm, the base font-size and line-height. While we are at it, we will also set up some base styles.

```sass
$base-font-size:    16px;
$line-height-ratio: 1.5;
// base line-height = 16px * 1.5 = 24px

html {
  font-size:    $base-font-size;
  line-height:  $line-height-ratio;
  background:   url(http://basehold.it/i/24);
}

* {
  margin-top:     0;
  margin-bottom:  0;
  padding-top:    0;
  padding-bottom: 0;
}
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/f3a46154fff6c2e2f8f3)

We are simply setting our base-font size and line height at the DOM root, the html element. By setting our base font-size on this element, we can define any additional sizes in rems to make them relate to the base font-size. If we then use media queries to change the font-size on the html element, all other sizes defined in rems will scale proportionally. You might be wondering why we are setting the top and bottom margins and padding on all elements to 0. This is to prevent any browser (or normalize.css) defaults from throwing off our vertical rhythm. In a bit, we will see how we can take control of the top and bottom to gain more vertical rhythm superpowers. Lastly, you might have noticed we are setting a background image. [Basehold.it](http://basehold.it/) is one of the tools I have found most valuable in understanding and debugging my site's vertical rhythm. You can set it as a background as I have done, where the integer at the end of the URL specifies the base line-height, that is how a far apart you want the lines, in pixels. Basehold.it also allows you to import it as a stylesheet and even set the color of the lines.

As you can see, with this small amount of Sass, we have solved our first case. We now have vertical rhythm for all font-sizes that are less than or equal to our base line-height, which would be 24px with this base font size, `($base-font-size * $line-height-ratio)`. What happens if we try to add fonts with a size greater than this?

```sass
h2 {
  font-size: 2rem; // 32px with a base font-size of 16px
}
```

Wait a minute, that works! Did we just solve both of our cases without even making use of our Sass specific powers? We could have just done this in CSS! Slow your roll. It is true that this works, take a look at the Sassmeister example above to verify that the h2 now fits centered on 2 lines, which is exactly what we want. Why does this work?

Since we are setting the font-size to 2rem, it is indeed larger than the base font-size, but it is exactly 2 times larger. This relationship is important. This means it's line-height would be `32px * 1.5 = 48px`. What is so special about 48px? It is exactly 2 times our base line-height! This is why it works in that case. But what if the font-size is 2.4rem? Now we see that the vertical rhythm is thrown off. By using whole number rem values, we can guarantee that everything will always be a multiple of our base line-height, and therefore keep our vertical rhythm. Using whole number rem values is an easy convention to follow and you get vertical rhythm with practically no CSS necessary. Components could even be composed of parts that are not whole number rem values as long as the sum of their parts equals a whole rem value. [BASSCSS](http://www.basscss.com/) is a great example of this simple approach in practice. The simplicity of the project and the amount it is able to accomplish speaks for itself. If you think this is all you need for your use case, take these lessons and run with them, there is nothing wrong with taking the path of simplicity. In fact it will often lead to the least headaches down the road. However, this usecase is not for everyone.

What if you want to use a modular scale and cannot guarantee whole number rem values? What if we come back to the project 5 years later and forget this constraint? What if we are working on a large team and a new team member does not realize this rule? Regardless, we now have less control over our font-sizes and need to manually manage the minute details to ensure vertical rhythm. Let's take advantage of our Sass powers and build a mixin that will overcome these limitations and do the work for us.

First let's build what we already know. We will take in the desired font-size of our element and use it to determine the number of base line-heights our line-height must be set to in order for the element to take up a whole number of base lines.

```sass
$base-font-size:    16px;
$line-height-ratio: 1.5;
$line-height-base:  1rem * $line-height-ratio;

@mixin vertical-rhythm($font-size) {
  // determine how many lines this font-size will take up
  $multiplier: ceil($font-size / $line-height-base);

  font-size:    $font-size;
  line-height:  $line-height-base * $multiplier;
}

h2 {
  // example usage
  @include vertical-rhythm(2.4rem);
}
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/de630d458c15520247c1)

Now we see that we can use any font-size and it will still follow the vertical rhythm. I am sad to admit when we have come so far, that I over-simplified my cases from earlier. There is actually a third case. Not all DOM elements abide by the rules of line-height. Line-height only makes sense for elements I like to refer to as "text-based elements". Elements like paragraphs, spans, and headers are all ruled by line-height. The actual height of the element depends on the amount of text within the element as well as how wide the container is and how many times the text must wrap to a new line. Each new line still preserves the line-height and vertical rhythm. The other kind of elements, that I will refer to as "non-text-based elements", such as images, divs, and other containers are not governed by line-height in the same way that text-based elements are. Instead, they are governed by the defined height property. So you may wish to think of these two groups as line-height based elements and height-based elements. Though you can set the height on either of these, it is natural to set the line-height for a paragraph element, while setting the height of an image. The other way around and you end up with weird behavior. Likewise, we must abide by this natural order when establishing vertical rhythm.

Let's handle this additional case:

```sass
// add $use-height parameter
@mixin vertical-rhythm($font-size, $use-height: false) {
  // determine how many lines this font-size will take up
  $multiplier: ceil($font-size / $line-height-base);

  // use height for height-based element, otherwise use line-height
  @if $use-height {
    $leftover:      $sb-line-height-base * $multiplier - $font-size;
    height:         $font-size;
    // use leftover height to take up a whole number of base-lines
    // this leftover space is not needed for line-height based elements
    // because line-height takes up the entire whole number of base-lines itself
    margin-top:     $leftover / 2;
    margin-bottom:  $leftover / 2;
  }
  @else {
    font-size:    $font-size;
    line-height:  $line-height-base * $multiplier;
  }
}
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/1ed9ccf7a937494141ab)

With just an additional parameter, we can handle this extra case. Now height-based elements will not break the flow of vertical rhythm.

One thing I want to note is that you must be careful not to become too obsessed by implementing strict vertical rhythm. There are potential edge cases you might come across, and going down the rabbit hole of vertical rhythm is quite overwhelming (trust me). While vertical rhythm can greatly improve the look, feel, and readability of a layout, being off by a few pixels here and there will not be noticable to anyone, but you, and probably only if you are using debug lines.

Some common edge cases you may come across are borders and [margin collapsing](https://developer.mozilla.org/en-US/docs/Web/CSS/margin_collapsing). You can easily solve for borders by adding an additional parameter that accounts for the pixels being used in the height (this won't affect height-based elements using the border-box model). Collapsing margins can be fixed by adding 1px of vertical padding and accounting for that extra pixel in the vertical rhythm.

Here is the vertical rhythm mixin I currently use on this site. Notice that I have added the `$bottom-rows` and `$top-rows` parameters to allow the specification of additional base-line rows above and below the element. I use 1 row below by default to get the flow I want between elements.

```sass
@mixin vertical-rhythm($font-size, $bottom-rows: 1, $top-rows: 0, $use-height: false, $border: 0rem) {
  // I use a rem function that enables me to pass in the $font-size and $border
  // as rems or px, and the result of the function will give me rems
  $font-size: rem($font-size);
  $border: rem($border);
  $multiplier: ceil($font-size / $line-height-base);

  // check if height-based element
  // if so use height property for height, otherwise use line-height property
  @if $use-height {
    $leftover:      $line-height-base * $multiplier - $font-size;
    height:         $font-size;
    margin-top:     $line-height-base * $top-rows + $leftover / 2;
    margin-bottom:  $line-height-base * $bottom-rows + $leftover / 2;
  }
  @else { // text based element (uses line-height)
    font-size:      $font-size;
    line-height:    $line-height-base * $multiplier;
    margin-top:     $line-height-base * $top-rows;
    margin-bottom:  $line-height-base * $bottom-rows - $border;
  }
}
```

[Play with this example in Sassmeister](http://sassmeister.com/gist/9e4a757c63f467677bbe)

You may wonder why we are using rems for everything. Try resizing this window. Notice that the text scales (a benefit of specifying sizes in rems), but the vertical rhythm remains intact. This is the benefit of using rems! Now we can adjust our base-font size on the html element and everything will scale up/down while preserving the vertical rhythm.

I encourage you to take this mixin and use it to begin applying vertical rhythm to your sites.

Other great resources:

* [Vertical Rhythm in Typography](http://blog.8thlight.com/chris-peak/2012/12/30/vertical-rhythm.html)
* [4 Simple STeps to Vertical Rhythm](http://typecast.com/blog/4-simple-steps-to-vertical-rhythm)
