//some global variables:
var _width = 1900,
	_height = 900,
	stepRes = 1000,
	threshold = 64,
	mousePositionX,
	mousePositionY;

var zoomSpeed = 0.0005;


var colors = Array();
for(var i=0;i<threshold;i++){
	colors.push(Math.round(Math.random()*0xFFFFFF));
}
//console.log(colors.toString());
console.log(0xFFFFFF);

//Custom pixi filter in order to compute the fractal on the gpu

PIXI.FractalFilter = function() {
    PIXI.AbstractFilter.call(this);

    this.passes = [ this ];

    this.uniforms = {
        resolution: {type: '2f', value: {x: _width, y: _height}},
        minSet: {type: '2f', value: {x: -2.5, y: -1}},
        maxSet: {type: '2f', value: {x: 1, y: 1}},
        threshold: {type: '1f', value: threshold},
        power: {type: '1f', value: 2},
        animator: {type: '1f', value: 0},
        stepRes: {type: '1f', value: stepRes},
        colors: {type: '1fv', value: colors}
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
		'uniform float colors[255];',
		//'int colors[255] = int[](103628,4951623,4944858,15872959,1616758,10362079,10408292,9391424,13420447,9367150,11966990,12156615,5922839,4737116,14142756,14416041,9432802,2672730,6129920,11671123,10694457,2699303,16745890,3439259,3061959,7438490,13752874,15131976,926138,5747932,15416274,5077728,15147849,16276210,9585253,2666276,8220452,4907926,6425649,8241892,3167733,2432969,8035960,15604287,9234176,16171857,8424767,948551,7429206,14779363,14121370,15337707,16430968,328887,8696376,11656621,16742236,8392891,11348035,8022868,761203,861366,8432187,13150578,9569100,13008630,15093566,13012256,1962570,4234407,7554315,7826677,16260666,15843024,1566275,7034556,11110341,14649766,11633147,13167965,5548978,5947867,14432639,5207410,6216727,25670,10293653,2320781,1594514,7722663,2925836,7164195,2823791,10848095,1432754,12194484,15056722,2441749,5083392,298744,14572425,7232090,4446316,5581951,11768568,2894493,10974100,7442549,5894599,11193437,4482663,7786769,4628242,15925841,674201,10762741,2708021,5925592,14740097,12151775,2874055,10923824,8733314,8140646,9325330,13133343,2554325,794827,31150,5068010,3291635,4179057,788923,11757948,13659487,9318717,12084676,33848,8614765,15568431,732529,6074701,4006232,6532859,7968069,1536639,6320118,13641149,11038111,6691227,14881989,2535080,7421383,6347288,5821322,16207691,16146868,10991522,6187558,12300536,14653842,1925315,1885432,16534887,8322900,9501542,1100379,10137576,5623853,15330925,11525950,13381108,3782711,5585938,1550708,7868712,4444349,2386069,2578482,119865,13364047,14777078,7767301,8990254,10903370,10260425,9254882,14857264,13119844,11103322,9141066,12547606,11473672,10540589,13639414,13443996,15748040,16427281,2931162,1209513,11675155,16082742,13452481,965632,11457461,13940573,10533403,2519335,9881332,16230323,4013215,16509681,4940805,149174,3330591,4381739,15762251,3976890,15265691,8479694,15376374,7203483,7804958,14322984,9918762,10116616,3278734,9665031,13119258,443521,12012312,4593342,5497182,10745599,13551465,7380418,9066819,15153462,1478076,8270716,3284537,14654532,13291878,8999440,10815637,4143076,6359361,3752641,12652267,14140465,8606871,10581003,3930623,485665);',

	    'void main(void) {',
			'vec2 ss = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y/resolution.y);',
			'vec2 scaledPosition = vec2((gl_FragCoord.x / resolution.x) * (maxSet.x - minSet.x) + minSet.x, (gl_FragCoord.y / resolution.y) * (maxSet.y - minSet.y) + minSet.y);',
			'vec2 newPosition = vec2(0.5+sin(.1+animator/stepRes*3.14*2.),0.5+sin(.1+(stepRes-animator)/stepRes*3.14*2.));',
			'int counter = 0;',
			'float r = 0.;',
			'float g = 0.;',
			'float b = 0.;',
			'for(int i=0; i < 10000; i++){',
				'if(newPosition.x * newPosition.x + newPosition.y * newPosition.y > 2.*2. || float(i) > threshold){',
					'counter = i;',
					'r = colors[i]/16777215.;',
					'g = colors[int(mod(float(i+1),255.))]/16777215.;',
					'b = colors[int(mod(float(i+2),255.))]/16777215.;',
					'break;',
				'}',
				'float xTemp = newPosition.x * newPosition.x - newPosition.y * newPosition.y + scaledPosition.x;',
				'newPosition.y = 2.*newPosition.x*newPosition.y+scaledPosition.y;',
				'newPosition.x = xTemp;',
			'}',
			'float color = float(counter);',
			'gl_FragColor = vec4(r, g, b, 1.0);',
	    '}'
	];
};

