/**
 * reference:
 *  http://www.css88.com/doc/underscore/docs/underscore.html
 */
const isString = function (str: any) {
    return (typeof str == 'string') && str.constructor == String;
}
export { isString }