// 応答の定義（ハッシュ）    
var response1 = {
	"2階":["2階の地図はこちらです",""],
	"お土産コーナー":["お土産コーナーはここにあります。",""],
	"子供用":["こどもようにかわるよ",""],
	"大人用":["大人用の表示です",""],
	"ひらがな":["こどもようにかわるよ",""]
};

var response2 = {
	"2階":["にかいのちずはこれだよ",""],
	"お土産コーナー":["お土産コーナーはここにあります。",""],
	"子供用":["こどもようのひょうじだよ",""],
	"大人用":["大人用に変わります",""],
	"ひらがな":["こどもようのひょうじだよ",""]
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
  let output_not_final = '';

  if (event.results[event.resultIndex].isFinal) { // 結果が確定（Final）のとき
    asr.abort(); // 音声認識を停止
    let keys = Object.keys(response1);
	let img="";
    for (const key of keys) {
      if (transcript.includes(key)) {
        if (child) {
          let hiragana = await makeHiraganaText(transcript);
          console.log("ひらがな", hiragana);
          outputY = '<div class="yourOutput">' + hiragana + '</div>' + '<br>';
          outputM = '<div class="mayoOutput">' + response2[key][0] + response2[key][1];
          answer = true;
        } else {
          outputY = '<div class="yourOutput">' + transcript + '</div>' + '<br>';
          outputM = '<div class="mayoOutput">' + response1[key][0] + response1[key][1];
          answer = true;
        }
		if(key=="2階"){
			console.log("key",key);
			  img="<div class='map'>地図画像</div>"
		}
		if(key=="大人用"&&child){
			document.getElementById('adultOrChild').innerText="おとなようへ";
			document.getElementById('title').innerText="案内";
			child=false;
			console.log("大人へ",child);
		}
		if(key=="子供用"&&!(child)){
			document.getElementById('adultOrChild').innerText="こどもようへ";
			document.getElementById('title').innerText="あんない";
			child=true;
			console.log("こどもへ",child);
		}
        break; // 応答が見つかったらループを抜ける
      }
    }

    console.log("コンソール", answer);

    if (!answer) {
		if (child) {
          let hiragana = await makeHiraganaText(transcript);
          console.log("ひらがな", hiragana);
          outputY = '<div class="yourOutput">' + hiragana + '</div>' + '<br>';
          outputM = '<div class="mayoOutput">' + "ごめんね。";
          answer = true;
        } else {
      outputY = '<div class="yourOutput">' + transcript + '</div>' + '<br>';
      outputM = '<div class="mayoOutput">' + "ごめんね。";
		}
    }

    resultOutput.innerHTML = output + outputY + outputM + '</div>'+img;
	console.log("img",img);
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
    resultOutput.innerHTML = output + output_not_final;
  }else{
	  output_not_final = '<div class="yourOutput">' + '<span style="color:#ddd;">' + transcript + '</span></div>';
    resultOutput.innerHTML = output + output_not_final;
  }
  }
}


// 開始ボタンのイベントハンドラ
startButton.addEventListener('click', function() {
	asr.start();
})

// 停止ボタンのイベントハンドラ
stopButton.addEventListener('click', function() {
	asr.abort();
    asr.stop();
})

adultOrChild.addEventListener('click', function() {
	if(child){
		//document.getElementById('adultOrChildImage').src="";
		this.innerText="おとなようへ";
		document.getElementById('title').innerText="案内";
		child=false;
		console.log("大人へ",child);
	}else{
		//document.getElementById('adultOrChildImage').src="";
		document.getElementById('title').innerText="あんない";
		this.innerText="こどもようへ";
		child=true;
		console.log("こどもへ",child);
	}
})

async function getWeather() {
  try {
    const postData = {
      "coordinates": "135.1708,34.2305"
    };

    const response = await fetch(queryWeatherURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();
	console.log("天気",data);
    return data; 
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

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

async function makeHiraganaText(input) {
  try {
    const rubyData = await convertToHiragana(input);
	console.log(rubyData);
    let result = '';
    rubyData.word.forEach(wordInfo => {
    if(wordInfo.furigana){
		console.log(wordInfo.furigana);
		result+=wordInfo.furigana;
	}else{
		console.log(wordInfo.surface);
		result+=wordInfo.surface;
	  }
    });
	console.log(result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
}
