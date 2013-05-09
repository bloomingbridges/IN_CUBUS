#include "incubusApp.h"

//--------------------------------------------------------------
void incubusApp::setup(){
    ofSetVerticalSync(true);
    debug = false;
}

//--------------------------------------------------------------
void incubusApp::update(){

}

//--------------------------------------------------------------
void incubusApp::draw(){
    ofBackground(244,239,252);
    
    ofPushMatrix();
    ofScale(4.5, 4.5);
    ofSetColor(107,84,47);
	ofRect(ofRandom(320),ofRandom(180),3,3);
    ofRect(ofRandom(320),ofRandom(180),3,3);
    ofRect(ofRandom(320),ofRandom(180),3,3);
    ofSetColor(171,243,172);
    ofRect(154, 84, 9, 9);
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