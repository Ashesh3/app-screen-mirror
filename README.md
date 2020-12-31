# Android App Mirror with Scrcpy

Allows you to list all the apps on your Android device and mirror them instantly with scrcpy, connects wirelessly with ADB.

![](https://i.imgur.com/N4mnsLC.png)

## Demo:

![](https://media3.giphy.com/media/yy5UamygoIgsnVA77I/giphy.gif)


## Steps to Use:
1. Clone the repo
2. Review the code once
3. `npm i -g electron`
4. `npm i`
5. Start the electron app `npm start` or `electron .` inside the cloned folder

## Prerequists
1. ADB over Network should be enabled on the device
2. Android and the PC should be in same network
3. Phone does not need to be rooted (check `adb.js`)
4. [scrcpy](https://github.com/Genymobile/scrcpy "scrcpy") should be added in PATH

## Notes
1. To use ADB over USB, connect the device through ADB before starting the app, the app should then auto detect the connected device
2. Only one device at a time is supported.
