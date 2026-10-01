# Section 04 "كيف تعمل": Research and Decisions

Built 2026-10-01. Code: `app/components/HowItWorks.js` + `HowItWorks.module.css`; copy: `PATIENT_STEPS` in `app/content.js`.

## References (Zapier "Search Content Across URLs" + Chrome)

| Source | Pattern taken |
|---|---|
| Function Health, /how-it-works | Each step has a tag line ("STEP 01 • schedule tests"), a title, one line of explanation and 3 or 4 short facts. |
| Bevel (Honorable Mention 2026) | Each feature is shown on a phone screen with a **floating card** overlapping the phone, showing the moment the feature creates. |

## How it reads in Arabic

- **Desktop:** two columns. The steps sit on the **right**, where an Arabic reader starts, and the phone sits on the left. The progress rail runs down the steps' right edge, through numbered dots, and fills top to bottom as you read.
- **The phone is sticky.** It shows the screen for the step currently passing 45% of the viewport, with a notification card hanging off its right side toward the text, so each screen visibly belongs to its step.
- **Inside the screens**, the order tracker runs right to left (أُرسل ← قُبل ← في الطريق ← وصل), the same way Arabic is read.
- **Phone layouts:** the sticky phone is dropped, and every step carries its own small screen under its text, so nothing depends on scroll position.

## Real screens (same day, at the user's request)

The drawn mock-ups were replaced by frames from the app's own screen recording
(`D:\Applications_Doctorleandek\Recording 2026-08-23 223049.mp4`, 396x836, 2:48):

| Step | Frame | Cleaning |
|---|---|---|
| 1 Home | 101s, corner from 17s | touch dot removed |
| 2 Medical services with prices | 81.5s, chip from 84s | touch dot removed |
| 3 Notifications, sent → completed | 19.6s, card from 19s | dot removed, every body line blurred (the doctor's name) |
| 4 Medical record, completed visit | 32s | dot filled from header, name/age/gender/blood type/allergies blurred |

`tools/make-how-shots.py` rebuilds all four into `public/how/` (12 to 36 KB each). The blur boxes were measured
on this recording, so **re-measure before using a new one**. The wallet screen was rejected because it shows a
0.00 balance. No clip was worth looping as video: the services list never scrolls in the recording.

## Implementation notes

- The active step comes from a scroll handler that reads four rects, not from an IntersectionObserver. An observer only reports crossings, so an anchor jump could leave the wrong step lit.
- The stage is only as tall as the phone, and the last step has `min-height: 62vh`. Together these keep the phone pinned until step 4 has been read.
- The screens are HTML illustrations (no screenshots): sharp at any size, Arabic, single-hue, and they cost no image requests.
- In the automation Chrome tab, scroll events and CSS transitions are held while the tab is in the background. Screenshots can show the previous step or a half-finished cross-fade. That's the environment, not the page.
