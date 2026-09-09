# Haval H6 — OBD App POC

A React + Vite + Framer Motion prototype that mimics the Haval H6 12.3" infotainment
screen (**8:3 / 1920x720**) and simulates the custom OBD-II app planned in `COMMANDS.md` §23.

## Run it

```bash
cd haval-h6-poc
npm install
npm run dev        # open the printed URL (default http://localhost:5173)
```

Or build and preview the static bundle (works offline):

```bash
npm run build
npm run preview
```

## What's simulated

- **Boot splash** (HAVAL logo + shine sweep) → **home launcher** with live HUD strip
- **OBD app:** ELM327 WiFi connect flow (192.168.0.10:35000) → PID probe → live gauges
  (RPM arc, speed dial, coolant bar, battery) → real-time speed/MAF graph → PID table → DTC scan
- **Full dashboard mocks:** Navigation (animated route), Media (equalizer + spinning disc),
  Phone (dialer + calls), Settings (GWM feature flags, writes blocked = read-only POC)
- **Interactive car sim:** Ignition, Throttle slider, Brake, Gear (P/R/N/D) — RPM/speed/MAF/coolant/battery all respond
- **Drivetrain / 4WD sim:** drive modes (Eco/Normal/Sport/Snow/Offroad) + surfaces (Dry/Wet/Snow/Mud). Wheel-slip sensing
  auto-engages AWD (2WD → 75/25 → ~50/50 in Offroad) with animated power-flow diagram, torque-split bar,
  4 wheel-slip bars, and an inclinometer
- **Offroad screen:** gearbox, front/rear diff temps and turbo boost (rise with load/torque), inclinometer (pitch/roll),
  plus drivetrain PIDs added to the OBD live table

## Controls

The **SIM control bar is always visible** at the bottom of every screen (throttle, ignition,
gear, brake, AWD status). Drive-mode / surface selectors live in the Offroad screen.

| Action | Button / key |
|--------|--------------|
| Ignition | `i` |
| Brake hold | `b` (or hold BRAKE) |
| Cycle gear | `g` |
| Throttle | slider, or Arrow Up / Down |
| Drive mode | Offroad screen (Eco/Normal/Sport/Snow/Offroad) |
| Surface | Offroad screen (Dry/Wet/Snow/Mud) |
| Navigate screens | click tiles / Home button |

## Screenshots

See `screenshots/` (home, obd-live, obd-dtc, media, settings).

> **POC only.** All data is simulated — no real ELM327 hardware is required. Wire in real
> OBD data via a WiFi ELM327 adapter per `COMMANDS.md` §23 once ADB/sideload access is achieved.
