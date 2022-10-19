import {Vector2D} from '../util/util.js';

/**
 * Implementation of 1D Perlin noise
 * 
 * https://en.wikipedia.org/wiki/Perlin_noise
 * http://adrianb.io/2014/08/09/perlinnoise.html
 */
class Perlin1D{
    /**
     * Permutation table to pseudo-randomize gradient vector pick
     */
    permutations = [
        151,160,137, 91, 90, 15,131, 13,201, 95, 96, 53,194,233,  7,225,140, 36,103, 30, 69,142,  8, 99, 37,240, 21, 10, 23,190,  6,148,
        247,120,234, 75,  0, 26,197, 62, 94,252,219,203,117, 35, 11, 32, 57,177, 33, 88,237,149, 56, 87,174, 20,125,136,171,168, 68,175,
         74,165, 71,134,139, 48, 27,166, 77,146,158,231, 83,111,229,122, 60,211,133,230,220,105, 92, 41, 55, 46,245, 40,244,102,143, 54,
         65, 25, 63,161,  1,216, 80, 73,209, 76,132,187,208, 89, 18,169,200,196,135,130,116,188,159, 86,164,100,109,198,173,186,  3, 64,
         52,217,226,250,124,123,  5,202, 38,147,118,126,255, 82, 85,212,207,206, 59,227, 47, 16, 58, 17,182,189, 28, 42,223,183,170,213,
        119,248,152,  2, 44,154,163, 70,221,153,101,155,167, 43,172,  9,129, 22, 39,253, 19, 98,108,110, 79,113,224,232,178,185,112,104,
        218,246, 97,228,251, 34,242,193,238,210,144, 12,191,179,162,241, 81, 51,145,235,249, 14,239,107, 49,192,214, 31,181,199,106,157,
        184, 84,204,176,115,121, 50, 45,127,  4,150,254,138,236,205, 93,222,114, 67, 29, 24, 72,243,141,128,195, 78, 66,215, 61,156,180
    ];

    /**
     * Gradient vectors used to populate vector grid
     */
    gradient = [
        new Vector2D(1 ,  1),
        new Vector2D(-1,  1),
        new Vector2D(1 , -1),
        new Vector2D(-1, -1)
    ]

    /**
     * Constructor for Perlin1D class
     * If a number is passed, it creates a vector gradient of that size with randomly generated vectors
     * 
     * @param {*} randomGradientVectors Number of vectors to create gradient
     */
    constructor(randomGradientVectors){
        if(randomGradientVectors !== undefined){
            const vectors = [];

            for(let i=0; i<randomGradientVectors; i++){
                vectors.push(new Vector2D(-1 + Math.random() * 2, -1 + Math.random() * 2))
            }

            this.gradient = vectors;
        }
    }

    /**
     * Find coordinates of cell in vector grid where a point falls in
     * 
     * @param {*} x X component of point
     * @returns Object with coordinates of cell {x}
     */
    getCellCoordinatesInGrid = (x) => {
        return {
            x: Math.floor(x) % 255
        }
    }

    /**
     * Pick values from permutations table according to cell coordinates
     * 
     * @param {*} Object() {x} coordinates of cell in vector grid
     * @returns Array of two gradient values corresponding to each vector of the cell
     */
    getGradientHashes = ({x}) => {
        return [
            this.permutations[this.permutations[x]],
            this.permutations[this.permutations[(x + 1) % 255]]
        ]
    }

    /**
     * Find position inside vector grid cell a point falls into
     * 
     * @param {*} x X component of point
     * @returns Coordinates inside cell where the point falls in relative to the origin {x}
     */
    getPositionInsideGrid = (x) => {
        return {
            x: x - Math.floor(x)
        }
    }

    /**
     * Pick vectors from gradient based on gradient hash values
     * 
     * @param {*} gradientHashes Values selected from permutations table
     * @returns Vectors corresponding to each corner of the cell
     */
    getGradientVectors = (gradientHashes) => {
        return [
            this.gradient[gradientHashes[0] % (this.gradient.length - 1)],
            this.gradient[gradientHashes[1] % (this.gradient.length - 1)],
        ]
    }

    /**
     * Performs the dot product between each vector and point inside vector grid cell
     * 
     * @param {*} gradientVectors Vectors corresponding to each corner of the vector grid cell
     * @param {*} Object {x} coordinates of point inside vector grid cell
     * @returns Dot products between each vector and point inside cell
     */
    getDotProducts = (gradientVectors, {x}) => {
        return [
            (gradientVectors[0].x * x       ),
            (gradientVectors[1].x * (x - 1) )
        ]
    }

    /**
     * Applies a mathematical function to soothe perlin values and eliminate visible boundaries
     * 
     * @param {*} Object {x} coordinates of point inside vector gride cell
     * @returns Processed {x} cordinates
     */
    applyFade = ({x}) => {
        return {
            x: 6*x**5 - 15*x**4 + 10*x**3
        }
    }

    /**
     * Linear interpolation between two values
     * 
     * @param {*} v1 Value 1
     * @param {*} v2 Value 2
     * @param {*} n Value to interpolate
     * @returns Interpolated value
     */
    linearInterpolation = (v1, v2, n) => {
        return v1 + n * (v2 - v1);
    }

    /**
     * Limits a value between a set of limits
     * 
     * @param {*} n Value to limit
     * @param {*} start1 Limit 1 lower bound
     * @param {*} stop1 Limit 1 upper bound
     * @param {*} start2 Limit 2 lower bound
     * @param {*} stop2 Limit 2 upper bound
     * @returns Bounded value
     */
    boundResult = (n, start1, stop1, start2, stop2) => {
        return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    }

    /**
     * Returns a Perlin noise value for value along the x axis
     * 
     * @param {*} x X component of coordinate
     * @returns Perlin noise value in interval [0, 1]
     */
    getNoiseAtPoint = (x) => {
        const cellCoordinates       = this.getCellCoordinatesInGrid(x); 
        const gradientHashes        = this.getGradientHashes(cellCoordinates); 
        const positionInsideGrid    = this.getPositionInsideGrid(x); 
        const gradientVectors       = this.getGradientVectors(gradientHashes); 
        const dotProducts           = this.getDotProducts(gradientVectors, positionInsideGrid); 
        const fadeValues            = this.applyFade(positionInsideGrid); 
        const pixelValue            = this.linearInterpolation(dotProducts[0], dotProducts[1], fadeValues.x); 
        const boundedResult         = this.boundResult(pixelValue, -Math.sqrt(2/4), Math.sqrt(2/4), 0, 1);

        return boundedResult;
    }
}

export default Perlin1D;