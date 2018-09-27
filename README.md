# img-edge-color-extractor

A simple javascript library for extracting the dominant color(s) from an image edge.

## Usage

Create an image (or grab an image URL), then get its dominant color & palette.

```javascript
var img = document.getElementById('image');
// or
var img = 'http://example.com/path-to-image.jpg'

RGBaster.colors(img, {
  success: function(payload) {
    // You now have the payload.
    console.log(payload.dominant);
    console.log(payload.secondary);
    console.log(payload.palette);
  }
});
```

## Source project

https://github.com/briangonzalez/rgbaster.js (MIT License)(Author: Brian Gonzalez)

## License

MIT