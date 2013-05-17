#pragma once

#include "ofMain.h"
#include "ofxNetwork.h"

class incubusApp : public ofBaseApp{

	public:
		void setup();
		void update();
		void draw();

		void keyPressed  (int key);
		void keyReleased(int key);
		void windowResized(int w, int h);
		void gotMessage(ofMessage msg);
    
    private:
        bool debug;
        bool unmasked;
        bool recording;
        int firstFrame;
        ofImage snapshot;
        ofImage mask;
        int degrees;
        ofEasyCam camera;
        float cameraRotation;
        ofLight lightSource;
        ofxUDPManager udpConnection;
		
};
