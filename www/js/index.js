var codenumber = '';
var url = 'https://aagit.net/tm.asp';
var deviceID = '';
var lat = '';
var lon = '';
var checkinTime = '';

function checkForEmployeeCodeNumberFile(){
    //alert('checking for phone file');
	//alert(cordova.file.dataDirectory + "empcode.txt");
	showSpinner("Checking for saved Employee Code Number");
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "empcode.txt",
		gotFile, getFileFail);
}

function gotFile(fileEntry) {
	hideSpinner();
	
	fileEntry.file(function(file) {
		var reader = new FileReader();

		reader.onloadend = function(e) {
			//alert("Text is: "+this.result);
			codenumber = this.result;
			
			//alert(codenumber);
	
			if(codenumber.length <= 0){
			  showcodenumberPrompt();
			}
			else{
			  testGPS();
			}
		}

		reader.readAsText(file);
	});
}

function getFileFail(e) {
	//alert("Failed to retrieve the phone file");
	//alert(e);
	
	showcodenumberPrompt();
}

function createPhoneFile(){
	showSpinner("Saving phone number for later use");
	
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
			//alert("got main dir",dir);
			dir.getFile("empcode.txt", {create:true}, function(file) {
				//alert("got the file", file);
				phoneFile = file;
				writePhoneFile(codenumber);		
			});
		});
}

function writePhoneFile(str) {
	
	//alert("Starting to write the file");
	phoneFile.createWriter(function(fileWriter) {
		
		fileWriter.seek(fileWriter.length);
		fileWriter.write(str);
		//alert("ok, in theory i worked");
		hideSpinner();
		testGPS();
	}, fileWriteFail);
}

function fileWriteFail(e) {
	hideSpinner();
	
	alert("FileSystem Error - Write File");
	//alert(e);
}

// Show a prompt to get the driver's phone number
function showcodenumberPrompt() {
	navigator.notification.prompt(
        'Please Enter Your Employee Code Number',  // message
        onPrompt,                     // callback to invoke
        'Code Number Registration', // title
        ['Ok','Exit'],              // buttonLabels
        ''                // defaultText
    );
}

// Process the prompt dialog results
function onPrompt(results) {
    if(results.buttonIndex == 1)
    {
	   if(results.input1.length == 0){
	     alert('You must Enter Employee Code number');
	   }
	   else{
		 codenumber = results.input1;
		 showKeepPhoneDialog();
	   }
    }
}

function showKeepPhoneDialog() {
  navigator.notification.confirm(
  'Is this number correct ' + codenumber + '?',  // message
  confirmPhone, // callback
  'Confirm Phone Number', // title
  'Yes,No' // buttonName
  );
}

// Phone Prompt Confirmation
function confirmPhone(buttonIndex) {
	// IF the user pressed YES then register their phone number
	if(buttonIndex == 1)
	{
		createPhoneFile();
	}
	else{
		codenumber = '';
		showcodenumberPrompt();
	}
}

function testGPS(){
  showSpinner("Testing GPS Availability");
  
  var options = {maximumAge: 0, timeout: 10000, enableHighAccuracy: true};
  navigator.geolocation.getCurrentPosition(onGPSTestSuccess, onError, options);
}

function onGPSTestSuccess(){
  hideSpinner();
  showGPS();
}

// Show a custom prompt dialog
function showGPS() {
  showSpinner("Retrieving GPS Coordinates");
  
  var options = {maximumAge: 0, timeout: 30000, enableHighAccuracy: true};
  navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}

var onSuccess = function(position) {
    hideSpinner();
	
	var d = new Date();
    
    /*alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Time: '          	+ d.toDateString() + ' ' + d.toTimeString() + '\n' +
          'Device UUID: '       + device.uuid     + '\n' +
		  'Phone Number: '      + codenumber);*/
		  
	deviceID = device.uuid;
	lat = position.coords.latitude;
	lon = position.coords.longitude;
	checkinTime = d.toDateString() + ' ' + d.toTimeString();
	
	createPhoneCheckInRequest();
};

function createPhoneCheckInRequest(){
	showSpinner("Sending information to Server, Please Wait...");
	 
    method = "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", url);

	var DeviceID = document.createElement("input");
        DeviceID.setAttribute("type", "text");
        DeviceID.setAttribute("name", "DeviceID");
        DeviceID.setAttribute("value", deviceID);

	var codenumber = document.createElement("input");
        codenumber.setAttribute("type", "text");
        codenumber.setAttribute("name", "codenumber");
        codenumber.setAttribute("value", codenumber);
		
	var Latitude = document.createElement("input");
        Latitude.setAttribute("type", "text");
        Latitude.setAttribute("name", "Latitude");
        Latitude.setAttribute("value", lat);
		
	var Longitude = document.createElement("input");
        Longitude.setAttribute("type", "text");
        Longitude.setAttribute("name", "Longitude");
        Longitude.setAttribute("value", lon);
		
	var PunchTime = document.createElement("input");
        PunchTime.setAttribute("type", "text");
        PunchTime.setAttribute("name", "PunchTime");
        PunchTime.setAttribute("value", checkinTime);
    
	form.appendChild(DeviceID);
	form.appendChild(codenumber);
	form.appendChild(Latitude);
	form.appendChild(Longitude);
	form.appendChild(PunchTime);
	
    document.body.appendChild(form);
    hideSpinner();
	form.submit();
	
	alert("Time has been submitted.", "Submit Success");
}

// onError Callback receives a PositionError object
function onError(error) {
    hideSpinner();
	
	if(error.code == 3){
		alert('GPS is not enabled or your location cannot be located.\n' +
		      'Enable your GPS or try again when you are in a more suitable location.');
	}
}

function showSpinner(msg) {
        var options = {
            customSpinner : true,
            position : "middle",
            label : msg,
            bgColor: "#000",
            opacity:0.5,
            color: "#000"
        };
        window.wizSpinner.show(options);
    }
    
function hideSpinner(){
   	window.wizSpinner.hide();
}