#include "incubusApp.h"

//--------------------------------------------------------------
void incubusApp::setup(){
    
    fbo.allocate(320, 180);
    ofDisableArbTex();
    mask.allocate(50,50,OF_IMAGE_COLOR_ALPHA);
    mask.setUseTexture(true);
    resetMask(true);
    
    ofSetSmoothLighting(true);
    lightSource.enable();
    lightSource.setPointLight();
    lightSource.setPosition(150, 200, 100);
    ofSetGlobalAmbientColor(ofFloatColor(127,127,127));
                                
    ofSetVerticalSync(true);
    debug = true;
    degrees = 0;
    cameraRotation = 0.0;
    connectedClients = 0;
    if (debug) ofSetFrameRate(30);
    
    //create the socket and set to send to 127.0.0.1:11999
	udpConnection.Create();
	udpConnection.Connect("127.0.0.1", 41234);
    udpConnection.Bind(11999);
	udpConnection.SetNonBlocking(true);
    
    //serial.listDevices();
	vector <ofSerialDeviceInfo> deviceList = serial.getDeviceList();
    
    if (deviceList.size() >= 5) {
        serialPort = deviceList[5].getDeviceName();
        wired = serial.setup(5,9600);
    }
    
    qrCode.loadImage("qrcode.png");
    logo.loadImage("logo.png");
    
    infoText.init("ONRAMP.ttf", 48);
    infoText.setText("To intercept cube transmissions scan the code");
    infoText.setColor(239, 207, 162, 255);
    infoText.wrapTextForceLines(6);
    
    accessText.init("ONRAMP.ttf", 14);
    accessText.setText("No QR-code scanner at hand? \n Search for IN//CUBUS on facebook or navigate to \n apps.facebook.com/in_cubus manually. \n \n Not a facebook user? Don't worry, you can still participate by heading to \n incubus.bloomingbridges.co.uk");
    accessText.wrapTextX(720);
    accessText.setColor(64, 61, 54, 255);
    accessText.words[14].color = ofColor(239, 207, 162, 255);
    accessText.words[18].color = ofColor(239, 207, 162, 255);
    accessText.words[26].color = ofColor(239, 207, 162, 255);
    accessText.words[30].color = ofColor(239, 207, 162, 255);
    accessText.words[32].color = ofColor(239, 207, 162, 255);
    accessText.words[34].color = ofColor(239, 207, 162, 255);
    accessText.words[36].color = ofColor(239, 207, 162, 255);
    accessText.words[56].color = ofColor(239, 207, 162, 255);
    
    ofToggleFullscreen();
    
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
    
    if (wired) {
        incomingBytes = "";
        while (serial.available() > 0) {
            incomingBytes += (char) serial.readByte();
        }
        serial.drain();
        if (incomingBytes.length() > 0)
            dioderProg = incomingBytes;
    }
    
    char udpMessage[265];
	udpConnection.Receive(udpMessage,265);
	string message = udpMessage;
	if(message!=""){
        cout << message << endl;
        vector<string> data = ofSplitString(message, ":");
        if (data[0] == "NEW")
            serial.writeByte(0);
        else if (data[0] == "HAI")
            addNewClient(atoi(data[1].c_str()));
        else if (data[0] == "BAI")
            removeClient(atoi(data[1].c_str()));
        else if (data[0] == "ERR")
            serial.writeByte(3);
    }
    
}

