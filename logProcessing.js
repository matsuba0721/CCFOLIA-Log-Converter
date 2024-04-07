const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const output = document.getElementById("output");
const chat = document.getElementById("chat");

const option = document.getElementById("option");
const downloadButton = document.getElementById("downloadLink");

// ドロップゾーンにdragoverイベントが発生した時に、デフォルトのイベントをキャンセルする
dropZone.addEventListener("dragover", (e) => {
	e.stopPropagation();
	e.preventDefault();
});
dropZone.addEventListener("dragleave", (e) => {
	e.stopPropagation();
	e.preventDefault();
});

function highlight(startString, endString, fontcolor) {
	// HTMLのすべてのテキストノードを取得
	var textNodes = getTextNodes();

	// テキストノードを検索して、AとBの文字列の間をハイライト
	for (var i = 0; i < textNodes.length; i++) {
		var node = textNodes[i];
		var nodeText = node.textContent;
		var startIndex = nodeText.lastIndexOf(startString);
		if (startIndex >= 0) {
			var endIndex = nodeText.indexOf(endString, startIndex + startString.length);
			if (endIndex >= 0) {
				// AとBの文字列の間をハイライトするスパン要素を作成
				var highlight = document.createElement("span");
				highlight.style.color = fontcolor;
				highlight.appendChild(document.createTextNode(nodeText.substring(startIndex, endIndex + endString.length)));

				// AとBの文字列の間をハイライトする前に、Aより前の文字列を保持するテキストノードを作成
				var before = document.createTextNode(nodeText.substring(0, startIndex));

				// AとBの文字列の間をハイライトする前に、Bより後の文字列を保持するテキストノードを作成
				var after = document.createTextNode(nodeText.substring(endIndex + endString.length));

				// Aより前の文字列を保持するテキストノードを追加
				node.parentNode.insertBefore(before, node);

				// ハイライトされたスパン要素を追加
				node.parentNode.insertBefore(highlight, node);

				// Bより後の文字列を保持するテキストノードを追加
				node.parentNode.insertBefore(after, node);

				// 元のテキストノードを削除
				node.parentNode.removeChild(node);
			}
		}
	}
}

// HTMLのすべてのテキストノードを取得する関数
function getTextNodes() {
	var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
	var node;
	var textNodes = [];
	while ((node = walker.nextNode())) {
		textNodes.push(node);
	}
	return textNodes;
}

function handleSelect(files) {
	// ファイルを処理する...
	if (document.querySelector("#log")) {
		document.querySelector("#log").remove();
		document.querySelector("style").remove();
	}
	document.querySelector("#downloadLink").style.display = "inline-block";
	const file = files[0];
	if (file == undefined) {
		document.querySelector("#downloadLink").style.display = "none";
		return;
	}
	const reader = new FileReader();
	reader.readAsText(file);

	reader.onload = () => {
		const div = document.createElement("div");
		div.id = "log";
		div.style.maxWidth = "100%";
		div.style.display = "none";
		div.innerHTML = reader.result;
		output.appendChild(div);

		const aggregatedLogs = [];
		const users = new Object();
		for (let index = 5, prev = { name: "", text: "" }; document.querySelector("#log > p:nth-child(" + index + ")"); index++) {
			const name = document.querySelector("#log > p:nth-child(" + index + ") > span:nth-child(2)").textContent.trim();
			const text = document.querySelector("#log > p:nth-child(" + index + ") > span:nth-child(3)").innerHTML;
			if (prev.name != name) {
				const aggregatedLog = new Object();
				aggregatedLog.name = name;
				aggregatedLog.text = text;
				prev = aggregatedLog;
				const id = aggregatedLogs.push(aggregatedLog);
				users[name] = `user-${id}`;
			} else {
				prev.text += "<br>" + text;
			}
		}

		const messages = document.createElement("ul");
		messages.className = "message";
		chat.append(messages);
		aggregatedLogs.forEach((log) => {
			const message = document.createElement("li");
			message.className = users[log.name];
			messages.append(message);

			const name = document.createElement("div");
			name.innerText = log.name;
			message.append(name);
			const text = document.createElement("p");
			text.innerHTML = log.text;
			message.append(text);
		});
	};
}
dropZone.addEventListener("drop", function (e) {
	e.stopPropagation();
	e.preventDefault();
	let files = e.dataTransfer.files;
	handleSelect(files);
});

fileInput.addEventListener("change", function () {
	handleSelect(this.files);
});

function htmlDownload(event) {
	event.preventDefault();
	const date = new Date();
	const style = document.querySelector("style").innerHTML;
	let html =
		'<!DOCTYPE html><html style="background: #222;"><head><style>.chatlog span{-webkit-text-size-adjust:none}footer button::after {content: "";position: absolute;width: 100%;height: 100%;top: 0;left: 0;background: radial-gradient(circle, #fff 10%, transparent 10%) no-repeat 50%;transform: scale(10, 10);opacity: 0;transition: transform 0.3s, opacity 1s;}footer button:active::after {transform: scale(0, 0);transition: 0s;opacity: 0.3;}' +
		style +
		'</style><meta charset="UTF-8"><title>' +
		String(date.getFullYear()) +
		String(Number(date.getMonth() + 1)) +
		String(date.getDate()) +
		String(date.getHours()) +
		String(date.getMinutes()) +
		String(date.getSeconds()) +
		'</title><link href="https://fonts.googleapis.com/css?family=Sawarabi+Gothic" rel="stylesheet"></script></head><body>';
	html += document.querySelector("#chat").innerHTML;
	html +=
		'</body><script>for (let tab of document.querySelectorAll(".tab")) {tab.addEventListener("click", function(e){\ntabView(e,tab.id)\n})\ntab.addEventListener("touchstart",function(e){\ntabView(e,tab.id)\n})\n}\nfunction tabView(event,tab){\nevent.preventDefault();\nfor (let elm of document.querySelectorAll(".chatlog")) {\nif (elm.className.includes(tab)) {\nelm.style.display = "flex"\n} else {\nelm.style.display = "none"\n}\n}\n}\n</script></html>';
	const textFile = new Blob([html], { type: "text/html" });
	const downloadUrl = URL.createObjectURL(textFile);
	const downloadLink = document.createElement("a");
	downloadLink.href = downloadUrl;
	downloadLink.download = String(date.getFullYear()) + String(Number(date.getMonth() + 1)) + String(date.getDate()) + String(date.getHours()) + String(date.getMinutes()) + String(date.getSeconds()) + ".html";
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
}

downloadButton.addEventListener("click", htmlDownload);
downloadButton.addEventListener("touchend", htmlDownload);
