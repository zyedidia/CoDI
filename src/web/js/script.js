var fs = require('fs');
var RaspiCam = require('../lib/raspicam');

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

            var pillDir = __dirname + '/../../../pills/';
            if (!fs.existsSync(pillDir)) {
                fs.mkdirSync(pillDir);
            }
            var dir = pillDir + data.pillname.toLowerCase();

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
                listPills();
            } else {
                vex.dialog.alert(data.pillname + " is already a registered pill.");
            }
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
        callback: function(value) {
            if (value != 'back') {
                var pillDir = __dirname + '/../../../pills/' + pill;

                if (value == 'analyze') {
                    analyze(pill);
                } else if (value == 'calibrate') {
                    if (!fs.existsSync(pillDir + 'scorchTime.txt')) {
                        vex.dialog.alert('No scorch time detected');
                    }

                    calibrate(pill, 5000);
                }
            }
        }
    });
}

function calibrate(pill, scorchTime) {
    var pillDir = __dirname + '/../../../pills/' + pill;
    $("#pillSelection").slideUp();
    $("#analyze").slideUp();
    $("#calibrate").slideDown();

    var i = 0;
    if (!fs.existsSync(pillDir + '/calibrate')) {
        fs.mkdirSync(pillDir + '/calibrate');
    }

    var camera = new RaspiCam({
        mode: "timelapse",
        output: pillDir + "/calibrate/image_%01d.jpg",
        encoding: "jpg",
        timelapse: 1000, // take a picture every 1 seconds
        timeout: scorchTime
    });

    camera.on("start", function( err, timestamp ){
        console.log("timelapse started at " + timestamp);
    });

    camera.on("read", function( err, timestamp, filename ){
        console.log("timelapse image captured with filename: " + filename);
    });

    camera.on("exit", function( timestamp ){
        console.log("timelapse child process has exited");
    });

    camera.on("stop", function( err, timestamp ){
        console.log("timelapse child process has been stopped at " + timestamp);
    });

    camera.start();

    // Take the pictures 
    // ...

    // var pictureTaker = setInterval(function() {
    //     captureFrame(video, pillDir + '/calibrate/image' + i + '.png', 1);
    //     setTimeout(function() {
    //         $("ul#calImgList").append("<li><img src=\"file://" + pillDir + "/calibrate/image" + i + ".png" + "\" height=70 width=70/></li>");
    //         i++;
    //     }, 2);
    // }, 1000);
    //
    // setTimeout(function() {
    //     clearTimeout(pictureTaker);
    // }, scorchTime + 3);

    // Call the D code to analyze the pictures
    // ...

    vex.dialog.alert(pill + " has been calibrated. Here are the results:<br/>Blank<br/>Blank");
}

function analyze(pill) {
    var pillDir = __dirname + '/../../../pills/' + pill;
    $("#pillSelection").slideUp();
    $("#calibrate").slideUp();
    $("#analyze").slideDown();
}

function listPills() {
    var files = fs.readdirSync(__dirname + '/../../../pills/');
    $("ul#pillList").empty();

    for (var i in files) {
        $("ul#pillList").append("<li><button class=\"btn-link\" type=\"button\" onclick=\"selectPill('" + files[i] + "')\">" + files[i] + "</button><button class=\"btn btn-danger btn-xs\" type=\"button\" onclick=\"removePill('" + files[i] + "')\">Remove</button></li>");
    }
}