PIXI.FractalFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.FractalFilter.prototype.constructor = PIXI.FractalFilter;


var stage = new PIXI.Stage(0x000000);
var renderer = PIXI.autoDetectRenderer(_width, _height);



var fractal = new PIXI.Sprite;

fractal.position.x = 0;
fractal.position.y = 0;
fractal.width = _width;
fractal.height = _height;

var FractalFilter = new PIXI.FractalFilter();
fractal.filters = [FractalFilter];

stage.addChild(fractal);


var scrollZoom = 0;

var animationPlay = true;
var animationPosition = 0;
var animationCounter = 0;

var oldMousePosition, newMousePosition;
var stageDragging = false;

$(document).ready(function(){
	document.body.appendChild(renderer.view);

	requestAnimFrame(animate);
	function animate() {
		newMousePosition = stage.getMousePosition().clone();
		//do things with mouse position

		var xLength = FractalFilter.uniforms.maxSet.value.x - FractalFilter.uniforms.minSet.value.x;
		var yLength = FractalFilter.uniforms.maxSet.value.y - FractalFilter.uniforms.minSet.value.y;

		if(stageDragging){
			console.log( stage.getMousePosition());
			xMovement = (newMousePosition.x - oldMousePosition.x)/_width;
			yMovement = (newMousePosition.y - oldMousePosition.y)/_height;

			console.log(newMousePosition.x - oldMousePosition.x);

			FractalFilter.uniforms.minSet.value.x -= xLength * xMovement ;
			FractalFilter.uniforms.minSet.value.y += yLength * yMovement ;
			FractalFilter.uniforms.maxSet.value.x -= xLength * xMovement ;
			FractalFilter.uniforms.maxSet.value.y += yLength * yMovement ;
		}


		//animate by zooming in towards mouse cursor

		if(stage.getMousePosition().x > 0){ 
			mousePositionX = stage.getMousePosition().x/_width;
			mousePositionY = stage.getMousePosition().y/_height;
		}
		var setRatio = (xLength)/(yLength);
		if(stage.getMousePosition().x ){
			FractalFilter.uniforms.minSet.value.x += xLength * scrollZoom * (mousePositionX);
			FractalFilter.uniforms.minSet.value.y += yLength * scrollZoom * (1-mousePositionY);
			FractalFilter.uniforms.maxSet.value.x -= xLength * scrollZoom * (1-mousePositionX);
			FractalFilter.uniforms.maxSet.value.y -= yLength * scrollZoom * (mousePositionY);
		}

		//animate with starting positions of x and y
		if(!animationPlay){
			animationPosition = $('#animationPosition').val();
		} else {
			animationPosition = Math.sin(animationCounter*2*Math.PI)*1000;
			animationCounter += 0.0001;
			$('#animationPosition').val(animationPosition);
		}
		FractalFilter.uniforms.animator.value = animationPosition;
		requestAnimFrame(animate);
		renderer.render(stage);
		scrollZoom = scrollZoom * .8;
		oldMousePosition = newMousePosition;
	}
	//Panning
	stage.mousedown = function(){
		stageDragging = true;
	};

	function stopDrag(){
		stageDragging = false;
	}
	stage.mouseup = function stopDrag(){
		stageDragging = false;
	}
	stage.mouseout = function stopDrag(){
		stageDragging = false;
	}
	//Play/pause button
	$('#playtoggle').click(function(e){
		e.preventDefault();
		animationPlay = !animationPlay;
		if(animationPlay){
			animationCounter = Math.asin(animationPosition/1000)/2/Math.PI;
		}
		$(this).toggleClass('arrow-right').toggleClass('bars');
	});


});

function resizeHandler(e){
	_width = $(document).width();
	_height = $(document).height();
	FractalFilter.uniforms.resolution.value.x = _width;
	FractalFilter.uniforms.resolution.value.y = _height;
	fractal.width = _width;
	fractal.height = _height;
	renderer.resize(_width,_height);
}


$(window).on('resize', resizeHandler);

resizeHandler();

$(document).mousewheel(function(e){
	scrollZoom += e.deltaY * e.deltaFactor/10000;
});