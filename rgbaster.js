"use strict";

// Helper functions.
var getContext = function (width, height) {
    var canvas = document.createElement("canvas");
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    return canvas.getContext('2d');
};

var getImageData = function (img, loaded) {

    var imgObj = new Image();
    var imgSrc = img.src || img;

    // Can't set cross origin to be anonymous for data url's
    // https://github.com/mrdoob/three.js/issues/1305
    if (imgSrc.substring(0, 5) !== 'data:')
        imgObj.crossOrigin = "Anonymous";

    imgObj.onload = function () {
        var context = getContext(imgObj.width, imgObj.height);
        context.drawImage(imgObj, 0, 0);

        var imageData = context.getImageData(0, 0, imgObj.width, imgObj.height);

        var quarter_imgWidth = imgObj.width / 4
        quarter_imgWidth = quarter_imgWidth - (quarter_imgWidth % 4)

        // RGBA array
        var rgba_array = Array()
        var rgba_count = -1;
        for (var m = 0; m < imageData.data.length; m++) {
            if (m % 4 == 0) {
                rgba_count++
                rgba_array[rgba_count] = Array()
            }
            rgba_array[rgba_count].push(imageData.data[m])
        }
        // console.log(rgba_array)

        //  divding
        var divided_imageData = Array()
        for (var m = 0; m < rgba_array.length; m++) {
            if ((m % imgObj.width > imgObj.width / 4) && (m % imgObj.width < imgObj.width * 3 / 4) && (m > imgObj.width * imgObj.height / 4) && (m < imgObj.width * imgObj.height * 3 / 4)) {} else {
                divided_imageData.push(rgba_array[m])
            }
        }
        // console.log(divided_imageData)

        //slimming to 1/10
        var slimmed_rgba_array = Array()
        for (var i = 0; i < divided_imageData.length; i++) {
            if (i % 10 == 0) {
                slimmed_rgba_array.push(divided_imageData[i])
            }
        }
        // console.log(slimmed_rgba_array)

        // reformat
        var result_array = Array()
        for (var i = 0; i < slimmed_rgba_array.length; i++) {
            // console.log(slimmed_rgba_array[i])
            for (var m = 0; m < slimmed_rgba_array[i].length; m++) {
                result_array.push(slimmed_rgba_array[i][m])
            }
        }
        // console.log(result_array)

        console.log("Slim image: " + imageData.data.length+" to "+result_array.length)
        // loaded && loaded(imageData.data);
        loaded && loaded(result_array);
    };

    imgObj.src = imgSrc;

};

var makeRGB = function (name) {
    return ['rgb(', name, ')'].join('');
};

var mapPalette = function (palette) {
    var arr = [];
    for (var prop in palette) {
        arr.push(frmtPobj(prop, palette[prop]))
    };
    arr.sort(function (a, b) {
        return (b.count - a.count)
    });
    return arr;
};

var fitPalette = function (arr, fitSize) {
    if (arr.length > fitSize) {
        return arr.slice(0, fitSize);
    } else {
        for (var i = arr.length - 1; i < fitSize - 1; i++) {
            arr.push(frmtPobj('0,0,0', 0))
        };
        return arr;
    };
};

var frmtPobj = function (a, b) {
    return {
        name: makeRGB(a),
        count: b
    };
}


// RGBaster Object
// ---------------
//
var PALETTESIZE = 10;

var RGBaster = {};

RGBaster.colors = function (img, opts) {

    opts = opts || {};
    var exclude = opts.exclude || [], // for example, to exclude white and black:  [ '0,0,0', '255,255,255' ]
        paletteSize = opts.paletteSize || PALETTESIZE;

    getImageData(img, function (data) {
        var colorCounts = {},
            rgbString = '',
            rgb = [],
            colors = {
                dominant: {
                    name: '',
                    count: 0
                },
                palette: []
            };


        for (var i = 0; i < data.length; i += 4) {

            rgb[0] = data[i];
            rgb[1] = data[i + 1];
            rgb[2] = data[i + 2];
            rgbString = rgb.join(",");

            // skip undefined data and transparent pixels
            if (rgb.indexOf(undefined) !== -1 || data[i + 3] === 0) {
                continue;
            }

            // Ignore those colors in the exclude list.
            if (exclude.indexOf(makeRGB(rgbString)) === -1) {
                if (rgbString in colorCounts) {
                    colorCounts[rgbString] = colorCounts[rgbString] + 1;
                } else {
                    colorCounts[rgbString] = 1;
                }
            }

        }

        if (opts.success) {
            var palette = fitPalette(mapPalette(colorCounts), paletteSize + 1);
            opts.success({
                dominant: palette[0].name,
                secondary: palette[1].name,
                palette: palette.map(function (c) {
                    return c.name;
                }).slice(1)
            });
        }
    });
};

// export default RGBaster