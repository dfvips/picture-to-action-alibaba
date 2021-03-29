var optId = chrome.contextMenus.create({
		"title" : chrome.i18n.getMessage("title"),
		"contexts" : ["image"],
		"onclick" : search
	});

function search(info, tab) {
	var url = info.srcUrl;
	if(url.indexOf("alicdn.com")!=-1){
	   	url = url.replace(/.(\d+x\d+).*|.jpg_(\d+x\d+).*/,'.jpg')
	}
	var fName = url.substring(url.lastIndexOf('/') + 1);
	if(!url.startsWith("file")){
	var getxhr = new XMLHttpRequest();
	getxhr.open('GET', url, true);
	getxhr.responseType = 'arraybuffer';
	getxhr.onreadystatechange = function (e) {
		if (getxhr.readyState === 4 && getxhr.status === 200) {
			contentType = getxhr.getResponseHeader('Content-Type');
			if (contentType === 'image/jpeg' || contentType == 'image/png') {
				uploadImage(getxhr.response, tab, fName, contentType);
			} else {
				var blob = new Blob([new Uint8Array(getxhr.response)], {
						type : contentType
					});
				var url = URL.createObjectURL(blob);
				var img = new Image();
				img.onload = function () {

					var canvas = document.createElement("canvas");
					canvas.width = this.width;
					canvas.height = this.height;
					var ctx = canvas.getContext("2d");
					ctx.drawImage(this, 0, 0);
					var imagedata = canvas.toDataURL("image/jpeg");
					imagedata = imagedata.replace(/^data:image\/(png|jpeg);base64,/, "");
					bimageData = base64DecToArr(imagedata).buffer;
					uploadImage(bimageData, tab, fName, "image/jpeg")
				}
				img.src = url;
			}
		} else if (getxhr.readyState === 4 && getxhr.status !== 200) {
			console.log("图片访问异常" + getxhr.status);
		}
	};
	getxhr.send();

}else{
			chrome.tabs.query({
			  active: true,
			  currentWindow: true
			}, (tabs) => {
			  let message = {
			    //这里的内容就是发送至content-script的内容
			    info: info.srcUrl
			  }
			  chrome.tabs.sendMessage(tabs[0].id, message, res => {
			    console.log('bg=>content')
			    var imagedata = res;
			    imagedata = imagedata.replace(/^data:image\/(png|jpeg);base64,/, "");
				bimageData = base64DecToArr(imagedata).buffer;
				uploadImage(bimageData, tab, fName, "image/jpeg");
			  })
			})
}
}

// function gettoken(img, tab, fName, imgType){
//     var xhr = new XMLHttpRequest();
// 	xhr.open('POST', 'https://open-s.1688.com/openservice/ossDataService?appName=pc_tusou&appKey='
// 				+ encodeBase64('ossDataService;' + new Date().getTime()), true);
// 	// xhr.open('POST', 'https://stream-upload.taobao.com/api/upload.api?appkey=1688search&folderId=0&_input_charset=utf-8&useGtrSessionFilter=false');
// 	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
// 	xhr.setRequestHeader('X-Requested-with', 'XMLHttpRequest');
// 	xhr.setRequestHeader('Cache-Control', 'no-cache');
// 	xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*;q=0.01');

// 	xhr.onload = function (e) {
// 		if (xhr.readyState === 4 && xhr.status === 200) {
// 			var d = JSON.parse(xhr.response);
// 			if (d.msg === 'OK') {
// 				d = d.data;
// 				uploadImage(img, tab, fName, "image/jpeg",d.accessid,d.policy,d.signature);
// 			}
// 		} else if (xhr.readyState === 4 && xhr.status !== 200) {
// 			console.log("未知错误");
// 		}
// 	};
// 	xhr.timeout = 5000; // s seconds timeout, is too long?
//     xhr.ontimeout = function () { console.log("请求超时"); }
// 	xhr.send();
// }

function encodeBase64(){
	var encode = encodeURI(new Date().getTime());
	var base64 = btoa(encode);
	return base64;
}

