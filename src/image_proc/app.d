import std.stdio;
import std.math;
import imageformats;
import std.file;
import std.string;
import std.conv;

class PillImage {
    ulong totalPixelNum;
    int size;
    int dominantColor;
    int minR;
    int minG;
    int minB;
    int maxR;
    int maxG;
    int maxB;
    double avgR;
    double avgG;
    double avgB;
    double stdDevR;
    double stdDevG;
    double stdDevB;

    this(IFImage img) {
        ubyte r = 0; ubyte g = 0; ubyte b = 0;

        auto redPixels = 0; auto greenPixels = 0; auto bluePixels = 0;

        double avgR = 0; double avgG = 0; double avgB = 0;
        int minR = 255; int minG = 255; int minB = 255;
        int maxR = 0; int maxG = 0; int maxB = 0;
        double stddevR = 0; double stddevG = 0; double stddevB = 0;

        foreach (i; 0 .. img.pixels.length) {
            auto rgb = i % 3;
            if (rgb == 0) {
                r = img.pixels[i];
            } else if (rgb == 1) {
                g = img.pixels[i];
            } else if (rgb == 2) {
                b = img.pixels[i];
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

        foreach (i; 0 .. img.pixels.length) {
            auto rgb = i % 3;

            if (rgb == 0) {
                r = img.pixels[i];
            } else if (rgb == 1) {
                g = img.pixels[i];
            } else if (rgb == 2) {
                b = img.pixels[i];
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

        int size = dominantColor == 0 ? redPixels : dominantColor == 1 ? greenPixels : bluePixels;

        this.totalPixelNum = img.pixels.length;
        this.size = size;
        this.dominantColor = dominantColor;
        this.minR = minR;
        this.minG = minG;
        this.minB = minB;
        this.maxR = maxR;
        this.maxG = maxG;
        this.maxB = maxB;
        this.avgR = avgR;
        this.avgG = avgG;
        this.avgB = avgB;
        this.stdDevR = stddevR;
        this.stdDevG = stddevG;
        this.stdDevB = stddevB;
    }

    void saveToFile(string filename) {
        File file = File(filename, "w");
        file.writeln(this.totalPixelNum);
        file.writeln(this.size);
        file.writeln(this.dominantColor);
        file.writeln(this.minR);
        file.writeln(this.minB);
        file.writeln(this.minG);
        file.writeln(this.maxR);
        file.writeln(this.maxB);
        file.writeln(this.maxG);
        file.writeln(this.avgR);
        file.writeln(this.avgB);
        file.writeln(this.avgG);
        file.writeln(this.stdDevR);
        file.writeln(this.stdDevB);
        file.writeln(this.stdDevG);
        file.writeln();
    }

    this(string src) {
        string[] lines = strip(src).split("\n");

        if (lines.length < 15) {
            writeln("Invalid");
        } else {
            this.totalPixelNum = to!ulong(lines[0]);
            this.size = to!int(lines[1]);
            this.dominantColor = to!int(lines[2]);
            this.minR = to!int(lines[3]);
            this.minB = to!int(lines[4]);
            this.minG = to!int(lines[5]);
            this.maxR = to!int(lines[6]);
            this.maxB = to!int(lines[7]);
            this.maxG = to!int(lines[8]);
            this.avgR = to!double(lines[9]);
            this.avgB = to!double(lines[10]);
            this.avgG = to!double(lines[11]);
            this.stdDevR = to!double(lines[12]);
            this.stdDevB = to!double(lines[13]);
            this.stdDevG = to!double(lines[14]);
        }
    }
}

bool analyze(PillImage genuine, PillImage test) {
    if (genuine.size != test.size) { writeln("size doesn't match in genuine "); }

    if (genuine.dominantColor != test.dominantColor) { writeln("dominantColor doesn't match in image "); }

    if (genuine.avgR - genuine.stdDevR > test.avgR || (genuine.avgR + genuine.stdDevR) < test.avgR) { 
        writeln("Red does not match");
        writeln(genuine.avgR, " ", genuine.stdDevR, " ", test.avgR);
        return false;
    }
    if (genuine.avgG - genuine.stdDevG > test.avgG || genuine.avgG + genuine.stdDevG < test.avgG) { 
        writeln("Green does not match");
        writeln(genuine.avgG, " ", genuine.stdDevG, " ", test.avgG);
        return false;
    }
    if (genuine.avgB - genuine.stdDevB > test.avgB || genuine.avgB + genuine.stdDevB < test.avgB) { 
        writeln("Blue does not match");
        writeln(genuine.avgB, " ", genuine.stdDevB, " ", test.avgB);
        return false;
    }

    return true;
}

void main(in string[] args) {
    if (args.length < 2) {
        writeln("Calibrate or analyze?");
        return;
    }

    if (args[1] == "analyze") {
        PillImage genuine = new PillImage(read_image(args[2]));
        PillImage test = new PillImage(read_image(args[3]));

        writeln(analyze(genuine, test));
    } else if (args[1] == "calibrate") {
        PillImage genuine = new PillImage(read_image(args[2]));
        genuine.saveToFile(args[2] ~ ".txt");
    }
}
