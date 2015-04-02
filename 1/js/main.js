$(document).ready(function(){
	var resX = $(document).width();
	var resY = $(document).width();

	var stepRes = 1000;

	var totalWidth = $(document).width();
	var totalHeight = $(document).height();

	var pixelWidth =  totalWidth / resX;
	var pixelHeight =  totalHeight / resY;

	var minSetX = -2.5;
	var minSetY = -1;

	var maxSetX = 1;
	var maxSetY = 1;

	var threshold = 255;

	var power = 2;

    var canvas = document.getElementById('c');
    
    var iterationCount = 0;



	canvas.width = $(document).width();
	canvas.height = $(document).height();




	var ctx = canvas.getContext("2d");  //get  canvas 2D context

	ctx.fillStyle = "black";
	ctx.fillRect(0,0,canvas.width,canvas.height);



    function animate() {

	   	iterationCount++;
	   	iterationCount = iterationCount % stepRes;

	   	console.log(iterationCount);


		var pix = ctx.createImageData(canvas.width, canvas.height);


    	//for each integer in resolution
    	for(var x = 0; x < resX; x++){
	    	for(var y = 0; y < resY; y++){
	    		var scaledX = (x/resX) * (maxSetX - minSetX) + minSetX;
	    		var scaledY = (y/resY) * (maxSetY - minSetY) + minSetY;


	    		var counter = 0;

	    		var xNew = 0.5 + Math.sin(iterationCount/stepRes*Math.PI*2),
	    			yNew = 0.5 + Math.sin((stepRes-iterationCount)/stepRes*Math.PI*2);

	    		while(Math.pow(xNew,power) + Math.pow(yNew,power) < Math.pow(2,power) && counter < threshold){
	    			var xTemp = Math.pow(xNew,power) - Math.pow(yNew, power) + scaledX;
	    			yNew = 2*xNew*yNew + scaledY;
	    			xNew = xTemp;

	    			counter++;
	    		}

	    		counter = 256-counter;
	    		//console.log(rgbToHex(counter,counter,counter));

	    		/*
  				graphics.beginFill(0xFFFFFF, counter/256);
  				graphics.drawRect(x*pixelWidth, y*pixelHeight, pixelWidth, pixelHeight);
  				graphics.endFill();
				*/
				var inc = (y*resX + x)*4;

				pix.data[inc++] = counter;
				pix.data[inc++] = counter;
				pix.data[inc++] = counter;
				pix.data[inc++] = 255;

	    	}
    	}


		ctx.putImageData(pix, 0, 0);

        window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);
});