
import { WebMercatorProjection, Geographic, Quadtree } from './../src/index';


const wm = new WebMercatorProjection();
const go = new Geographic(114.2344412, 33.23313241234342, 0);
const v1 = wm.project(go);
const v3 = wm.unproject(v1);
const tree = new Quadtree();
tree.on("hi", function () {
    alert("hello");
});

tree.update();

