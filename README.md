# earth.gl

a minimal library for global visualization

## build ##
``` javascript
//rollup
rollup -c 
//npm
npm run compile
```

## debug ##
```
gulp watch
```



# Tile System #
> 栅格瓦片系统</br>
> 通过distance error计算地图的level</br>
> 通过PerspectiveCamera矩阵构造的视锥（Frustrum）与地球表面相交覆盖的区域，获取瓦片</br>
> 在交互Camera时会更新Frustrum相关参数（在Quadtree.js应用相关参数计算覆盖区域）</br>
> 获取到瓦片和瓦片的boundary后，通过构建8x8个顶点的曲面，在曲面上贴瓦片纹理以实现球面的效果</br>
``` javascript
//构造 8x8 个顶点的曲面
const lerp = 8, factor = 1/lerp;
 for (let x = 0; x <= lerp; x++)
    for (let y = 0; y <= lerp; y++) {
        const g1 = new Geographic(start.longitude + x * factor * rangeX, 
        start.latitude + y * factor * rangeY,
        0);
        //经纬度插值后，算成笛卡尔坐标
        const spaceCoord = PSEUDOMERCATOR.geographicToSpace(g1);
        //顶点数组
        vertices = vertices.concat(spaceCoord._out);
        //纹理索引
        texcoords = texcoords.concat([x * factor, y * factor]);
    }
```
>矢量瓦片系统
>矢量瓦片系统相比于栅格瓦片系统，多了经纬度坐标换算笛卡尔坐标的过程。</br>
>绘制方法远比直接应用纹理，将瓦片当作纹理贴在8x8个顶点构成的曲面上复杂。
