/**
 * Two dimensional vector class
 */
export class Vector2D {
    constructor(x, y){
        this.setCoordinates(x, y);
    }

    getVector = () => {
        return {
            x: this.x,
            y: this.y,
            direction: this.direction,
            magnitude: this.magnitude
        }
    }

    setDirection = (direction) => {
        this.direction = sanatizeRadians(direction);
        this.x = Math.cos(this.direction) * this.magnitude;
        this.y = Math.sin(this.direction) * this.magnitude;

        return this.getVector();
    }

    setCoordinates = (x, y) => {
        this.x = x;
        this.y = y;
        this.magnitude = distanceBetweenTwoPoints(0, 0, x, y);
        this.direction = Math.atan(Math.abs(y)/Math.abs(x));

        if(x < 0 && y > 0) this.direction += (Math.PI / 2);
        if(x < 0 && y < 0) this.direction += (Math.PI);
        if(x > 0 && y < 0) this.direction = (2*Math.PI) - this.direction;

        return this.getVector();
    }

    setMagnitude = (magnitude) => {
        this.magnitude = magnitude;
        this.x = Math.cos(this.direction) * this.magnitude;
        this.y = Math.sin(this.direction) * this.magnitude;

        return this.getVector();
    }

    normalize = () => {
        return this.setMagnitude(1);
    }

}

/**
 * Converts degrees to radians
 * 
 * @param {*} deg Value to convert
 * @returns Converted value between 0 and 2PI
 */
export const degToRad = (deg) => {
    return sanatizeDegrees(deg) * Math.PI / 180;
}

/**
 * Computes the Euclidian distance between two points
 * 
 * @param {*} x1 X component of point one
 * @param {*} y1 Y component of point one
 * @param {*} x2 X component of point two
 * @param {*} y2 Y component of point two
 * @returns Euclidean distance between the two points
 */
export const distanceBetweenTwoPoints = (x1, y1, x2, y2) => {
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
}

/**
 * Adds or subtracts two radian values, wrapping around values
 * 
 * @param {*} a Valeu one
 * @param {*} b Value two
 * @returns Sum of both arguments between 0 and 2PI
 */
export const addRadians = (a, b) => {
    const sum = a + b;
    return sum < 0 ? 2*Math.PI + (sum % (2*Math.PI)) : sum % (2*Math.PI);
}

/**
 * Adds or subtracts two degree values, wrapping around values
 * 
 * @param {*} a Value one
 * @param {*} b Value two
 * @returns Sum of both arguments between 0 and 360
 */
export const addDegrees = (a, b) => {
    const sum = a + b;
    return sum < 0 ? 360 + (sum % 360) : sum % 360;
}

/**
 * Makes a value fit between allowed radian values
 * 
 * @param {*} rad Value to sanatize
 * @returns Value between 0 and 2PI
 */
 export const sanatizeRadians = (rad) => {
    return addRadians(rad, 0);
}

/**
 * Makes a value fit between allowed degree values
 * 
 * @param {*} deg Value to sanatize
 * @returns Value between 0 and 360
 */
export const sanatizeDegrees = (deg) => {
    return addDegrees(deg, 0);
}