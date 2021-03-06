var fs = require('fs');
var RaspiCam = require('../lib/raspicam');
var sys = require('sys')
var exec = require('child_process').exec;

$(document).ready(function() {
    $("#calibrate").hide();
    $("#analyze").hide();
}); 

deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function newPill() {
    vex.dialog.open({
        message: 'Enter the pill name',
        input: "<input name=\"pillname\" type=\"text\" placeholder=\"Pill Name\" required />",
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, {
                text: 'Ok'
            }), $.extend({}, vex.dialog.buttons.NO, {
                text: 'Back'
            })
        ],
        callback: function(data) {
            if (data === false) {
                return console.log('Cancelled');
            }
            if (!/^[a-zA-Z0-9]+$/.test(data.pillname)) {
                vex.dialog.alert(data.pillname + " is not a valid name. Please use only alphanumeric characters and no spaces.");
                return;
            }
            var pillName = data.pillname;

            vex.dialog.prompt({
                message: 'Please input the scorch time for this pill (in seconds):',
                callback: function(value) {
                    if (isNaN(value)) {
                        // Not a valid number
                        vex.dialog.alert(value + " is not a valid number.");
                        return;
                    }
                    scorchTime = parseInt(value);

                    pillName += scorchTime;
                    var pillDir = __dirname + '/../../../pills/';
                    if (!fs.existsSync(pillDir)) {
                        fs.mkdirSync(pillDir);
                    }
                    var dir = pillDir + pillName.toLowerCase();

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                        listPills();
                    } else {
                        vex.dialog.alert(pillName + " is already a registered pill.");
                    }
                }
            });
        }
    });
}

function removePill(pill) {
    vex.dialog.confirm({
        message: 'Remove ' + pill + '?',
        callback: function(value) {
            if (value) {
                deleteFolderRecursive(__dirname + "/../../../pills/" + pill);
                listPills();
            }
        }
    });
}

function selectPill(pill) {
    vex.dialog.open({
        message: 'Calibrate or Analyze',
        buttons: [
            $.extend({}, vex.dialog.buttons.NO, { className: 'vex-dialog-button-primary', text: 'Calibrate', click: function($vexContent, event) {
                $vexContent.data().vex.value = 'calibrate';
                vex.close($vexContent.data().vex.id);
            }}),
            $.extend({}, vex.dialog.buttons.NO, { className: 'vex-dialog-button-primary', text: 'Analyze', click: function($vexContent, event) {
                $vexContent.data().vex.value = 'analyze';
                vex.close($vexContent.data().vex.id);
            }}),
                $.extend({}, vex.dialog.buttons.NO, { text: 'Back', click: function($vexContent, event) {
                    $vexContent.data().vex.value = 'back';
                    vex.close($vexContent.data().vex.id);
                }})
        ],
        callback: function(type) {
            if (type != 'back') {
                var pillDir = __dirname + '/../../../pills/' + pill;
                var scorchTime = -1;
                var matches = pill.match(/\d+$/);
                if (matches) {
                    number = matches[0];
                    scorchTime = parseInt(number, 10);
                }

                if (type == 'analyze') {
                    analyze(pill, scorchTime);
                } else if (type == 'calibrate') {
                    calibrate(pill, scorchTime * 1000);
                }
            }
        }
    });
}

function takePictures(type, pill, scorchTime) {
    var pillDir = __dirname + '/../../../pills/' + pill;
    var i = 0;
    if (!fs.existsSync(pillDir + '/' + type)) {
        fs.mkdirSync(pillDir + '/' + type);
    }

    console.log("Taking pictures");

    var camera = new RaspiCam({
        mode: "timelapse",
        output: pillDir + "/" + type + "image_%01d.jpg",
        encoding: "jpg",
        timelapse: 1000, // take a picture every 1 seconds
        timeout: scorchTime
    });

    camera.on("start", function( err, timestamp ){
        console.log("timelapse started at " + timestamp);
    });

    camera.on("read", function( err, timestamp, filename ){
        console.log("timelapse image captured with filename: " + filename);
        $("ul#calImgList").append("<li><img src=\"file://" + pillDir + "/" + type + "/" + filename + "\" height=70 width=70/></li>");
    });

    camera.on("exit", function( timestamp ){
        console.log("timelapse child process has exited");

        function puts(error, stdout, stderr) { sys.puts(stdout); }
        exec("../../d_codi " + type, puts);

        vex.dialog.alert(pill + " has been " + type + "d. Here are the results:<br/>Blank<br/>Blank");
    });

    camera.on("stop", function( err, timestamp ){
        console.log("timelapse child process has been stopped at " + timestamp);
    });

    camera.start();
}

function calibrate(pill, scorchTime) {
    var pillDir = __dirname + '/../../../pills/' + pill;
    $("#pillSelection").slideUp();
    $("#analyze").slideUp();
    $("#calibrate").slideDown();

    takePictures("calibrate", pill, scorchTime);
}

function analyze(pill, scorchTime) {
    var pillDir = __dirname + '/../../../pills/' + pill;
    $("#pillSelection").slideUp();
    $("#calibrate").slideUp();
    $("#analyze").slideDown();

    takePictures("analyze", pill, scorchTime)
}

function listPills() {
    var files = fs.readdirSync(__dirname + '/../../../pills/');
    $("ul#pillList").empty();

    for (var i in files) {
        $("ul#pillList").append("<li><button class=\"btn-link\" type=\"button\" onclick=\"selectPill('" + files[i] + "')\">" + files[i] + "</button><button class=\"btn btn-danger btn-xs\" type=\"button\" onclick=\"removePill('" + files[i] + "')\">Remove</button></li>");
    }
}
