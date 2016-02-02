//
// Copyright 2015, Evothings AB
//
// Licensed under the Apache License, Version 2.0 (the "License")
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
// LinkIt One - Position
//
// Created February, 2015
//
// This example shows you how to fetch the position and share it using
// a simple webserver.
//

#include <LTask.h>
#include <LWiFi.h>
#include <LWiFiServer.h>
#include <LWiFiClient.h>
#include <LGPS.h>

// Configuration of the WiFi AP settings.
#define WIFI_AP "foo"
#define WIFI_PASSWORD "bar"

// LWIFI_OPEN, LWIFI_WPA, or LWIFI_WEP.
#define WIFI_AUTH LWIFI_WPA

// Configure how often the position should be fetced (ms),
const uint32_t gpsReadInterval = 5000;

// Configure the timeout of a http request (ms).
const uint32_t requestTimeout = 1000;

// Global variables
LWiFiServer server(80);
gpsSentenceInfoStruct gpsData;
char buff[256];
double latitude;
double longitude;
int hour, minute, second, num;

void setup()
{
	LTask.begin();
	LWiFi.begin();
	Serial.begin(115200);
	LGPS.powerOn(GPS_GLONASS);
	delay(2000);
}

void loop()
{
	static uint32_t lastGPSReadTimestamp = 0;
	static bool wifiStatusPrinted = false;

	connectToAccessPoint();

	if (Serial && wifiStatusPrinted == false)
	{
		printWifiStatus();
		wifiStatusPrinted = true;
	}
	else if(!Serial)
	{
		wifiStatusPrinted = false;
	}


	if (millis() - lastGPSReadTimestamp > gpsReadInterval)
	{
		LGPS.getData(&gpsData);
		parseGPGGA((const char*)gpsData.GPGGA);
		convertPositionToDecimalForm();
		lastGPSReadTimestamp = millis();
	}

	//Serial.println((char *)gpsData.GPGGA);

	LWiFiClient client = server.available();

	if (client)
	{
		Serial.println("new client");
		// an http request ends with a blank line
		boolean currentLineIsBlank = true;
		uint32_t lastReceptionTime = millis();
		while (client.connected())
		{
			if (client.available())
			{
				// we basically ignores client request, but wait for HTTP request end
				int c = client.read();
				lastReceptionTime = millis();

				Serial.print((char)c);

				if (c == '\n' && currentLineIsBlank)
				{
					Serial.println("send response");
					// send a standard http response header
					client.println("HTTP/1.1 200 OK");
					client.println("Content-Type: application/json");
					client.println("Connection: close");  // the connection will be closed after completion of the response
					client.println("Access-Control-Allow-Origin: *");
					client.println();
					client.print("{\"long\":\"");
					client.print(longitude, 8);
					client.print("\", \"lat\":\"");
					client.print(latitude, 8);
					client.print("\"}");
					client.println();
					break;
				}
				if (c == '\n')
				{
					// you're starting a new line
					currentLineIsBlank = true;
				}
				else if (c != '\r')
				{
					// you've gotten a character on the current line
					currentLineIsBlank = false;
				}
			}
			else
			{
				if (millis() - lastReceptionTime > requestTimeout)
				{
					Serial.println("Error - client timeout, dropping connection...");
					break;
				}
			}
		}
		// give the web browser time to receive the data
		delay(500);

		// close the connection:
		Serial.println("close connection");
		client.stop();
		Serial.println("client disconnected");
	}
}


// Helper functions

void connectToAccessPoint()
{

	while (LWiFi.status() != LWIFI_STATUS_CONNECTED)
	{
		if (LWiFi.connect(WIFI_AP, LWiFiLoginInfo(WIFI_AUTH, WIFI_PASSWORD)))
		{
			server.begin();
			printWifiStatus();
		}
		else
		{
			Serial.println("Error - failed to connect to WiFi");
		}
	}
}

void convertPositionToDecimalForm()
{

	double latitudeDecimalPart;
	double longitudeDecimalPart;

	latitude = latitude / 100.0;
	longitude = longitude / 100.0;

	latitudeDecimalPart = modf(latitude, &latitude);
	longitudeDecimalPart = modf(longitude, &longitude);

	latitude = latitude + (latitudeDecimalPart * 100.0 / 60.0);
	longitude = longitude + (longitudeDecimalPart * 100.0 / 60.0);
}

// Helper functions from the GPS.ino example by MediaTek

// Helper function for extracting GPS data from a NMEA string.
// Returns the offset of the character after the n:th comma.
// Returns 0 if the n:th comma is not found.
static unsigned char getComma(unsigned char num, const char *str)
{
	unsigned char i, j = 0;
	int len = strlen(str);
	for (i = 0; i < len; i ++)
	{
		if (str[i] == ',')
			j++;
		if (j == num)
			return i + 1;
	}
	return 0;
}

