
//
// Copyright 2014, Andreas Lundquist
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// DFRobot - Bluno - Hello World
//                                               version: 0.2 - 2014-12-01
//

void setup() {
  Serial.begin(115200);

  pinMode(2, OUTPUT);
  pinMode(A0, INPUT);             
}

void loop() {

  int sensorReading = analogRead(A0);

  byte buffer[3] = {0xAD, 
                    (byte)sensorReading,
                    (byte)(sensorReading >> 8)
                   };

  Serial.write(buffer, sizeof(buffer));


  if (Serial.available())
  {

    byte cmd = Serial.read();

    if (cmd == 0x01) {

      digitalWrite(2, HIGH);
    }
    else if (cmd == 0x00) {

      digitalWrite(2, LOW);
    }
  }

  delay(200); 
}




