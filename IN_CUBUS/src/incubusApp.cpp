#include "incubusApp.h"

//--------------------------------------------------------------
void incubusApp::setup(){
    
    fbo.allocate(320, 180);
    
    mask.allocate(320,180,OF_IMAGE_COLOR_ALPHA);
    resetMask(false);
    
    ofSetSmoothLighting(true);
    lightSource.enable();
    lightSource.setPointLight();
    lightSource.setPosition(160, 90, -10);
    ofSetGlobalAmbientColor(ofFloatColor(127,127,127));
                                
    ofSetVerticalSync(true);
    debug = true;
    degrees = 0;
    cameraRotation = 0.0;
    if (debug) ofSetFrameRate(30);
    
    //create the socket and set to send to 127.0.0.1:11999
	udpConnection.Create();
	udpConnection.Connect("127.0.0.1", 41234);
	udpConnection.SetNonBlocking(true);
    
    //serial.listDevices();
	vector <ofSerialDeviceInfo> deviceList = serial.getDeviceList();
    serialPort = deviceList[5].getDeviceName();
    serial.setup(5,9600);
    
}

//--------------------------------------------------------------
void incubusApp::update(){

    cameraRotation += 1;
    if (abs(cameraRotation) == degrees + 1) {
        degrees++;
        if (degrees > 359) {
            degrees = 0;
            cameraRotation = 0.0;
        }
    }
    
    incomingBytes = "";
    while (serial.available() > 0) {
        incomingBytes += (char) serial.readByte();
    }
    serial.drain();
    if (incomingBytes.length() > 0)
        dioderProg = incomingBytes;
    
}

//--------------------------------------------------------------
void incubusApp::draw(){
    
    fbo.begin();
    
    ofBackground(244,239,252);
    
    ofPushMatrix();
    ofNoFill();
    ofSetLineWidth(1);
    ofSetColor(222,216,226);
    ofTranslate(160, 90);
    ofRotateY((float) degrees);
    ofFill();
    //lightSource.enable();
    ofBox(0, 0, 0, 100);
    //lightSource.disable();
    ofPopMatrix();
    
    fbo.end();
    
    if (recording) {
        //snapshot.grabScreen(0,0,320,180);
        fbo.readToPixels(snapshot.getPixelsRef());
        snapshot.saveImage("../../../IN_COMING/" + ofToString(degrees) + ".png");
        //cout << "Capturing.." << endl;
        if (degrees == firstFrame) {
            recording = false;
            cout << "RECORDING STOP" << endl;
        }
    }
    
    ofPushMatrix();
    if (ofGetWindowMode() == OF_FULLSCREEN) {
        float factor = (debug) ? 4.5 : 6.0;
        ofScale(factor, factor);
    }
    
    ofSetMinMagFilters(GL_NEAREST, GL_NEAREST);
    fbo.draw(0.f, 0.f);
    
    int p = (int) ofRandom(57600);
    mask.getPixelsRef()[p*4+3] = (unsigned char) 0;
    mask.update();
    
    if (!unmasked) {
        ofEnableAlphaBlending();
        mask.draw(0, 0);
        ofDisableAlphaBlending();
    }
    
    //ofSetColor(171,243,172);
    //ofRect(159, 89, 4, 4);
    
    ofPopMatrix();
    
    if (debug) {
        ofSetColor(208,222,255);
        ofRect(0,810,1440,90);
        ofSetColor(180,181,255);
        ofRect(0,810,1440,12);
        ofSetColor(112,74,158);
        string debugLabel = "DEBUG";
        debugLabel += (serialPort.length() > 0) ? " // SERIAL PORT: " + serialPort : "";
        debugLabel += (dioderProg.length() > 0) ? " // CUBE ROUTINE: " + dioderProg : "";
        debugLabel += " // DEGREES: " + ofToString(cameraRotation);
        debugLabel += (recording) ? " // CAPTURING" : "";
        ofDrawBitmapString(debugLabel , 40, 866);
    }
    
}

//--------------------------------------------------------------
void incubusApp::keyPressed(int key){

}

//--------------------------------------------------------------
void incubusApp::keyReleased(int key){
    if (key == 'd') {
        debug = !debug;
    }
    else if (key == 'f') {
        ofToggleFullscreen();
    }
    else if (key == 'm') {
        unmasked = !unmasked;
    }
    else if (key == '.') {
        string msg = "BLARGH";
        udpConnection.Send(msg.c_str(),msg.length());
    }
    else if (key == '/') {
        serial.writeByte('n');
    }
    else if (key == '0') {
        serial.writeByte(0);
    }
    else if (key == '1') {
        serial.writeByte(1);
    }
    else if (key == '2') {
        serial.writeByte(2);
    }
    else if (key == '3') {
        serial.writeByte(3);
    }
    else if (key == '4') {
        serial.writeByte(4);
    }
    else if (key == 'r') {
        cout << "RECORDING START (" + ofToString(degrees) + ")" << endl;
        firstFrame = degrees - 1;
        if (firstFrame < 0)
            firstFrame = 359;
        recording = true;
    }
}

//--------------------------------------------------------------
void incubusApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void incubusApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void incubusApp::resetMask(bool noisy){
    int i = 0;
    for( i=0; i < mask.getPixelsRef().size(); i+=4) {
        mask.getPixelsRef()[i]   = (unsigned char) (noisy) ? ofRandom(47) : 47;
        mask.getPixelsRef()[i+1] = (unsigned char) (noisy) ? ofRandom(84) : 84;
        mask.getPixelsRef()[i+2] = (unsigned char) (noisy) ? ofRandom(107) : 107;
        mask.getPixelsRef()[i+3] = (unsigned char) 255;
    }
    mask.update();
}
