# Haval H6 (2021) Head Unit — Complete System Documentation

> **Read-only reconnaissance.** No modifications were made to the head unit.
> All data captured live over wireless ADB (`adb root` — device is a `userdebug` build).
> Raw dumps are saved alongside this report in `recon/`.

---

## Table of Contents
1. [Connection & Access](#1-connection--access)
2. [Device Identity & Firmware](#2-device-identity--firmware)
3. [Hardware](#3-hardware)
4. [ADB-over-WiFi Mechanism](#4-adb-over-wifi-mechanism)
5. [Network Architecture](#5-network-architecture)
6. [Filesystem & Partitions](#6-filesystem--partitions)
7. [Package Install Whitelist](#7-package-install-whitelist)
8. [Installed Packages (82)](#8-installed-packages)
9. [Running Processes & HAL Services](#9-running-processes--hal-services)
10. [SOME/IP Vehicle Network](#10-someip-vehicle-network)
11. [Vehicle Properties (CarPropertyService)](#11-vehicle-properties)
12. [Display & Input](#12-display--input)
13. [SELinux & Security](#13-selinux--security)
14. [OTA System](#14-ota-system)
15. [Logging System](#15-logging-system)
16. [System Services (dumpsys)](#16-system-services)
17. [File Inventory](#17-file-inventory)

---

## 1. Connection & Access

| Item | Value |
|------|-------|
| ADB endpoint (this session) | `192.168.40.193:5555` (car hotspot, IP/TCP mode) |
| Previous session endpoint | `172.20.10.4:5555` (phone hotspot) |
| Root | **YES** — `adb root` → `uid=0(root)`, context `u:r:su:s0` |
| ADB authentication | **NONE** — `ro.adb.secure` unset; no RSA key prompt |
| adbd runtime props | `service.adb.tcp.port=5555`, `service.adb.root=1` |

**Note:** The head unit has TWO WiFi interfaces — `wlan0` (STA/client) and `wlan1` (AP/hotspot). It can be connected to a phone hotspot (`wlan0`) while simultaneously hosting its own hotspot (`wlan1`). The car hotspot must be in **IP/TCP mode** for ADB to be reachable over it.

---

## 2. Device Identity & Firmware

| Property | Value |
|----------|-------|
| Vehicle | 2021 Haval H6 (2nd gen), VIN `LGWFF6A58MH958839` |
| Product model | `B01G` (GWM model code) |
| OS brand/integrator | **APTIV** (tier-1 supplier) |
| Product name/device | `gwmv3` |
| HUT type | `V3_ICC` |
| Hardware config | `gwmv3-PV B06/Overseas High Internal Amp` |
| Android | **9 (Pie), API 28** |
| Build ID | `PQ2A.190405.003-RELtest-r8a7795` |
| Incremental | `OSSOP3.Debug.401.20210526.184918` |
| Build type | `userdebug` (test-keys) — **not a production user build** |
| Build date | 2021-05-26 (CST) |
| Build host | `381abefabac6` (Docker container) |
| Software version | `S018A02XKN11003` |
| Part number | `7901105XKN11A` |
| Serial | `QDBBWAABDN2106080488` |
| HUT UIN | `AABDN012106080488A01` / node `AABDN-773` |
| eMMC | 64 GB |
| Telematics project | `BEAN_EX_APTIV01` (id F001, Beantechs T-Box) |
| Locale defaults | `zh-CN` (persist.sys.language=zh, country=CN); unit set to `en` / `Africa/Maputo` |
| WiFi country code | `CN` |

---

## 3. Hardware

| Component | Detail |
|-----------|--------|
| SoC | Renesas R-Car H3 ES3.x (`r8a7795`), board `salvator-x` |
| CPU | 4× ARM Cortex-A57-class (AArch64) — `CPU part 0xd07`, plus cluster entries; ARMv8 |
| GPU | PowerVR (pvrsrvctl / pvr_* kernel threads present) |
| RAM | ~5 GB (`MemTotal: 5210716 kB`) |
| Kernel | Linux 4.14.133+, Linaro GCC 7.3, built 2021-05-26 (same Docker host) |
| Android GL | OpenGL ES 3.1 (`ro.opengles.version=196610`) |
| Storage | 64 GB eMMC, virtio-block devices (`vda`–`vdk`) |
| TEE | OP-TEE (`optee_debug_log`, `tee_supplicant`, `hal_keymaster_renesas`, `hal_gatekeeper_renesas`) |
| WiFi/Bluetooth | Broadcom (bcmsdh_sdmmc driver; `dhd_*` kernel threads; separate MACs `d2:40:ef:d2:77:9b` wlan0 / `d2:40:ef:b2:77:9b` wlan1) |
| Automotive Ethernet PHY | RAVB (`ravb` driver, eth1) |
| IMU | ASM330LHH (automotive 6-axis inertial, `irq/109-asm330l` thread) |
| GNSS | aptiv GNSS HAL 1.1 (`gnsshal_1_1`) |
| Audio | 6-channel internal amp (`fmas.spkr_6ch`), AAC 5.1, Renesas OMX codecs (H263/H264/H265/M2V/M4V/VC1/VP8/VP9) |

### Block devices (`/proc/partitions`)
| Device | Size (blocks) | Partition use |
|--------|---------------|---------------|
| vda | 512 MB | vendor (→ `/vendor`) |
| vdb | ~12.4 GB | `/data` |
| vdc | 3.5 GB | system (root `/` via dm-0) |
| vdd | 3 GB | `/data/ota_package` (vfat) |
| vde | 0.5 MB | (small/misc) |
| vdf | ~824 MB | `/aptivlog` |
| vdg | 20 GB | `/autonavi` |
| vdh | 0.5 MB | vbmeta (AVB) |
| vdi | 128 MB | `/data/ota_transfer` (vfat) |
| vdj | 4 MB | (small/misc) |
| vdk | ~13.5 GB | `/tencent` |
| dm-0 / dm-1 | — | verity-mapped system / vendor |

---

## 4. ADB-over-WiFi Mechanism

From `/init.rc`:
```
# aptiv interface will set tcp port
on property:service.adb.tcp.port=5555
    stop adbd
    start adbd
```

- The **Engineering Mode app** (`com.gwmv3.engineermode`, `sharedUserId=android.uid.system`, `EngineerModeActivity`) contains the wireless-ADB switch. Toggling it sets `service.adb.tcp.port=5555` and restarts adbd.
- `service.*` properties are **runtime-only** → wireless ADB **resets at every power cycle**. This explains "it worked last time" followed by a closed port.
- adbd listens on `*:5555` (all interfaces, IPv6) and `127.0.0.1:5037`.
- `ro.adb.secure` unset → no auth. **Anyone on the car's network gets instant root.**
- USB config is `rndis,adb` (RNDIS tether + ADB), `persist.sys.usb.config=mtp,adb`.

---

## 5. Network Architecture

### Interfaces (the head unit is a multi-homed automotive gateway)
| Interface | IP | Role |
|-----------|-----|------|
| `eth0` (virtio_net) | 192.168.10.10/24 | Internal virtual/cluster network (ARP peer 192.168.10.1) |
| `eth1` (ravb) | 192.168.60.60/24 | Automotive Ethernet (SOME/IP backbone) |
| `eth1_2`–`eth1_4`, `eth1_11`–`eth1_13` | 172.16.{2,3,4,11,12,13}.99/24 | 802.1-style VLAN sub-interfaces on eth1 — each talks to a different ECU (ARP shows peers `.1`, `.83`, `.91`, `.97`, `.176`, `.178` etc.) |
| `wlan0` | 172.20.10.4/28 | WiFi STA — client of phone hotspot |
| `wlan1` | 192.168.40.193/24 | WiFi AP — the car's own hotspot (this session's ADB link) |
| `bcm0` | (link-local only) | Secondary Broadcom interface |

### Listening ports
| Port | Process | Purpose |
|------|---------|---------|
| 5555 | adbd | **ADB (root, no auth)** |
| 5037 (localhost) | adbd | ADB smart-socket |
| 7000 | com.aptiv.carplay | **CarPlay / iAP2 network session** |
| 53 | dnsmasq | DHCP/DNS for car hotspot clients |
| 2001, 3500, 3600, 6000, 7001, 7100, 8008, 8009, 55229, 31113 (localhost), 3510 (localhost) | com.softmedia.receiver (`tmedia.receiver` — user-sideloaded app) | App's own servers |

---

## 6. Filesystem & Partitions

| Mount | Device | Type | Mode | Use |
|-------|--------|------|------|-----|
| `/` | /dev/root (dm-0) | ext4 | **ro**, dm-verity | system (root image) |
| `/vendor` | dm-1 | ext4 | **ro**, dm-verity | vendor |
| `/data` | vdb | ext4 | rw | app/data (12 GB, 9% used) |
| `/autonavi` | vdg | ext4 | rw | AutoNavi navigation data (20 GB, 1% used) |
| `/aptivlog` | vdf | ext4 | rw | APTIV logs (**93% full — 733 MB/795 MB**) |
| `/tencent` | vdk | ext4 | rw | Tencent (SOTA/nav service) data (13 GB, empty) |
| `/data/ota_package` | vdd | vfat | rw | OTA staging |
| `/data/ota_transfer` | vdi | vfat | rw | OTA transfer/FBL logs |

Other mounts: sdcardfs (`/storage/emulated`), tmpfs on `/dev`, `/mnt`, cgroups, debugfs/tracefs, configfs (USB gadget).

Notable directories:
- `/system/etc/someip/` — SOME/IP config (see §10)
- `/vendor/etc/aptiv/iap/` — **iAP2 (Apple iPod Accessory Protocol 2) configs** for CarPlay: `iap2_cp_bt.cfg`, `iap2_cp_oob_usb.cfg`, `iap2_cp_usb.cfg`, `iap2_dm.cfg`, `iap2_ea_and_hm.cfg`, `iap2_oob.cfg`, `iap2_wcp.cfg`
- `/vendor/etc/` — audio policy, media codecs (Renesas OMX), fstab.gwmv3, sensors hals.conf, powervr.ini, usb_port_configuration.xml
- `/data/carlog/` — persistent logcat ring (7 × 25 MB)
- `/system/framework/` — includes custom `aptiv.core.jar`, `aptiv.support.car.jar`, `aptivshare.jar`, `android.car.jar`, `vendor.aptiv.hardware.iap-V1.0/1.1-java.jar`
- Themes: `theme0201/0301/0302/0401` APKs + `AptivThemeManager` + `com.gwm.app.themestore`

---

## 7. Package Install Whitelist

From `dumpsys package`:
```
Package install whitelist:
  sInstallPackageArray=(com.gwm.app.appstore,com.gwm.app.themestore,com.aptiv.thememanager,com.tencent.sotainstaller)
  sUpgradePackageArray=null
```

This is a **framework-level (GWM-modified PackageManagerService)** restriction — the cause of the "session invalid / install whitelist" error when sideloading via APKPure on-device. Only GWM's app store, theme store, theme manager, and Tencent SOTA installer may create install sessions normally. **Root ADB (`pm install` / `adb install`) bypasses it** (not performed — read-only recon).

---

## 8. Installed Packages

### User-installed (in `/data/app`)
| Package | Note |
|---------|------|
| `com.apkpure.aegon` | APKPure store (XInstallerActivity seen in window list — the blocked install attempt) |
| `com.alphainventor.filemanager` | File Manager |
| `com.google.android.tts` | Google TTS |
| `com.gwm.app.themestore` | GWM theme store |
| `com.softmedia.receiver` | runs a web/media server stack (ports 2001–3600, 6000–8009) |
| `to.sok.settings`, `to.sok.wifi` | head-unit tweak tools |

### System apps (`/system/app`)
`AndroidAuto` (com.citos.androidauto), `AudioRecognition`, `BeanDataTrackService` (Beantechs telematics data), `CertInstaller`, `CompanionDeviceManager`, `CtsShimPrebuilt`, `ExtShared`, `HTMLViewer`, `KeyChain`, `RadioServiceOversea`, `SecureElement`, `WallpaperBackup`, `hanvon` (Hanvon handwriting IME), `tboxservice` (vendor.aptiv.tbox), `theme0201/0301/0302/0401`, `webview`

### Privileged apps (`/system/priv-app`) — 55 entries
**GWM-branded:** GwmLauncher (HomeActivity), GwmSystemUI (com.android.systemui), GwmSetting (+settingservice), GwmMedia (+media.player), GwmPhoto, GwmRadio, GwmDvr, GwmDlna, GwmBluetooth, GwmVehicle, **GwmEngineerMode**

**APTIV-branded:** AptivCarService, AptivBeanService, AptivBluetooth, AptivCameraService, AptivCommonService, AptivInputService, AptivJavaEthernetService, AptivMediatorService, AptivMultiDisplay, AptivSettingService, AptivThemeManager, AptivWifiService, CarPlay (iAP2), PhoneProjectionService, MediaService, DiagnosticService, ThirdMediaPartyService, cloudlog, AptivJavaEthernetService

**AOSP/other:** CarService (com.android.car), Settings (+SettingsIntelligence), Telecom, PackageInstaller, OTAClient (com.redbend.client — Red Bend/Harman OTA), OTAUsbDetecter, providers (media/telephony/contacts/downloads/settings), Shell, cloudlog, etc.

---

## 9. Running Processes & HAL Services

### Native/HAL processes (uid ≠ apps)
| Process | UID | Role |
|---------|-----|------|
| `android.hardware.automotive.vehicle@2.0-service.aptiv` | root | **Vehicle HAL** (CAN→Android bridge) |
| `android.hardware.automotive.evs@1.0-service.aptiv` | automotive_evs | Surround-view camera (EVS) |
| `someipd`, `someipd2`, `someipd3`, `someipd12` | shell | SOME/IP daemons (vehicle Ethernet messaging) |
| `aptivsystemserver`, `aptivlogserver`, `aptivethernetserver` | system | APTIV platform services |
| `vendor.aptiv.systemcontrol@1.0-service` | system | system control HAL |
| `vendor.aptiv.audiocontrol@1.0-service`, `aptiv-audiocontrol-1-0` | system/audioserver | audio policy |
| `vendor.aptiv.hardware.iap-service` | iap | **iAP2/CarPlay accessory HAL** |
| `vendor.aptiv.tbox@1.0-service` + tbox app | shell/system | telematics box |
| `vendor.aptiv.sensorsext@1.0-service` | system | extended sensors |
| `android.hardware.gnss@1.1-service.aptiv` | system | GNSS |
| `android.hardware.keymaster@3.0` / `gatekeeper@1.0` (renesas) | system | crypto/TEE |
| `android.hardware.bluetooth@1.0-service.gwmv3` | bluetooth | BT HAL |
| `android.hardware.health@2.0`, `light@2.0`, `sensors@1.0`, `usb@1.0`, `graphics.allocator@2.0`, `graphics.composer@2.1`, `audio@4.0`, `audio.effect@4.0`, `broadcastradio@1.1`, `wifi@1.0` | various | standard HALs |
| `hostapd` + `dnsmasq` | wifi/dns_tether | **car hotspot AP + DHCP/DNS** |
| `wpa_supplicant`, `wificond` | wifi | STA side |
| `keystore`, `drmserver`, `mediaserver`, `mediaserver` codecs, `installd`, `vold`, `netd`, `logd`, `logcatd` (ring), `tombstoned`, `incidentd`, `statsd`, `storaged`, `mdnsd` | various | AOSP infra |
| `tee-supp` (tee_supplicant) | root | OP-TEE supplicant |

### Key app processes
`system_server`, `com.android.car` (CarService), `com.aptiv.car`, `com.gwmv3.launcher` (focused), `com.gwmv3.setting` (+ `.settingservice`), `com.gwmv3.vehicle`, `com.gwmv3.systemui`, `com.gwmv3.media` (+player), `com.aptiv.thememanager`, `com.aptiv.camera`, `com.aptiv.carplay`, `com.aptiv.wifi`, `com.aptiv.radio`, `com.aptiv.media`, `com.aptiv.usbdetecter`, `com.redbend.client` (OTA), `com.citos.androidauto`, `com.beantechs.datatrackservice`, `com.hanvon.inputmethod.callaime`, plus the user-sideloaded apps (`to.sok.*`, apkpure, filemanager, softmedia.receiver, webview sandbox).

---

## 10. SOME/IP Vehicle Network

Config: `/system/etc/someip/someip_config-HUT.xml` — the head unit's SOME/IP service map:

| Service ID | UDP port | Event groups / multicast | Likely domain |
|-----------|----------|--------------------------|---------------|
| 0x0301 | 32001 | 2 evgroups @ 225.225.225.100:1024/1025 | Vehicle body/diagnostics master |
| 0x0201 | 32011 | 1 @ 225.225.225.101:1024 | ECU service |
| 0x0202 | 32012 | 1 @ 225.225.225.102:1024 | ECU service |
| 0x0204 | 32002 | 1 @ 225.225.225.103:1024 | ECU service |
| 0x0205 | 32003 | 2 @ 225.225.225.104:1024/1025 | ECU service |
| 0x0203 | 32004 | 2 @ 225.225.225.105:1024/1025 | ECU service |
| 0x0401 | 32005 | 2 @ 225.225.225.106:1024/1025 | ECU service |
| 0x0402 | 32006 | — (no events) | request/response only |
| 0x0403 | 32007 | — | request/response only |

- Service discovery (SD): multicast `239.192.255.251:30490` (standard SOME/IP SD), TTL 3s, cyclic offers every 1s.
- Client port range 55001–65535. TCP 30001 without magic cookies.
- ETS (test suite): `/system/etc/someip/ets/someipETS.tgz` + `start_ets.sh`.
- Daemon naming (`someipd2`, `someipd3`, `someipd12`) matches **VLAN sub-interfaces** (eth1_2, eth1_3, eth1_12, …) — each daemon speaks to a different vehicle domain ECU over its own VLAN.

---

## 11. Vehicle Properties

`CarPropertyService` / `PropertyHalService` (Vehicle HAL → Car API) exposes GWM-mapped property IDs. Observed examples (from `dumpsys car_service`):
- IDs 354419973–356517121: booleans/integers on area 117 (HVAC/door/window-type areas), value ranges 1–7 (e.g. gear/level settings)
- 358614274/275: float, min 16.0 max 32.0 on areas 49/68 — **HVAC temperature setpoints (°C)**
- 289472773/775, 291504388/390: read-only int/float arrays — odometer/fuel type info
- 555796515+, 560996465–561002611: byte-array props ( VIN-like binary blobs, area 16777216 = 0x01000000)
- 286261505: string, read-only

GWM vendor feature flags (from earlier research, visible in this build's prop namespace style): `persist.vendor.gwm.cfg.*` (head-up display, auto high beam, ADAS) — not set on this overseas unit.

---

## 12. Display & Input

### Displays (3)
| Display | Type | Resolution | Density | Layer stack |
|---------|------|-----------|---------|-------------|
| Built-in Screen (display 0) | BUILT_IN (LVDS) | 1920×720 @ 60fps | 160 dpi | 0 |
| HDMI Screen (display 1) | HDMI | 1920×720 @ 60fps | 213 dpi | 1 |
| HDMI Screen (display 2) | HDMI | 1920×720 @ 60fps | 213 dpi | 2 |

(Built-in 1920×720 widescreen, typical for H6's curved dash; two extra HDMI layer stacks — instrument cluster / rear entertainment path via AptivMultiDisplay.)

### Input devices
- `QVM virtio-input` touchscreen (1920×720) — touch is a **virtio device**, forwarded from a hypervisor/cluster chip
- `dummy_input`, Virtual

### Window state at capture
Focused: `com.gwmv3.launcher/.HomeActivity`. StatusBar 1920×80 top bar; SystemUI left rail 100px; softmedia.receiver and apkpure XInstallerActivity present but hidden.

---

## 13. SELinux & Security

| Control | State |
|---------|-------|
| SELinux | **Enforcing** (ro.boot.selinux=enforcing) |
| dm-verity | Enforcing on `/` and `/vendor` (`veritymode=enforcing`, `partition.vendor.verified=2`) |
| AVB (vbmeta) | v1.1, `device_state=locked`, sha256 digest `d15b5598…c5509` |
| OEM unlock | supported=1 but `sys.oem_unlock_allowed=0` |
| Build security | `userdebug`/`test-keys`, `ro.debuggable=1`, `ro.secure=1`, `security.perf_harden=1` |
| ADB auth | **disabled** (`ro.adb.secure` unset, empty adb_keys) → unauthenticated root over WiFi |
| SELinux app domains | standard + custom: `carservice_app` (com.android.car), `aptivcarservice_app` (com.aptiv.car) |
| adbd context after `adb root` | `u:r:su:s0` (bypasses most of the policy in practice) |

**Risk summary:** unauthenticated root ADB on all interfaces + test-keys userdebug image. Anyone on the car's hotspot (or phone hotspot when in STA mode) has full filesystem read access and could write to `/data`, mount/modify partitions, or flash OTA payloads.

---

## 14. OTA System

- **Client:** `com.redbend.client` (Red Bend — now Harman) OTA client, priv-app, persistent process
- **USB OTA:** `com.aptiv.usbdetecter` detects update packages on USB
- **Staging:** `/data/ota_package` (3 GB vfat) with `fblota/` (flash-bootloader OTA: `Result/`, `logs/`), `display/`, `rb_work/` (Red Bend workdir: `logs/`, `workdir/`)
- **Transfer:** `/data/ota_transfer/LogForFBL/` — `FBL_REFLASH_LOG.access` (1.3 MB), `.error` (9.5 KB) — bootloader reflash history
- `ota_tmp.txt` = "This is a useless file" (placeholder)
- A/B: `ro.build.ab_update=true` — A/B (seamless) update capable
- `ro.car.recovery.restart_runtime.enabled=true` — runtime watchdog/recovery
- Tencent SOTA installer (`com.tencent.sotainstaller`) is whitelisted for installs (Tencent cloud update path used in CN market; `/tencent` partition provisioned but unused on this overseas unit)
- Last FBL activity timestamps: 2021-09-28; no pending OTA in staging

---

## 15. Logging System

- Persistent logcat ring in `/data/carlog/` — 7 files × ~25 MB (logcatd, buffers main,events,system,crash,kernel; 16 rotations × 40960 lines, 8 MB/buffer)
- `/aptivlog` partition (795 MB, **93% full**) — APTIV platform logs via `aptivlogserver`/`carlog`
- `/data/aptiv/log_configuration.xml` — module log levels (xl4someip=ERROR, Aptiv_gps=ASSERT, SETTING.VEHICLE/HVAC/SYSTEM=INFO, TAHTTP=ERROR …)
- `kernellog` service + pstore/ramoops for kernel crash logs
- Dropbox + tombstones (`tombstoned`, max 50)

---

## 16. System Services

Full `dumpsys -l` (100 services): AOSP standards (activity, window, power, audio, bluetooth_manager, connectivity, ethernet, wifi, wificond, location, sensorservice, statusbar, telephony.registry, thermalservice, usb, vold, …) plus vehicle-specific:
`aptiv.ethernetserver`, `aptiv.log`, `aptiv.system`, `aptivcar_service`, `aptivsettingservice`, `car_service`, `com.beantechs.datatrackservice`, `broadcastradio`, `servicediscovery`, `system_update`.

---

## 17. File Inventory

| File | Contents |
|------|----------|
| `getprop_full.txt` | all 407 system properties |
| `packages_list.txt` | 82 packages with APK paths |
| `package_dumpsys.txt` | full PackageManager dump (incl. install whitelist) |
| `processes.txt` | 242 processes (all users) |
| `network.txt` | interfaces, routes, listening ports, ARP |
| `partitions.txt` | block devices |
| `mounts.txt` | mounts |
| `system_tree.txt`, `dirs.txt` | /system, /vendor, /data listings |
| `build_props.txt` | system + prop.default + vendor build.prop |
| `init.rc.txt` | init script (ADB TCP trigger) |
| `someip_config.xml` | SOME/IP vehicle service map |
| `permissions_config.txt`, `privapp_config.txt` | platform + privapp + hiddenapi whitelists |
| `selinux.txt` | SELinux contexts/policy files |
| `feature_props.txt`, `aptiv_identity.txt` | hardware/APTIV identity props |
| `car_props.txt` | CarPropertyService configs + log config |
| `ota.txt`, `ota_client.txt` | OTA staging dirs + Red Bend client data |
| `services_list*.txt`, `display_input.txt`, `storage_mem.txt`, `settings_list.txt` | dumpsys service list, displays, input, storage, memory, settings |
| `kernel_info.txt` | kernel version + CPU |
| `apks/` | pulled `GwmEngineerMode.apk`, `GwmSetting.apk`, `PackageInstaller.apk` |
