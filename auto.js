// let isfirst = true;
if(window.location.href.indexOf("1688.com")!=-1){
  $(document).ready(function(){
  var a = document.createElement("script");
  a.text = '$(".tab-pane").parent().parent().unbind("contextmenu");$(".tab-pane").parent().parent().off("contextmenu");';
  document.getElementsByTagName("head")[0].appendChild(a);
  });
}else{
  var basecode = getBase64Image(document.getElementsByTagName("img")[0]);
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      var img = document.getElementsByTagName("img")[0];
      sendResponse(basecode);
  });
}
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    var dataURL = canvas.toDataURL("image/" + ext);
    return dataURL;
}