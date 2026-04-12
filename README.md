# 🚗 Haval H6 Infotainment Reverse Engineering & Modding

> Unlocking hidden capabilities, ADB access, and system-level control on the Haval H6 infotainment platform.

---

## 📌 Overview

This project documents the reverse engineering and modification of the Haval H6 infotainment system.

The goal is to:

* Gain **ADB access**
* Explore **system properties (`getprop`)**
* Enable **hidden features**
* Modify **vehicle configuration flags**
* Understand the **Android-based head unit architecture**

---

## ⚠️ Disclaimer

> This project is for **educational and research purposes only**.

* You are responsible for any modifications made to your vehicle.
* Incorrect changes may:

  * Brick the head unit
  * Disable vehicle features
  * Void warranty

---

## 🧠 System Architecture

The Haval H6 infotainment runs on a customized Android OS with:

* Locked-down ADB
* Vendor-specific property configs
* CAN bus integration for vehicle features

### Key areas:

```
/system
/vendor
/persist
/data
```

---

## 🔌 Connecting via ADB

### Requirements

* MacOS / Linux / Windows
* Android Platform Tools
* USB connection (or WiFi ADB if enabled)

### Attempt connection:

```bash
adb devices
adb connect <headunit-ip>:5555
adb shell
```

### Common issues:

* No device detected → USB not in debug mode
* Authorization blocked → Developer options locked
* Charging-only USB port (common on Haval)

---

## 🔍 Exploring System Properties

Dump all properties:

```bash
adb shell getprop
```

### Example interesting properties:

```bash
persist.vendor.gwm.cfg.head.up.display
persist.vendor.gwm.cfg.auto.high.beam
persist.vendor.gwm.cfg.adas.enable
```

### Modify (if writable):

```bash
adb shell setprop <key> <value>
```

> ⚠️ Many properties are read-only unless rooted.

---

## ⚙️ Feature Flags & Hidden Settings

The infotainment uses **config flags** to enable/disable features.

### Examples:

| Feature          | Property                                 |
| ---------------- | ---------------------------------------- |
| Heads-Up Display | `persist.vendor.gwm.cfg.head.up.display` |
| Auto High Beams  | `persist.vendor.gwm.cfg.auto.high.beam`  |
| ADAS Features    | `persist.vendor.gwm.cfg.adas.enable`     |

---

## 🧩 Reverse Engineering Approach

### 1. Property Discovery

```bash
adb shell getprop | grep gwm
```

### 2. APK Analysis

Pull system apps:

```bash
adb pull /system/app
adb pull /system/priv-app
```

Analyze with:

* JADX
* APKTool

### 3. Log Monitoring

```bash
adb logcat
```

Useful for:

* Feature toggles
* CAN bus events
* Errors when enabling hidden settings

---

## 🔓 Potential Modifications

* Enable hidden UI toggles
* Unlock disabled vehicle features
* Force-enable ADAS configs
* Customize UI behavior
* Inject custom apps (if root achieved)

---

## 🚧 Current Limitations

* No root access (yet)
* Read-only vendor properties
* Locked bootloader
* Limited USB modes

---

## 🛠️ Future Work

* Root exploit research
* Custom launcher installation
* CAN bus message injection
* Full feature toggle mapping
* OTA update reverse engineering

---

## 📸 Screenshots

*Add your head unit screenshots here*

---

## 🤝 Contributing

Pull requests welcome. Focus areas:

* New property discoveries
* APK analysis findings
* Exploits / access methods
* Feature mapping

---

## 📄 License

MIT License

---

## 🔗 References

* Android ADB Documentation
* Reverse Engineering Android Apps
* CAN Bus Basics

---

## 💬 Notes

If you're working on a Haval H6 in South Africa or similar markets, firmware differences may apply.
