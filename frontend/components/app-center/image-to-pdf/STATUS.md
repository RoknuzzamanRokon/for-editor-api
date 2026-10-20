# Image-to-PDF editor — plan & status

Scope: the Request Builder for `app-center/edit/image-to-pdf` (user and admin
pages). Phases 1–4 of the editor plan. Out of scope: four-corner perspective
correction, OpenCV corner detection, PDF page-size/compression settings.

## Design

- All editing happens in the browser. Each edited image is re-rendered to a
  JPEG (`output`) and uploaded in place of the original. The API contract is
  unchanged: `POST /api/v3/conversions/image-to-pdf`, multipart field `files`,
  one entry per page in display order.
- Edits are non-destructive: `ImageItem.original` is never modified; `edits`
  is re-applied to it on every render, so a crop can be widened again later.
- Crop is stored normalized (0–1) relative to the *rotated* image.
- Preview renders at ≤1600 px (long side), final output at ≤3500 px, JPEG 0.92,
  one image at a time.
- Backend: EXIF orientation is applied in `ImageToPDFConverterService` so
  unedited phone photos are upright too.

## Files

| File | Role |
| --- | --- |
| `types.ts` | `ImageEdits`, `ImageItem`, defaults and comparison helpers |
| `imageProcessing.ts` | crop/rotation geometry, filters, canvas rendering |
| `ImageToPdfBuilder.tsx` | upload grid, reorder, Edited badge, Convert button |
| `ImageEditorModal.tsx` | full-screen editor (crop, rotate, filters, navigation) |

## Status

See the bottom of this file — updated after each phase.

### Baseline (before any change)

- `npx tsc --noEmit`: clean. `next lint`: 1 pre-existing warning
  (`components/settings/AccountSettingsPanel.tsx:348`, react-hooks/exhaustive-deps).
- No frontend test runner existed; added Vitest + happy-dom + Testing Library.

### Backend — EXIF orientation ✅

- `_load_as_rgb` applies `ImageOps.exif_transpose`; the single-image path now
  shares `_load_as_rgb`. `backend/tests/test_image_to_pdf_converter.py`
  (5 tests) pass; 3 of them fail without the fix.
- Note: the root `.gitignore` has `test*.py`, so the test file is force-added
  like the existing backend tests.

### Phase 1 — shared builder ✅

- `ImageToPdfBuilder` holds the upload grid, drag/keyboard reorder, remove,
  clear, and Convert button; both App Center pages render it.
- Pages keep `imageItems: ImageItem[]` and send `item.output` per page through
  `appendImagesToFormData` (field `files`, display order).
- Tests: `ImageToPdfBuilder.test.tsx`, `appCenterPages.test.tsx` — 11 passing.
- tsc clean; lint unchanged from baseline.

### Phases 2–3 — editor, navigation, rotate, reset, crop ✅

- `ImageEditorModal` (portaled to `<body>`; the Request Builder card has a
  backdrop-filter that would otherwise trap `position: fixed`): Cancel/Done,
  "Image n / N", Prev/Next, ←/→ keys (ignored in inputs and the crop box),
  thumbnail strip, crop presets (Free, A4, 1:1, Original), rotate left/right,
  Reset, discard confirmation, focus trap, scroll lock, `beforeunload` guard.
- Done renders changed images one at a time (`Applying edits… n/N`) and saves
  only if all succeed; a failure keeps every draft and saves nothing. Reset to
  defaults restores the original file without re-encoding.
- Tiles: tap (≤6 px movement) or Enter opens the editor; dragging still
  reorders; an Edit button and an "Edited" badge were added; Convert is
  disabled while the editor is open. Focus returns to the tile on close.
- `react-image-crop@11.1.2` for the crop box (peer `react >=16.13.1`; no deps).
- Tests: 39 passing (geometry incl. a brute-force rotation/crop check, editor,
  builder ↔ editor, pages). tsc clean; lint unchanged from baseline.
- Real-browser check (headless Chrome via a scratch harness, not committed):
  all four rotations, rotation + crop, EXIF-tagged JPEG, transparency → white,
  JPEG encode, corrupt-file error, and the full tap → crop → rotate → Done flow
  on desktop/light and mobile/sunset.

### Phase 4 — filters, adjustments, preview optimisation ✅

- Filters: Original, Scan, Grayscale, Black & White; Brightness/Contrast
  sliders (-100..100, clamped; double-click resets one). Filter runs first,
  then brightness/contrast, identically for preview and final output.
- Scan: lighting map ≈48 cells wide built from block-averaged pixels (mean of
  each cell's brightest 20%, dilated, smoothed) → per-pixel normalisation with
  separate brightness gain (tapers off below a dark knee to avoid multiplying
  noise in near-black background) and colour balance (neutralises tinted
  paper) → 2nd/98th percentile level stretch (capped 4×) → mild S-curve →
  luminance-only unsharp mask with a noise floor.
- B&W: per-pixel ratio to the local paper level (< 0.75 → black), with a 3×3
  neighbourhood veto that removes lone noise specks without thickening strokes.
- Preview: three cached layers (rotated base per rotation → filter per filter
  → tone on every change, 60 ms debounce); never full resolution. Verified in
  Chrome that the preview canvas equals `renderEdited` at the same size.
- "Apply filter to all images": copies filter + brightness + contrast only,
  states exactly what it will copy, asks before replacing other images' own
  filter settings, keeps every crop and rotation.
- Tests: 58 passing (13 filter tests on synthetic unevenly-lit pages and edge
  cases: black, white, flat grey, 1×1, 3×200). tsc clean; lint unchanged;
  `next build` succeeds.
- Chrome timings (this machine): Scan on a 1600×1200 preview ≈ 200 ms; a
  4000×3000 photo rendered at 3500 px ≈ 0.9 s (Scan), 0.6 s (B&W).

## Known limitations

- Rectangular crop only; no perspective (four-corner) correction yet.
- Output is always JPEG 0.92 (as specified). Scan/B&W pages of noisy photos
  can be 2–3.5 MB each at 3500 px; PNG for B&W would be far smaller.
- Scan is a document filter: on an ordinary photo (no "ink") it washes the
  image towards white.
- Filters run on the main thread; a 3500 px Scan blocks for ≈1 s per image
  during Done (progress is shown between images). A Web Worker would avoid it.
- The preview filters the whole rotated image, while the output filters only
  the crop, so lighting statistics can differ slightly at the crop edges.
