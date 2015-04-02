//some global variables:
var _width = 1900,
	_height = 900,
	stepRes = 1000;

//Custom pixi filter in order to compute the fractal on the gpu

PIXI.BorderFilter = function() {
    PIXI.AbstractFilter.call(this);

    this.passes = [ this ];

    this.uniforms = {
        resolution: {type: '2f', value: {x: _width, y: _height}},
        minSet: {type: '2f', value: {x: -2.5, y: -1}},
        maxSet: {type: '2f', value: {x: 1, y: 1}},
        threshold: {type: '1f', value: 255},
        power: {type: '1f', value: 2},
        animator: {type: '1f', value: 0},
        stepRes: {type: '1f', value: stepRes}
    }

    this.fragmentSrc = [
	    'precision highp float;',
		'uniform vec2 resolution;',
		'uniform vec2 minSet;',
		'uniform vec2 maxSet;',
		'uniform float threshold;',
		'uniform float power;',
		'uniform float animator;',
		'uniform float stepRes;',

	    'void main(void) {',
			'vec2 ss = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y/resolution.y);',
			'vec2 scaledPosition = vec2((gl_FragCoord.x / resolution.x) * (maxSet.x - minSet.x) + minSet.x, (gl_FragCoord.y / resolution.y) * (maxSet.y - minSet.y) + minSet.y);',
			'vec2 newPosition = vec2(0.5+sin(animator/stepRes*3.14*2.),0.5+sin((stepRes-animator)/stepRes*3.14*2.));',
			'int counter = 0;',
			'for(int i=0; i < 10000; i++){',
				'if(newPosition.x * newPosition.x + newPosition.y * newPosition.y > 2.*2. || float(i) > threshold){',
					'break;',
				'}',
				'float xTemp = newPosition.x * newPosition.x - newPosition.y * newPosition.y + scaledPosition.x;',
				'newPosition.y = 2.*newPosition.x*newPosition.y+scaledPosition.y;',
				'newPosition.x = xTemp;',
				'counter = i;',
			'}',
			'float color = float(counter);',
			'gl_FragColor = vec4(color/threshold, color/threshold, color/threshold, 1.0);',
	    '}'
	];
};

PIXI.BorderFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.BorderFilter.prototype.constructor = PIXI.BorderFilter;

$(document).ready(function(){
	var stage = new PIXI.Stage(0x000000);
	var renderer = PIXI.autoDetectRenderer(_width, _height);
	document.body.appendChild(renderer.view);

	var fractal = new PIXI.Sprite;

	fractal.position.x = 0;
	fractal.position.y = 0;
	fractal.width = _width;
	fractal.height = _height;

	var borderFilter = new PIXI.BorderFilter();
	fractal.filters = [borderFilter];

	stage.addChild(fractal);

	requestAnimFrame(animate);
	function animate() {
		borderFilter.uniforms.animator.value = (borderFilter.uniforms.animator.value + 1) % stepRes;
		requestAnimFrame(animate);
		renderer.render(stage);
	}
});