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
    
        void resetMask(bool noisy);
    
    private:
        bool debug;
        bool unmasked;
        bool recording;
        int firstFrame;
        int degrees;
        float cameraRotation;
        ofImage snapshot;
        ofImage mask;
        ofFbo fbo;
        ofEasyCam camera;
        ofLight lightSource;
        ofxUDPManager udpConnection;
		
};
