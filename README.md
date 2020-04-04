# earth.gl

a minimal library for global visualization

# Coordinate System #

>坐标系统解释：</br>
 地理空间中的三维表达是基于笛卡尔坐标系（算法默认也使用笛卡尔坐标系）</br>
 earth.gl的三维空间坐标构建在笛卡尔坐标系之下（与cesium一致）</br>
 与WebGL坐标系不同之处如下图所示, 根绝右手法则（注意xoy平面，x垂直于屏幕）</br>
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
x = cos(latitude) * cos(longitude);
y = cos(latitude) * sin(longitude);
z = sin(latitude);
```
> 5. 单位圆上的x,y,z换算成以真实的米, (x,y,z)是垂直于球的向量，离地高度就是
```javascript
//earth.gl构造的是正圆，所以不用如此复杂的计算
//此计算过程适合椭球体的（当然也适用于正圆）
radiiSquared = (radii*radii, radii*radii, radii*radii);
k = radiiSquared.multiply(x,y,z);
gamma = sqrt(n.clone().dot(k));
k = k.scale(1/gamma);
//计算离地高度后，矢量相加(k+h）即摄像机在笛卡尔空间的坐标
//h = 离地高度 dot (x,y,z)
camera.position = k.add(h);
```
>6. 摄像机的用途是将笛卡尔构建的三维坐标换算成屏幕坐标NDC，
```javascript
            1 
            |
            |
-1 --------------------- 1
            |
            |
           -1 
```
>7. earth.gl 目前仅构建了透视矩阵(PerspectiveCamera)</br>
> 通过设置 up 方向为（0，0，1）表示笛卡尔坐标系</br>
> 其他部分与webgl常规的投影算法一致</br>