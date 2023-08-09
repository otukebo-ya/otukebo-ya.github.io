// 応答の定義（ハッシュ）    
var response1 = {
	"子供用":["こどもようにかわるよ"],
	"大人用":["大人用の表示です"],
	"ひらがな":["こどもようにかわるよ"],
	"エレベーター,階段,トイレ,AED":["エレベーターの場所はこちらです","階段の場所はこちらです","トイレの場所はこちらです","AEDの場所はこちらです"],
	"1階,1回":["1階の地図はこちらです","１階のことでしょうか？１階の地図はこちらです"],
	"2階,2回":["2階の地図はこちらです","２階のことでしょうか？２階の地図はこちらです"],
	"入り口,第一展示室,第2展示室,ショップ,お土産,エントランス,ロッカー,案内,現在地":["入り口はこちらです","第一展示室はこちらです","第二展示室はこちらです",
		"ミュージアムショップはこちらです","おみやげはミュージアムショップで購入できます。\nミュージアムショップはこちらです","エントランスホールはこちらです","ロッカーはこちらです",
		"総合案内所はこちらです","現在地はこちらです"],
	"休憩,疲れた,企画,体験,事務,学芸員":["休憩室はこちらです","お疲れ様です休憩されてはいかがですか？\n休憩室は二階のこちらです","企画展示室はこちらです","体験学習室はこちらです",
		"事務・学芸員室はこちらです","事務・学芸員室はこちらです"],
	"天気":["今のお天気は"]
};

var response2 = {
	"子供用":["こどもようのひょうじだよ"],
	"大人用":["大人用に変わります"],
	"ひらがな":["ひらがなのひょうじだよ"],
	"エレベーター,階段,トイレ,AED":["えれべーたーはここにあるよ","かいだんはここにあるよ","といれはここにあるよ","えーいーでぃーはここにあるよ"],
	"1階,1回":["1かいのちずはこちれだよ","1かいのちずはこちれだよ"],
	"2階,2回":["２かいのちずはこれだよ","2かいのちずはこちれだよ"],
	"入り口,第一展示室,第2展示室,ショップ,お土産,エントランス,ロッカー,案内,現在地":["いりぐちはここだよ","だいいちてんじしつはここだよ","だいにてんじしつはここだよ",
		"ミュージアムショップはここだよ","おみやげはミュージアムショップにうっているよ。\nミュージアムショップはここだよ","エントランスホールはここだよ","コインロッカーはここだよ",
		"総合案内所はこちらです","現在地はこちらです"],
	"休憩,疲れた,企画,体験,事務,学芸員":["きゅうけいしつはここだよ","おつかれ、きゅうけいしなくてだいじょうぶ？\nきゅうけいしつはにかいのここにあるよ","きかくてんじしつはここだよ","たいけんがくしゅうしつはここだよ",
		"じむ・がくげいいんしつはここだよ","じむ・がくげいいんしつはここだよ"],
	"天気":["いまのおてんきは"]
};

// yahooapiのキー
const furiganaURL = "https://jlp.yahooapis.jp/FuriganaService/V2/furigana?appid=";
const weatherURL = "https://map.yahooapis.jp/weather/V1/place?appid=";
const APPID = "dj00aiZpPUw3VlJLSjBxd0hBcyZzPWNvbnN1bWVyc2VjcmV0Jng9OTI-"; // あなたのアプリケーションID
const queryFuriganaURL = furiganaURL + APPID;
const queryWeatherURL = weatherURL + APPID;

const startButton = document.querySelector('#startButton'); // 開始ボタン
const stopButton = document.querySelector('#stopButton'); // 停止ボタン
const resultOutput = document.querySelector('#resultOutput'); // 結果出力エリア
const adultOrChild = document.querySelector('#adultOrChild'); // 子供/大人用ボタン

let child=false;

if (!'SpeechSynthesisUtterance' in window) {
    alert("あなたのブラウザはSpeech Synthesis APIに未対応です。");
}

