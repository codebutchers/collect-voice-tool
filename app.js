//Cloudinary upload API constants
const CLOUD_NAME = "dz5pvwzm5";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

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
const COMMAND_11_PRESET = "xn0ajz9k";
const COMMAND_12_PRESET = "hhrz2wxs";

//webkitURL is deprecated but nevertheless 
URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;
//new audio context to help us record 
var recordButton = document.getElementById("recordButton");
var uploadButton = document.getElementById("uploadButton");
var recordCount = document.getElementById("recordCount");

var nextButton = document.getElementById("next");
var statusBar = document.getElementById("status");
var readyBar = document.getElementsByClassName("ready")[0];

//add events to those 3 buttons 
recordButton.addEventListener("click", startRecording);
uploadButton.addEventListener("click", uploadFiles);
uploadButton.disabled = true;
nextButton.hidden = true;
var audioTracks = [];
var trackCount;
var uploadCount = 0;
/* Simple constraints object, for more advanced audio features see

https://addpipe.com/blog/audio-constraints-getusermedia/ */

function check(){
     recordCount.innerHTML = "RECORDED: " + audioTracks.length;
     if (audioTracks.length == 10){
          recordButton.disabled = true;
          uploadButton.disabled = false;
     } else {
          recordButton.disabled = false;
          uploadButton.disabled = true;
     }
} 

function startRecording() {
	console.log("recordButton clicked");
     readyBar.innerHTML = "Xin mời nói!"
	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device
		*/
		audioContext = new AudioContext();
		audioContext.resume().then(() => {
               //update the format 
		//document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");
          });
          
          setTimeout(stopRecording, 1600);
		

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
	});
}

function stopRecording() {
     console.log("stopButton clicked");
     readyBar.innerHTML = "";
     //disable the stop button, enable the record too allow for new recordings 
     recordButton.disabled = false;
     //tell the recorder to stop the recording 
     rec.stop(); //stop microphone access 
     gumStream.getAudioTracks()[0].stop();
     //create the wav blob and pass it on to createDownloadLink 
     rec.exportWAV(createDownloadLink);
}

function deleteAudioTrack(delBtn, li, blob){
     li.remove();
     delBtn.remove(); 
     console.log(blob);
     var numTrack = audioTracks.indexOf(blob);
     audioTracks.splice(numTrack,1);  
     console.log(audioTracks);
     check();
}

function createDownloadLink(blob) {
     var url = URL.createObjectURL(blob);
     var au = document.createElement('audio');
     var li = document.createElement('li');
     var link = document.createElement('a');
     var delBtn = document.createElement('button');
     delBtn.innerHTML = "X";
     //add file to audioTracks
     audioTracks.push(blob);
     //add controls to the <audio> element 
     au.controls = true;
     au.src = url;
     //link the a element to the blob 
     link.href = url;
     link.download = new Date().toISOString() + '.wav';
     link.innerHTML = link.download;
     //add the new audio and a elements to the li element 
     li.appendChild(au);
     li.appendChild(link);
     recordingsList.appendChild(delBtn); 
     //add the li element to the ordered list 
     recordingsList.appendChild(li);
     delBtn.addEventListener("click", () => deleteAudioTrack(delBtn, li, blob));
     console.log(audioTracks);
     check();
}

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
               if(uploadCount === 10){
                    statusBar.innerHTML = "Upload thành công! Click Next để tiếp tục...";
                    nextButton.hidden = false;
               }
               return res.json();
          }).catch((err) => {
               console.error(err);
          })
     }

}