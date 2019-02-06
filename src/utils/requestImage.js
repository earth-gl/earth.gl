/**
 * @function
 * @param {String} url 
 * @returns {Promise}
 */
const requestImage = function (url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, image.width, image.height);
            const imgData = ctx.getImageData(0, 0, image.width, image.height);
            resolve(new Uint8Array(imgData.data));
        };
        image.onerror = function (err) {
            reject(err);
        };
        image.src = url;
        image.crossOrigin = 'Anonymous';
    });
};

module.exports = requestImage;