#pragma once

#include "ofMain.h"
#include "ofxNetwork.h"
#include "ofxTextSuite.h"

class incubusApp : public ofBaseApp{

	public:
		void setup();
		void update();
		void draw();

		void keyPressed  (int key);
		void keyReleased(int key);
		void windowResized(int w, int h);
		void gotMessage(ofMessage msg);
    
        void drawCube(bool toBuffer);
        void resetMask(bool noisy);
        void messWithMask();
        void addNewClient(int pos);
        void removeClient(int pos);
    
    private:
        bool debug;
        bool unmasked;
        bool recording;
        bool wired;
        int connectedClients;
        int firstFrame;
        int degrees;
        float cameraRotation;
        string dioderProg;
        string serialPort;
        string incomingBytes;
        ofImage snapshot;
        ofImage mask;
        ofTexture* maskTex;
        ofFbo fbo;
        ofEasyCam camera;
        ofLight lightSource;
        ofxUDPManager udpConnection;
        ofSerial serial;
    
        ofImage qrCode;
        ofTrueTypeFont onRamp;
        ofxTextBlock infoText;
        ofxTextBlock accessText;
		
};
