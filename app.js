//Khai báo tên tài khoản cloudinary
const CLOUD_NAME = "dz5pvwzm5";

//Khai báo địa chỉ chứa data thu âm thanh
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

//Các endpoint ứng với từng lệnh 
const COMMAND_1_PRESET  = "cjn01rjd";
const COMMAND_2_PRESET  = "gglajrqs";
const COMMAND_3_PRESET  = "nzpqpddv";
const COMMAND_4_PRESET  = "dpfl3gmh";
const COMMAND_5_PRESET  = "lkrjn9z9";
const COMMAND_6_PRESET  = "u7rf9a4g";
const COMMAND_7_PRESET  = "oy4tyjh9";
const COMMAND_8_PRESET  = "e5hq3h9t";
const COMMAND_9_PRESET  = "kmyl6gqf";
const COMMAND_10_PRESET = "jppru3wt";

URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;
//đối tượng Recorder.js  
var input;
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;
//audio context giúp thu âm

//Khai báo các nút, thanh trạng thái
var recordButton = document.getElementById("recordButton");
var uploadButton = document.getElementById("uploadButton");
var recordCount = document.getElementById("recordCount");

var nextButton = document.getElementById("next");
var statusBar = document.getElementById("status");
var readyBar = document.getElementsByClassName("ready")[0];

//Gắn sự kiện cho nút thu âm, upload file, đặt chế độ hiển thị cho nút upload và nút tiếp theo
recordButton.addEventListener("click", startRecording);
uploadButton.addEventListener("click", uploadFiles);
uploadButton.disabled = true;
nextButton.hidden = true;

//Khởi tạo các giá trị đầu
const ATTEMPS_PER_COMMAND = 10;
var audioTracks = [];
var trackCount;
var uploadCount = 0;

//Hàm kiểm tra xem 1 lệnh đủ 10 file hay chưa
function check(){
     recordCount.innerHTML = "RECORDED: " + audioTracks.length;
     if (audioTracks.length == ATTEMPS_PER_COMMAND){
          recordButton.disabled = true;
          uploadButton.disabled = false;
     } else {
          recordButton.disabled = false;
          uploadButton.disabled = true;
     }
} 

//Hàm thu âm
function startRecording() {
	console.log("recordButton clicked");
     readyBar.innerHTML = "Xin mời nói!"
     var constraints = { audio: true, video:false }
	recordButton.disabled = true;

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() thành công, tạo luồng, khởi chạy Recorder.js ...");

		audioContext = new AudioContext();
		audioContext.resume().then(() => {

		gumStream = stream;
		input = audioContext.createMediaStreamSource(stream);
		rec = new Recorder(input,{numChannels:1})
		rec.record()

		console.log("Bắt đầu thu âm");
          });

          setTimeout(stopRecording, 1600);
	}).catch(function(err) {
          //Cho nút thu âm hoạt động trở lại khi getUserMedia() bị lỗi
    	     recordButton.disabled = false;
	});
}

//Hàm dừng thu âm
function stopRecording() {
     console.log("stopButton clicked");
     readyBar.innerHTML = "";
     recordButton.disabled = false;
     rec.stop(); //dừng truy cập microphone 
     gumStream.getAudioTracks()[0].stop();
     //Tạo file wav bằng kiểu blob và truyền vào hàm createDownloadLink
     rec.exportWAV(createDownloadLink);
}

//Hàm xóa file audio
function deleteAudioTrack(delBtn, li, blob){
     li.remove();
     delBtn.remove(); 
     console.log(blob);
     var numTrack = audioTracks.indexOf(blob);
     audioTracks.splice(numTrack,1);  
     console.log(audioTracks);
     check();
}

//Hàm tạo nút download
function createDownloadLink(blob) {
     var url = URL.createObjectURL(blob);
     var au = document.createElement('audio');
     var li = document.createElement('li');
     var link = document.createElement('a');
     var delBtn = document.createElement('button');
     delBtn.innerHTML = "X";
     //Thêm file vào mảng audioTracks
     audioTracks.push(blob);
     au.controls = true;
     au.src = url;
     link.href = url;
     link.download = new Date().toISOString() + '.wav';
     link.innerHTML = link.download;
     li.appendChild(au);
     li.appendChild(link);
     recordingsList.appendChild(delBtn); 
     recordingsList.appendChild(li);
     delBtn.addEventListener("click", () => deleteAudioTrack(delBtn, li, blob));
     console.log(audioTracks);
     check();
}

//Hàm upload lên cloudinary
function uploadFiles(){
     uploadButton.disabled = true;
     var pathNumber = parseInt(recordButton.className);
     var cloudinaryUploadPreset = eval(`COMMAND_${pathNumber}_PRESET`);
     for(let i = 0; i < audioTracks.length; i++){
          var filename = new Date().toISOString();
          var formData = new FormData();
          formData.append('file', audioTracks[i]);
          formData.append('upload_preset', cloudinaryUploadPreset);
          formData.append('public_id', filename);
          fetch(CLOUDINARY_URL, {
               method: 'POST',
               body: formData,
          }).then((res) => {
               uploadCount++;
               statusBar.innerHTML = "Uploaded " + uploadCount + " file(s)";
               if(uploadCount === ATTEMPS_PER_COMMAND){
                    statusBar.innerHTML = "Upload thành công! Click Next để tiếp tục...";
                    nextButton.hidden = false;
               }
               return res.json();
          }).catch((err) => {
               console.error(err);
          })
     }
}
