/**
 * @author yellow
 * @date 2020/10/5
 */

import { IObject3D } from '../types';

/**
* 
*/
const _prefixId = 'earth.gl';

/**
 * seed of id
 */
let i = 1;

const getId = function (pfx: string): string {
    const str = (pfx || _prefixId);
    return `_${str}_id_${i++}_`;
}

const setId = function (obj: IObject3D): string {
    return obj.id || getId(_prefixId);
}

export function stamp(obj: IObject3D, prefix = _prefixId) {
    return setId(obj);
}