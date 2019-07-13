0. Install serialport for Raspberry Pi if needed

```bash
sudo apt-get update
sudo apt-get install -y build-essential
sudo npm install serialport --unsafe-perm --build-from-source

cd node_modules/serialport
sudo node-gyp configure build
```

1. Install packages
```bash
npm install
```

2. Register volumio-controller as a service and start it
```bash
sudo cp ~/volumio-controller-service/volumio-controller.service /lib/systemd/system
sudo chown root:root /lib/systemd/system/volumio-controller.service

sudo systemctl enable volumio-controller.service
sudo systemctl start volumio-controller.service
```

3. Enable volumio-controller when RFID-reader via USB is connected
```bash
sudo cp ~/volumio-controller-service/100-volumio-controller.rules /etc/udev/rules.d
sudo chown root:root /etc/udev/rules.d/100-volumio-controller.rules
```

4. Watch log
```bash
sudo journalctl -f -u volumio-controller.service
```
