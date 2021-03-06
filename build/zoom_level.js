'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ZoomLevel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _world_values = require('./world_values');

var worldValues = _interopRequireWildcard(_world_values);

var _mercator_projection = require('./mercator_projection');

var mercProj = _interopRequireWildcard(_mercator_projection);

var _logger = require('./logger');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ZoomLevel = function () {
    function ZoomLevel(zoomLevel) {
        _classCallCheck(this, ZoomLevel);

        _logger.logger.log("New ZoomLevel:  ", zoomLevel);
        this.zoom = Math.floor(zoomLevel);
        this.matrixSideSize = Math.pow(2, this.zoom);
        this.horizontalMapTileSize = worldValues.EQUATOR / this.matrixSideSize;
        this.verticalMapTileSize = 2 * worldValues.MERIDIAN / this.matrixSideSize;
        this.mercatorProjection = new mercProj.MercatorProjection();
    }

    _createClass(ZoomLevel, [{
        key: 'getXYOfTileContainingPoint',
        value: function getXYOfTileContainingPoint(x, y, projectionType) {
            _logger.logger.log("getXYOfTileContainingPoint, x, y, projectionType: ", x, y, projectionType);
            var res = null;
            if (projectionType == worldValues.PROJECTION_TYPE_WEBMERCATOR) {
                res = this.mercatorProjection.getTileXYForMercatorPoint(x, y);
            } else if (projectionType == worldValues.PROJECTION_TYPE_WGS84) {
                res = this.mercatorProjection.getTileXYForWGS84Point(x, y);
            }
            _logger.logger.log("getXYOfTileContainingPoint, res: ", res);
            return res;
        }
    }, {
        key: 'getTileXYForWGS84Point',
        value: function getTileXYForWGS84Point(geoPoint) {
            _logger.logger.log("getTileXYForWGS84Point, geoPoint: ", geoPoint);
            if (geoPoint.lon < -179.999999 || geoPoint.lon > 179.999999 || geoPoint.lat < -85.0511 || geoPoint.lat > 85.0511) {
                throw "TILES_COORD_OUT_OF_RANGE";
            }
            var mercPoint = this.mercatorProjection.convertGeoToMerc(geoPoint);
            var res = this.getTileXYForMercatorPoint(mercPoint);
            _logger.logger.log("getTileXYForWGS84Point, res: ", res);
            return res;
        }
    }, {
        key: 'getTileXYForMercatorPoint',
        value: function getTileXYForMercatorPoint(mercPoint) {
            _logger.logger.log("getTileXYForMercatorPoint, mercPoint: ", mercPoint);
            var tileXY = { "x": 0, "y": 0 };
            tileXY.x = Math.floor((mercPoint.east + worldValues.EQUATOR / 2.0) / this.horizontalMapTileSize);
            tileXY.y = Math.floor((worldValues.MERIDIAN - mercPoint.north) / this.verticalMapTileSize);
            _logger.logger.log("getTileXYForMercatorPoint, tileXY: ", tileXY);
            return tileXY;
        }

        //Mercator coordinates stretch from -20037508.34 to 20037508.34 in each direction.

    }, {
        key: 'getMercatorExtentForTile',
        value: function getMercatorExtentForTile(tilex, tiley) {
            var x = Math.floor(tilex);
            var y = Math.floor(tiley);
            _logger.logger.log("getMercatorExtentForTile, zoom ", this.zoom, ": ", x, y);
            var minEast = x * this.horizontalMapTileSize - worldValues.EQUATOR / 2.0;
            var maxEast = (x + 1.0) * this.horizontalMapTileSize - worldValues.EQUATOR / 2.0;
            var maxNorth = worldValues.MERIDIAN - y * this.verticalMapTileSize;
            var minNorth = worldValues.MERIDIAN - (y + 1.0) * this.verticalMapTileSize;
            var res = { "minEast": minEast, "maxEast": maxEast, "minNorth": minNorth, "maxNorth": maxNorth };
            _logger.logger.log("getMercatorExtentForTile, res: ", res);
            return res;
        }
    }, {
        key: 'getWGS84ExtentForTile',
        value: function getWGS84ExtentForTile(tilex, tiley) {
            var x = Math.floor(tilex);
            var y = Math.floor(tiley);
            _logger.logger.log("getWGS84EtentForTile, zoom ", this.zoom, ": ", x, y);
            var mercExtent = this.getMercatorExtentForTile(x, y);
            var maxMerc = { "north": mercExtent.maxNorth, "east": mercExtent.maxEast };
            var minMerc = { "north": mercExtent.minNorth, "east": mercExtent.minEast };
            var maxGeo = this.mercatorProjection.convertMercToGeo(maxMerc);
            var minGeo = this.mercatorProjection.convertMercToGeo(minMerc);
            var res = { "minLon": minGeo.lon, "minLat": minGeo.lat, "maxLon": maxGeo.lon, "maxLat": maxGeo.lat };
            _logger.logger.log("getWGS84EtentForTile, res: ", res);
            return res;
        }
    }, {
        key: 'getZoomLevelCardinality',
        value: function getZoomLevelCardinality() {
            return Math.pow(this.matrixSideSize, 2);
        }
    }]);

    return ZoomLevel;
}();

exports.ZoomLevel = ZoomLevel;

// let z = 19;
// let zoomLevel = new ZoomLevel(z);
// logger.log("Zoom level ", z, " cardinality ",  zoomLevel.getZoomLevelCardinality());
// let p = {"lon": 10, "lat": 46};
// logger.log("Geo point: ", p)
// let mp = zoomLevel.mercatorProjection.convertGeoToMerc(p);
// logger.log("Converted mercator point: ", mp);
// let gp = zoomLevel.mercatorProjection.convertMercToGeo(mp);
// logger.log("Re-converted geo point: ", gp);
// let xy = zoomLevel.getTileXYForWGS84Point(p);
// logger.log("Tiles coord: ", xy);
// let mercatorExtent = zoomLevel.getMercatorExtentForTile(xy.x, xy.y)
// logger.log("Mercator extent: ", mercatorExtent);
// let geoExtent = zoomLevel.getWGS84ExtentForTile(xy.x, xy.y)
// logger.log("WGS84 extent: ", geoExtent);

//# sourceMappingURL=zoom_level.js.map