const tts = new SpeechSynthesisUtterance(); // TTSインスタンスを生成
//tts.text = textForm.value; // テキストを設定
tts.lang = "ja-JP"; // 言語(日本語)、英語の場合はen-US
tts.rate = 1.3; // 速度
tts.pitch = 1.0; // 声の高さ
tts.volume = 1.0; // 音量

SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
if (!'SpeechRecognition' in window) {
    alert("あなたのブラウザはSpeech Recognition APIに未対応です。");
}

const asr = new SpeechRecognition(); // ASRインスタンスを生成
asr.lang = "ja-JP"; // 言語（日本語）
asr.interimResults = true; // 途中結果出力をオン
asr.continuous = true; // 継続入力をオン

let output = ''; // 出力
// 認識結果が出力されたときのイベントハンドラ
asr.onresult = async function(event) {
	let transcript = event.results[event.resultIndex][0].transcript; // 結果文字列
	let answer = false;
	let weather='';
	let output_not_final = '';

	if (event.results[event.resultIndex].isFinal) { // 結果が確定（Final）のとき
		asr.abort(); // 音声認識を停止
		let keys = Object.keys(response1);
		let img="";
		for (const key of keys) {
			let flag = 0;
			let wordNum = 1;
			for (const word of key.split(',')) {
				let pattern = new RegExp(word);
				let flag_test = pattern.test(transcript);
				if(flag_test){
					flag = 0 + wordNum;
				}
				wordNum++;
			}
			if(flag>0){
				answer = true;
				
				//天気を聞かれたら、天気を答える
				if(key=="天気"){
					weather= await tellNowWeather();
				}
				
				//子供用ならば文字をひらがなに
				if (child) {
					let hiragana = await makeHiraganaText(transcript);
					outputY = '<div class="yourOutput">' + hiragana + '</div>' + '<br>';
					outputM = '<div class="naviOutput">' + response2[key][flag-1]+weather;
				} else {
					outputY = '<div class="yourOutput">' + transcript + '</div>' + '<br>';
					outputM = '<div class="naviOutput">' + response1[key][flag-1]+weather;
				}
				 
				if(transcript.includes("2階")&&key.includes("エレベーター")){
					img = showMap(2,flag);
				}else if(key.includes("エレベーター")){
					img = showMap(1,flag);
				}else if(key.includes("2階")){
					img="<div class='map'><img class='mapImage' src='images/map2.png'/></div>";
				}else if(key.includes("1階")){
					img="<div class='map'><img class='mapImage' src='images/map.png'/></div>";
				}else if(key.includes("入り口")){
					img=show1Froom(flag);
				}else if(key.includes("休憩")){
					img=show2Froom(flag);
				}
				
				// 大人/子ども用の切り替え
				changeAdultOrChild(key);
				break;
			}
		}
	
	//答えられない回答
    if (!answer && transcript!=undefined) {
		if (child) {
			let hiragana = await makeHiraganaText(transcript);
			outputY = '<div class="yourOutput">' + hiragana + '</div>' + '<br>';
			outputM = '<div class="naviOutput">' + "ごめんね。そのしつもんはわからないよ。";
        } else {
			outputY = '<div class="yourOutput">' + transcript + '</div>' + '<br>';
			outputM = '<div class="naviOutput">' + "ごめんなさい。その質問はわからないよ。";
		}
    }

    resultOutput.innerHTML = output+outputY + outputM + '</div>'+img;
	resultOutput.scrollIntoView(false);
    output += outputY + outputM + '</div>' + '<br>'+img;
    tts.text = outputM;

    tts.onend = function(event) {
      asr.start(); // 音声認識を再開
    }

    speechSynthesis.speak(tts); // 再生
	} else { // 結果がまだ未確定のとき
		if(child){
			let hiragana = await makeHiraganaText(transcript);
			output_not_final = '<div class="yourOutput">' + '<span style="color:#ddd;">' + hiragana + '</span></div>';
			resultOutput.innerHTML = output+output_not_final;
			resultOutput.scrollIntoView(false);
		}else{
			output_not_final = '<div class="yourOutput">' + '<span style="color:#ddd;">' + transcript + '</span></div>';
			resultOutput.innerHTML = output+output_not_final;
			resultOutput.scrollIntoView(false);
	  }
  }
}

