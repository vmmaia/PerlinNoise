import Canvas from './classes/Canvas.js';
import Perlin2D from './classes/Perlin2D.js';

let DEBUG = false;
const REFRESH_RATE = 60;

const canvas = new Canvas;

const IMG_WIDTH = canvas.width / 2;
const IMG_HEIGHT = canvas.height / 2;
let P_VECTORS = 256;
let FREQUENCY = 18;

let P_GEN_TIME = 0;
let FPS = 0;
let lastLoop = new Date();

let perlin = new Perlin2D(P_VECTORS);

let xScrollPos = 0;

let image =  canvas.canvasContext.createImageData(IMG_WIDTH, IMG_HEIGHT);
let buffer = [];

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
                perlin = new Perlin2D(P_VECTORS);
                break;
            case "v":
                P_VECTORS++;
                perlin = new Perlin2D(P_VECTORS);
                break;
            case " ":
                DEBUG = !DEBUG;
                break;
        }
    }, false);
}

const shiftBufferByOffset = (xOffset, yOffset) => {
    if(xOffset > IMG_WIDTH || yOffset > IMG_HEIGHT) return;

    for(let y=0; y<IMG_HEIGHT; y++){
        for(let x=0; x<IMG_WIDTH; x++){
            if(x >= IMG_WIDTH - xOffset || y >= IMG_HEIGHT - yOffset){
                buffer[y][x] = 255;
                continue;
            }

            buffer[y][x] = buffer[y + yOffset][x + xOffset];
        }
    }

}

const pasteImageInBuffer = (image, width, height) => {
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

const generatePerlinImage = (width, height) => {
    const perlinArray = [];

    for(let y=0; y < height ; y++){
        const row = [];

        for(let x=0; x < width; x++){
            const pValue = perlin.getNoiseAtPoint((xScrollPos + x) / IMG_WIDTH * FREQUENCY, y / IMG_HEIGHT * FREQUENCY);

            row.push(Math.floor(pValue * 255));
        }

        perlinArray.push(row);
    }

    xScrollPos += width;

    return perlinArray;
}

const drawPerlinImage = () => {
    for(let y=0; y<IMG_HEIGHT; y++){
        for(let x=0; x<IMG_WIDTH; x++){
            const index = (y*IMG_WIDTH + x) * 4;
            
            image.data[index + 0] = buffer[y][x]; 
            image.data[index + 1] = buffer[y][x]; 
            image.data[index + 2] = buffer[y][x]; 
            image.data[index + 3] = 255; 
        }
    }

    canvas.drawImage(
        image, 
        (canvas.width / 2) - (IMG_WIDTH / 2), 
        (canvas.height / 2) - (IMG_HEIGHT / 2)
    );
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

        buffer.push(row);
    }

    canvas.clearCanvas();

    let perlinArray = generatePerlinImage(IMG_WIDTH, IMG_HEIGHT);

    pasteImageInBuffer(perlinArray, IMG_WIDTH, IMG_HEIGHT);

    drawPerlinImage();
    
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
        const perlinArray = generatePerlinImage(1, IMG_HEIGHT);
        const pt2 = new Date();

        P_GEN_TIME = pt2 - pt1;

        shiftBufferByOffset(1, 0);
        pasteImageInBuffer(perlinArray, 1, IMG_HEIGHT);

        canvas.clearCanvas();
        drawPerlinImage();

        if(DEBUG) drawDebug();
    }, 1000 / REFRESH_RATE);
}

setup();
mainLoop();