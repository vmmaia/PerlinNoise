let Canvas = (function () {
    var instance;
    
    /**
     * Singleton design pattern to manipulate canvas
     */
    class Singleton {
        /**
         * Instantiates a single instance of canvas context
         * 
         * @returns Instance of canvas context
         */
        constructor() {
            if (instance) {
                return instance;
            }

            instance = this;

            const canvas = document.getElementById('canvas');
            canvas.setAttribute('width', window.innerWidth);
            canvas.setAttribute('height', window.innerHeight);

            this.canvasContext = canvas.getContext("2d");
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.id = Math.random();
        }

        /**
         * Draws a line in the canvas
         * 
         * @param {*} x1 Origin point X component
         * @param {*} y1 Origin point Y component
         * @param {*} x2 Destination point X component
         * @param {*} y2 Destination point Y component
         * @param {*} color Color to paint the line
         */
        drawLine = (x1, y1, x2, y2, color) => {
            this.canvasContext.strokeStyle = color;

            this.canvasContext.beginPath();
            this.canvasContext.moveTo(x1, y1);
            this.canvasContext.lineTo(x2, y2);
            this.canvasContext.stroke();
        }

        /**
         * 
         * 
         * @param {*} x 
         * @param {*} y 
         * @param {*} width 
         * @param {*} height 
         * @param {*} color 
         */
        drawRectangle = (x, y, width, height, color) => {
            this.canvasContext.fillStyle = color;

            this.canvasContext.fillRect(x, y, width, height);
        }

        /**
         * 
         * @param {*} image 
         * @param {*} x 
         * @param {*} y 
         */
        drawImage = (image, x, y) => {
            this.canvasContext.putImageData(image, x, y);
        }

        /**
         * Resets the canvas with a black background
         */
        clearCanvas = () => {
            this.canvasContext.fillStyle = '#000';
            this.canvasContext.fillRect(
                0, 
                0, 
                this.canvasContext.canvas.width, 
                this.canvasContext.canvas.height
            );
        }

        /**
         * Writes text in the canvas
         * 
         * @param {*} text String to write
         * @param {*} x Position X component
         * @param {*} y Position Y component
         * @param {*} color Color to paint the text
         */
        write = (text, x, y, color) => {
            this.canvasContext.fillStyle = color;
            this.canvasContext.font = "16px serif";

            this.canvasContext.fillText(text, x, y);
        }

        /**
         * Draws a circle in the canvas
         * 
         * @param {*} x Center X component
         * @param {*} y Center Y component
         * @param {*} radius Circle radius
         * @param {*} color Color to paint the circle
         */
        drawCircle = (x, y, radius, color) => {
            this.canvasContext.fillStyle = color;
            this.canvasContext.beginPath();
            this.canvasContext.ellipse(x, y, radius, radius, 0, 0, 2*Math.PI);
            this.canvasContext.fill();
        }
    }

    return Singleton;
}());

export default Canvas;