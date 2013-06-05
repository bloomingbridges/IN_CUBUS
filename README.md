# IN//CUBUS

This repository holds the source code to my graduation project in __BA (Hons.) Digital Art & Technology__. [More info](https://incubus.bloomingbridges.co.uk/about)

It is made up of several components:

- A visualisation written in openFrameworks (/IN_CUBUS)
- A NodeJS server connected to a MongoDB database, serving the facebook app through Express and managing WebSocket connections (/EX_CUBUS)
- A local NodeJS script to bridge the communication between the visualisation and the server in real-time (/TRANS_CUBUS)
- An Arduino sketch for controlling two IKEA DIODER Led bars inside the installation, talking to the visualisation (/META_CUBUS)

---

- A PhantomJS script for creating dummy socket connections (/TRANS_CUBUS)
- A NodeJS script picking up images rendered out by the visualisation, processing and uploading them to the database (/TRANS_CUBUS)


## Prerequisites

You may find an OS X executable of the visualisation in /IN_CUBUS/bin/, however if you want to compile it yourself (for whatever reason), you need a copy of openFrameworks (release 0073) and XCode 4 upwards.

In order to run the mediator script, at minimum NodeJS v.0.8.15 is required. Modules are excluded from this repo, so you need to manually install 'dgram' and 'ws' via NPM.

If you want to run your own server you need to provide your own credentials.json holding information about your MongoDB user and facebook developer info in the following format:

```json
	{
		"db": {
			"URL": ADDRESS+PORT+/,
			"NAME": "",
			"USER": "",
			"PWD": ""
		},
		
		"fb": {
			"APP_ID": "",
			"APP_SECRET": ""
		}
	}
```

To test the app locally you can install the modules by running 'npm install' in the root folder of the project, switching line 48 with 49 inside mediator.js and open localhost:3000 in your browser.

## Running IN/CUBUS

You can use the bash script provided to start a new visualisation, communicating with my server and producing ghost visitors by navigating to the repo folder on your drive and running

	./run
	
The Visualisation will run full-screen at 1920x1080 resolution. To exit full-screen mode hit 'f', to toggle the debug panel press 'd'. The numbers 0-5 will change the animations that are running on the Arduino, '/' will run the animation next in line.

Press '.' if you want to flush the database, hit '.' once more within the following ten seconds to cancel the operation.

### Experimental features warning

The churn script for processing and uploading images hasn't been developed in a while, so there is no guarantee that it will work. If you want to try however, you should make sure you raise the amount of files a process is allowed to handle in your OS by running

	ulimit -n 512