const ellipsoid_wgs84 = require("../src/core/Ellipsoid").WGS84,
    TerrainEncoding = require("./../core/TerrainEncoding"),
    maximumRadius = require("../src/core/Ellipsoid").WGS84.maximumRadius,
    QuadtreeTile = require("../src/core/QuadtreeTile"),
    equal14 = require("../src/utils/revise").equal14,
    clamp = require("../src/utils/clamp"),
    { Vec2, Vec3, Mat4 } = require("kiwi.matrix");

var degeneratePositionLocalFrame = {
    north: [-1, 0, 0],
    east: [0, 1, 0],
    up: [0, 0, 1],
    south: [1, 0, 0],
    west: [0, -1, 0],
    down: [0, 0, -1]
};

const DEFAULT_STRUCTURE = {
    heightScale: 1.0,
    heightOffset: 0.0,
    elementsPerHeight: 1,
    stride: 1,
    elementMultiplier: 256.0,
    isBigEndian: false
};

var scratchCalculateCartesian = {
    east: new Vec3(),
    north: new Vec3(),
    up: new Vec3(),
    west: new Vec3(),
    south: new Vec3(),
    down: new Vec3()
};

var localFrameToFixedFrameCache = {};

var vectorProductLocalFrame = {
    up: {
        south: 'east',
        north: 'west',
        west: 'south',
        east: 'north'
    },
    down: {
        south: 'west',
        north: 'east',
        west: 'north',
        east: 'south'
    },
    south: {
        up: 'west',
        down: 'east',
        west: 'down',
        east: 'up'
    },
    north: {
        up: 'east',
        down: 'west',
        west: 'up',
        east: 'down'
    },
    west: {
        up: 'north',
        down: 'south',
        north: 'down',
        south: 'up'
    },
    east: {
        up: 'south',
        down: 'north',
        north: 'up',
        south: 'down'
    }
};

const localFrameToFixedFrameGenerator = function (firstAxis, secondAxis) {
    var thirdAxis = vectorProductLocalFrame[firstAxis][secondAxis];
    var resultat;
    var hashAxis = firstAxis + secondAxis;
    if (localFrameToFixedFrameCache[hashAxis])
        resultat = localFrameToFixedFrameCache[hashAxis];
    else {
        resultat = function (origin, ellipsoid) {
            if (equal14(origin.x, 0.0) && equal14(origin.y, 0.0)) {
                var sign = Math.sign(origin.z);
                var first = degeneratePositionLocalFrame[firstAxis];
                var scratchFirstCartesian = new Vec3().set(first[0], first[1], first[2]);
                if (firstAxis !== 'east' && firstAxis !== 'west') {
                    scratchFirstCartesian.scale(sign);
                }
                var second = degeneratePositionLocalFrame[secondAxis];
                var scratchSecondCartesian = new Vec3().set(second[0], second[1], second[2]);
                if (secondAxis !== 'east' && secondAxis !== 'west') {
                    scratchSecondCartesian.scale(sign);
                }
                var third = degeneratePositionLocalFrame[thirdAxis];
                var scratchThirdCartesian = new Vec3().set(third[0], third[1], third[2]);
                if (thirdAxis !== 'east' && thirdAxis !== 'west') {
                    scratchThirdCartesian.scale(sign);
                }
            } else {
                scratchCalculateCartesian.up = ellipsoid.geodeticSurfaceNormal(origin);
                var up = scratchCalculateCartesian.up;
                var east = scratchCalculateCartesian.east;
                east.x = -origin.y;
                east.y = origin.x;
                east.z = 0.0;
                scratchCalculateCartesian.east.normalize();
                scratchCalculateCartesian.north.normalize();
                scratchCalculateCartesian.down = scratchCalculateCartesian.up.clone().scale(-1);
                scratchCalculateCartesian.west = scratchCalculateCartesian.east.clone().scale(-1);
                scratchCalculateCartesian.south = scratchCalculateCartesian.north.clone().scale(-1);
                scratchFirstCartesian = scratchCalculateCartesian[firstAxis];
                scratchSecondCartesian = scratchCalculateCartesian[secondAxis];
                scratchThirdCartesian = scratchCalculateCartesian[thirdAxis];
            }
            //
            var m4 = new Mat4().set(
                scratchFirstCartesian.x,
                scratchFirstCartesian.y,
                scratchFirstCartesian.z,
                0.0,
                scratchSecondCartesian.x,
                scratchSecondCartesian.y,
                scratchSecondCartesian.z,
                0.0,
                scratchThirdCartesian.x,
                scratchThirdCartesian.y,
                scratchThirdCartesian.z,
                0.0,
                origin.x,
                origin.y,
                origin.z,
                1.0
            );
            return m4;
        };
        localFrameToFixedFrameCache[hashAxis] = resultat;
    }
    return resultat;
};

const eastNorthUpToFixedFrame = localFrameToFixedFrameGenerator('east', 'north');

/**
 * 
 */
