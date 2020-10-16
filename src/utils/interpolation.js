const Geographic = require('./../core/Geographic'),
    { PSEUDOMERCATOR } = require('./../core/Ellipsoid');
/**
 * 三维空间矩形内插，实现球面贴图, 默认使用 8x8 个顶点
 * @param {import('./../core/Rectangle')} boundary 
 */
const interpolation = function (boundary) {
    const lerp = 12,
        factor = 1 / lerp,
        rangeX = boundary.width,
        rangeY = boundary.height,
        start = boundary.southwest;
    let texcoords = [],
        vertices = [],
        indices = [];
    for (let x = 0; x <= lerp; x++)
        for (let y = 0; y <= lerp; y++) {
            //convert to space
            //bug!不能直接使用线性加减得到方框顶点，而是需要从投影米级坐标计算
            const g1 = new Geographic(
                start.longitude + x * factor * rangeX,
                start.latitude + y * factor * rangeY,
                0);
            //convert to space coord
            const spaceCoord = PSEUDOMERCATOR.geographicToSpace(g1);
            //push vertices
            vertices = vertices.concat(spaceCoord._out);
            //texcoords
            texcoords = texcoords.concat([x * factor, y * factor]);
        }
    for (let x = 0; x < lerp; ++x)
        for (let y = 0; y < lerp; ++y) {
            let first = (x * (lerp + 1)) + y;
            let second = first + lerp + 1;
            indices.push(first);
            indices.push(second);
            indices.push(first + 1);
            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    //retrun vertices array and indices array
    return { vertices, indices, texcoords };
}

module.exports = interpolation;