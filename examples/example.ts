
import { Vec2 } from 'kiwi.matrix';
import { WebMercator, Geographic} from './../src/index';


const wm = new WebMercator();
const go = new Geographic(114.2344412,33.23313241234342,0);
const v1 = wm.project(go);
const v3 = wm.unproject(v1);

const v5 = "";

