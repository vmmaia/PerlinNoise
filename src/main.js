import Canvas from './classes/Canvas.js';
import Perlin2D from './classes/Perlin2D.js';
import Perlin1D from './classes/Perlin1D.js';

let DEBUG = false;
const REFRESH_RATE = 60;

const canvas = new Canvas;

const IMG_WIDTH = canvas.width / 2;
const IMG_HEIGHT = canvas.height / 3;
let P_VECTORS = 256;
let FREQUENCY = 18;

let P_GEN_TIME = 0;
let FPS = 0;
let lastLoop = new Date();

let perlin1D = new Perlin1D(P_VECTORS);
let perlin2D = new Perlin2D(P_VECTORS);

let xScrollPos1D = 0;
let xScrollPos2D = 0;

let image1 =  canvas.canvasContext.createImageData(IMG_WIDTH, IMG_HEIGHT);
let image2 =  canvas.canvasContext.createImageData(IMG_WIDTH, IMG_HEIGHT);

let buffer1 = [];
let buffer2 = [];

/**
 * Draws debug info on canvas
 */
const drawDebug = () => {
    const info = [
        "-- DEBUG ------------------",
        `IMG_W: ${IMG_WIDTH}`,
        `IMG_H: ${IMG_HEIGHT}`,
        `FREQ: ${FREQUENCY}`,
        `P_VECTORS: ${P_VECTORS}`,
        `P_GEN_TIME (1x${IMG_HEIGHT}): ${P_GEN_TIME}ms`,
        `FPS: ${FPS}`,
    ]

    // Info
    for(let i=0, pos=15; i<info.length; i++, pos+=15){
        canvas.write(info[i], 10, pos, '#00ffff');
    }
}

/**
 * Keyboard event listener
 */
const addListeners = () => {
    window.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "z":
                FREQUENCY > 1 ? FREQUENCY-- : null;
                break;
            case "x":
                FREQUENCY++;
                break;
            case "c":
                P_VECTORS > 2 ? P_VECTORS-- : null;
                perlin1D = new Perlin1D(P_VECTORS);
                perlin2D = new Perlin2D(P_VECTORS);
                break;
            case "v":
                P_VECTORS++;
                perlin1D = new Perlin1D(P_VECTORS);
                perlin2D = new Perlin2D(P_VECTORS);
                break;
            case " ":
                DEBUG = !DEBUG;
                break;
        }
    }, false);
}

/**
 * Shift image buffer to left by a given amount and paints the old pixels white
 * 
 * @param {*} buffer Buffer to offset
 * @param {*} xOffset Horizontal offset
 */
const shiftBufferByOffset = (buffer, xOffset) => {
    if(xOffset > IMG_WIDTH) return;

    for(let y=0; y<IMG_HEIGHT; y++){
        for(let x=0; x<IMG_WIDTH; x++){
            if(x >= IMG_WIDTH - xOffset){
                buffer[y][x] = 255;
                continue;
            }

            buffer[y][x] = buffer[y][x + xOffset];
        }
    }

}

/**
 * Inserts an image inside the buffer from right to left
 * 
 * @param {*} buffer Buffer to paste image into
 * @param {*} image Pixel data to paste
 * @param {*} width Image width
 * @param {*} height Image height
 */
const pasteImageInBuffer = (buffer, image, width, height) => {
    let xIndex = 0;
    let yIndex = 0;

    for(let y = IMG_HEIGHT - height; y<IMG_HEIGHT; y++){
        for(let x = IMG_WIDTH - width; x<IMG_WIDTH; x++){

            buffer[y][x] = image[yIndex][xIndex];

            xIndex = (xIndex + 1) % width;
        }

        yIndex = (yIndex + 1) % height;
    }
} 

/**
 * Continuously generates 2D perlin noise values for an image of arbitrary size
 * 
 * @param {*} width Image width
 * @param {*} height Image height
 * @returns Two dimensional pixel values array
 */
