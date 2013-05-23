const int green1 = 6;
const int blue1 = 5;
const int red1 = 3;

const int green2 = 11;
const int blue2 = 10;
const int red2 = 9;

// Protocol details (two header bytes, 12 value bytes, checksum)

const int kProtocolHeaderFirstByte = 0xBA;
const int kProtocolHeaderSecondByte = 0xBE;

const int kProtocolHeaderLength = 2;
const int kProtocolBodyLength = 12;
const int kProtocolChecksumLength = 1;

// Buffers and state

bool appearToHaveValidMessage;
byte receivedMessage[12];

void setup() {
  // set pins 2 through 13 as outputs:
  pinMode(green1, OUTPUT);
  pinMode(blue1, OUTPUT);
  pinMode(red1, OUTPUT);
  
  pinMode(green2, OUTPUT);
  pinMode(blue2, OUTPUT);
  pinMode(red2, OUTPUT);
  
  analogWrite(red1, 0);
  analogWrite(green1, 50);
  analogWrite(blue1, 50);
  
  analogWrite(red2, 0);
  analogWrite(green2, 50);
  analogWrite(blue2, 50);
  
  appearToHaveValidMessage = false;

  // initialize the serial communication:
  Serial.begin(57600);
}


void loop () {
  
  int availableBytes = Serial.available();
  
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
      
      analogWrite(green1, receivedMessage[0]);
      analogWrite(blue1, receivedMessage[1]);
      analogWrite(red1, receivedMessage[2]);
      
      analogWrite(green2, receivedMessage[3]);
      analogWrite(blue2, receivedMessage[4]);
      analogWrite(red2, receivedMessage[5]);
      
      
      Serial.print("OK");
      Serial.write(byte(10));
      
    } else {
      
      Serial.print("FAIL");
      Serial.write(byte(10));
    }
    
    appearToHaveValidMessage = false;
  }
}
