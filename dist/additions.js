$(document).on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

$(document).on("drop", function(e) {
    var file = e.dataTransfer.files[0];
    droppedFile(file);
});

function droppedFile(file) {
    hashFile(file, function(file, bytes, hash) {
        if (typeof hash !== "undefined") {
            console.log(hash);
            finishedHash(hash);
        } else {
            showProgress(bytes / file.size);
        }
    });
}

function hashFile(file, callback) {
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;

    var chunkSize = 1024 * 1024 * 2;
    var chunks = Math.ceil(file.size / chunkSize);
    var currentChunk = 0;
    var spark = new SparkMD5.ArrayBuffer();
        
    var fr = new FileReader();

    var readNextChunk = function() {
        var start = currentChunk * chunkSize;
        var end = Math.min(start + chunkSize, file.size);
        fr.readAsArrayBuffer(blobSlice.call(file, start, end));
    };

    fr.onload = function (e) {
        spark.append(e.target.result);
        ++currentChunk;

        if (currentChunk < chunks) {
            callback(file, currentChunk * chunkSize);
            readNextChunk();
        } else {
            callback(file, file.size, spark.end());
        }
    };

    fr.onerror = function () {
        console.warn("Error reading file during incremental MD5 hashing.");
    };

    readNextChunk();
}

function showProgress(fraction) {
    var percentage = Math.floor(fraction * 10000) / 100;
    $('input[name="message"]').prop("disabled", true);
    if (percentage >= 50) {
        $('input[name="message"]').css("background", "linear-gradient(90deg, #add8e6 " + percentage + "%, #ffffff " + (100 - percentage) + "%)");
    } else {
        $('input[name="message"]').css("background", "linear-gradient(-90deg, #ffffff " + (100 - percentage) + "%, #add8e6 " + percentage + "%)");
    }
    $('input[name="message"]').val(percentage + "% complete...");
}

function finishedHash(hash) {
    $('input[name="message"]').css("background", "none");
    $('input[name="message"]').val(hash);
    $('input[name="message"]').prop("disabled", false);
}
