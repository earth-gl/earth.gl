const forEach = require('./../utils/forEach');
const FRAF = (cb) => {
    window.setTimeout(cb, 1000 / 60);
};

const RAF = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || FRAF;

const AnimateCache = [];

const TweenCache = {};

const update = function (time) {
    AnimateCache.forEach(animate => {
        animate(time);
    });
    forEach(TweenCache, (tween)=>{
        tween(time);
    });
    RAF(update);
};

module.exports = {
    AnimateCache,
    TweenCache,
    update
}