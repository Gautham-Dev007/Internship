#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <FS.h>
#include <LittleFS.h>
#include <WiFiClientSecure.h>
#include "base64.h"

// ====== CONFIGURATION ======
const char* ssid = "WIFI name";
const char* password = "WIFI password";

// SMTP (example for Gmail)
const char* smtp_server = "smtp.gmail.com";
const int smtp_port = 465;
const char* smtp_user = "Email to be connected";
const char* smtp_pass = "email password";

WebServer server(80);

void handleRoot() {
  server.send(200, "text/plain", "Hello from STM32");
}

AsyncWebServer server(80);
String emailFile = "/emails.json";

// ====== HELPERS ======
bool loadEmails(JsonArray& emailList, DynamicJsonDocument& doc) {
  if (!LittleFS.exists(emailFile)) return false;
  File file = LittleFS.open(emailFile, "r");
  if (!file) return false;
  DeserializationError err = deserializeJson(doc, file);
  file.close();
  return !err;
}

bool saveEmails(JsonArray& emailList, DynamicJsonDocument& doc) {
  File file = LittleFS.open(emailFile, "w");
  if (!file) return false;
  serializeJson(doc, file);
  file.close();
  return true;
}

bool addEmail(const String& email) {
  DynamicJsonDocument doc(1024);
  JsonArray list = doc.to<JsonArray>();
  loadEmails(list, doc);

  // Check duplicates
  for (JsonVariant v : list) {
    if (v.as<String>() == email) return false;
  }

  list.add(email);
  return saveEmails(list, doc);
}

void sendEmail(const char* to, const char* subject, const char* message) {
  WiFiClientSecure client;
  client.setInsecure();

  if (!client.connect(smtp_server, smtp_port)) {
    Serial.println("SMTP connection failed");
    return;
  }

  client.println("HELLO STM32");
  client.println("AUTH LOGIN");
  client.println(base64::encode(smtp_user));
  client.println(base64::encode(smtp_pass));
  client.println("MAIL FROM: <" + String(smtp_user) + ">");
  client.println("RCPT TO: <" + String(to) + ">");
  client.println("DATA");
  client.println("Subject: " + String(subject));
  client.println("To: " + String(to));
  client.println("");
  client.println(message);
  client.println(".");
  client.println("QUIT");
}

// ====== WEB PAGES ======
String htmlForm() {
  return R"rawliteral(
  <!DOCTYPE html><html>
  <head><meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>Email Signup</title>
  <style>
    body { font-family: Arial; text-align:center; background:#f4f4f4; }
    form { margin-top:20px; }
    input { padding:10px; margin:5px; }
    .btn { background:#007BFF; color:white; border:none; padding:10px 20px; cursor:pointer; }
  </style></head>
  <body>
  <h1>Subscribe to Our Mailing List</h1>
  <form action='/submit' method='POST'>
    <input type='email' name='email' placeholder='Enter your email' required>
    <input class='btn' type='submit' value='Subscribe'>
  </form>
  <br><a href='/admin'>Admin Panel</a>
  </body></html>
  )rawliteral";
}

String htmlAdmin() {
  DynamicJsonDocument doc(1024);
  JsonArray list = doc.to<JsonArray>();
  loadEmails(list, doc);

  String page = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'>"
                "<title>Admin Panel</title></head><body><h2>Collected Emails</h2><ul>";
  for (JsonVariant v : list) {
    page += "<li>" + v.as<String>() + "</li>";
  }
  page += "</ul></body></html>";
  return page;
}

// ====== SERVER HANDLERS ======
void setupServer() {
  server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
    request->send(200, "text/html", htmlForm());
  });

  server.on("/admin", HTTP_GET, [](AsyncWebServerRequest* request) {
    request->send(200, "text/html", htmlAdmin());
  });

  server.on("/submit", HTTP_POST, [](AsyncWebServerRequest* request) {
    if (request->hasParam("email", true)) {
      String email = request->getParam("email", true)->value();
      if (addEmail(email)) {
        sendEmail(email.c_str(), "Welcome!", "Thanks for subscribing!");
        request->send(200, "text/html", "<h1>Thanks for subscribing!</h1><a href='/'>Back</a>");
      } else {
        request->send(200, "text/html", "<h1>Email already exists!</h1><a href='/'>Back</a>");
      }
    } else {
      request->send(400, "text/plain", "Email missing");
    }
  });
}

// ====== MAIN SETUP ======
void setup() {
  Serial.begin(115200);
  if (!LittleFS.begin(true)) {
    Serial.println("LittleFS Mount Failed");
    return;
  }
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");

  setupServer();
  server.begin();
}

void loop() {
    server.handleClient();
    }
