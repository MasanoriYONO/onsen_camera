// This is a JavaScript file

var f_read_flag = 0;
var saved_photo_filename = "";
var saved_photo_directory = "net.masanoriyono.shizugas.camera";
var image_tag = "";
var photo_div = "";
var saved_date = "";
var array_picture = [];
var update_div = "";
var update_div_id = 0;
var delete_id = 0;
var confirm_id = 0;
var remove_photo_filename;
var saved_location = "";
var photo_id = 0;
var f_file = false;
var image_directory = "";
var view_title = "";

function photo(id, divisoin, recdate, recloc, filename){
    this.id = id;
    this.division = divisoin;
    this.recdate = recdate;
    this.recloc = recloc;
    this.filename = filename;
}

function view_detail(index){
    var options = {path: image_directory + array_picture[index].filename, id:index, title:array_picture[index].division};
    myNavigator.pushPage('page_photo_detail.html', options);
}

$(document).on('pageinit', '#page_photo_detail', function(event) {
    var page = myNavigator.getCurrentPage();
    pd_id = page.options.id; 
    $("#v_title").empty();
    $("#v_title").text(page.options.title);
    
    $("#camera_pic").empty();
    $("#camera_pic").attr("src",page.options.path);
});

function modify_div(id){
    confirm_id = id
    
    navigator.notification.confirm(
            "削除しますか？", 
            deleteCallback, 
            "この写真を削除", 
            ["OK","キャンセル"]);
    
}

function deleteCallback(buttonIndex){
    if(buttonIndex == 1){
        delete_id = array_picture[confirm_id].id;
        console.log("deleteCallback:" + delete_id);
        
        deleteMemo(delete_id);
        
        get_photo_list();
        
    }
}

function get_photo_list(){
    console.log("get_photo_list.");
    // 配列の初期化
    array_picture = [];
    
    var list = getMemoList();
    var str="";
    
    for(var i = 0 ; i < list.length; i++){
        
        // console.log(list[i].time);
        // console.log(list[i].text);
        // console.log(list[i].path);
        
        str += "time: " + list[i].time + "\n"
            + "division: " + list[i].text + "\n"
            + "path: " + list[i].path + "\n\n";
            
        var filepath = list[i].path.split("/");
        console.log(filepath[filepath.length-1]);
            
        var temp_photo = new photo(list[i].time,
                        list[i].text,
                        list[i].time,
                        "no loc",
                        // list[i].path);
                        filepath[filepath.length-1]);
        
        array_picture.push(temp_photo);
    }
        
    
    
    if(str){
        // console.log(str);
        
        for(var i=0; i < array_picture.length; i++){
            console.log(array_picture[i].id);
            console.log(array_picture[i].division);
            console.log(array_picture[i].recdate);
            console.log(array_picture[i].recloc);
            console.log(array_picture[i].filename);
        }
    }
    
    var picture_list = new PictureList();
    picture_list.load();
}

////撮影
function camera() {
    console.log("camera.");
    
    navigator.camera.getPicture(camera_getPictureSuccess, camera_failCamera,
    {
        quality: 75,
        destinationType: Camera.DestinationType.File_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        saveToPhotoAlbum: true,
        correctOrientation:true
    });
}
// 撮影で成功した時。
function camera_getPictureSuccess(uri) {
    console.log("camera_getPictureSuccess.");
    //一時ファイルをギャラリーに保存する。
    console.log("uri:" + uri);
    
    window.resolveLocalFileSystemURL(uri, camera_moveToPersistent, camera_failFS);
}

function camera_moveToPersistent(fileEntry) {
    console.log("camera_moveToPersistent.");
    // ファイル移動時に名前をつけるようにする。20150821
    var m = moment();
    saved_photo_filename = m.format("YYYYMMDD_HHmmss") + ".jpg";
    ////
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
        //The folder is created if doesn't exist
        fileSys.root.getDirectory( 
                    saved_photo_directory
                    ,{create:true, exclusive: false}
                    ,function(directory) {
                        // fileEntry.moveTo(directory, saved_photo_filename,  camera_moveToSuccess, camera_failFS);
                        fileEntry.copyTo(directory, saved_photo_filename,  camera_moveToSuccess, camera_failFS);
                    }
                    ,camera_failFS);
    },camera_failFS);
    
    /* 
    iOSではシステムの一時フォルダからアプリのフォルダへ移動する際に
    fileEntry.nameにcdv_photo_001.jpgという毎回同じファイル名をセットしてきていた。
    そのため複数枚のリスト表示をする際にもDBには同じレコードが複数存在するのに
    ファイル実体は移動時に毎回上書きされてしまうために1つしか存在せず
    同じ画像ファイルがいくつも表示される、という状況になっていた。
    
    Androidでは命名規則は機種依存だと思う。未確認。ASUSはUnixタイムスタンプをつける機種だった。
    他の機種はIMG_XXX.JPGなどの名前かもしれない。
    
    両方のOSでファイル名規則は時間にして移動時にリネームすることにした。
    以下は変更前のコード。fileEntry.nameをそのまま使用していた。
    */
    // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
    //     //The folder is created if doesn't exist
    //     fileSys.root.getDirectory( 
    //                 saved_photo_directory
    //                 ,{create:true, exclusive: false}
    //                 ,function(directory) {
    //                     fileEntry.moveTo(directory, fileEntry.name,  camera_moveToSuccess, camera_failFS);
    //                 }
    //                 ,camera_failFS);
    // },camera_failFS);
    
}

