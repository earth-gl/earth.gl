/**
 * 
 * @param {*} time 
 * @param {*} callback 
 */
const isNode = require("./isNode");

const setTimeout2 = isNode? function(time,callback){
    setTimeout(callback,time);
} :setTimeout(time,callback);

module.exports = setTimeout2;