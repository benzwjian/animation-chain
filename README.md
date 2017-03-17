# animation-chain
Add attributes to your HTML to animate DOM elements.

## Prerequisites
### Add scripts
```html
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="animation-chain.js"></script>
```

## Usage
### Basic
Add `data-ani="fadeIn"` attribute to your target animated element, where `fadeIn` is CSS class that contains animation effect.
```html
<div id="dom">
  <div data-ani="fadeIn">I will fade in page!</div>
</div>
```
Once your element is set, use `animate()` to start the animation.
```javascript
var aniChain = new AnimationChain($('#dom'));
aniChain.animate(); // start to animate
```

### Order of Animation
Add 'data-ani-order` attribute to your multiple elements to order their animation sequence.
```html
<div id="dom">
  <div data-ani="fadeIn" data-ani-order="0">I will fade in page first!</div>
  <div data-ani="fadeIn" data-ani-order="1">My turn!</div>
</div>
```
The sequence number starts from 0. Again, once your element is set, use `animate()` to start the animation.
```javascript
var aniChain = new AnimationChain($('#dom'));
aniChain.animate(); // start to animate
```
If there are two elements have the same sequence number, they will be animated at the same time.

### Mobile Mode
In responsive page design, you can set animation for mobile device.
```html
<div>
  <div data-ani="fadeIn" data-ani-mobile="fadeUp">I will fade in page first!</div>
</div>
```
For this case, the element will animate with `fadeIn` on desktop browsers, otherwise `fadeUp` on mobile browsers.

### Use with Animate.css
[Animate.css](https://daneden.github.io/animate.css/) is a great animation library without writing css by youself.
```html
<div>
  <div class="animated" data-ani="fadeIn">I will fade in page first!</div>
</div>
```

## API
### .animate()
Start the animation. If `.animate()` is called again, the animation will restart.

### .atOnce()
Set the animation processes only one time.

### .setNodeOnBeforeStart(order: Integer, fn: Function)
Set function to be executed before animation of a element starts. For example, you have HTML as below:
```html
<div id="dom">
  <div data-ani="fadeIn" data-ani-order="0">I will fade in page first!</div>
  <div data-ani="fadeIn" data-ani-order="1">My turn!</div>
</div>
```
You want to log message before node1(i.e. data-ani-order="1") starts animation:
```javascript
var aniChain = new AnimationChain($('#dom'));
aniChain.setNodeOnBeforeStart(1, function() {
  console.log('before node1 animation');
});
```
For example of async function, the animation will continue until function resolved, or stop in rejected case.
```javascript
aniChain.setNodeOnBeforeStart(1, function(resolve, reject) {
  console.log('before node1 animation');
  setTimeout(function(){
    console.log('before node1 animation');
    resolve();
   }, 1000);
});
```

### .setNodeOnEnded(order: Integer, fn: Function)
Set function to be executed after animation of a element finished. It also supports to set async function.

### .setOnBeforeStart(fn: Function)
Set function to be executed before whole animation starts. It also supports to set async function.

### .setOnEnded(fn: Function)
Set function to be executed after whole animation finished. It also supports to set async function.
