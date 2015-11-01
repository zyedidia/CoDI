import std.stdio;
import imageformats;

// finds the dominant color in an input picture
void main(in string[] args) {
    if (args.length < 2) {
        writeln("No input file");
        return;
    }
    IFImage im = read_image(args[1]);

    ubyte r = 0;
    ubyte g = 0;
    ubyte b = 0;

    auto redPixels = 0;
    auto greenPixels = 0;
    auto bluePixels = 0;

    foreach (i; 0 .. im.pixels.length) {
        auto rgb = i % 3;
        if (rgb == 0) {
            r = im.pixels[i];
        } else if (rgb == 1) {
            g = im.pixels[i];
        } else if (rgb == 2) {
            b = im.pixels[i];
        }

        if (r > 25) {
            redPixels++;
        }

        if (g > 25) {
            greenPixels++;
        }

        if (b > 25) {
            bluePixels++;
        }
    }

    auto dominantColor = 0;
    if (redPixels > greenPixels) {
        if (bluePixels > redPixels) {
            dominantColor = 2;
        }
    } else {
        dominantColor = 1;
        if (bluePixels > greenPixels) {
            dominantColor = 2;
        }
    }

    writeln("Dominant color is ", dominantColor);

    writeln("Size is ", dominantColor == 0 ? redPixels : dominantColor == 1 ? greenPixels
        : bluePixels);
    /* write_image("out.png", im.w, im.h, im.pixels); */
}
