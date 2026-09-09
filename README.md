# 🚗 Haval H6 Infotainment Reverse Engineering & Modding

> Unlocking hidden capabilities, ADB access, and system-level control on the Haval H6 infotainment platform.

**Status: ADB-over-WiFi ✅ · Root ✅ · Full system recon ✅ · Whitelist bypass ✅ · Apps installed ✅**

---

## 📌 Overview

This project documents the reverse engineering and modification of the **2021 Haval H6 (2nd gen, South African market)** infotainment system (head unit).

Goals:

* ~~Gain **ADB access**~~ ✅ done — wireless, unauthenticated, root
* ~~Explore **system properties (`getprop`)**~~ ✅ done — full dump in `recon/`
* ~~Understand the **head unit architecture**~~ ✅ done — see [`recon/HEAD_UNIT_RECON.md`](recon/HEAD_UNIT_RECON.md)
* Enable **hidden features** — GWM cfg flags identified, untested
* Modify **vehicle configuration flags**
* Install third-party apps — ✅ working (whitelist bypassed)

### Vehicle context (verified 2026-08)

* 2021 ZA H6: **wired CarPlay / Android Auto only**, no GWM connected-car app (that arrived with the facelift "Coffee OS").
* Head unit: **APTIV-integrated Android 9** — full verified identity table below.

---

## ⚠️ Disclaimer

> This project is for **educational and research purposes only**.

* You are responsible for any modifications made to your vehicle.
* Incorrect changes may:
  * Brick the head unit
  * Disable vehicle features
  * Void warranty
* Anything touching vehicle behavior (ADAS, lighting flags) is **safety-relevant** — change one thing at a time and be able to revert.

---

## 📱 Device Identity (verified via getprop / dumpsys)

| Property | Value |
|----------|-------|
| Vehicle | 2021 Haval H6, VIN `LGWFF6A58MH958839` |
| OS integrator | **APTIV** (tier-1), product brand HAVAL, model `B01G` |
| Platform | `gwmv3` / `V3_ICC`, HUT `gwmv3-PV B06/Overseas High Internal Amp` |
| SoC | **Renesas R-Car H3 (`r8a7795`)**, board `salvator-x`, 4× Cortex-A57-class, arm64-v8a |
| Android | **9 (Pie, API 28)** — `userdebug` **test-keys** build (`ro.debuggable=1`) |
| Build | `PQ2A.190405.003-RELtest-r8a7795 / OSSOP3.Debug.401.20210526.184918` (2021-05-26) |
| Kernel | Linux 4.14.133+ (Linaro GCC 7.3) |
| Firmware | `S018A02XKN11003` (part `7901105XKN11A`), serial `QDBBWAABDN2106080488` |
| Display | 1920×720 @60fps built-in (160dpi) + **two HDMI layer stacks** (multi-display) |
| RAM / Storage | ~5 GB / 64 GB eMMC (12 GB `/data`, 11+ GB free) |
| T-Box | Beantechs (`BEAN_EX_APTIV01` / F001) |

Full table: [`recon/HEAD_UNIT_RECON.md` §2](recon/HEAD_UNIT_RECON.md)

---

## 🔌 Connecting via ADB (the working procedure)

The head unit exposes **unauthenticated root ADB over WiFi**. This is the exact sequence that works:

