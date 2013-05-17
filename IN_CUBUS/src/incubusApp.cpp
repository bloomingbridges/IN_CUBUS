#include "incubusApp.h"

//--------------------------------------------------------------
void incubusApp::setup(){
    mask.allocate(320,180,OF_IMAGE_COLOR_ALPHA);
    int i = 0;
    for( i=0; i < mask.getPixelsRef().size(); i+=4) {
        mask.getPixelsRef()[i]   = (unsigned char) ofRandom(47);
        mask.getPixelsRef()[i+1] = (unsigned char) ofRandom(84);
        mask.getPixelsRef()[i+2] = (unsigned char) ofRandom(107);
        mask.getPixelsRef()[i+3] = (unsigned char) 255;
    }
    mask.update();
    
    //ofSetSmoothLighting(true);
    lightSource.enable();
    lightSource.setPointLight();
    lightSource.setPosition(160, 90, -10);
    lightSource.setAttenuation();
    ofSetGlobalAmbientColor(ofFloatColor(127,127,127));
                                
    ofSetVerticalSync(true);
    debug = true;
    degrees = 0;
    cameraRotation = 0.0;
    //if (debug) ofSetFrameRate(12);
    
    //create the socket and set to send to 127.0.0.1:11999
	udpConnection.Create();
	udpConnection.Connect("127.0.0.1", 41234);
	udpConnection.SetNonBlocking(true);
    
}

//--------------------------------------------------------------
void incubusApp::update(){

}

//--------------------------------------------------------------
void incubusApp::draw(){
    ofBackground(244,239,252);
    
    cameraRotation += 0.2;
    if ((int) cameraRotation == degrees + 1) {
        degrees++;
        if (degrees > 359) {
            degrees = 0;
            cameraRotation = 0.0;
        }
        cout << degrees << endl;
    }
    
    ofPushMatrix();
    if (ofGetWindowMode() == OF_FULLSCREEN) {
        float factor = (debug) ? 4.5 : 6.0;
        ofScale(factor, factor);
    }
    
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
    
    int p = (int) ofRandom(57600);
    //cout << p << endl;
    mask.getPixelsRef()[p*4+3] = (unsigned char) 0;
    mask.update();
    
    if (!unmasked) {
        ofSetMinMagFilters(GL_NEAREST, GL_NEAREST);
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
        ofDrawBitmapString("HELLO, IN//CUBUS!", 40, 866);
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
}

//--------------------------------------------------------------
void incubusApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void incubusApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void incubusApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void incubusApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void incubusApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void incubusApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void incubusApp::dragEvent(ofDragInfo dragInfo){ 

}