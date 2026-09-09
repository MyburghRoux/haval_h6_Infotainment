# 🛠️ Possible Modifications — Master List

> Compiled after full system recon + community research (2026-09).
> Target: 2021 Haval H6 overseas (APTIV `gwmv3`, Android 9 userdebug, root ADB available).
> Prereq for everything: wireless ADB up (Engineering Mode switch) + `adb root`.

**Legend:** ✅ done · 🔧 safe & reversible · ⚠️ vehicle-behavior risk · 🔴 advanced / brick risk

---

## A. Access & Persistence

| # | Modification | Command / Method | Status |
|---|--------------|------------------|--------|
| A1 | Make wireless ADB survive reboots | `setprop persist.adb.tcp.port 5555` | 🔧 (declined for now) |
| A2 | Root shell on the unit, no laptop | Termux + `RISH_APPLICATION_ID=com.termux ~/bin/rish` | ✅ deployed (approve prompt pending) |
| A3 | On-device app installs (whitelist bypass) | `pm install` via rish | ✅ capability ready |
| A4 | DNS-hijack install path (no laptop ever) | car_apk_manager project + smart-manual vuln | 🔴 research only |

---

## B. Apps & Launchers

| # | Modification | Notes | Status |
|---|--------------|-------|--------|
| B1 | Install any app | `adb install` / rish — whitelist bypassed | ✅ proven (Shizuku, Aurora, Termux) |
| B2 | Aurora Store (Play catalog, no GMS) | 4.8.4 F-Droid | ✅ installed |
| B3 | Termux (Linux on the unit) | 0.118.3 | ✅ installed |
| B4 | Dudu Desktop PRO Haval Edition | `com.dudu.autoui` from dudu-lucky.com — launcher + theme center + steering-wheel mapping + OBD plugins; 1920×720 fishtail support | 🔧 not installed |
| B5 | Car Launcher / Agama / dashline | Alternative car launchers (Android 9 compatible) | 🔧 |
| B6 | Gbox / GSpace | GMS sandbox for Google-dependent apps (Maps, YouTube proper) | 🔧 |
| B7 | 应用管家 (App Manager 1.5.6) | On-device ADB file manager; system mount, pseudo-uninstall | 🔧 Chinese community tool |
| B8 | Debloat / kill telemetry | `pm uninstall -k --user 0 com.beantechs.datatrackservice com.aptiv.log` (reversible: `pm enable`) | 🔧 |
| B9 | Install Car Scanner/Torque + BT OBD dongle | Real-time engine data on screen | 🔧 needs dongle |

---

## C. UI / Theming

| # | Modification | Notes | Status |
|---|--------------|-------|--------|
| C1 | Install GWM theme APKs | Themes are plain APKs discovered by AptivThemeManager (`theme0201–0401` format) | 🔧 source: theme store dumps / Taobao packs / 123pan |
| C2 | Dudu theme center themes | Download in-app → `pm install` via rish (whitelist hits on-device installs) | 🔧 after B4 |
| C3 | Custom wallpapers | 1920×720; USB import if overseas firmware supports it (GwmPhoto / 灵控球-style) | 🔧 test |
| C4 | Fullscreen any app (hide status bar) | `settings put global policy_control immersive.full=<pkg>` — documented GWM command; revert with `null` | 🔧 |
| C5 | Enable overlay/floating windows for apps | Grant `android.permission.SYSTEM_ALERT_WINDOW` → Amap speed HUD, Dudu floating ball | 🔧 |
| C6 | Auto-start apps on boot | Apps with `RECEIVE_BOOT_COMPLETED`; Chinese community uses a dedicated autostart APK | 🔧 |
| C7 | Steering-wheel button remapping | Dudu PRO 方控 mapping, or community 车机助手 | 🔧 after B4 |
| C8 | Launch hidden activities | `am start -n com.gwmv3.engineermode/.screen.main.EngineerModeActivity` — factory/AC plugin screens | 🔧 |
| C9 | System-wide theme editing (pull → patch → push theme APKs) | Needs 🔴 D1 first | 🔴 |

---

## D. System-level (advanced)

| # | Modification | Notes | Status |
|---|--------------|-------|--------|
| D1 | Disable dm-verity + remount `/system` rw | `adb disable-verity && reboot && adb remount` — enables permanent system mods, **breaks OTA** | 🔴 point of no return |
| D2 | Custom boot animation | Needs D1 | 🔴 |
| D3 | Replace GwmLauncher permanently (priv-app push) | Needs D1; or just set default home (🔧) | 🔴 / 🔧 |
| D4 | Audio policy tweaks (6-ch amp, volumes) | `/vendor/etc/audio_policy*.xml` — needs D1 + vendor remount | 🔴 |
| D5 | Move wireless ADB tool into /system (survives factory reset) | Chinese community method | 🔴 |

---

## E. Vehicle Behavior (⚠️ safety-relevant)

| # | Modification | Notes | Status |
|---|--------------|-------|--------|
| E1 | HUD flag | `setprop persist.vendor.gwm.cfg.head.up.display true` — only if projector hardware exists | ⚠️ untested |
| E2 | Auto high beam | `persist.vendor.gwm.cfg.auto.high.beam` | ⚠️ untested |
| E3 | ADAS enable | `persist.vendor.gwm.cfg.adas.enable` | ⚠️ untested — change one at a time |
| E4 | Region / locale / units | `persist.sys.*` props (zh-CN defaults on overseas unit) | ⚠️ low |
| E5 | HVAC/vehicle property mapping | `dumpsys car_service` — GWM-mapped CarProperty IDs (16–32°C setpoints etc.) | 🔧 read-only exploration |

---

## F. Telemetry / Diagnostics

| # | Modification | Notes | Status |
|---|--------------|-------|--------|
| F1 | Monitor SOME/IP vehicle bus | 9 services, UDP 32001–32012, multicast groups — passive logging | 🔧 |
| F2 | Logcat/CAR.AM monitoring | `adb logcat` — feature toggles, CAN events | 🔧 |
| F3 | Clean `/aptivlog` (93% full) | Purge old rotated logs | 🔧 |
| F4 | OTA reverse engineering | Red Bend client (`com.redbend.client`), `/data/ota_package` staging, FBL logs | 🔧 research |
| F5 | Block OTA (prevent re-lock) | Disable OTAClient — but you may *want* updates; document settings instead | ⚠️ choice |

---

## G. Research-grade (from the H6 GT / Brazilian community)

| # | Modification | Notes | Status |
|---|--------------|-------|--------|
| G1 | Frida server on the unit | Instrument system_server — unlock UI/vehicle tweaks without file mods | 🔴/🔧 |
| G2 | Vehicle property tool (Haval Impulse style) | AIDL interface to car services — H6 GT tooling, may need porting to Android 9/gwmv3 | 🔴 research |
| G3 | Cluster display customization | H6 GT only — **not applicable** to this unit | ❌ N/A |

---

## Recommended order

1. **Finish A2/A3** (approve Termux in Shizuku → you're self-contained)
2. 🔧 B4 Dudu Desktop → C2 themes, C7 button mapping (the visible wins)
3. 🔧 B8 debloat, C4 fullscreen, F3 log cleanup
4. ⚠️ E1–E3 flags one at a time (revert path ready)
5. 🔴 D1+ only after backing everything up and accepting OTA loss

**Before any dealer visit / OTA:** screenshot all settings — OTAs re-lock things (community-documented).
