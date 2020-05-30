#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>


const char* ssid = "siec99";  // Enter SSID here
const char* password = "qwerty12345678";  //Enter Password here

ESP8266WebServer server(80);

int Silnik_A=5;//Right side 
int Silnik_B=4;//Left side 
int Silnik_A_WSTECZ=0;//Right reverse 
int Silnik_B_WSTECZ=2;//Left reverse 
        

int bieg=7;
int PWM_Biegu=0;
int czas_jednego_zrywu_silnika_milisekundy=600;
int promienSkretuMinus=200;
 
void setup() {
  Serial.begin(115200);
  delay(100);
  
 pinMode(Silnik_A, OUTPUT); 
 pinMode(Silnik_B, OUTPUT); 
 pinMode(Silnik_A_WSTECZ, OUTPUT); 
 pinMode(Silnik_B_WSTECZ, OUTPUT); 

         
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected..!");
  Serial.print("Got IP: ");  Serial.println(WiFi.localIP());

  server.on("/", handle_OnConnect);






    server.on("/jedz",jedz);
    server.on("/ustawBieg",ustawBieg);
    server.on("/jakiBiegUstawiony",zwrocInformacjeOUstawionymBiegu);
    server.on("/ustawZrywSilnika",ustaw_czas_zrywu_silnika);
    server.on("/jakiZrywSilnika",zwroc_czas_zrywu_silnika);
    server.on("/skrecOstroLewo",skrecOstroLewo);
    server.on("/skrecOstroPrawo",skrecOstroPrawo);
    server.on("/ustawPromienSkretu",ustawPromienSkretuMinus);
    server.on("/jakiPromienSkretu",jakiPromienSkretu);
    server.on("/skrecLewo",skrecLewo);
    server.on("/skrecPrawo",skrecPrawo);


    
 
  server.begin();
  Serial.println("HTTP server started");

}
void loop() {
  
  server.handleClient();
  
}

void skrecLewo(){
   if(bieg==0){//Jade wstecz}
    if(PWM_Biegu-promienSkretuMinus>0){
       digitalWrite(Silnik_B, PWM_Biegu-promienSkretuMinus); 
     }else{
        digitalWrite(Silnik_B, LOW); 
     }
    
     digitalWrite(Silnik_A, PWM_Biegu); 
     digitalWrite(Silnik_A_WSTECZ,HIGH); 
     digitalWrite(Silnik_B_WSTECZ, HIGH); 
     
     server.send(200, "text/html", "skrecam Ostro W Lewo Wstecz");   
     delay(czas_jednego_zrywu_silnika_milisekundy);
  
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
    
  }else{
    if(PWM_Biegu-promienSkretuMinus>0){
       digitalWrite(Silnik_B, PWM_Biegu-promienSkretuMinus); 
     }else{
        digitalWrite(Silnik_B, LOW); 
     }
     digitalWrite(Silnik_A, PWM_Biegu); 
     digitalWrite(Silnik_A_WSTECZ,LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW); 
     
     server.send(200, "text/html", "skrecam Ostro W Lewo Przód");   
     delay(czas_jednego_zrywu_silnika_milisekundy);
  
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
  
    
  }




  
}

void skrecPrawo(){
   if(bieg==0){//Jade wstecz}
    if(PWM_Biegu-promienSkretuMinus>0){
       digitalWrite(Silnik_A, PWM_Biegu-promienSkretuMinus); 
     }else{
        digitalWrite(Silnik_A, LOW); 
     }
    
     digitalWrite(Silnik_B, PWM_Biegu); 
     digitalWrite(Silnik_A_WSTECZ,HIGH); 
     digitalWrite(Silnik_B_WSTECZ, HIGH); 
     
     server.send(200, "text/html", "skrecam Ostro W Lewo Wstecz");   
     delay(czas_jednego_zrywu_silnika_milisekundy);
  
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
    
  }else{
    if(PWM_Biegu-promienSkretuMinus>0){
       digitalWrite(Silnik_A, PWM_Biegu-promienSkretuMinus); 
     }else{
        digitalWrite(Silnik_A, LOW); 
     }
     digitalWrite(Silnik_B, PWM_Biegu); 
     digitalWrite(Silnik_A_WSTECZ,LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW); 
     
     server.send(200, "text/html", "skrecam Ostro W Lewo Przód");   
     delay(czas_jednego_zrywu_silnika_milisekundy);
  
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
  
    
  }




  
}


void skrecOstroPrawo(){

  if(bieg==0){//Jade wstecz}
    digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, PWM_Biegu); 
     digitalWrite(Silnik_A_WSTECZ,HIGH); 
     digitalWrite(Silnik_B_WSTECZ, HIGH); 
     
     server.send(200, "text/html", "skrecam Ostro W Lewo Wstecz");   
     delay(czas_jednego_zrywu_silnika_milisekundy);
  
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
    
  }else{
     digitalWrite(Silnik_A,LOW ); 
     digitalWrite(Silnik_B, PWM_Biegu); 
     digitalWrite(Silnik_A_WSTECZ,LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW); 
     
     server.send(200, "text/html", "skrecam Ostro W Lewo Przód");   
     delay(czas_jednego_zrywu_silnika_milisekundy);
  
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
  
    
  }
}

