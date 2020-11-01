/**
 * 去除字符空格
 */
const trim = function (input: string): string {
    return ((input || '') + '').replace(/^\s+|\s+$/g, '');
}
/**
 * 
 * @param input 
 */
const splitWords = function (input: string): string[] {
    return trim(input).split(/\s+/);
}

export { splitWords }