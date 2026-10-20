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
