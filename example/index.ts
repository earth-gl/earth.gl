
import { WebMercatorProjection, GeodeticCoordinate, Globe } from '../src/index';

const map = new Globe({
    width: 800,
    height: 600,
    canvas: "mapCanvas",
    coordinate: new GeodeticCoordinate(114.2344412, 33.23313241234342, 10000)
});

// map.addLayer();

const wm = new WebMercatorProjection();
const go = new GeodeticCoordinate(114.2344412, 33.23313241234342, 0);
const v1 = wm.project(go);
const v3 = wm.unproject(v1);

const sss = "";