//--------------------------------------------------------------
void incubusApp::draw(){
    
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
    
    messWithMask();
    drawCube(false);
    
//    fbo.draw(0.f, 0.f);
    
//    int p = (int) ofRandom(57600);
//    mask.getPixelsRef()[p*4+3] = (unsigned char) 0;
//    mask.update();
    
    ofSetColor(41, 41, 41);
    ofRect(0, 0, 140, 1080);
    
    ofSetColor(64, 61, 54);
    ofRect(40, 85, 60, 60);
    
    ofSetColor(255, 255, 255);
    qrCode.draw(45, 90, 50, 50);
    
    ofPopMatrix();
    
    if (ofGetWindowMode() == OF_FULLSCREEN) {
        if (debug) {
            ofPushMatrix();
            ofScale(0.73, 0.73);
        }
        
        infoText.drawCenter(420, 40);
        accessText.drawCenter(420, 940);
        
//        ofSetColor(239, 207, 162);
//        onRamp.drawString("No QR-code scanner at hand?" , 32, 920);
//        ofSetColor(64, 61, 54);
//        onRamp.drawString("Search for IN//CUBUS on facebook or" , 32, 950);
//        onRamp.drawString("navigate to apps.facebook.com/in_cubus manually." , 32, 980);
//        
//        ofSetColor(239, 207, 162);
//        onRamp.drawString("Not a facebook user? Don't worry, " , 32, 1040);
//        ofSetColor(64, 61, 54);
//        onRamp.drawString("you can still participate by heading to" , 32, 1070);
//        onRamp.drawString("incubus.bloomingbridges.co.uk" , 32, 1100);
        if (debug) ofPopMatrix();
    }
    
    if (debug) {
        ofSetColor(208,222,255);
        ofRect(0,810,1440,90);
        ofSetColor(180,181,255);
        ofRect(0,810,1440,12);
        ofSetColor(112,74,158);
        string debugLabel = "DEBUG";
        debugLabel += (serialPort.length() > 0) ? " // SERIAL PORT: " + serialPort : "";
        debugLabel += (dioderProg.length() > 0) ? " // CUBE ROUTINE: " + dioderProg : "";
        debugLabel += " // CONNECTED CLIENTS: " + ofToString(connectedClients);
        debugLabel += (recording) ? " // DEGREES: " + ofToString(cameraRotation) + " // CAPTURING" : "";
        ofDrawBitmapString(debugLabel , 90, 866);
        ofEnableAlphaBlending();
        mask.draw(20, ofGetScreenHeight() - 64, 50, 50);
        ofDisableAlphaBlending();
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
    else if (key == '.') {
        string msg = "FLUSH";
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
void incubusApp::drawCube(bool toBuffer){
    if (toBuffer) fbo.begin();
    ofBackground(244,239,252);
    
    glEnable(GL_DEPTH_TEST);
    ofPushMatrix();
    
    ofTranslate(230, 90);
    ofRotateY((float) degrees);
    
    lightSource.enable();
    
    ofFill();
    ofSetLineWidth(0);
    ofSetColor(222,216,226);
    ofBox(0, 110, 0, 120);
    
    ofNoFill();
    ofSetLineWidth(2);
    //ofSetColor(183, 237, 219);
    ofSetColor(47, 84, 107);
    ofBox(0, 0, 0, 100);
    
    ofFill();
    ofEnableAlphaBlending();
    ofSetColor(255,255,255,225);
    ofSetMinMagFilters(GL_NEAREST, GL_NEAREST);
    maskTex = &mask.getTextureReference();
    maskTex->draw(-50, -50, 50, 100, 100);
    ofRotateY(90);
    maskTex->draw(-50, -50, 50, 100, 100);
    ofRotateY(90);
    maskTex->draw(-50, -50, 50, 100, 100);
    ofRotateY(90);
    maskTex->draw(-50, -50, 50, 100, 100);
    ofRotateX(90);
    ofSetColor(255,255,255,255);
    maskTex->draw(-50, -50, 50, 100, 100);
    ofDisableAlphaBlending();
    lightSource.disable();
    glDisable(GL_DEPTH_TEST);
    ofPopMatrix();
    if (toBuffer) fbo.end();
}

//--------------------------------------------------------------
void incubusApp::resetMask(bool noisy){
    int i = 0;
    for( i=0; i < mask.getPixelsRef().size(); i+=4) {
        mask.getPixelsRef()[i]   = (unsigned char) (noisy) ? 47 + ofRandom(60) : 31;
        mask.getPixelsRef()[i+1] = (unsigned char) (noisy) ? 84 + ofRandom(40) : 46;
        mask.getPixelsRef()[i+2] = (unsigned char) (noisy) ? 107 + ofRandom(10) : 103;
        mask.getPixelsRef()[i+3] = (unsigned char) 50;
    }
    mask.update();
    mask.reloadTexture();
}

//--------------------------------------------------------------
void incubusApp::messWithMask(){
    int i = 0;
    for( i=0; i < mask.getPixelsRef().size(); i+=4) {
        if (mask.getPixelsRef()[i+3] != 255) {
            mask.getPixelsRef()[i]   = (unsigned char) 47 + ofRandom(60);
            mask.getPixelsRef()[i+1] = (unsigned char) 84 + ofRandom(40);
            mask.getPixelsRef()[i+2] = (unsigned char) 107 + ofRandom(10);
        }
    }
    mask.update();
    mask.reloadTexture();
}

//--------------------------------------------------------------
void incubusApp::addNewClient(int pos){
    connectedClients++;
    serial.writeByte(4);
    mask.getPixelsRef()[pos*4] = (unsigned char) 239;
    mask.getPixelsRef()[pos*4+1] = (unsigned char) 207;
    mask.getPixelsRef()[pos*4+2] = (unsigned char) 162;
//    mask.getPixelsRef()[pos*4] = (unsigned char) 163;
//    mask.getPixelsRef()[pos*4+1] = (unsigned char) 217;
//    mask.getPixelsRef()[pos*4+2] = (unsigned char) 216;
    mask.getPixelsRef()[pos*4+3] = (unsigned char) 255;
    //mask.getPixelsRef()[pos*4+3] = (unsigned char) 0;
    mask.update();
    mask.reloadTexture();
}

//--------------------------------------------------------------
void incubusApp::removeClient(int pos){
    connectedClients--;
    //mask.getPixelsRef()[pos*4] = (unsigned char) 31;
    mask.getPixelsRef()[pos*4+3] = (unsigned char) 50;
    mask.update();
    mask.reloadTexture();
    if (connectedClients == 0)
        serial.writeByte(4);
}
