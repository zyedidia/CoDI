import std.stdio;
import std.math;
import imageformats;

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

    double avgR = 0; double avgG = 0; double avgB = 0;
    int minR = 255; int minG = 255; int minB = 255;
    int maxR = 0; int maxG = 0; int maxB = 0;
    double stddevR = 0; double stddevG = 0; double stddevB = 0;

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
            avgR += r;

            if (r < minR) {
                minR = r;
            } else if (r > maxR) {
                maxR = r;
            }
        }

        if (g > 25) {
            greenPixels++;
            avgG += g;
            
            if (g < minG) {
                minG = g;
            } else if (g > maxG) {
                maxG = g;
            }
        }

        if (b > 25) {
            bluePixels++;
            avgB += b;

            if (b < minB) {
                minB = b;
            } else if (b > maxB) {
                maxB = b;
            }
        }
    }

    avgR /= redPixels;
    avgG /= greenPixels;
    avgB /= bluePixels;

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
            stddevR += (r - avgR) * (r - avgR);
        } 
        if (g > 25) {
            stddevG += (g - avgG) * (g - avgG);
        } 
        if (b > 25) {
            stddevB += (b - avgB) * (b - avgB);
        }
    }

    stddevR /= redPixels;
    stddevR = sqrt(stddevR);

    stddevG /= greenPixels;
    stddevG = sqrt(stddevG);

    stddevB /= bluePixels;
    stddevB = sqrt(stddevB);

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
    writeln();
    writeln("Size is ", dominantColor == 0 ? redPixels : dominantColor == 1 ? greenPixels : bluePixels);
    writeln();
    writeln("Average R: ", avgR);
    writeln("Average G: ", avgG);
    writeln("Average B: ", avgB);
    writeln();
    writeln("Min R: ", minR);
    writeln("Min G: ", minG);
    writeln("Min B: ", minB);
    writeln();
    writeln("Max R: ", maxR);
    writeln("Max G: ", maxG);
    writeln("Max B: ", maxB);
    writeln();
    writeln("StdDev R: ", stddevR);
    writeln("StdDev G: ", stddevG);
    writeln("StdDev B: ", stddevB);
    /* write_image("out.png", im.w, im.h, im.pixels); */
}