// 開始ボタンのイベントハンドラ
startButton.addEventListener('click', function() {
	tts.text = "どこを探しているのか教えてね";

    tts.onend = function(event) {
      asr.start(); // 音声認識を再開
    }

    speechSynthesis.speak(tts);
})

// 停止ボタンのイベントハンドラ
stopButton.addEventListener('click', function() {
	asr.abort();
    asr.stop();
})

// 子ども/大人用の切り替えボタン
adultOrChild.addEventListener('click', function() {
	if(child){
		document.getElementById('adultOrChildImgs').src="images/child.png";
		document.getElementById('title').src="images/title2.png";
		child=false;
	}else{
		document.getElementById('adultOrChildImgs').src="images/adult.png";
		document.getElementById('title').src="images/hiraganatitle2.png";
		child=true;
	}
})

// 時刻表示
timerID = setInterval('clock()',500); //0.5秒毎にclock()を実行
function clock() {
	document.getElementById("dateAndTime").textContent = getNow();
}

function getNow() {
	var week = ["（日）", "（月）", "（火）", "（水）", "（木）", "（金）", "（土）"];
	var now = new Date();
	var year = now.getFullYear();
	var mon = now.getMonth()+1; //１を足すこと
	var day = now.getDate();
	var dayOfWeek=now.getDay();
	var hour = now.getHours();
	var min = now.getMinutes();
	//出力用
	var s = year + "年" + mon + "月" + day + "日"+ week[dayOfWeek] + hour + "時" + min + "分"; 
	return s;
}

// 現在の天気の表示
async function showNowWeather(){
	try{
		const weather = await getWeather();
		nowWeather = weather[0];
		nextWeather = weather[1];
		if(nowWeather===0){//降水強度が０のとき晴れ、１以下で曇り、それ以外で雨とする。
			document.getElementById("nowWeatherImg").src="images/sunny.png";
		}else if(nowWeather<=1){
			document.getElementById("nowWeatherImg").src="images/cloudy.png";
		}else{
			document.getElementById("nowWeatherImg").src="images/rainy.png";
		}
		if(nextWeather===0){
			document.getElementById("nextWeatherImg").src="images/sunny.png";
		}else if(nextWeather<=1){
			document.getElementById("nextWeatherImg").src="images/cloudy.png";
		}else{
			document.getElementById("nextWeatherImg").src="images/rainy.png";
		}
	}catch(error){
		document.getElementById("nowWeatherImg").src="images/nodata.png";
		document.getElementById("nextWeatherImg").src="images/nodata.png";
	}
}

//APIから現在と３０分後の天気を取得
async function getWeather() {
	try {
		let weatherArray=[];
		var url = queryWeatherURL + "&coordinates=134,34" + "&output=json";
		const response = await fetch(url);
		const data = await response.json();
		const nowRainfall = data.Feature[0].Property.WeatherList.Weather[0].Rainfall;
		weatherArray.push(nowRainfall);
		const nextRainfall = data.Feature[0].Property.WeatherList.Weather[3].Rainfall;//30分後の天気
		weatherArray.push(nextRainfall);
		return weatherArray;
	} catch (error) {
		console.error('Error:', error);
		throw error;
	}
}

//現在の天気を答える
async function tellNowWeather(){
	let weather= await getWeather();
	if(child){
		if(weather[0]==0){
			weather="はれだよ。いいおてんきだね。";
		}else if(weather[0]<=1){
			weather="くもりかな？";
		}else{
			weather="あめだよ。イヤなおてんきだね。きをつけてかえってね。";
		}
	}else{
		if(weather[0]==0){
			weather="晴れです降水強度は0です。いい天気ですね。";
		}else if(weather[0]<=1){
			weather="曇りかな？降水強度は"+weather[0]+"です。何とも言えない天気ですね。";
		}else{
			weather="雨です。降水強度は"+weather[0]+"です。イヤな天気ですね。お帰りはお気を付けて。";
		}
	}
	return weather;
}

