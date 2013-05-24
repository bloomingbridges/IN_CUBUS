const int GREEN_A = 6;
const int BLUE_A = 5;
const int RED_A = 3;

const int GREEN_B = 11;
const int BLUE_B = 10;
const int RED_B = 9;

// Protocol details (two header bytes, 12 value bytes, checksum)
const int kProtocolHeaderFirstByte = 0xBA;
const int kProtocolHeaderSecondByte = 0xBE;

const int kProtocolHeaderLength = 2;
const int kProtocolBodyLength = 12;
const int kProtocolChecksumLength = 1;

int p = 0;
String programmes[3] = {"OFF", "SOLID", "FADE"};
unsigned int colours[6] = {0,0,0,0,0,0};
int fadeDirection = 1;

// Buffers and state

bool appearToHaveValidMessage;
byte receivedMessage[12];

void setup() {
  // set PWM pins to outputs:
  pinMode(RED_A, OUTPUT);
  pinMode(GREEN_A, OUTPUT);
  pinMode(BLUE_A, OUTPUT);
  
  pinMode(RED_B, OUTPUT);
  pinMode(GREEN_B, OUTPUT);
  pinMode(BLUE_B, OUTPUT);
  
  analogWrite(RED_A, 0);
  analogWrite(GREEN_A, 50);
  analogWrite(BLUE_A, 50);
  
  analogWrite(RED_B, 0);
  analogWrite(GREEN_B, 50);
  analogWrite(BLUE_B, 50);
  
  appearToHaveValidMessage = false;

  // initialize the serial communication:
  Serial.begin(9600);
}


void loop () {
  
  int availableBytes = Serial.available();
  // readColourFromSerial(availableBytes);
  if (availableBytes > 0) {
    byte b;
    while (Serial.available() > 0) {
      b = Serial.read();
    }
    Serial.print("NEW PROGRAMME: ");
    p++;
    resetAll();
    if (p > 2) { p = 0; };
    Serial.println(programmes[p]);
  }

  switch (p) {
    case 0:
      break;
    case 1:
      solid();
      break;
    case 2:
      fade();
      break;
  }

  updateChannels();
  delay(10);  
}

void resetAll() {
  colours[0] = 0;
  colours[1] = 0;
  colours[2] = 0;
  colours[3] = 0;
  colours[4] = 0;
  colours[5] = 0;
  fadeDirection = 1;
}

void updateChannels() {
  analogWrite(RED_A, colours[0]);
  analogWrite(GREEN_A, colours[1]);
  analogWrite(BLUE_A, colours[2]);
  analogWrite(RED_B, colours[3]);
  analogWrite(GREEN_B, colours[4]);
  analogWrite(BLUE_B, colours[5]);
}

void solid() {
  colours[0] = 0;
  colours[1] = 50;
  colours[2] = 50;
  colours[3] = 0;
  colours[4] = 50;
  colours[5] = 50;
}

void fade() {
  for (int i=5; i>=0; i--) {
    colours[i] += fadeDirection;
  }
  unsigned int tmp = colours[0];
  if (tmp == 0 || tmp == 255) {
    fadeDirection *= -1;
    Serial.print("FADE DIRECTION: ");
    Serial.println(fadeDirection);
  }
}

void readColourFromSerial(int availableBytes) {

  if (!appearToHaveValidMessage) {
    
    // If we haven't found a header yet, look for one.
    if (availableBytes >= kProtocolHeaderLength) {
      
      // Read then peek in case we're only one byte away from the header.
      byte firstByte = Serial.read();
      byte secondByte = Serial.peek();
      
      if (firstByte == kProtocolHeaderFirstByte &&
          secondByte == kProtocolHeaderSecondByte) {
            
          // We have a valid header. We might have a valid message!
          appearToHaveValidMessage = true;
          
          // Read the second header byte out of the buffer and refresh the buffer count.
          Serial.read();
          availableBytes = Serial.available();
      }
    }
  }
  
  if (availableBytes >= (kProtocolBodyLength + kProtocolChecksumLength) && appearToHaveValidMessage) {
     
    // Read in the body, calculating the checksum as we go.
    byte calculatedChecksum = 0;
    
    for (int i = 0; i < kProtocolBodyLength; i++) {
      receivedMessage[i] = Serial.read();
      calculatedChecksum ^= receivedMessage[i];
    }
    
    byte receivedChecksum = Serial.read();
    
    if (receivedChecksum == calculatedChecksum) {
      // Hooray! Push the values to the output pins.
      
      analogWrite(GREEN_A, receivedMessage[0]);
      analogWrite(BLUE_A, receivedMessage[1]);
      analogWrite(RED_A, receivedMessage[2]);
      
      analogWrite(GREEN_B, receivedMessage[3]);
      analogWrite(BLUE_B, receivedMessage[4]);
      analogWrite(RED_B, receivedMessage[5]);
      
      
      Serial.print("OK");
      Serial.write(byte(10));
      
    } else {
      
      Serial.print("FAIL");
      Serial.write(byte(10));
    }
    
    appearToHaveValidMessage = false;
  }
}