const computeVertices = function (options) {
    //
    const { heightmap, width, height, skirtHeight, nativeRectangle } = options;
    const oneOverGlobeSemimajorAxis = 1.0 / maximumRadius;
    //
    const { heightScale, elementsPerHeight, stride, elementMultiplier, heightOffset, isBigEndian } = DEFAULT_STRUCTURE;
    const exaggeration = 1.0,
        geographicWest = nativeRectangle.west,
        geographicSouth = nativeRectangle.south,
        geographicEast = nativeRectangle.east,
        geographicNorth = nativeRectangle.north,
        rectangleWidth = nativeRectangle.width,
        rectangleHeight = nativeRectangle.height,
        granularityX = rectangleWidth / (width - 1),
        granularityY = rectangleHeight / (height - 1);
    //
    var radiiSquared = ellipsoid_wgs84.radiiSquared;
    var radiiSquaredX = radiiSquared.x;
    var radiiSquaredY = radiiSquared.y;
    var radiiSquaredZ = radiiSquared.z;
    var minimumHeight = 65536.0;
    var maximumHeight = -65536.0;
    var relativeToCenter = new Vec3();
    //
    var fromENU = eastNorthUpToFixedFrame(relativeToCenter, ellipsoid_wgs84);
    var toENU = fromENU.clone().invert();
    //
    var minimum = new Vec3().set(
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY);
    var maximum = new Vec3().set(
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY);
    var hMin = Number.POSITIVE_INFINITY;
    var arrayWidth = width + (skirtHeight > 0.0 ? 2.0 : 0.0);
    var arrayHeight = height + (skirtHeight > 0.0 ? 2.0 : 0.0);
    var size = arrayWidth * arrayHeight;
    var positions = new Array(size);
    var heights = new Array(size);
    var uvs = new Array(size);
    var webMercatorTs = [];
    //
    var startRow = 0;
    var endRow = height;
    var startCol = 0;
    var endCol = width;
    var index = 0;
    //
    for (var rowIndex = startRow; rowIndex < endRow; ++rowIndex) {
        var row = rowIndex;
        if (row < 0) {
            row = 0;
        }
        if (row >= height) {
            row = height - 1;
        }
        var latitude = nativeRectangle.north - granularityY * row;
        var cosLatitude = Math.cos(latitude);
        var nZ = Math.sin(latitude);
        var kZ = radiiSquaredZ * nZ;
        var v = (latitude - geographicSouth) / (geographicNorth - geographicSouth);
        v = clamp(v, 0.0, 1.0);
        for (var colIndex = startCol; colIndex < endCol; ++colIndex) {
            var col = colIndex;
            if (col < 0) {
                col = 0;
            }
            if (col >= width) {
                col = width - 1;
            }
            var longitude = nativeRectangle.west + granularityX * col;
            var terrainOffset = row * (width * stride) + col * stride;
            var heightSample;
            if (elementsPerHeight === 1) {
                heightSample = heightmap[terrainOffset];
            } else {
                heightSample = 0;

                var elementOffset;
                if (isBigEndian) {
                    for (elementOffset = 0; elementOffset < elementsPerHeight; ++elementOffset) {
                        heightSample = (heightSample * elementMultiplier) + heightmap[terrainOffset + elementOffset];
                    }
                } else {
                    for (elementOffset = elementsPerHeight - 1; elementOffset >= 0; --elementOffset) {
                        heightSample = (heightSample * elementMultiplier) + heightmap[terrainOffset + elementOffset];
                    }
                }
            }

            heightSample = (heightSample * heightScale + heightOffset) * exaggeration;

            var u = (longitude - geographicWest) / (geographicEast - geographicWest);
            u = clamp(u, 0.0, 1.0);
            uvs[index] = new Vec2(u, v);

            maximumHeight = Math.max(maximumHeight, heightSample);
            minimumHeight = Math.min(minimumHeight, heightSample);

            if (colIndex !== col || rowIndex !== row) {
                var percentage = 0.00001;
                if (colIndex < 0) {
                    longitude -= percentage * rectangleWidth;
                } else {
                    longitude += percentage * rectangleWidth;
                }
                if (rowIndex < 0) {
                    latitude += percentage * rectangleHeight;
                } else {
                    latitude -= percentage * rectangleHeight;
                }

                cosLatitude = Math.cos(latitude);
                nZ = Math.sin(latitude);
                kZ = radiiSquaredZ * nZ;
                heightSample -= skirtHeight;
            }

            var nX = cosLatitude * Math.cos(longitude);
            var nY = cosLatitude * Math.sin(longitude);

            var kX = radiiSquaredX * nX;
            var kY = radiiSquaredY * nY;

            var gamma = Math.sqrt((kX * nX) + (kY * nY) + (kZ * nZ));
            var oneOverGamma = 1.0 / gamma;

            var rSurfaceX = kX * oneOverGamma;
            var rSurfaceY = kY * oneOverGamma;
            var rSurfaceZ = kZ * oneOverGamma;

            var position = new Vec3();
            position.x = rSurfaceX + nX * heightSample;
            position.y = rSurfaceY + nY * heightSample;
            position.z = rSurfaceZ + nZ * heightSample;

            positions[index] = position;
            heights[index] = heightSample;
            index++;
            var cartesian3Scratch = new Mat4().multiplyByVec3(position);
            minimum.min(cartesian3Scratch);
            maximum.max(cartesian3Scratch);
            hMin = Math.min(hMin, heightSample);
        }
    }
    //
    var encoding = new TerrainEncoding(minimum, maximum, relativeToCenter, hMin, maximumHeight, fromENU, false, false);
    //
    var indices = createTypedArrayFromArrayBuffer(vertexCount, rawMesh.triangleIndices);
    var vertices = new Float32Array(rawMesh.vertexData);
    //
    const surfaceElement = that._createSufraceElement.call(that, vertices, indices);
    surfaces.push(surfaceElement);
}




computeVertices({
    heightmap: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0],
    width: 5,
    height: 5,
    skirtHeight: 0.0,
    nativeRectangle: new QuadtreeTile({ x: 6, y: 1, level: 2 }).boundary
});




module.exports = computeVertices;