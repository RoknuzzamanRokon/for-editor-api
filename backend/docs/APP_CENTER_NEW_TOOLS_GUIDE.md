# App Center: New Tools Guide

This documents the 6 new Editor Panel apps and 4 new Viewer Panel viewers
added to the App Center (`/admin/app-center` and `/user/app-center`). No
existing styling, layout, or components were changed — everything below
follows the exact patterns already used by the pre-existing tools.

## New Editor Panel apps

All six live in the **Other Tools** category (previously empty). Like every
Editor Panel app, they cost 3 points per request (charged on the backend,
same as every other conversion) and require the `UserConversionPermission`
row for their action to be granted — either via `manage_permissions.py` or
the admin "API Permissions" page — before a given user can call them.

| App | Action key | Endpoint | What it does |
|---|---|---|---|
| Zip Files | `zip_files` | `POST /api/v3/conversions/zip-files` | Combines one or more uploaded files of any type into a single `.zip`. |
| Unzip Archive | `unzip_file` | `POST /api/v3/conversions/unzip-file` | Extracts a `.zip` and re-packages its contents into a flattened, sanitized `.zip`. |
| CSV to Excel | `csv_to_excel` | `POST /api/v3/conversions/csv-to-excel` | Converts a `.csv` into a single-sheet `.xlsx` workbook. |
| Excel to CSV | `excel_to_csv` | `POST /api/v3/conversions/excel-to-csv` | Converts the **first sheet** of an `.xlsx`/`.xls` workbook into `.csv`. |
| HTML to PDF | `html_to_pdf` | `POST /api/v3/conversions/html-to-pdf` | Renders an uploaded `.html` file to PDF. |
| PDF to HTML | `pdf_to_html` | `POST /api/v3/conversions/pdf-to-html` | Converts a PDF into a single self-contained HTML file, one section per page. |

### Why "Unzip Archive" always returns a `.zip`

A conversion can only hand back one downloadable file, so there's no way to
return "a folder of files" for the browser to save individually. Instead,
Unzip Archive extracts every entry from the uploaded archive and re-zips them
flat (no subfolders) into a new archive — useful for stripping out a single
top-level wrapper folder, and safe against "zip slip" path-traversal entries,
which are silently dropped rather than extracted. See
`backend/services/unzip_file.py` for the extraction logic.

### Known limitations

- **Excel to CSV** only exports the workbook's first sheet — a CSV has no
  concept of multiple sheets, so there's no lossless way to carry the rest.
- **HTML to PDF** uses `xhtml2pdf`, a pure-Python renderer with a limited CSS
  subset (no flexbox/grid, limited positioning). Complex modern layouts will
  render simplified, not pixel-perfect.
- **PDF to HTML** uses PyMuPDF's built-in per-page HTML export. It preserves
  text position and embeds images as base64 data URIs, but it is not a
  semantic re-authoring of the document (no `<h1>`/`<p>` structure — just
  positioned text spans).

### Where the code lives

- Registry entry (drives the "my-api" list + permission checks):
  `backend/core/permissions.py` → `ALLOWED_ACTIONS`
- Services: `backend/services/zip_files.py`, `unzip_file.py`,
  `csv_to_excel_converter.py`, `excel_to_csv_converter.py`,
  `html_to_pdf_converter.py`, `pdf_to_html_converter.py`
- Endpoints + history routes: `backend/api/v3/endpoints/converters.py`
  (search for `zip-files`, `unzip-file`, `csv-to-excel`, `excel-to-csv`,
  `html-to-pdf`, `pdf-to-html`)
- Frontend icon/label + route wiring: `getIcon()`/`getShortName()` in
  `frontend/app/{admin,user}/app-center/page.tsx`, and `ACTION_TO_ROUTE`/
  `ACTION_TO_HISTORY_ROUTE` in `frontend/app/{admin,user}/app-center/edit/[slug]/page.tsx`
- The Zip Files multi-file picker is a new `isZipFiles` branch in the same
  `edit/[slug]/page.tsx` files, modeled on the existing Merge PDF picker
  (minus reordering, since zip order doesn't matter).
- A new HTML preview branch (rendered in a sandboxed `<iframe>`) was added to
  the Preview Viewer in both `edit/[slug]/page.tsx` files, right alongside
  the existing PDF/image/DOCX/XLSX preview branches.

## New Viewer Panel viewers

All four are pure client-side components — no backend involved, same as
every existing viewer (PDF/Docs/CSV/Excel/Markdown/JSON/XML).

| Viewer | Key | Component | What it does |
|---|---|---|---|
| Image Viewer | `image_reader` | `components/viewers/ImageViewer.tsx` | Views PNG/JPG/WEBP/GIF/BMP with zoom and rotate controls. |
| PowerPoint Viewer | `pptx_reader` | `components/viewers/PPTXViewer.tsx` | Views a `.pptx` slide-by-slide (text + embedded images). |
| Text/Code Viewer | `text_reader` | `components/viewers/TextCodeViewer.tsx` | Views plain text or source files with line numbers. |
| YAML Viewer | `yaml_reader` | `components/viewers/YAMLViewer.tsx` | Parses a `.yaml`/`.yml` file and displays its structure. |

### Known limitations

- **PowerPoint Viewer** has no browser-native OOXML renderer to lean on, so
  it parses the `.pptx` (which is just a zip of XML) directly with `jszip`:
  it extracts each slide's paragraph text and embedded images, and lays them
  out in a simple slide card. This reproduces *content*, not the original
  *layout* — text positioning, fonts, and animations are not preserved.
- **Text/Code Viewer** shows plain monospace text with line numbers — no
  syntax highlighting. This matches the effort level of the existing viewers
  (e.g. the JSON viewer is also just `JSON.stringify` in a `<pre>`), and
  avoids introducing a new CSS theme that wouldn't follow the app's existing
  dark-mode toggle.
- **YAML Viewer** displays the parsed document as indented JSON (via
  `JSON.stringify`), mirroring exactly how the existing JSON viewer displays
  its data — not a YAML-specific tree widget.

### New frontend dependencies

- `jszip` — parses the `.pptx` zip container for the PowerPoint Viewer.
- `js-yaml` — parses YAML for the YAML Viewer.

### Where the code lives

- Components: `frontend/components/viewers/{ImageViewer,PPTXViewer,TextCodeViewer,YAMLViewer}.tsx`
- Wired into `frontend/app/{admin,user}/app-center/view/[viewer]/page.tsx`
  (dynamic import + `viewerNames`/`viewerIcons` entries + render branch,
  same pattern as every existing viewer)
- Added to the Viewer Panel grid array in
  `frontend/app/{admin,user}/app-center/page.tsx`

## Adding another tool or viewer later

Follow the same two playbooks:

**A new Editor Panel app** needs: an entry in `ALLOWED_ACTIONS`
(`backend/core/permissions.py`), a service module in `backend/services/`, a
`POST` + history endpoint in `backend/api/v3/endpoints/converters.py`, and
icon/label + route-map entries in both `admin` and `user` app-center pages —
duplicated in both trees, since they are separate (non-shared) page files.

**A new Viewer Panel viewer** needs: a self-contained client component in
`frontend/components/viewers/`, a dynamic-import + name/icon + render branch
in both `view/[viewer]/page.tsx` files, and a grid entry in both
`app-center/page.tsx` files. No backend work required unless the viewer
needs to parse a format no existing frontend library handles.
