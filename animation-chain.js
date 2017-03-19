var AnimationNode = function(dom$) {
    var self = this;
    this.el$ = dom$ || [] // array of dom$, or emtpy array if node doesn't need any animations
    this.isAnimating = false;
    this.isAnimated = false;
    this.animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    this.onBeforeStartFn = null;
    this.onEndedFn = null;
    this.successor = null;
    this.isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    this.onBeforeStartAnimationPromise = function(){
        return new Promise(function(resolve, reject) {
            self.isAnimating = true;
            if(self.onBeforeStartFn) {
                if(self.onBeforeStartFn.length) { // use for customized logic to resolve manually, especially async fun
                    self.onBeforeStartFn.apply(self, [resolve, reject]);
                }else{
                    self.onBeforeStartFn.apply(self);
                    resolve();
                }
            }else resolve();
        });
    }

    this.onAnimatePromise = function(){
        var numofAnimatedDom = 0;
        return new Promise(function(resolve, reject) {
            if(self.el$.length) {
                for(var i=0; i<self.el$.length; i++) {
                    var animation = self.isMobile && self.el$[i].attr('data-ani-mobile') ? 
                                    self.el$[i].attr('data-ani-mobile') : 
                                    self.el$[i].attr('data-ani');
                    self.el$[i].removeClass('invisible').addClass(animation).one(self.animationEnd, function(){
                        numofAnimatedDom++;
                        if(numofAnimatedDom == self.el$.length) {
                            resolve();
                        }
                    });
                }
            }else{
                resolve();
            }
        });
    }

    this.onEndedAnimationPromise = function(){
        return new Promise(function(resolve, reject) {
            if(self.onEndedFn) {
                if(self.onEndedFn.length) { // use for customized logic to resolve manually, especially async fun
                    self.onEndedFn.apply(self, [resolve, reject]);
                }else{
                    self.onEndedFn.apply(self);
                    resolve();
                }
            }else resolve();
        });
    }

    this.switchNextNodePromise = function(){
        return new Promise(function(resolve, reject) {
            self.isAnimating = false;
            self.isAnimated = true;
            self.next();
            resolve();
        });
    }
}

AnimationNode.prototype.next = function() {
    return this.successor && this.successor.animate.apply(this.successor, arguments);
}

AnimationNode.prototype.setNextSuccessor = function(successor) {
    return this.successor = successor;
}

AnimationNode.prototype.animate = function() {
    this.promiseChain = Promise.resolve()
                        .then(this.onBeforeStartAnimationPromise)
                        .then(this.onAnimatePromise)
                        .then(this.onEndedAnimationPromise)
                        .then(this.switchNextNodePromise)
                        ["catch"](function(reason) {
                            console.info('catch promise error');
                            return 'nextSuccessor';
                        });
}

AnimationNode.prototype.unanimate = function() {
    if(this.el$.length) {
        for(var i=0; i<this.el$.length; i++) {
            var animation = this.isMobile && this.el$[i].attr('data-ani-mobile') ? 
                            this.el$[i].attr('data-ani-mobile') : 
                            this.el$[i].attr('data-ani');
            this.el$[i].removeClass(animation).addClass('invisible');
        }
    }
    this.isAnimating = false;
    this.isAnimated = false;
}

var AnimationChain = function(target$) {
    this.el$ = target$;
    this.domNodes = [];
    this.animationNodes = [];
    this.onEndedFn = null;
    this.onBeforeStartFn = null;
    this.once = false;
    this.numofAnimated = 0;
    var self = this;
    self.el$.find('.animated').each(function(){
        /* push the same data-ani-order elements toghter */
        // $(this).addClass('invisible');
        var aniOrder = parseInt($(this).attr('data-ani-order'));
        if (!self.domNodes[aniOrder]) self.domNodes[aniOrder] = []; // array of array of animated dom$
        self.domNodes[aniOrder].push($(this));
    });

    // virtualize chain-start by prepending an empty node to chain
    this.headNode = new AnimationNode();
    this.animationNodes.push(this.headNode);

    for(var i=0; i<this.domNodes.length; i++) {
        this.animationNodes.push(new AnimationNode(this.domNodes[i]));
    }

    // virtualize chain-end by appending an empty node with chain
    this.tailNode = new AnimationNode();
    this.animationNodes.push(this.tailNode);


    for(var i=0; i<this.animationNodes.length; i++) {
        var j = i + 1;
        this.animationNodes[i].setNextSuccessor(this.animationNodes[j]);
    }

}

AnimationChain.prototype.animate = function(force) {
    if (this.once && this.numofAnimated >= 1) return;

    if (!this.isAnimating() && !this.isAnimated()) {
        if (force) {
            this.unanimate();
            var self = this;
            setTimeout(function(){self.animationNodes[0].animate();}, 300);
        } else {
            this.animationNodes[0].animate();
        }
        this.numofAnimated++;
    }
}

AnimationChain.prototype.unanimate = function() {
    if (this.once && this.numofAnimated >= 1) return;

    for(var i=0; i<this.animationNodes.length; i++) {
        this.animationNodes[i].unanimate();
    }
}
    
AnimationChain.prototype.isAnimating = function() {
    var numofNodeIsAnimating = 0;
    for(var i=0; i<this.animationNodes.length; i++) {
        if(this.animationNodes[i].isAnimating) numofNodeIsAnimating++;
    }
    return numofNodeIsAnimating > 0 ? true : false;
}

AnimationChain.prototype.isAnimated = function() {
    var numofNodeIsAnimated = 0;
    for(var i=0; i<this.animationNodes.length; i++) {
        if(this.animationNodes[i].isAnimated) numofNodeIsAnimated++;
    }
    return numofNodeIsAnimated == this.animationNodes.length ? true : false;
}

AnimationChain.prototype.atOnce = function() {
    this.once = true;
    return this;
}

AnimationChain.prototype.setOnEnded = function(fn) {
    this.tailNode.onEndedFn = fn; //this.tailNode is this.animationNodes[last]
    return this;
}

AnimationChain.prototype.setOnBeforeStart = function(fn) {
    this.headNode.onBeforeStartFn = fn; //this.headNode is this.animationNodes[0]
    return this;
}
    
AnimationChain.prototype.setNodeOnEnded = function(nodeIdx, fn) {
    this.animationNodes[nodeIdx+1].onEndedFn = fn;
    return this;
}
    
AnimationChain.prototype.setNodeOnBeforeStart = function(nodeIdx, fn) {
    this.animationNodes[nodeIdx+1].onBeforeStartFn = fn;
    return this;
}