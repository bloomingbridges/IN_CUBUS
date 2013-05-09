#include "incubusApp.h"

//--------------------------------------------------------------
void incubusApp::setup(){
    mask.allocate(320,180,OF_IMAGE_COLOR_ALPHA);
    int i = 0;
    for( i=0; i < mask.getPixelsRef().size(); i++) {
        mask.getPixelsRef()[i]   = (int) 107;
        //mask.getPixelsRef()[i+1] = (int) 84;
        //mask.getPixelsRef()[i+2] = (int) 47;
//        mask.getPixelsRef()[i+3] = (int) ofRandom(255);
    }
    ofSetVerticalSync(true);
    debug = true;
    if (debug) ofSetFrameRate(12);
}

//--------------------------------------------------------------
void incubusApp::update(){

}

//--------------------------------------------------------------
void incubusApp::draw(){
    ofBackground(244,239,252);
    
    ofPushMatrix();
    if (ofGetWindowMode() == OF_FULLSCREEN) {
        float factor = (debug) ? 4.5 : 6.0;
        ofScale(factor, factor);
    }
    mask.update();
    mask.draw(0, 0);
    //ofSetColor(107,84,47);
	//ofRect(ofRandom(320),ofRandom(180),2,2);
    //ofRect(ofRandom(320),ofRandom(180),2,2);
    //ofRect(ofRandom(320),ofRandom(180),2,2);
    ofSetColor(171,243,172);
    ofRect(159, 89, 4, 4);
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