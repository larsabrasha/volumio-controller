1. Install serialport for Raspberry Pi

```console
sudo apt-get install -y build-essential

sudo npm install serialport --unsafe-perm --build-from-source
```

2. Register volumio-controller as a service
```console
sudo cp ~/volumio-controller-service/volumio-controller.service /lib/systemd/system
sudo chown root:root /lib/systemd/system/volumio-controller.service
sudo systemctl enable volumio-controller.service
```

3. Enable volumio-controller when RFID-reader via USB is connected
```console
sudo cp ~/volumio-controller-service/100-volumio-controller.rules /etc/udev/rules.d
sudo chown root:root /etc/udev/rules.d/100-volumio-controller.rules

cd node_modules/serialport
sudo node-gyp configure build
```

4. Watch log
```console
sudo journalctl -f -u volumio-controller.service
```