1. **Car hotspot → "IP/TCP mode"** (other modes don't route — port scans just hang).
2. On the head unit, open the hidden **Engineering Mode** (`com.gwmv3.engineermode` — built into 2021/2022 firmware; GWM removed it in 2023+ builds) and enable the **wireless ADB switch**. It sets `service.adb.tcp.port=5555`.
3. Connect your laptop to the **car's hotspot** (subnet `192.168.40.x`).
4. Find the head unit's real IP — **the IP shown on screen can be stale** (we saw `.192` displayed while the unit actually answered on `.193`). Trust the ARP table:
   ```bash
   arp -a | grep "192.168.40"     # head unit MAC starts with d2:40:ef
   ```
5. Connect and elevate:
   ```bash
   adb connect 192.168.40.193:5555
   adb root                      # userdebug build → uid=0, context u:r:su:s0
   ```

### ⚡ The reset gotcha (why "it worked yesterday")

`service.adb.tcp.port` is a **runtime-only property**. `/init.rc` reacts to it:

```
on property:service.adb.tcp.port=5555
    stop adbd
    start adbd
```

→ **Every power cycle kills wireless ADB.** Re-toggle the Engineering Mode switch after each boot.

Optional fix (not applied by default — keeps root ADB open permanently):
```bash
adb shell setprop persist.adb.tcp.port 5555
```

### Historical notes

* The head unit has **two WiFi interfaces**: `wlan0` (client, e.g. phone hotspot) and `wlan1` (its own AP). Both can be active simultaneously.
* On the phone-hotspot network the unit was `172.20.10.4`.
* USB: config is `rndis,adb`; the unit's USB port did not enumerate as a device on macOS in our session — WiFi is the reliable path.

---

## 🔓 Root & Security Posture

| Control | State |
|---------|-------|
| `adb root` | **works** (userdebug/test-keys) → uid 0, `u:r:su:s0` |
| ADB authentication | **none** — `ro.adb.secure` unset, empty `adb_keys`; anyone on the car's network gets instant root |
| SELinux | Enforcing (but `su` domain permitted via adb root) |
| dm-verity / AVB | Enforcing; `vbmeta.device_state=locked` (AVB 1.1) |
| Bootloader unlock | `sys.oem_unlock_allowed=0` → **no Magisk/Xposed**; adb root is the only root |

**Security finding:** unauthenticated root ADB on all interfaces is a significant exposure — treat the car hotspot like an untrusted network.

---

## 🧱 Package Install Whitelist (the "session invalid" error)

GWM's framework carries a custom install whitelist (`dumpsys package`):

```
Package install whitelist:
  sInstallPackageArray=(com.gwm.app.appstore,com.gwm.app.themestore,com.aptiv.thememanager,com.tencent.sotainstaller)
```

On-device installs from any other app (APKPure, Aurora, Dudu theme center, …) are rejected with *"session invalid"*.

**Bypass (verified working):** install as root —

```bash
adb install app.apk              # from laptop
# or on the head unit itself (Termux + rish, see below):
pm install /sdcard/Download/app.apk
```

Community-confirmed behavior for this platform: "APTIV units can't install directly, but installed apps DO show."

---

## 🛠️ Modifications Applied (session log)

| Component | Version | Source | State |
|-----------|---------|--------|-------|
| Shizuku | 13.6.0 | F-Droid (`com.aurora.store_…` repo) | installed; server runs **as root** |
| Aurora Store | 4.8.4 | F-Droid | working (Play catalog, no GMS) |
| Termux | 0.118.3 | F-Droid | working (bootstrap OK) |
| rish (Shizuku shell) | shipped w/ Shizuku | deployed to Termux `~/bin/rish` + `~/bin/rish_shizuku.dex` | ready |

### Starting Shizuku (modern versions — no start.sh!)

Shizuku ≥ v13 dropped the `/sdcard/.../start.sh` method. The starter is a **native binary** shipped in the APK:

```bash
adb shell /data/app/moe.shizuku.privileged.api-*/lib/arm64/libshizuku.so
# → "info: shizuku_server pid is NNNN … exit with 0"
```

### On-device root shell (after power cycle)

```bash
# 1. Re-enable wireless ADB in Engineering Mode, then from laptop:
adb connect <car-ip>:5555 && adb root
adb shell /data/app/moe.shizuku.privileged.api-*/lib/arm64/libshizuku.so

# 2. On the head unit, in Termux:
RISH_APPLICATION_ID=com.termux ~/bin/rish
# first connect → approve the "Allow Termux?" prompt in Shizuku
# → pm install /sdcard/Download/anything.apk  (whitelist bypass, no laptop needed)
```

---

## 📦 App Compatibility (research results)

Constraints: **Android 9 (API 28) · arm64-v8a · 1920×720 landscape · NO Google Play Services**.

**Works well:**
* **Aurora Store** / **F-Droid** — app stores without GMS
* **Waze** (proven on Haval H6 platform by the community), **OsmAnd** / **Organic Maps** (offline), Sygic, Amap 车机版 8.1
* **NewPipe** / **SmartTube** (YouTube, no GMS/ads), **VLC**, **Poweramp**
* **Car Launcher** (`com.autolauncher.motorcar.free`), **Agama**, **dashline** (GitHub, minSdk 19)
* **Car Scanner ELM OBD2 / Torque Pro** + Bluetooth OBD dongle (BT works on the unit)
* **Termux**, **rish**, 应用管家 (App Manager — community ADB file manager for these units)
* **Gbox / GSpace** — GMS sandbox for apps that hard-require Google services

**Doesn't work / avoid:**
* Apps requiring Android 10/11/12+ (check "Min: Android" on APKMirror) — e.g. AutoZen (12L+)
* Magisk / LSPosed / Xposed — locked bootloader, no flash possible
* Anything hard-dependent on GMS directly (use Gbox instead)

---

## 🎨 Themes (research results)

* **GWM themes are just APKs.** Built-ins: `theme0201/0301/0302/0401` (`/system/app`, 60–72 MB each), discovered and applied by **AptivThemeManager** (`com.aptiv.thememanager` v2.0). GWM Theme Store (`com.gwm.app.themestore`) is one of the 4 whitelisted installers.
* New GWM-format theme APKs → `adb install` / rish `pm install` them.
* **嘟嘟桌面 PRO (Dudu Desktop PRO) Haval Edition** (`com.dudu.autoui`, free, dudu-lucky.com) — the community theming solution: built-in Theme Center (free themes as APKs), day/night auto-switching, explicit 1920×720 "fishtail screen" support, OBD/tire-pressure/HUD plugins, steering-wheel mapping.
* Official custom/dynamic wallpaper import (1920×720, USB) exists on newer Chinese-market desktops (灵控球); overseas firmware support varies.
* Paid custom theme packs are sold on Taobao for H6/Dargo/Tank300; community packs on 90APT's netdisks.
* ⚠️ On APTIV units, **Dudu's on-device theme installs hit the whitelist** — download in-app, install via `pm install` (rish) or `adb install`.
* Instrument-cluster themes are a different system (H6 GT / newer units) — not applicable here.

---

## 🧠 System Architecture (verified)

**Partitions:** `/` (dm-0, ro, verity) · `/vendor` (dm-1, ro, verity) · `/data` (vdb, 12 GB) · `/autonavi` (vdg, 20 GB — provisioned, ~empty on overseas unit) · `/aptivlog` (vdf, **93% full**) · `/tencent` (vdk, unused) · `/data/ota_package` + `/data/ota_transfer` (vfat staging)

**Network — the unit is a multi-homed automotive gateway:**

| Interface | Role |
|-----------|------|
| `eth0` (virtio) 192.168.10.10 | internal cluster network |
| `eth1` (ravb) 192.168.60.60 | automotive Ethernet backbone |
| `eth1_2/3/4/11/12/13` (VLANs) 172.16.x.99 | per-ECU domains — one `someipd` daemon each |
| `wlan0` | WiFi client (phone hotspot) |
| `wlan1` | the car's own hotspot AP (ADB link) |

**SOME/IP vehicle services** (from `someip_config-HUT.xml`): 9 services (IDs 0x0201–0x0403), UDP 32001–32012, multicast event groups 225.225.225.100–106; SD on 239.192.255.251:30490.

**Key processes/HALs:** vehicle HAL (`vehicle@2.0-service.aptiv`), EVS surround camera, iAP2/CarPlay HAL (port 7000), tbox HAL, GNSS, OP-TEE TEE, hostapd+dnsmasq (hotspot), Red Bend OTA client (`com.redbend.client`), 82 packages (54 priv-app).

Full details, listening ports, vehicle property map, SELinux contexts, logging system: **[`recon/HEAD_UNIT_RECON.md`](recon/HEAD_UNIT_RECON.md)**

---

## 🔍 Reverse Engineering Approach

```bash
adb shell getprop | grep gwm          # property discovery
adb pull /system/priv-app/GwmEngineerMode   # APK analysis (JADX / APKTool)
adb logcat                            # feature toggles, CAN/SOME-IP events, errors
adb shell dumpsys package             # whitelist + package internals
adb shell dumpsys car_service         # vehicle property configs
```

Pulled system APKs for analysis are in [`recon/apks/`](recon/apks/): `GwmEngineerMode.apk` (wireless ADB switch), `GwmSetting.apk`, `PackageInstaller.apk` (whitelist).

### GWM feature flags (community-documented, untested on this unit)

| Feature | Property |
|---------|----------|
| Heads-Up Display | `persist.vendor.gwm.cfg.head.up.display` |
| Auto High Beams | `persist.vendor.gwm.cfg.auto.high.beam` |
| ADAS Features | `persist.vendor.gwm.cfg.adas.enable` |

> ⚠️ Only meaningful if the hardware is present; ADAS-adjacent flags are safety-relevant.

---

## 🖥️ POC — OBD App Simulator

A working prototype that mimics the H6 12.3" screen (8:3) and simulates the OBD app from `COMMANDS.md` §23 — boot, launcher, ELM327 connect flow, PID probe, live gauges, graphs, DTC scan, plus Nav/Media/Phone/Settings mocks and an interactive car sim.

```bash
cd haval-h6-poc
npm install
npm run dev
```

All data is simulated (no hardware needed). Screenshots in `haval-h6-poc/screenshots/`.

---

## 📂 Repository Contents

```
README.md                    ← this file
COMMANDS.md / .pdf           ← vehicle command reference (incl. OBD app spec §23)
apkSideloading/code.md       ← sideloading research
haval-h6-poc/                ← OBD app simulator (Vite/JS)
recon/
  HEAD_UNIT_RECON.md         ← full 17-section system reconnaissance report
  getprop_full.txt           ← all 407 system properties
  packages_list.txt          ← 82 packages w/ paths
  package_dumpsys.txt        ← full PackageManager dump (install whitelist!)
  processes.txt              ← 242 processes
  network.txt                ← interfaces, routes, ports, ARP
  partitions.txt / mounts.txt
  build_props.txt            ← system + prop.default + vendor build.prop
  init.rc.txt                ← ADB TCP-port trigger mechanism
  someip_config.xml          ← SOME/IP vehicle service map
  permissions_config.txt / privapp_config.txt / selinux.txt
  car_props.txt / ota.txt / ota_client.txt
  display_input.txt / storage_mem.txt / settings_list.txt / services_list*.txt
  kernel_info.txt / dirs.txt / system_tree.txt / config_lists.txt / data_system.txt
  feature_props.txt / aptiv_identity.txt / hardware_vendor.txt / aptiv_dirs.txt
  apks/                      ← pulled GWM system APKs (EngineerMode, Setting, PackageInstaller)
```

---

## 🚧 Current Limitations

* `/system` is read-only (dm-verity) — permanent system mods need `adb disable-verity` (advanced, breaks OTA)
* No Magisk/Xposed (locked bootloader) — adb root + Shizuku is the ceiling
* Wireless ADB resets every power cycle (see the fix above)
* GWM cfg vehicle flags untested
* `/aptivlog` at 93% capacity (cosmetic, but watch it)

---

## 🛠️ Future Work

* [ ] Test GWM feature flags (HUD / auto high beam / ADAS)
* [ ] Dudu Desktop PRO Haval edition — install + theme flow
* [ ] Frida instrumentation of system_server (H6 GT community tooling as reference)
* [ ] OTA reverse engineering (Red Bend client, `/data/ota_package` staging)
* [ ] SOME/IP vehicle property ↔ CarProperty ID mapping
* [ ] Custom launcher trial (Car Launcher / dashline)

---

## 🤝 Contributing

Pull requests welcome. Focus areas:

* New property discoveries
* APK analysis findings
* Access methods / exploits
* Feature mapping (esp. `persist.vendor.gwm.cfg.*`)

---

## 📄 License

MIT License

---

## 🔗 References & Community

* [Shizuku](https://shizuku.rikka.app) — privileged API framework (starter docs)
* [Aurora Store](https://gitlab.com/AuroraOSS/AuroraStore) — Play client without GMS
* [Dudu Desktop PRO (嘟嘟桌面)](https://dudu-lucky.com/guide/dudu.html) — Haval special edition + theme center
* [90APT / GWM guides](http://gwm.90apt.com/) — Chinese community: wireless ADB, maps, app installs for 3rd-gen H6/Dargo/Tank300
* [car-factory/car_apk_manager](https://github.com/car-factory/car_apk_manager) — DNS-based install tooling for GWM units
* [ipsBruno/gwm-haval-multimidia-native](https://github.com/ipsBruno/gwm-haval-multimidia-native) / [haval-api-exploit](https://github.com/bobaoapae/haval-api-exploit) — Brazilian H6 GT RE (Telnet root, Frida)
* [leandrosavn/haval-impulse](https://github.com/leandrosavn/haval-app-tool-multimidia) — H6 GT vehicle property tool (Shizuku-based)
* bilibili: 王忘杰 / 哈弗益达 — video guides for this exact platform

---

## 💬 Notes

If you're working on a Haval H6 in South Africa or similar markets, firmware differences may apply — this repo documents the **2021 APTIV/`gwmv3` overseas (B01G)** unit specifically.
