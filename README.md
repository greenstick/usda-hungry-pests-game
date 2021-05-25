# [USDA Hungry Pests Game](https://greenstick.github.io/usda-hungry-pests-game/)

![Screen Shot of Game](https://github.com/greenstick/usda-hungry-pests-game/blob/master/img/demo/screen-shot.png)

## Overview

I developed this project while working at [Column Five Media](https://www.columnfivemedia.com) in 2014. The final client for the project was the United States Department of Agriculture and aimed to serve as a tool to educate middle schoolers on invasive pest species, so-called 'Hungry Pests.' This was perhaps one of my favorite projects I took on at Column Five; our team was given a lot of creative freedom, and I was given the duty of scoping our development, determining technical requirements & feasibility, and developing it. Ultimately, the project came in just under budget and was later deployed on the [USDA's Hungry Pests microsite](http://hungrypests.com/resources/interactive.php). 

## How it Works

Under the hood, the project is fairy simple. It takes a state based approach to manage the interactivity and transitions between the scenes and subscenes. States and their associated data are encapsulated in a [JSON object](https://github.com/greenstick/usda-hungry-pests-game/blob/master/js/data/interactive.json). It uses [Knockout.js](https://github.com/knockout/knockout) to manage a large portion of the interactivity via an MVVM pattern, with the item collector being perhaps the best example of this. [Modernizr](https://github.com/Modernizr/Modernizr) is used for browser detection and mobile interactivity. To expedite development, I used [D3.js](https://github.com/d3) for SVG manipulations, though I certainly took a liberty there. Finally, perhaps one of the more interesting challenges was replicating the dark green multiply filter that one our talented designer had created for the mockups. Funny thing: this is not at all easy to do in the browser (or at least wasn't circa 2014) because it's not natively supported across modern browsers. The solution: create a simple image of it and overlay it. Hax.

## Wanna Play Around With It?
Checkout the [Github hosted site](https://greenstick.github.io/usda-hungry-pests-game/)...and watch out for [Vin Vasive](https://www.hostedfiles.org/usda/hungry-pests/facebook/8879/vin-vasive-summer-road-trip.jpg)!
