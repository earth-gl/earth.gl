
/**
 * @author yellow 2020/10/28
 * 判断运行环境是否是Node
 */
const isNode = function (): boolean {
    return typeof process === 'object' && String(process) === '[object process]' && !process["browser"];
}

export { isNode }
