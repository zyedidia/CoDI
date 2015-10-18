import std.stdio;
import imageformats;

void main(in string[] args) {
    if (args.length < 2) {
        writeln("No input file");
        return;
    }
    IFImage im = read_image(args[1]);

    ubyte r = 0; ubyte g = 0; ubyte b = 0;

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
            im.pixels[i] = 0;
        } else {
            im.pixels[i] = 255;
        }
    }

    write_image("out.png", im.w, im.h, im.pixels);
}
