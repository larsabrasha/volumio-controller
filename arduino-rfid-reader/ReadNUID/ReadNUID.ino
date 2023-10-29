/*
 * Reading RFID card and printing 
 * Inspired by https://highvoltages.co/tutorial/arduino-tutorial/arduino-mfrc522-tutorial-is-rfid-tag-present-or-removed/
 *
 * Typical pin layout used:
 * -----------------------------------------------------------------------------------------
 *             MFRC522      Arduino       Arduino   Arduino    Arduino          Arduino
 *             Reader/PCD   Uno/101       Mega      Nano v3    Leonardo/Micro   Pro Micro
 * Signal      Pin          Pin           Pin       Pin        Pin              Pin
 * -----------------------------------------------------------------------------------------
 * RST/Reset   RST          9             5         D9         RESET/ICSP-5     RST
 * SPI SS      SDA(SS)      10            53        D10        10               10
 * SPI MOSI    MOSI         11 / ICSP-4   51        D11        ICSP-4           16
 * SPI MISO    MISO         12 / ICSP-1   50        D12        ICSP-1           14
 * SPI SCK     SCK          13 / ICSP-3   52        D13        ICSP-3           15
 */

#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN 9
#define SS_PIN 10

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance
MFRC522::Uid cardId;

void printHex(uint8_t *data, uint8_t length)
{
  for (byte i = 0; i < length; i++)
  {
    Serial.print(data[i] < 0x10 ? "0" : "");
    Serial.print(data[i], HEX);
  }
}

void copyReadCardIdInto(MFRC522::Uid *id) {
  memset(id, 0, sizeof(MFRC522::Uid));
  memcpy(id->uidByte, mfrc522.uid.uidByte, mfrc522.uid.size);
  id->size = mfrc522.uid.size;
  id->sak = mfrc522.uid.sak;
}

/***/

void setup() {
  Serial.begin(9600);  // Initialize serial communications with the PC
  SPI.begin();         // Init SPI bus
  mfrc522.PCD_Init();
}

void loop() {
  MFRC522::MIFARE_Key key;
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  MFRC522::StatusCode status;

  // Look for new cards
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  copyReadCardIdInto(&cardId);
  Serial.print("NewCard ");
  printHex(cardId.uidByte, cardId.size);
  Serial.println("");

  while (true) {
    uint8_t control = 0x00;

    for (int i = 0; i < 3; i++) {
      if (!mfrc522.PICC_IsNewCardPresent()) {
        if (mfrc522.PICC_ReadCardSerial()) {
          // Serial.print('a');
          control |= 0x16;
        }
        if (mfrc522.PICC_ReadCardSerial()) {
          // Serial.print('b');
          control |= 0x16;
        }
        // Serial.print('c');
        control += 0x1;
      }
      // Serial.print('d');
      control += 0x4;
    }

    // Serial.println(control);
    if (control == 13 || control == 14) {
      // Card is still there
    } else {
      break;
    }
  }
  Serial.println("CardRemoved");
  delay(200);  //change value if you want to read cards faster

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}