var fs = require('fs');

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
    console.log(pill);
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

    var video = document.getElementById("videoElement");
    video.play();

    var i = 0;
    if (!fs.existsSync(pillDir + '/calibrate')) {
        fs.mkdirSync(pillDir + '/calibrate');
    }
    var pictureTaker = setInterval(function() {
        captureFrame(video, pillDir + '/calibrate/image' + i + '.png', 1);
        setTimeout(function() {
            $("ul#calImgList").append("<li><img src=\"file://" + pillDir + "/calibrate/image" + i + ".png" + "\" height=70 width=70/></li>");
            i++;
        }, 2);
    }, 1000);

    setTimeout(function() {
        clearTimeout(pictureTaker);
    }, scorchTime + 3);
}

function analyze(pill) {
    var pillDir = __dirname + '/../../../pills/' + pill;
    $("#pillSelection").slideUp();
    $("#calibrate").slideUp();
    $("#analyze").slideDown();

    var video = document.getElementById("videoElement");
    video.play();
}

function listPills() {
    var files = fs.readdirSync(__dirname + '/../../../pills/');
    console.log(files);
    $("ul#pillList").empty();

    for (var i in files) {
        $("ul#pillList").append("<li><button class=\"btn-link\" type=\"button\" onclick=\"selectPill('" + files[i] + "')\">" + files[i] + "</button><button class=\"btn btn-danger btn-xs\" type=\"button\" onclick=\"removePill('" + files[i] + "')\">Remove</button></li>");
    }
}

function captureFrame(video, filename, scaleFactor) {
    if (scaleFactor === null) {
        scaleFactor = 1;
    }
    var w = video.videoWidth * scaleFactor;
    var h = video.videoHeight * scaleFactor;
    var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    
    // string generated by canvas.toDataURL()
    var img = canvas.toDataURL();

    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFile(filename, buf);
    console.log("saved");
}
