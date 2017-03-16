# animation-chain
Add attributes to your HTML to animate DOM elements.

## Usage
### Basic
Add `data-ani="fadeIn"` attribute to your target animated element, where `fadeIn` is CSS class that contains animation effect.
```html
<div id="dom1">
  <div data-ani="fadeIn">I will fade in page!</div>
</div>
```
Once your element is set, use `animate()` to start the animation.
```javascript
var aniDom1 = new AnimationChain($('#dom1'));
aniDom1.animate(); // start to animate
```

### Order of Animation
Add 'data-ani-order` attribute to your multiple elements to order their animation sequence.
```html
<div id="dom2">
  <div data-ani="fadeIn" data-ani-order="0">I will fade in page first!</div>
  <div data-ani="fadeIn" data-ani-order="1">My turn!</div>
</div>
```
The sequence number starts from 0. Again, once your element is set, use `animate()` to start the animation.
```javascript
var aniDom2 = new AnimationChain($('#dom2'));
aniDom2.animate(); // start to animate
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
