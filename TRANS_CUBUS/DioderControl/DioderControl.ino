const int GREEN_A = 6;
const int BLUE_A = 5;
const int RED_A = 3;

const int GREEN_B = 11;
const int BLUE_B = 10;
const int RED_B = 9;

int p = 0;
String programmes[] = {"OFF", "SOLID", "FADE", "STEREO", "FLASH", "NOISE"};
int delayArray[] = {0,0,20,50,50,100};
unsigned int colours[6] = {0,0,0,0,0,0};
unsigned int flashColours[6] = {255,0,255,255,0,255};
int flashEasing;
int fadeDirection;
bool strobeSwitch;

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
  byte command;
  // readColourFromSerial(availableBytes);
  if (availableBytes) {
    while (Serial.available() > 0) {
      command = Serial.read();
    }
    if (command == 'n')
      nextRoutine();
    else if (command >= 0 && command <= 4)
      setRoutine(command);
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
    case 3:
      strobe();
      break;
    case 4:
      flash();
      break;
    case 5:
      noise();
      break;
  }

  updateChannels();
  delay(delayArray[p]);  
}

void resetAll() {
  colours[0] = 0;
  colours[1] = 0;
  colours[2] = 0;
  colours[3] = 0;
  colours[4] = 0;
  colours[5] = 0;
  fadeDirection = 1;
  strobeSwitch = false;
  flashEasing = 50;
}

void setColours(unsigned int newColours[]) {
  for (int i = 0; i < 6; i++)
  {
    colours[i] = newColours[i]; 
  }
}

void setRoutine(int index) {
  p = index;
  //Serial.print("NEW PROGRAMME: ");
  Serial.print(programmes[p]);
  resetAll();
  if (p == 4)
    setColours(flashColours);
}

void nextRoutine() {
  p++;
  if (p > 5) { p = 0; };
  setRoutine(p);
}

void setBothToRed() {
  colours[0] = 255;
  colours[1] = 0;
  colours[2] = 0;
  colours[3] = 255;
  colours[4] = 0;
  colours[5] = 0;
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
    //Serial.print("FADE DIRECTION: ");
    //Serial.println(fadeDirection);
  }
}

void strobe() {
  setBothToRed();
  int start = (strobeSwitch) ? 0 : 3;
  colours[start]   = 0;
  colours[start+1] = 255;
  colours[start+2] = 255; 
  strobeSwitch = !strobeSwitch;
}

void flash() {
  int zeroCount = 0;
  for (int i = 5; i >= 0; i--)
  {
    if (colours[i] <= flashEasing) {
      colours[i] = 0;
      zeroCount++;
    }
    else
      colours[i] -= flashEasing;
  }
  if (flashEasing > 5)
    flashEasing--;
  if (zeroCount == 6)
    setRoutine(2);
}

void noise() {
  colours[0] = colours[3] = 47 + random(60);
  colours[1] = colours[4] = 84 + random(40);
  colours[2] = colours[5] = 107 + random(10);
}