function randomString(e) {
    e = e || 32;
    for (var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678", n = t.length, r = "", o = 0; o < e; o++)
        r += t.charAt(Math.floor(Math.random() * n));
    return "cbuimgsearch/" + r + Date.parse((new Date).toDateString());
}
// function uploadImage(img, tab, fName, imgType,accessid,policy,signature) {
 function uploadImage(img, tab, fName,imgType) {
 	fName="a.jpg";
	var imgLength = img.byteLength;
	var xhr = new XMLHttpRequest();
	var boundary = 'moxieboundary'+ new Date().getTime();
	// xhr.open('POST', 'https://cbusearch.oss-cn-shanghai.aliyuncs.com/', true);
	xhr.open('POST', 'https://stream-upload.taobao.com/api/upload.api?appkey=1688search&folderId=0&_input_charset=utf-8&useGtrSessionFilter=false');
	xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
	xhr.setRequestHeader('X-Requested-with', 'XMLHttpRequest');
	xhr.setRequestHeader('Cache-Control', 'no-cache');
	xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*;q=0.01');

	xhr.onload = function (e) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			// if(xhr.response!=undefined){
				var url = JSON.parse(xhr.response).object.url;
				url = url.substring(url.lastIndexOf("/")+1);
				chrome.tabs.create({
					url : "https://s.1688.com/youyuan/index.htm?tab=imageSearch&imageAddress="+ url+"&spm="
					// url : 'https://s.1688.com/youyuan/index.htm?tab=imageSearch&imageType=oss&imageAddress='+ key
				});
			// }
		} else if (xhr.readyState === 4 && xhr.status !== 200) {
			console.log("请求失败" + xhr.status);
		}
	};
	var CRLF = "\r\n";
	var request = "--" + boundary + CRLF;
	var blob = new Blob([new Uint8Array(img)], {
			type : imgType
		});
	var reader = new FileReader();
	reader.onloadend = function () {
		request += 'Content-Disposition: form-data; name=\"name\"\r\n\r\n'+ fName+CRLF;
		request += "--" + boundary + CRLF;
		// request += 'Content-Disposition: form-data; name=\"key\"\r\n\r\n' + key+CRLF;
		// request += "--" + boundary + CRLF;
		request += 'Content-Disposition: form-data; name=\"success_action_status\"\r\n\r\n200'+CRLF;
		request += "--" + boundary + CRLF;
		request += 'Content-Disposition: form-data; name=\"file\"; filename=\"' + fName + '\"' + CRLF;
		request += "Content-Type: " + imgType + CRLF + CRLF;
		request += reader.result+ CRLF + CRLF;
		request += "--" + boundary + "--";

		var nBytes = request.length,
		ui8Data = new Uint8Array(nBytes);
		for (var nIdx = 0; nIdx < nBytes; nIdx++) {
			ui8Data[nIdx] = request.charCodeAt(nIdx) & 0xff;
		}
		xhr.timeout = 5000; // s seconds timeout, is too long?
		// data.append("file", ui8Data);
        xhr.ontimeout = function () { console.log("查询超时，请稍后重试!"); }
        // xhr.send(data);
		xhr.send(ui8Data);
	}
	reader.readAsBinaryString(blob);
}

function base64DecToArr(sBase64, nBlocksSize) {

	var
	sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
	nInLen = sB64Enc.length,
	nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
	taBytes = new Uint8Array(nOutLen);

	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3;
		nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
				taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
			}
			nUint24 = 0;
		}
	}

	return taBytes;
}
function b64ToUint6(nChr) {

	return nChr > 64 && nChr < 91 ?
	nChr - 65
	 : nChr > 96 && nChr < 123 ?
	nChr - 71
	 : nChr > 47 && nChr < 58 ?
	nChr + 4
	 : nChr === 43 ?
	62
	 : nChr === 47 ?
	63
	 :
	0;

}

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    details.requestHeaders.push({
        name:"Referer",
        value:"https://s.1688.com"
    });
    details.requestHeaders.push({
        name:"Origin",
        value:"https://s.1688.com"
    });
    return {
        requestHeaders: details.requestHeaders
    };
},
    {
        urls: ["https://s.1688.com/*","https://cbusearch.oss-cn-shanghai.aliyuncs.com/*","https://open-s.1688.com/*"]
    },
    ["blocking", "requestHeaders", "extraHeaders"]
);