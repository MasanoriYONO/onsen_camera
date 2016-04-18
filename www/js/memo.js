///// Return list of memo
function getMemoList() {
    console.log("getMemoList.");
    
    var list = localStorage.getItem("photo_memo_list");
    if (list == null) {
        return new Array();
    } else {
        return JSON.parse(list);
    }
}

///// Save memo
function saveMemoList(list) {
    console.log("saveMemoList.");
    
    try {
        localStorage.setItem("photo_memo_list", JSON.stringify(list));
    } catch (e) {
        alert('Error saving to storage.');
        throw e;
    }
}

///// Add memo
function addMemo(t_memo, phtoto_time, file_path) {
    console.log("addMemo.");
    
    var list = getMemoList();
    list.push({ id: phtoto_time, time: phtoto_time, text: t_memo, path: file_path });
    saveMemoList(list);
}

///// Delete specified memo
function deleteMemo(id) {
    console.log("deleteMemo.");
    
    var list = getMemoList();
    for (var i in list) {
        if (list[i].id == id) {
            var filepath = list[i].path.split("/");
            console.log(filepath[filepath.length-1]);
            remove_photo_filename = filepath[filepath.length-1];
            camera_removeImageFile();
            list.splice(i, 1);
            
            break;  // Quit for loop when found
        }
    }
    saveMemoList(list);
}