//ひらがなに変換する
async function convertToHiragana(transcript) {
  try {
    const postData = {
      "id": "1234-1",
      "jsonrpc": "2.0",
      "method": "jlp.furiganaservice.furigana",
      "params": {
        "q": transcript,
        "grade": 1
      }
    };

    const response = await fetch(queryFuriganaURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

//入力の読みをつなげ合せてひらがなの文章にする
async function makeHiraganaText(transcript) {
  try {
    const rubyData = await convertToHiragana(transcript);
    let result = '';
    rubyData.word.forEach(wordInfo => {
    if(wordInfo.furigana){
		result+=wordInfo.furigana;
	}else{
		result+=wordInfo.surface;
	  }
    });
    return result;
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
}

// 画面を切り替える
function changeAdultOrChild(key) {
	if(key=="大人用"&&child){
		document.getElementById('adultOrChildImgs').src="images/child.png";
		document.getElementById('title').src="images/title2.png";
		child=false;
	}else if((key=="子供用"||key=="ひらがな")&&!child){
		document.getElementById('adultOrChildImgs').src="images/adult.png";
		document.getElementById('title').src="images/hiraganatitle2.png";
		child=true;
	}
}

// マップ表示（一階、二階に共通するもの）
function showMap(floor, flag){
	let bottom;
	let left;
	let src;
	if(floor==1){
		switch(flag){
			case 1:
				bottom="220px";
				left="585px";
				break;
			case 2:
				bottom="190px";
				left="490px";
				break;
			case 3:
				bottom="355px";
				left="585px";
				break;
			case 4:
				bottom="250px";
				left="290px";
				break;
		}
	}else if(floor==2){
		switch(flag){
			case 1:
				bottom="220px";
				left="585px";
				break;
			case 2:
				bottom="190px";
				left="490px";
				break;
			case 3:
				bottom="45px";
				left="420px";
				break;
			case 4:
				bottom="390px";
				left="338px";
				break;
		}
	}
	console.log("flag",flag);
	if(floor==1){
		src="images/map.png"
	}else{
		src="images/map2.png"
	}
	return "<div class='map'><img class='mapImage' src='" + src + "'/><img class='pin' style='bottom:" + bottom + "; left:" + left + ";' src='images/pin.png'/></div>";
}

//１階固有の場所
function show1Froom(flag){
	let className;
	switch(flag){
		case 1:
			bottom="20px";
			left="320px";
			break;
		case 2:
			bottom="250px";
			left="100px";
			break;
		case 3:
			bottom="350px";
			left="350px";
			break;
		case 4:
			bottom="60px";
			left="570px";
			break;
		case 5:
			bottom="60px";
			left="570px";
			break;
		case 6:
			bottom="150px";
			left="320px";
			break;
		case 7:
			bottom="25px";
			left="110px";
			break;
		case 8:
			bottom="190px";
			left="460px";
			break;
		case 9:
			bottom="255px";
			left="350px";
			break;
	}
	return "<div class='map'><img class='mapImage' src='images/map.png'/><img class='pin' style='bottom:" + bottom + "; left:" + left + ";' src='images/pin.png'/></div>";
}

//2階固有の場所
function show2Froom(flag){
	let className;
	switch(flag){
		case 1:
			bottom="360px";
			left="490px";
			break;
		case 2:
			bottom="360px";
			left="490px";
			break;
		case 3:
			bottom="320px";
			left="170px";
			break;
		case 4:
			bottom="85px";
			left="175px";
			break;
		case 5:
			bottom="50px";
			left="570px";
			break;
		case 6:
			bottom="50px";
			left="570px";
			break;
	}
	return "<div class='map'><img class='mapImage' src='images/map2.png'/><img class='pin' style='bottom:" + bottom + "; left:" + left + ";' src='images/pin.png'/></div>";
}
