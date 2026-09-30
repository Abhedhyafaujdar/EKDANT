# EKDANTA — Complete Frontend

A full frontend prototype for the EKDANTA AI-powered digital crime-scene investigation platform.

## Pages / navigation
- Home / Landing
- New Investigation
- Dashboard
- Timeline
- Evidence
- Entities
- Connection Graph
- Persons of Interest
- AI Analysis
- Investigation Report

## Included interactions
- Fully working sidebar navigation
- Top navigation shortcuts
- Persistent dark/light theme toggle
- Case-file upload UI
- Simulated analysis pipeline with progress
- Interactive interconnected-dot graph
- Large suspect node + small general-user nodes
- Animated signal particles travelling through graph edges
- Suspect click -> graph zoom/highlight -> entity detail drawer
- Timeline and evidence filtering UI
- Entity and persons-of-interest views
- Evidence-grounded AI analysis screen
- Report page with downloadable-PDF button placeholder
- Responsive layout

## Graph implementation
The graph uses `@xyflow/react` as the project dependency for future backend-driven graph expansion. The current visual prototype uses a custom SVG/DOM rendering layer so the signal-flow aesthetic matches the supplied design reference.

React Flow is an open-source React library for interactive node-based UIs. Official docs: https://reactflow.dev/

## Run
npm install
npm run dev

## Build
npm run build

No real credentials, malware samples, or backend services are included. The current case data is mock/demo data and should be replaced with your backend APIs later.
