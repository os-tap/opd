#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
 #include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

//#include "index.h"

#ifndef STASSID
#define STASSID "Mi A3"
#define STAPSK  "35353535"
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

//IPAddress ip(192,168,1,10);  //статический IP
//IPAddress gateway(192,168,1,1);
//IPAddress subnet(255,255,255,0);

int pov1 = 10;// = 10;               //настройка скорости поворотника
int pov2 = 20;

const int led = 13;
 
const int PinNP = 2;      
const int NeoPix = 60;
int r = 255, g = 255, b = 255;

int STATE = 0;

/*
0 - neutral
1 - left
2 - right
3 - avaria
*/

ESP8266WebServer server(80);

Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NeoPix, PinNP, NEO_RGB + NEO_KHZ800); //это я хз для чего


void HandleState(int new_state = -1) {
  if (new_state >= 0){
    STATE = new_state;
  }
    server.sendHeader("Access-Control-Allow-Origin", "http://opd.ostap.xyz");
    server.send(200);
}

void LightsOut(){
  for (int i = 0; i < NeoPix; ++i) {
        pixels.setPixelColor(i, pixels.Color(0,0,0));
    }
  pixels.show();
}

void setup(void) {
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  //WiFi.config(ip, gateway, subnet);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder started");
  }

  server.on("/", [](){
    server.send(200, "text/html", "Hello");
//    server.send(200, "text/html", INDEX_PAGE);
  });

  server.on("/left", [](){
    HandleState(1);
  });
  server.on("/right", [](){
    HandleState(2);
  });
  server.on("/neutral", [](){
    HandleState(0);
  });
  server.on("/avaria", [](){
    HandleState(3);
  });
  server.on("/speed", [](){
    for (uint8_t i = 0; i < server.args(); i++) {
      if (server.argName(i)=="v") {
        pov2 = server.arg(i).toInt();
        break;
      }
    }
    
    HandleState();
  });
  server.on("/color", [](){
    for (uint8_t i = 0; i < server.args(); i++) {
      if (server.argName(i)=="r") {
        r = server.arg(i).toInt();
      }
      if (server.argName(i)=="g") {
        g = server.arg(i).toInt();
      }
      if (server.argName(i)=="b") {
        b = server.arg(i).toInt();
      }
    }
    
    HandleState();
  });

  server.on("/unload", [](){
    for (uint8_t i = 0; i < server.args(); i++) {
      if (server.argName(i)=="r") {
        r = server.arg(i).toInt();
      }
      if (server.argName(i)=="g") {
        g = server.arg(i).toInt();
      }
      if (server.argName(i)=="b") {
        b = server.arg(i).toInt();
      }
      if (server.argName(i)=="active") {
        
          if(server.arg(i) == "neutral")  STATE = 0;
          if(server.arg(i) == "left")     STATE = 1;
          if(server.arg(i) == "right")    STATE = 2;
          if(server.arg(i) == "avaria")   STATE = 3;
          
      }
      if (server.argName(i)=="speed") {
        pov2 = server.arg(i).toInt();
      }
    }
    
    HandleState();
  });


  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
  pixels.begin();
  LightsOut();
}


bool DelayHandle(int old_state) {
  pixels.show();
  delay(pov1);
  server.handleClient();
  if (STATE != old_state) LightsOut();
  return STATE == old_state;
}

void Left() {  
    //Serial.println("Left");                 //левый поворот
    for (int i = 0; i < NeoPix; ++i) {
        pixels.setPixelColor(i + NeoPix/2, pixels.Color(g,r,b));
        if (!DelayHandle(1)) return;
    }
   
    for (int i = 0; i < NeoPix; ++i) {
        pixels.setPixelColor(i+NeoPix/2, pixels.Color(0,0,0));
        if (!DelayHandle(1)) return;
    }
   
    delay(pov2);
}
 
void Right() {     
    //Serial.println("Right");               //правый поворот
    for (int i = 0; i < NeoPix; ++i) {
        pixels.setPixelColor(NeoPix/2-i, pixels.Color(g,r,b));
        if (!DelayHandle(2)) return;
    }
   
    for (int i = 0; i < NeoPix; ++i) {
        pixels.setPixelColor(NeoPix/2-i, pixels.Color(0,0,0));
        if (!DelayHandle(2)) return;
    }
   
    delay(pov2);
}
 
void Emergency() { 
    //Serial.println("Ember");               //аварийка
    for (int i = 0; i < NeoPix; ++i) {
        pixels.setPixelColor(NeoPix/2-i, pixels.Color(g,r,b));
        pixels.setPixelColor(i+NeoPix/2, pixels.Color(g,r,b));
        if (!DelayHandle(3)) return;
    }
   
    for (int i = 0; i < NeoPix; ++i) {
        pixels.setPixelColor(NeoPix/2 - i, pixels.Color(0,0,0));
        pixels.setPixelColor(i + NeoPix/2, pixels.Color(0,0,0));
        if (!DelayHandle(3)) return;
    }
   
    delay(pov2);
}

void loop(void) {
  //pixels.clear();
  //LightsOut();

  switch(STATE){
    case 0:
      //LightsOut();
      break;
    case 1: 
      Left();
      break;
    case 2:
      Right();
      break;
    case 3: 
      Emergency();
      break;
  }

  server.handleClient();
  MDNS.update();
}


void handleNotFound() {
  digitalWrite(led, 1);
  String args = "";
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    args += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message+args);
  Serial.println(server.uri()+"\n"+args);
  digitalWrite(led, 0);
}
