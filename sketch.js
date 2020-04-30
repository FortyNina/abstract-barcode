//p5js-colorpoints

var videoFeed; //reference to video from webcam
var lerpPercent = 0; //keep track of lerping
var colorTravelSpeed = .05; //how quickly the color lerps
var prevFrame;
var movementThreshold = 4000;
var maxDotWidth = 15;
var invert = false;
var frameCounter = 0;

//**change to 16 in sketch.js
var pixScale = 8;

var screenWidth = 600;
var screenHeight = 450;

//SLIDER AND GUI OBJECTS-------------------------------------
var threshSlider;
var invertCheckBox;

//LOCATIONS AND SIZES
var barLocations = [];
var barSizes = [];
var superBoxColors = [];
var superBoxSize = [];
var topIndicies = [];





//-----------------------------------------------------------

function setup() {
  //**change to displayWidth and Height in sketch.js
  cv = createCanvas(screenWidth, screenHeight);
  
  //**uncomment in sketch.js file
  //cv.parent('container');

  pixelDensity(1);
  videoFeed = createCapture(VIDEO);
  console.log(videoFeed.width);
  console.log(videoFeed.height);
  
    let videoWidth = screenWidth ;
  let videoHeight = (screenWidth * videoFeed.height / videoFeed.width) ;
  console.log(videoWidth);
  console.log(videoHeight);

  
  
    //**change to displayWidth and Height in sketch.js
  videoFeed.size(screenWidth / pixScale, screenHeight / pixScale);



  videoFeed.hide();
  threshSlider = createSlider(0, 10000, 5000);
  threshSlider.position = (200, 500);
  createP("");
  invertCheckBox = createCheckbox('Invert',false);
createP("");

setNewBars();


}


function draw() {

  movementThreshold = threshSlider.value();
  invert = invertCheckBox.checked();
  
  var pixelBrightnesses = [];
  var pixelXes = [];
  var pixelYes = [];


   background(193,167,160);
  videoFeed.loadPixels();
  //Handle coloring pixels

  for (var y = 0; y < videoFeed.height; y++) {
    for (var x = 0; x < videoFeed.width; x++) {
      var index = (videoFeed.width - x + 1 + (y * videoFeed.width)) * 4;
      var r = videoFeed.pixels[index + 0];
      var g = videoFeed.pixels[index + 1];
      var b = videoFeed.pixels[index + 2];
      var brightMapped = (map(((r + g + b) / 3), 0, 255, 0, pixScale)) + .5;

      append(pixelBrightnesses, brightMapped);
      append(pixelYes, y);
      append(pixelXes, x);
      
      var widthBasedOnMovement = 1;


      //get new width based on pixel comparisons
      //widthBasedOnMovement = whatever
      if (prevFrame != null) {
        var moveDist = getColDist(r, prevFrame[index + 0], g, prevFrame[index + 1], b, prevFrame[index + 2]);

        if (invert) {
          if (moveDist > movementThreshold) {
            widthBasedOnMovement = 0;
          } else if (moveDist < movementThreshold) {
            widthBasedOnMovement = 1;
          }
        } else {
          if (moveDist < movementThreshold) {
            widthBasedOnMovement = 0;
          } else {
            widthBasedOnMovement = 1;
          }
        }
      }
      //
      var widthBrightnessModifier = 1;
      stroke(0);
      fill(0);
      if (brightMapped < 1) {
        widthBrightnessModifier = 1;
      } 
      else{
        widthBrightnessModifier = 10;
      
      }

      rectMode(CENTER);

      var finalWidth = widthBrightnessModifier * widthBasedOnMovement;
      if (finalWidth > maxDotWidth) {
        finalWidth = maxDotWidth;
      }

      if(finalWidth > 1){
        for(var k = 0; k < barLocations.length;k++)
          if(abs((x * pixScale) - barLocations[k]) < 3){
            rect(x * pixScale, y* pixScale, barSizes[k], 9);
          }

        }
      
        //fill(80,5,80);
     // ellipse(x * pixScale, y * pixScale, finalWidth, finalWidth);
    }
  }

  frameCounter  =frameCounter - 1;
  if(frameCounter < 0){
    frameCounter = 10;
    let sorted = sort(pixelBrightnesses);

    var topBrightness = [sorted[0],sorted[sorted.length * 2 / 5], sorted[sorted.length *  3/ 5],sorted[sorted.length * 4 / 5],sorted[sorted.length  / 5], sorted[0]];
      topIndicies = [0,0,0,0,0];

    for(var t = 0; t < pixelBrightnesses.length;t++){
      if(pixelBrightnesses[t] == topBrightness[0]){
        topIndicies[0] = [pixelXes[t], pixelYes[t]];
      }
      else if(pixelBrightnesses[t] == topBrightness[1]){
        topIndicies[1] = [pixelXes[t], pixelYes[t]];
      }
      else if(pixelBrightnesses[t] == topBrightness[2]){
        topIndicies[2] = [pixelXes[t], pixelYes[t]];
      }
      else if(pixelBrightnesses[t] == topBrightness[3]){
        topIndicies[3] = [pixelXes[t], pixelYes[t]];
      }
      else if(pixelBrightnesses[t] == topBrightness[4]){
        topIndicies[4] = [pixelXes[t], pixelYes[t]];
      }
    }
}

  for(var r = 0; r < superBoxColors.length;r++){
    fill(superBoxColors[r][0],superBoxColors[r][1],superBoxColors[r][2]);
    stroke(superBoxColors[r][0],superBoxColors[r][1],superBoxColors[r][2]);
    rect(topIndicies[r][0] * 8, topIndicies[r][1] * 8, superBoxSize[r][0],superBoxSize[r][1]);

  }


  prevFrame = videoFeed.pixels;

}

function getColDist(r1, g1, b1, r2, g2, b2) {
  var dist = (r2 - r1) * (r2 - r1) + (g2 - g1) * (g2 - g1) + (b2 - b1) * (b2 - b1);
  return dist;

}

function setNewBars(){
  for(var j = 0; j < barLocations.length;j++){
    barLocations = shorten(barLocations);
  }
  for(var i = 0; i < width; i += random(20,40)){
    append(barLocations, i);
    append(barSizes, random(1,20));
  }

  superBoxColors = [];
  superBoxSize = [];
  for(var k = 0; k <5; k ++){
    var col = [random(0,255),random(0,255), random(0,255)];
    append(superBoxColors, col);
    var size = [random(20, 40), random(height / 6, height / 2)];
    append(superBoxSize, size);
  }

}

function mousePressed(){
  setNewBars();
}


