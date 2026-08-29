# SynchroLink Prototype — Demo Script

This document provides sample inputs to demonstrate the multi-modal field ingestion capabilities of the SynchroLink platform. You can copy-paste or speak these scenarios to showcase the AI's ability to extract and structure unstructured data.

---

## 1. Text Ingestion Demo
**Tab to use:** `Text / Log`
**Scenario:** A progress update indicating a material delay.

**Input Text to Copy:**
> The mechanical installation for the P-204 pump in CDU Unit 2 is 80 percent complete. However, we faced a 2-day delay due to late material delivery. We will continue the rest of the work tomorrow.

**What to highlight during the demo:**
- The AI correctly identifies the **Asset** as `P-204` and **Discipline** as `Mechanical`.
- It captures the **80% Progress** update.
- It detects the **2-day delay** and intelligently classifies the **Root Cause** as `MATERIAL_DELIVERY`.

---

## 2. Voice Ingestion Demo
**Tab to use:** `Voice / Hindi` (or standard Voice Ingestion)
**Scenario:** A quick civil update from the field engineer on-site.

**What to Speak (Voice Script):**
> "Hello, Suriya here. The concrete pouring for foundation F-102 at the CDU-02 site is 95 percent finished. Curing is currently in progress, and there are no issues."

**What to highlight during the demo:**
- The speech-to-text pipeline captures the raw audio accurately.
- The Extraction AI successfully pulls out the **Asset** `F-102` and the **95% Progress** without any manual form filling.

---

## 3. WhatsApp Bot Demo
**Tab to use:** `WhatsApp Bot`
**Scenario:** A simple chat-based electrical progress update.

**Message to Send:**
> The cable termination for the control room panel EP-07 is 60% complete.

**What to highlight during the demo:**
- Simulates how field workers can interact with SynchroLink naturally via WhatsApp.
- The bot replies acknowledging the update, while the engine updates the background Gantt charts in real-time.

---

## 4. Bulk Excel Ingestion (DPR)
**Tab to use:** `DPR File`

I have generated a sample Daily Progress Report file for you named **`sample_dpr.xlsx`**. You can find it in your main project folder. 

**What to highlight during the demo:**
- Drag and drop `sample_dpr.xlsx` into the upload box.
- Explain how SynchroLink automatically parses structured spreadsheet data (legacy DPRs) and maps it to the EPC schedule matrix.