// Helper function for extracting GPS data from a NMEA string.
// Returns the number that follows the first comma in s.
static double getDoubleNumber(const char *s)
{
	char buf[10];
	unsigned char i;
	double rev;

	i = getComma(1, s);
	i = i - 1;
	strncpy(buf, s, i);
	buf[i] = 0;
	rev = atof(buf);
	return rev;
}

// Helper function for extracting GPS data from NMEA string.
// Returns the number that follows the first comma in s.
static double getIntNumber(const char *s)
{
	char buf[10];
	unsigned char i;
	double rev;

	i = getComma(1, s);
	i = i - 1;
	strncpy(buf, s, i);
	buf[i] = 0;
	rev = atoi(buf);
	return rev;
}

// Helper function for extracting GPS data from NMEA string.
void parseGPGGA(const char* GPGGAstr)
{
	/* Refer to http://www.gpsinformation.org/dale/nmea.htm#GGA
	 * Sample data: $GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47
	 * Where:
	 *  GGA          Global Positioning System Fix Data
	 *  123519       Fix taken at 12:35:19 UTC
	 *  4807.038,N   Latitude 48 deg 07.038' N
	 *  01131.000,E  Longitude 11 deg 31.000' E
	 *  1            Fix quality: 0 = invalid
	 *                            1 = GPS fix (SPS)
	 *                            2 = DGPS fix
	 *                            3 = PPS fix
	 *                            4 = Real Time Kinematic
	 *                            5 = Float RTK
	 *                            6 = estimated (dead reckoning) (2.3 feature)
	 *                            7 = Manual input mode
	 *                            8 = Simulation mode
	 *  08           Number of satellites being tracked
	 *  0.9          Horizontal dilution of position
	 *  545.4,M      Altitude, Meters, above mean sea level
	 *  46.9,M       Height of geoid (mean sea level) above WGS84
	 *                   ellipsoid
	 *  (empty field) time in seconds since last DGPS update
	 *  (empty field) DGPS station ID number
	 *  *47          the checksum data, always begins with *
	 */

	int tmp;
	if (GPGGAstr[0] == '$')
	{
		tmp = getComma(1, GPGGAstr);
		hour     = (GPGGAstr[tmp + 0] - '0') * 10 + (GPGGAstr[tmp + 1] - '0');
		minute   = (GPGGAstr[tmp + 2] - '0') * 10 + (GPGGAstr[tmp + 3] - '0');
		second   = (GPGGAstr[tmp + 4] - '0') * 10 + (GPGGAstr[tmp + 5] - '0');

		sprintf(buff, "UTC timer %2d-%2d-%2d", hour, minute, second);
		Serial.println(buff);

		tmp = getComma(2, GPGGAstr);
		latitude = getDoubleNumber(&GPGGAstr[tmp]);
		tmp = getComma(4, GPGGAstr);
		longitude = getDoubleNumber(&GPGGAstr[tmp]);

		// Extract and apply North/South and East/West.
		tmp = getComma(3, GPGGAstr);
		if(GPGGAstr[tmp] == 'N')
		{	// do nothing
		}
		else if(GPGGAstr[tmp] == 'S')
		{
			latitude = -latitude;
		}
		else
		{
			sprintf(buff, "Error: found %i(%c). Expected N or S.", GPGGAstr[tmp], GPGGAstr[tmp]);
			Serial.println(buff);
		}

		tmp = getComma(5, GPGGAstr);
		if(GPGGAstr[tmp] == 'E')
		{	// do nothing
		}
		else if(GPGGAstr[tmp] == 'W')
		{
			longitude = -longitude;
		}
		else
		{
			sprintf(buff, "Error: found %i(%c). Expected E or W.", GPGGAstr[tmp], GPGGAstr[tmp]);
			Serial.println(buff);
		}

		sprintf(buff, "latitude = %10.4f, longitude = %10.4f", latitude, longitude);
		Serial.println(buff);

		tmp = getComma(7, GPGGAstr);
		num = getIntNumber(&GPGGAstr[tmp]);
		sprintf(buff, "Number of satellites in view = %d", num);
		Serial.println(buff);
		Serial.println("Note: If number of satelites=0, there is no GPS position fix yet \n");
	}
	else
	{
		Serial.println("No Satellites in view ...");
	}
}

// Helper functions from the WifiWebServer.ino example developed by MediaTek

void printWifiStatus()
{
	// print the SSID of the network you're attached to:
	Serial.print("SSID: ");
	Serial.println(LWiFi.SSID());

	// print your WiFi shield's IP address:
	IPAddress ip = LWiFi.localIP();
	Serial.print("IP Address: ");
	Serial.println(ip);

	Serial.print("subnet mask: ");
	Serial.println(LWiFi.subnetMask());

	Serial.print("gateway IP: ");
	Serial.println(LWiFi.gatewayIP());

	// print the received signal strength:
	long rssi = LWiFi.RSSI();
	Serial.print("signal strength (RSSI):");
	Serial.print(rssi);
	Serial.println(" dBm\n");
}
