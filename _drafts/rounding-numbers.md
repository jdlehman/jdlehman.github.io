---
layout: post
title: "Rounding Numbers in Different Bases"
tags:
  - js
  - snippet
keywords:
  - js
  - math
  - rounding
  - base
---

Like most languages, JavaScript makes rounding numbers easy with its built in `Math.round` function. The one caveat is that it assumes numbers are base-ten. What would rounding to the nearest whole number look like in base-two, or base-sixteen?

<!--more-->

```js
function roundValue(num, base) {
  var baseNum = parseInt(num, base);
  var remainder = baseNum % base;
  if (remainder >= base / 2) {
    return (baseNum + base - remainder).toString(base);
  } else {
    return (baseNum - remainder).toString(base);
  }
}
```
