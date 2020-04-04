# earth.gl

a minimal library for global visualization

# Coordinate System #

>坐标系统解释：</br>
 地理空间中的三维表达是基于笛卡尔坐标系（算法默认也使用笛卡尔坐标系）</br>
 earth.gl的三维空间坐标构建在笛卡尔坐标系之下（与cesium一致）</br>
 与WebGL坐标系不同之处如下图所示(注意xoy平面，基于右手法则，ox垂直于屏幕）</br>
```javascript
           y                                         z
           |                                         |
           |                                         |
           |                                         |
           |__ __ __ __ __x       =>                 |__ __ __ __ __ y 
          / o                                       / o
         /                                         /
        /                                         /
       /                                         /
       Z                                        x
            WebGL                                         笛卡尔
```
 > 1. 首先构建笛卡尔坐标系，用于表达空间位置, 原点（0,0,0）为地球的中心。</br>
 > 2. 使用最长的半轴作为半径构建椭球体（实际上是正圆）,代码参考 Ellipsoid.js</br>
 > 3. 输入相机的初始位置坐标，形式为（经度，纬度，离里面高度（米））</br>
 > 4. 首先对经纬度转换，假设在单位圆内，根据经纬度可以得到空间坐标x,y,z
```javascript
//笛卡尔坐标系下的x, y, z
const x = cos(latitude) * cos(longitude);
const y = cos(latitude) * sin(longitude);
const z = sin(latitude);
```
> 5. 单位圆上的x,y,z换算成以真实的米, (x,y,z)是垂直于球的向量，离地高度就是
```javascript
//earth.gl构造的是正圆，所以不用如此复杂的计算
//此计算过程适合椭球体的（当然也适用于正圆）
const radiiSquared = (radii*radii, radii*radii, radii*radii);
let k = radiiSquared.multiply(x,y,z);
const gamma = sqrt(n.clone().dot(k));
k = k.scale(1/gamma);
//计算离地高度后，矢量相加(k+h）即摄像机在笛卡尔空间的坐标
//h = 离地高度 dot (x,y,z)
camera.position = k.add(h);
```
>6. 摄像机的用途是将笛卡尔构建的三维坐标换算成屏幕坐标NDC，
```javascript

           y                                                1.0f
           |                                                 |
           |                                                 |
           |                                                 |
           |__ __ __ __ __x       =>        -1.0f __ __ __ __|__ __ __ __ __  1.0f
          / o                                                |                x
         /                                                   |
        /                                                    |
       /                                                   -1.0f
       Z                                                     y
            WebGL                                           NDC
```
>7. earth.gl 目前仅构建了PerspectiveCamera</br>
> 通过设置 up 方向为 Vec3(0，0，1) 表示笛卡尔坐标系</br>
> 其他部分与webgl常规的投影算法一致</br>

# Tile System #
>1. 栅格瓦片系统
>1.1 通过distance error计算地图的level</br>
>1.2 通过PerspectiveCamera矩阵构造的视锥（Frustrum）与地球表面相交覆盖的区域，获取瓦片</br>
>1.3 在交互Camera时会更新Frustrum相关参数（在Quadtree.js应用相关参数计算覆盖区域）</br>
>1.4 获取到瓦片和瓦片的boundary后，通过构建8x8个顶点的曲面，在曲面上贴瓦片纹理以实现球面的效果(utils/interpolation.js)</br>
``` javascript
const lerp = 8;
 for (let x = 0; x <= lerp; x++)
        for (let y = 0; y <= lerp; y++) {
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
```
>2. 矢量瓦片系统
>2.1 矢量瓦片系统相比于栅格瓦片系统，多了经纬度坐标换算笛卡尔坐标的过程。</br>
>2.2 绘制方法远比直接应用纹理，将瓦片当作纹理贴在8x8个顶点构成的曲面上复杂。
```
```