const generatePerlinImage = (width, height) => {
    const perlinArray = [];

    for(let y=0; y < height ; y++){
        const row = [];

        for(let x=0; x < width; x++){
            const pValue = perlin2D.getNoiseAtPoint((xScrollPos2D + x) / IMG_WIDTH * FREQUENCY, y / IMG_HEIGHT * FREQUENCY);

            row.push(Math.floor(pValue * 255));
        }

        perlinArray.push(row);
    }

    xScrollPos2D += width;

    return perlinArray;
}

/**
 * Continuously generates 1D perling noise for an image of arbitrary size
 * 
 * @param {*} width Image width
 * @returns Two dimensional pixel values array
 */
const generatePerlinValue = (width) => {
    const perlinArray = [];

    for(let y=0; y<IMG_HEIGHT; y++){
        const row = [];

        for(let x=0; x<width; x++){
            row.push(0);
        }

        perlinArray.push(row);
    }

    for(let x=0; x < width; x++){
        const pValue = perlin1D.getNoiseAtPoint((xScrollPos1D + x) / IMG_WIDTH * FREQUENCY);
        const pixel = Math.floor(pValue * (IMG_HEIGHT/2) / 0.5);

        perlinArray[pixel][x] = 255;
    }

    xScrollPos1D += width;

    return perlinArray;
}

/**
 * Paints buffer image on canvas
 * 
 * @param {*} image Image to draw
 * @param {*} buffer Pixel data
 * @param {*} x Origin X component
 * @param {*} y Origin Y component
 */
const drawPerlinImage = (image, buffer, x, y) => {
    for(let y=0; y<IMG_HEIGHT; y++){
        for(let x=0; x<IMG_WIDTH; x++){
            const index = (y*IMG_WIDTH + x) * 4;
            
            image.data[index + 0] = buffer[y][x]; 
            image.data[index + 1] = buffer[y][x]; 
            image.data[index + 2] = buffer[y][x]; 
            image.data[index + 3] = 255; 
        }
    }

    canvas.drawImage(image, x, y);
}

/**
 * Initial instatiations
 */
const setup = () => {
    for(let y=0; y<IMG_HEIGHT; y++){
        const row = [];

        for(let x=0; x<IMG_WIDTH; x++){
            row.push(0);
        }

        buffer1.push([...row]);
        buffer2.push([...row]);
    }

    canvas.clearCanvas();

    let perlin2DArray = generatePerlinImage(IMG_WIDTH, IMG_HEIGHT);
    pasteImageInBuffer(buffer1, perlin2DArray, IMG_WIDTH, IMG_HEIGHT);
    drawPerlinImage(image1, buffer1, (canvas.width / 2) - (IMG_WIDTH / 2), canvas.height / 9);
    
    let perlin1DArray = generatePerlinValue(1);
    pasteImageInBuffer(buffer2, perlin1DArray, IMG_WIDTH, IMG_HEIGHT);
    drawPerlinImage(image2, buffer2, (canvas.width / 2) - (IMG_WIDTH / 2), canvas.height / 9 * 2 + IMG_HEIGHT);
    
    addListeners();
}

/**
 * Main logic loop
 */
const mainLoop = () => {
    setInterval(() => {
        let thisLoop = new Date();
        FPS = Math.round(1000 / (thisLoop - lastLoop));
        lastLoop = thisLoop;

        const pt1 = new Date();
        const perlin2DArray = generatePerlinImage(1, IMG_HEIGHT);
        const perlin1DArray = generatePerlinValue(1);
        const pt2 = new Date();

        P_GEN_TIME = pt2 - pt1;

        shiftBufferByOffset(buffer1, 1);
        shiftBufferByOffset(buffer2, 1);

        pasteImageInBuffer(buffer1, perlin2DArray, 1, IMG_HEIGHT);
        pasteImageInBuffer(buffer2, perlin1DArray, 1, IMG_HEIGHT);

        canvas.clearCanvas();
        drawPerlinImage(image1, buffer1, (canvas.width / 2) - (IMG_WIDTH / 2), canvas.height / 9);
        drawPerlinImage(image2, buffer2, (canvas.width / 2) - (IMG_WIDTH / 2), canvas.height / 9 * 2 + IMG_HEIGHT);

        if(DEBUG) drawDebug();
    }, 1000 / REFRESH_RATE);
}

setup();
mainLoop();