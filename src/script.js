let stream = null;
let	audio = null;
let	mixedStream = null;
let	chunks = [];
let	recorder = null;
let	recordBtn = null;
let	stopBtn = null;
let	downloadBtn = null;
let	recordedVid = null;
let liveVid = null;

window.addEventListener('load', () => {
	recordBtn = document.getElementById("recordBtn");
	stopBtn = document.getElementById("stopBtn");
	downloadBtn = document.getElementById("download");
	liveVid = document.getElementById("liveVid");
	recordedVid = document.getElementById("recordedVid");

	recordBtn.addEventListener('click', startRecording);
	stopBtn.addEventListener('click', stopRecording);
})

async function selectScreen() {
	try {
		stream = await navigator.mediaDevices.getDisplayMedia({
			video: true
		});

		audio = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
				frameRate: 30,
			},
		});

		setupLiveVideo();
	} catch (err) {
		console.log(err)
	}
}

function setupLiveVideo() {
	if (stream) {
		liveVid.srcObject = stream;
		liveVid.play();
	} else {
		console.log('No stream available');
	}
}

async function startRecording() {
	await selectScreen();

	if (stream && audio) {
		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(1000);
	
		recordBtn.disabled = true;
		stopBtn.disabled = false;
		downloadBtn.disabled = true;
	} else {
		console.log('No stream available.');
	}
}

function stopRecording() {
	recorder.stop();

	recordBtn.disabled = false;
	stopBtn.disabled = true;
}

function handleDataAvailable (e) {
	chunks.push(e.data);
}

function handleStop(event) {
	const blob = new Blob(chunks, { 'type' : 'video/mp4' });
	chunks = [];

	downloadBtn.href = URL.createObjectURL(blob);
	downloadBtn.download = 'video.mp4';
	downloadBtn.disabled = false;
	
	recordedVid.src = URL.createObjectURL(blob);
	recordedVid.load();
	recordedVid.onloadeddata = function() {
		recordedVid.play();
		downloadBtn.disabled = false;
	}

	stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());
}

