var fs = require('fs');
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

            var pillsDir = __dirname + '/../../../pills/';
            if (!fs.existsSync(pillsDir)) {
                fs.mkdirSync(pillsDir);
            }
            var dir = pillsDir + data.pillname.toLowerCase();

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

function listPills() {
    var files = fs.readdirSync(__dirname + '/../../../pills/');
    console.log(files);
    $("ul#pillList").empty();

    for (var i in files) {
        $("ul#pillList").append("<li><button class=\"btn-link\" type=\"button\">" + files[i] + "</button><button class=\"btn btn-danger btn-xs\" type=\"button\" onclick=\"removePill('" + files[i] + "')\">Remove</button></li>");
    }
}