function camera_moveToSuccess(fileEntry) {
    console.log("camera_moveToSuccess.");
    
    // alert('画像ファイル「' + fileEntry.name + '」を移動しました。\n' + fileEntry.fullPath);
    $('#camera_pic')
        .css('display', 'block')
        .attr('src', image_directory + saved_photo_filename);
    
    // ファイル移動時に名前をつけるように変更。20150821
    // photo_data = fileEntry.name;
    // saved_photo_filename = fileEntry.name;
    
    // TODO:撮影日時の取得と格納。
    var m = moment();
    saved_date = m.format("YYYY-MM-DD HH:mm:ss");
    console.log(saved_date);
    
    navigator.notification.prompt(
        "この写真の説明を入力してください。", 
        promptCallback, 
        "入力してください", 
        ["OK","キャンセル"],
        "写真の説明");        
}

function promptCallback(results){
    if(results.buttonIndex == 1){
        photo_div = results.input1;
        
        $("#v_title").text(photo_div);
        $('#saved_date').text(saved_date);
        $("#view_date").css('display', 'block');
        
        addMemo(photo_div, saved_date, image_directory + saved_photo_filename);
        
    }
}


function camera_failCamera(message) {
    console.log("camera_failCamera.");
    
    console.log('カメラ操作に失敗しました。\n' + message);
}

function camera_failFS(error) {
    console.log("camera_failFS.");
    
    console.log('ファイルシステム操作に失敗しました。\nエラーコード: ' + error.code);
}

//+++++++　read image　+++++++
function camera_readImageFile(dest_tag){
    console.log("camera_readImageFile");
    image_tag = dest_tag;
    
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, camera_gotDIR_R_Image, camera_fail);
}

function camera_gotDIR_R_Image(fileSystem) {
    console.log("camera_gotDIR_R_Image");
    
    fileSystem.root.getDirectory(saved_photo_directory, {create: true}, camera_gotFS_R_Image, camera_fail);
    
}

function camera_gotFS_R_Image(dirEntry) {
    console.log("camera_gotFS_R_Image");
    console.log(saved_photo_filename);
    
    dirEntry.getFile(saved_photo_filename, {create: true}, camera_gotFileEntry_R_Image, camera_fail);
    
    image_directory = dirEntry.nativeURL;
    console.log("image_directory:" + image_directory);
}
        
function camera_gotFileEntry_R_Image(fileEntry) {
    console.log("camera_gotFileEntry_R_Image");
    
    fileEntry.file(camera_gotFile_Image, camera_fail);
}
        
function camera_gotFile_Image(file){
    console.log("camera_gotFile_Image");
    
    camera_readAsDataURL(file);
}
        
function camera_readAsDataURL(file) {
    console.log("camera_readAsDataURL");
    
    var reader = new FileReader();
    reader.onloadstart = function(evt) {
        f_read_flag++;
    };
    reader.onloadend = function(evt) {
        var saved_data = evt.target.result;
        
        if(image_tag != ""){
            myNavigator.on('postpush', function(e) {
                $(e.enterPage.element).find("#saved_date").text(saved_date);
                // $(e.enterPage.element).find("#saved_location").text(saved_location);
                $(e.enterPage.element).find("#camera_pic").attr('src', saved_data);
                
                $(e.enterPage.element).find("#camera_pic").css('display', 'block');
                $(e.enterPage.element).find("#view_date").css('display', 'block');
            });
        }
    };
    reader.readAsDataURL(file);
}


// error
function camera_fail(error) {
    console.log("camera_fail:" + error.code);
}


// +++++++　remove image file　+++++++
// ファイルを削除する。
function camera_removeImageFile(){
    console.log("camera_removeImageFile.");
    
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, camera_gotDIR_R_removeImage, camera_failFS);
}

function camera_gotDIR_R_removeImage(fileSystem) {
    console.log("camera_gotDIR_R_removeImage.");
    
    fileSystem.root.getDirectory(saved_photo_directory, {create: false}, camera_gotFS_R_removeImage, camera_failFS);
    
}

function camera_gotFS_R_removeImage(dirEntry) {
    console.log("camera_gotFS_R_removeImage.");
    
    var filename = remove_photo_filename;
    console.log(remove_photo_filename);
    
    dirEntry.getFile(remove_photo_filename, {create: false}, camera_gotFileEntry_R_removeImage, camera_failFS);
}
        
function camera_gotFileEntry_R_removeImage(fileEntry) {
    console.log("camera_gotFileEntry_R_removeImage.");
    
    fileEntry.remove(camera_gotFile_removeImage, camera_failFS);
}

function camera_gotFile_removeImage(file){
    console.log("camera_gotFile_removeImage.");
}