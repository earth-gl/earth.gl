# earth.gl

a minimal library for global visualization under Typescript

## Typescript Usage ##

> 首先,需要安装typescript
```
npm install --save-dev typescript
```

> eslint 用于typescript语法规则检查
``` 
//eslint基础
npm install --save-dev eslint
//语法解析器
npm install --save-dev typescript @typescript-eslint/parser
//eslint默认规则的补充，提供适用于ts语法的规则检查
npm install --save-dev @typescript-eslint/eslint-plugin
```

> 创建配置文件 .eslintrc.json
```javascript
module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        // 禁止使用 var
        'no-var': "error",
        // 优先使用 interface 而不是 type
        '@typescript-eslint/consistent-type-definitions': [
            "error",
            "interface"
        ]
    }
}
```

> 使用Prettier修复格式错误
```
npm install --save-dev prettier
```
>创建 prettier.config.js 文件，配置格式规则
```
// prettier.config.js or .prettierrc.js
module.exports = {
    // 一行最多 100 字符
    printWidth: 100,
    // 使用 4 个空格缩进
    tabWidth: 4,
    // 不使用缩进符，而使用空格
    useTabs: false,
    // 行尾需要有分号
    semi: true,
    // 使用单引号
    singleQuote: true,
    // 对象的 key 仅在必要时用引号
    quoteProps: 'as-needed',
    // jsx 不使用单引号，而使用双引号
    jsxSingleQuote: false,
    // 末尾不需要逗号
    trailingComma: 'none',
    // 大括号内的首尾需要空格
    bracketSpacing: true,
    // jsx 标签的反尖括号需要换行
    jsxBracketSameLine: false,
    // 箭头函数，只有一个参数的时候，也需要括号
    arrowParens: 'always',
    // 每个文件格式化的范围是文件的全部内容
    rangeStart: 0,
    rangeEnd: Infinity,
    // 不需要写文件开头的 @prettier
    requirePragma: false,
    // 不需要自动在文件开头插入 @prettier
    insertPragma: false,
    // 使用默认的折行标准
    proseWrap: 'preserve',
    // 根据显示样式决定 html 要不要折行
    htmlWhitespaceSensitivity: 'css',
    // 换行符使用 lf
    endOfLine: 'lf'
};
```
>在vscode/setting.json中配置Prettier插件, 实现保存文件时自动格式化并且自动修复 ESLint 错误
```
{
    "files.eol": " ",
    "editor.tabSize": 4,
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "eslint.autoFixOnSave": true,
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        {
            "language": "typescript",
            "autoFix": true
        }
    ],
    "typescript.tsdk": "node_modules/typescript/lib"
}
```
> 可选配置：使用AlloyTeam的ESlint配置
```
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-alloy
```
>根目录下创建 .eslintrc.js，配置eslint规则
```
module.exports = {
    extends: [
        'alloy',
        'alloy/typescript',
    ],
    env: {
        // 您的环境变量（包含多个预定义的全局变量）
        // Your environments (which contains several predefined global variables)
        //
        // browser: true,
        // node: true,
        // mocha: true,
        // jest: true,
        // jquery: true
    },
    globals: {
        // 您的全局变量（设置为 false 表示它不允许被重新赋值）
        // Your global variables (setting to false means it's not allowed to be reassigned)
        //
        // myGlobal: false
    },
    rules: {
        // 自定义您的规则
        // Customize your rules
    }
};
```

## build ##
``` javascript
//rollup
~~rollup -c~~
//npm
~~npm run compile~~
//改用parcel，启动监控
parcel examples/example.html

```


## debug ##
```
gulp watch
```

## coordinate system ##

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
 > 首先构建笛卡尔坐标系，用于表达空间位置, 原点（0,0,0）为地球的中心。</br>
 > 使用最长的半轴作为半径构建椭球体（实际上是正圆）,代码参考 Ellipsoid.js</br>
 > 输入相机的初始位置坐标，形式为（经度，纬度，离里面高度（米））</br>
 > 对经纬度转换，假设在单位圆内，根据经纬度可以得到空间坐标x,y,z
```javascript
//笛卡尔坐标系下的x, y, z
const x = cos(latitude) * cos(longitude);
const y = cos(latitude) * sin(longitude);
const z = sin(latitude);
```
> 单位圆上的x,y,z换算成以真实的米, (x,y,z)是垂直于球的向量，离地高度就是
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
> 摄像机的用途是将笛卡尔构建的三维坐标换算成屏幕坐标NDC，
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
> earth.gl 目前仅构建了PerspectiveCamera</br>
> 通过设置 up 方向为 Vec3(0，0，1) 表示笛卡尔坐标系</br>
> 其他部分与webgl常规的投影算法一致</br>

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