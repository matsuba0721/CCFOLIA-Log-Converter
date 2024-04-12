const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const option = document.getElementById("option");
const optiontable = document.getElementById("optiontable");
const output = document.getElementById("output");

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
	while (optiontable.firstChild) {
		optiontable.removeChild(optiontable.firstChild);
	}
	output.style.display = "none";
	while (output.firstChild) {
		output.removeChild(output.firstChild);
	}
	option.style.display = "none";

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
			const style = document.querySelector("#log > p:nth-child(" + index + ")").style;
			if (prev.name != name) {
				const aggregatedLog = new Object();
				aggregatedLog.name = name;
				aggregatedLog.text = text;
				prev = aggregatedLog;
				const id = aggregatedLogs.push(aggregatedLog);
				const user = new Object();
				user.id = `user-${id}`;
				user.color = style.color;
				users[name] = user;
			} else {
				prev.text += "<br>" + text;
			}
		}
		Object.keys(users)
			.sort()
			.forEach((name) => {
				const user = users[name];
				const userTr = document.createElement("tr");
				userTr.style.height = "2.2em";
				optiontable.appendChild(userTr);

				const displayTd = document.createElement("td");
				userTr.appendChild(displayTd);
				const displayCheck = document.createElement("input");
				displayCheck.type = "checkbox";
				displayCheck.id = "option-" + user.id;
				displayCheck.name = "option-" + user.id;
				displayCheck.value = name;
				displayCheck.checked = true;
				displayTd.appendChild(displayCheck);
				const displayCheckLabel = document.createElement("label");
				displayCheckLabel.id = "option-label-" + user.id;
				displayCheckLabel.htmlFor = "option-" + user.id;
				displayCheckLabel.innerText = name;
				displayCheckLabel.style.color = user.color;
				displayCheckLabel.style.fontWeight = "bold";
				displayTd.appendChild(displayCheckLabel);

				displayCheck.onclick = function (event) {
					const name = event.target.value;
					const id = user.id;
					const messages = document.getElementsByClassName(id);
					for (let index = 0; index < messages.length; index++) {
						const element = messages[index];
						element.style.display = event.target.checked ? "" : "none";
					}
					const check = document.getElementById("option-label-" + id);
					check.style.textDecoration = event.target.checked ? "none" : "line-through";
				};

				const previewTd = document.createElement("td");
				userTr.appendChild(previewTd);
				const previewBox = document.createElement("div");
				previewBox.id = "option-preview-" + user.id;
				previewBox.innerHTML = "Ccふぉリ亜";
				previewBox.style.width = "7em";
				previewBox.style.color = user.color;
				previewBox.style.backgroundColor = "#444";
				previewBox.style.boxShadow = "2px 2px 0px #aaa";
				previewTd.appendChild(previewBox);

				const displayrColorTd = document.createElement("td");
				userTr.appendChild(displayrColorTd);
				const colorCodes = ["#222222", "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#607D8B", "#9E9E9E", "#E0E0E0"];
				colorCodes.forEach((colorCode) => {
					const colorButton = document.createElement("div");
					colorButton.value = user.id;
					colorButton.name = "option-group-" + user.id;
					colorButton.style.backgroundColor = colorCode;
					colorButton.style.width = "1.5em";
					colorButton.style.height = "1.5em";
					colorButton.style.float = "left";
					colorButton.style.margin = "2px";
					displayrColorTd.appendChild(colorButton);

					colorButton.onclick = function (event) {
						const id = event.target.value;
						const label = document.getElementById("option-label-" + id);
						label.style.color = event.target.style.backgroundColor;
						const preview = document.getElementById("option-preview-" + id);
						preview.style.color = event.target.style.backgroundColor;

						const messages = document.getElementsByClassName(id);
						for (let index = 0; index < messages.length; index++) {
							const element = messages[index];
							element.style.color = event.target.style.backgroundColor;
						}
					};
				});
				displayrColorTd.lastChild.checked = true;
			});

		const chat = document.createElement("chat");
		chat.id = "chat";
		output.appendChild(chat);

		const messages = document.createElement("ul");
		messages.className = "message";
		chat.append(messages);
		aggregatedLogs.forEach((log) => {
			const message = document.createElement("li");
			message.className = users[log.name].id;
			message.style.color = users[log.name].color;

			messages.append(message);

			const name = document.createElement("div");
			name.innerText = log.name;
			message.append(name);
			const text = document.createElement("p");
			text.innerHTML = log.text;
			message.append(text);
		});

		output.style.display = "";
		option.style.display = "";
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
