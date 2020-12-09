
import { WebMercatorProjection, GeodeticCoordinate, Globe } from './../src/index';

const g = new Globe({
    width:100,
    height:100,
    canvas:"mapCanvas"
});

// const wm = new WebMercatorProjection();
// const go = new GeodeticCoordinate(114.2344412, 33.23313241234342, 0);
// const v1 = wm.project(go);
// const v3 = wm.unproject(v1);

