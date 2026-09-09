# Install APKs via ADB Sideloading

## Prerequisites

- Android device with **Developer Options** and **USB Debugging** enabled
- USB cable (data cable, not charge-only)
- `adb` (Android Debug Bridge) installed on your computer
  - macOS: `brew install android-platform-tools`
  - Linux: `sudo apt install adb` (Debian/Ubuntu) or `sudo dnf install android-tools` (Fedora)
  - Windows: download from the Android SDK platform-tools or use `winget install Google.PlatformTools`

## Setup

1. Enable Developer Options:
   - Go to **Settings > About phone**
   - Tap **Build number** 7 times
2. Enable USB Debugging:
   - **Settings > Developer options > USB debugging** — turn on
3. Connect your phone via USB and accept the **"Allow USB debugging?"** prompt on the device.

## Verify Connection

```bash
adb devices
```

Your device should appear as `device` (not `unauthorized` or `offline`).

## Install an APK

```bash
adb install path/to/app.apk
```

### Options

- `-r` — reinstall / keep existing app data:
  ```bash
  adb install -r path/to/app.apk
  ```
- `-d` — allow downgrade:
  ```bash
  adb install -r -d path/to/app.apk
  ```
- `-g` — grant all runtime permissions on install:
  ```bash
  adb install -g path/to/app.apk
  ```
- `-t` — allow test APKs (for `android:testOnly` apps):
  ```bash
  adb install -t path/to/app.apk
  ```

## Install Multiple APKs (push then install)

For large APKs, pushing first is more reliable:

```bash
adb push path/to/app.apk /sdcard/app.apk
adb shell pm install /sdcard/app.apk
```

## Install from an APK Already on the Device

```bash
adb shell pm install /sdcard/app.apk
```

## Uninstall

```bash
adb uninstall com.example.package
```

Keep app data on uninstall:

```bash
adb uninstall -k com.example.package
```

## Troubleshooting

| Error | Fix |
| --- | --- |
| `device unauthorized` | Re-accept the USB debugging prompt / unplug and reconnect |
| `device offline` | Replug cable, restart adb (`adb kill-server` then `adb start-server`) |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Add `-r`, or uninstall the existing app first |
| `INSTALL_FAILED_VERSION_DOWNGRADE` | Add `-d` |
| `INSTALL_FAILED_ALREADY_EXISTS` | Add `-r` or uninstall the app |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` | Free space on device |
| `INSTALL_FAILED_TEST_ONLY` | Add `-t` |
| `INSTALL_FAILED_USER_RESTRICTED` | On some OEMs, disable "USB installation" in developer options |
| `INSTALL_FAILED_INVALID_APK` | APK is corrupt or not a valid APK |

## Wireless ADB (optional, no cable)

1. Connect over USB once and run:
   ```bash
   adb tcpip 5555
   ```
2. Disconnect and connect over Wi-Fi (same network):
   ```bash
   adb connect <device-ip>:5555
   ```
3. Find the device IP under **Settings > About phone > Status**.
4. Then install as normal:
   ```bash
   adb install path/to/app.apk
   ```

## Useful Commands

```bash
adb devices                 # list connected devices
adb kill-server             # stop adb server
adb start-server            # start adb server
adb shell pm list packages  # list installed packages
adb shell dumpsys package com.example.package  # inspect a package
adb logcat                  # view device logs
```