void skrecOstroLewo(){

  if(bieg==0){//Jade wstecz}
    digitalWrite(Silnik_A,PWM_Biegu ); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ,HIGH); 
     digitalWrite(Silnik_B_WSTECZ, HIGH); 
     
     server.send(200, "text/html", "skrecam Ostro W Lewo Wstecz");   
     delay(czas_jednego_zrywu_silnika_milisekundy);
  
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
    
  }else{
     digitalWrite(Silnik_A,PWM_Biegu ); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ,LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW); 
     
     server.send(200, "text/html", "skrecam Ostro W Lewo Przód");   
     delay(czas_jednego_zrywu_silnika_milisekundy);
  
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
  
    
  }
}

void jedz() {
    
  if(bieg==0){//Jade wstecz
      analogWrite(Silnik_A,PWM_Biegu ); 
     analogWrite(Silnik_B, PWM_Biegu); 
     digitalWrite(Silnik_A_WSTECZ,HIGH); 
     digitalWrite(Silnik_B_WSTECZ, HIGH); 
     
     server.send(200, "text/html", "Jadę do tyłu"); 
     Serial.println("Jadę do tyłu");
     delay(czas_jednego_zrywu_silnika_milisekundy);
      
      
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
    
  }else{//Jade do przodu
     analogWrite(Silnik_A,PWM_Biegu ); 
     analogWrite(Silnik_B, PWM_Biegu); 
     digitalWrite(Silnik_A_WSTECZ,LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW); 
     
     server.send(200, "text/html", "Jadę do przodu"); 
     Serial.println("Jadę do przodu");
     delay(czas_jednego_zrywu_silnika_milisekundy);
      
      
     digitalWrite(Silnik_A, LOW); 
     digitalWrite(Silnik_B, LOW); 
     digitalWrite(Silnik_A_WSTECZ, LOW); 
     digitalWrite(Silnik_B_WSTECZ, LOW);    
    
  }
    
     
}

void jakiPromienSkretu(){
    server.send(200, "text/html", ""+String( promienSkretuMinus));   
}


void handle_OnConnect(){
   server.send(200, "text/html", "Nawiązano połączenie");   
}

void ustawPromienSkretuMinus(){
    promienSkretuMinus=server.arg(0).toInt();
    Serial.println("Ustawiono promien skretu:"+ promienSkretuMinus);
    server.send(200, "text/html", "Ustawiono promień skrętu na:"+String( promienSkretuMinus));   
}

void zwroc_czas_zrywu_silnika(){
  server.send(200, "text/html", ""+String(czas_jednego_zrywu_silnika_milisekundy));   
  
}

void ustaw_czas_zrywu_silnika(){
    czas_jednego_zrywu_silnika_milisekundy=server.arg(0).toInt();
    Serial.println("Ustawiono czas zrywu silnika na:"+czas_jednego_zrywu_silnika_milisekundy);
    server.send(200, "text/html", "Ustawiono czas zrywu silnika na:"+String(czas_jednego_zrywu_silnika_milisekundy));   

 }

void zwrocInformacjeOUstawionymBiegu(){
  server.send(200, "text/html", ""+String(bieg));   
 }


void ustawBieg(){
  // 0-Wsteczny Pełna moc (1023)
  // 1-Jedynka 170
  // 2-Dwójka  340
  // 3-Trójka  510
  // 4-Czwórka 680
  // 5-Piątka  850
  // 6-Szóstka 1023
  //7-Luz         0 
  int ustawiany_bieg=server.arg(0).toInt();
  
  if(ustawiany_bieg>7){
    bieg=7; 
  }else if(ustawiany_bieg<0){
     bieg=1; 
  }else{
     bieg=ustawiany_bieg;
  }

  switch(bieg){
    case 0:
        PWM_Biegu=1023;
        digitalWrite(Silnik_A_WSTECZ,HIGH); 
        digitalWrite(Silnik_B_WSTECZ, HIGH); 
    break;

    case 1:
        PWM_Biegu=170;
        digitalWrite(Silnik_A_WSTECZ,LOW); 
        digitalWrite(Silnik_B_WSTECZ, LOW); 
    break;    

    case 2:
        PWM_Biegu=340;
        digitalWrite(Silnik_A_WSTECZ,LOW); 
        digitalWrite(Silnik_B_WSTECZ, LOW); 
    break;   

    case 3:
        PWM_Biegu=510;
        digitalWrite(Silnik_A_WSTECZ,LOW); 
        digitalWrite(Silnik_B_WSTECZ, LOW); 
    break;   

    case 4:
        PWM_Biegu=680;
        digitalWrite(Silnik_A_WSTECZ,LOW); 
        digitalWrite(Silnik_B_WSTECZ, LOW); 
    break;   

    case 5:
        PWM_Biegu=850;
        digitalWrite(Silnik_A_WSTECZ,LOW); 
        digitalWrite(Silnik_B_WSTECZ, LOW); 
    break;   

    case 6:
        PWM_Biegu=1023;
        digitalWrite(Silnik_A_WSTECZ,LOW); 
        digitalWrite(Silnik_B_WSTECZ, LOW); 
    break;   

    case 7:
        PWM_Biegu=0;
        digitalWrite(Silnik_A_WSTECZ,LOW); 
        digitalWrite(Silnik_B_WSTECZ, LOW); 
    break;   
    
  }

  

  
  String wiadomoscUstawianiaBiegu = "Ustawiam bieg na :";
  wiadomoscUstawianiaBiegu += bieg ;
  Serial.println(wiadomoscUstawianiaBiegu);
  
  server.send(200, "text/html", "Ustawiono bieg:"+String(bieg));   
 }












}}















void handle_OnConnect() {


  server.send(200, "text/html", "Connected Sucessfull"); 
}

void handle_NotFound(){
  server.send(404, "text/plain", "Not found");
}