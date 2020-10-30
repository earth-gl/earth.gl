import { GLMatrix, Vec3 } from 'kiwi.matrix';
import { sin, log, atan, exp } from '../util/fixed';
import { Projection } from './Projection';
import { PSEUDOMERCATOR } from './Ellipsoid';
import { Geographic } from './Geographic';

const maxLatitude = 85.0511287798;
/**
 * Web墨卡托投影
 * @author yellow
 */
class WebMercatorProjection extends Projection {
  constructor() {
    super(PSEUDOMERCATOR, maxLatitude);
    //减少一次运算，结果和maxLatitude一致
    //this._maximumLatitude = this._mercatorAngleToGeodeticLatitude(Math.PI);
  }
  /**
   * Converts a Mercator angle, in the range -PI to PI, to a geodetic latitude in the range -PI/2 to PI/2.
   * @param mercatorAngle in radius
   */
  private _mercatorAngleToGeodeticLatitude(mercatorAngle: number): number {
    return Math.PI / 2 - (2.0 * atan(exp(-mercatorAngle)));
  }
  /**
   * 
   * @param latitude 
   */
  private _geodeticLatitudeToMercatorAngle(latitude: number): number {
    const maximumLatitude = this._maximumLatitude;
    if (latitude > maximumLatitude)
      latitude = maximumLatitude;
    else if (latitude < -maximumLatitude)
      latitude = -maximumLatitude;
    const sinLatitude = sin(latitude);
    return 0.5 * log((1.0 + sinLatitude) / (1.0 - sinLatitude));
  }
  /**
   * 
   * @param geographic 
   */
  project(geographic: Geographic): Vec3 {
    const semimajorAxis = this._semimajorAxis;
    const x = GLMatrix.toRadian(geographic.longitude) * semimajorAxis,
      y = this._geodeticLatitudeToMercatorAngle(GLMatrix.toRadian(geographic.latitude)) * semimajorAxis,
      z = geographic.height;
    return new Vec3().set(x, y, z);
  }
  /**
   * 
   * @param v3 
   */
  unproject(v3: Vec3): Geographic {
    const oneOverEarthSemimajorAxis = this._oneOverSemimajorAxis,
      longitude = v3.x * oneOverEarthSemimajorAxis,
      latitude = this._mercatorAngleToGeodeticLatitude(v3.y * oneOverEarthSemimajorAxis),
      height = v3.z;
    return new Geographic(GLMatrix.toDegree(longitude), GLMatrix.toDegree(latitude), height);
  }
}

export {
  WebMercatorProjection
}