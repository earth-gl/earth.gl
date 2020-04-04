# earth.gl

a minimal library for global visualization

# Coordinate System #

>1. 地理相关三维算法，坐标基于笛卡尔坐标系，所以系统的三维空间坐标构建在笛卡尔坐标系之下，与WebGL坐标系不同的是：
```
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
 >2. 最终通过camear投影成屏幕NDC坐标
```         1 
            |
            |
-1 --------------------- 1
            |
            |
           -1 
```


由于大部分空间算法都使用笛卡尔坐标系，所以本系统设置camera时，进行了重定义，反算出的三维空间坐标符合第二卡坐标系统