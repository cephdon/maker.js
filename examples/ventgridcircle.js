require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
///<reference path="../target/ts/makerjs.d.ts"/>
var makerjs = require('./../target/js/node.maker.js');
var Ventgrid = (function () {
    function Ventgrid(filterRadius, spacing, width, height) {
        var _this = this;
        this.filterRadius = filterRadius;
        this.spacing = spacing;
        this.width = width;
        this.height = height;
        this.units = makerjs.unitType.Millimeter;
        this.paths = {};
        var alternate = false;
        var xDistance = 2 * filterRadius * (1 + spacing / 100);
        var countX = Math.ceil(width / xDistance);
        var yDistance = makerjs.solvers.solveTriangleASA(60, xDistance / 2, 90);
        var countY = Math.ceil(height / yDistance) + 1;
        function checkBoundary(x, y) {
            return y - filterRadius < height && x - filterRadius < width;
        }
        var row = function (iy) {
            var total = countX;
            if (!alternate) {
                total++;
            }
            for (var i = 0; i < total; i++) {
                var x = i * xDistance;
                var y = iy * yDistance;
                if (alternate) {
                    x += xDistance / 2;
                }
                if (checkBoundary(Math.abs(x), Math.abs(y))) {
                    var id = 'filter_' + i + '_' + iy;
                    _this.paths[id] = new makerjs.paths.Circle([x, y], filterRadius);
                    if (alternate || (!alternate && i > 0)) {
                        _this.paths[id + '_alt'] = new makerjs.paths.Circle([-x, y], filterRadius);
                    }
                }
            }
        };
        for (var i = 0; i < countY; i++) {
            row(i);
            if (i > 0) {
                row(-i);
            }
            alternate = !alternate;
        }
    }
    return Ventgrid;
})();
Ventgrid.metaParameters = [
    { title: "filterRadius", type: "range", min: 1, max: 20, value: 2 },
    { title: "spacing", type: "range", min: 10, max: 100, value: 49 },
    { title: "width", type: "range", min: 20, max: 200, value: 37 },
    { title: "height", type: "range", min: 20, max: 200, value: 50 },
];
module.exports = Ventgrid;
//To compile this: go to the root and:
// cd examples
// tsc ventgrid.ts --declaration

},{"../target/js/node.maker.js":undefined}],"ventgridcircle":[function(require,module,exports){
///<reference path="../target/ts/makerjs.d.ts"/>
///<reference path="ventgrid.d.ts"/>
var makerjs = require('./../target/js/node.maker.js');
var ventgrid = require('./ventgrid.js');
var VentgridCircle = (function () {
    function VentgridCircle(filterRadius, spacing, radius) {
        this.filterRadius = filterRadius;
        this.spacing = spacing;
        this.radius = radius;
        this.units = makerjs.unitType.Millimeter;
        this.paths = {};
        this.rim = new makerjs.paths.Circle([0, 0], radius);
        var ventgridInstance = new ventgrid(filterRadius, spacing, radius, radius);
        for (var id in ventgridInstance.paths) {
            var circle = ventgridInstance.paths[id];
            this.checkCircle(id, circle);
        }
    }
    VentgridCircle.prototype.checkCircle = function (id, circle) {
        var distanceToCenter = makerjs.measure.pointDistance([0, 0], circle.origin);
        if (makerjs.round(distanceToCenter + circle.radius) <= this.radius) {
            //inside
            this.paths[id] = circle;
        }
        else if (makerjs.round(distanceToCenter - circle.radius) > this.radius) {
        }
        else {
            //border
            var arcIntersection = makerjs.path.intersection(circle, this.rim);
            if (arcIntersection && arcIntersection.path1Angles.length == 2) {
                var filterArc = new makerjs.paths.Arc(circle.origin, circle.radius, arcIntersection.path1Angles[1], arcIntersection.path1Angles[0]);
                this.paths[id] = filterArc;
                var rimArc = new makerjs.paths.Arc([0, 0], this.radius, arcIntersection.path2Angles[0], arcIntersection.path2Angles[1]);
                this.paths[id + '_rim'] = rimArc;
            }
        }
    };
    return VentgridCircle;
})();
VentgridCircle.metaParameters = [
    { title: "filterRadius", type: "range", min: 1, max: 20, value: 6 },
    { title: "spacing", type: "range", min: 10, max: 100, value: 30 },
    { title: "radius", type: "range", min: 20, max: 200, value: 100 }
];
module.exports = VentgridCircle;
//To compile this: go to the root and:
//   cd examples
//   tsc ventgridcircle.ts
//   cp ventgridcircle.js temp.js  
//   browserify -r ./temp.js:ventgridcircle --exclude ../target/js/node.maker.js > ventgridcircle.js

},{"../target/js/node.maker.js":undefined,"./ventgrid.js":1}]},{},[]);
