/**
 * Marketing copy source of truth.
 *
 * Every capability listed here maps to a real action in
 * `backend/core/permissions.py::ALLOWED_ACTIONS` and a real route in
 * `frontend/app/user/app-center/edit/[slug]/page.tsx::ACTION_TO_ROUTE`.
 * The action keys are kept alongside the marketing labels on purpose: if a
 * conversion is ever removed from the backend, the key here is the thing that
 * makes the drift obvious instead of leaving an invented feature on the site.
 *
 * Rule for anyone editing this file: no entry goes in without a shipped
 * endpoint behind it.
 */

export type ConversionEntry = {
  /** Matches ALLOWED_ACTIONS in the backend. */
  action: string
  label: string
  icon: string
}

export type ConversionGroup = {
  id: string
  label: string
  icon: string
  blurb: string
  items: ConversionEntry[]
}

/** All 28 shipped conversions, grouped the way buyers shop for them. */
export const CONVERSION_GROUPS: ConversionGroup[] = [
  {
    id: 'tabular',
    label: 'Tabular & Spreadsheet Data',
    icon: 'table_chart',
    blurb: 'Move coordinate lists, attribute tables, and measurement data between the formats your next tool expects.',
    items: [
      { action: 'pdf_to_excel', label: 'PDF to Excel', icon: 'table_chart' },
      { action: 'excel_to_pdf', label: 'Excel to PDF', icon: 'grid_on' },
      { action: 'csv_to_excel', label: 'CSV to Excel', icon: 'grid_on' },
      { action: 'excel_to_csv', label: 'Excel to CSV', icon: 'csv' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents & Office Files',
    icon: 'description',
    blurb: 'Turn reports, specifications, and submittals into the format a client, portal, or archive requires.',
    items: [
      { action: 'pdf_to_docs', label: 'PDF to Word', icon: 'description' },
      { action: 'docx_to_pdf', label: 'Word to PDF', icon: 'picture_as_pdf' },
      { action: 'pdf_to_pptx', label: 'PDF to PowerPoint', icon: 'co_present' },
      { action: 'pptx_to_pdf', label: 'PowerPoint to PDF', icon: 'slideshow' },
      { action: 'pdf_to_text', label: 'PDF to Text', icon: 'text_snippet' },
      { action: 'text_to_pdf', label: 'Text to PDF', icon: 'note_add' },
      { action: 'pdf_to_html', label: 'PDF to HTML', icon: 'code' },
      { action: 'html_to_pdf', label: 'HTML to PDF', icon: 'html' },
    ],
  },
  {
    id: 'pdf',
    label: 'PDF & Plan-Set Toolkit',
    icon: 'picture_as_pdf',
    blurb: 'Assemble, trim, stamp, and secure drawing sets and report packages without a desktop license.',
    items: [
      { action: 'merge_pdf', label: 'Merge PDF', icon: 'merge' },
      { action: 'split_pdf', label: 'Split PDF', icon: 'call_split' },
      { action: 'pdf_organize', label: 'Reorganize Pages', icon: 'reorder' },
      { action: 'pdf_page_remove', label: 'Remove Pages', icon: 'delete_sweep' },
      { action: 'rotate_pdf', label: 'Rotate PDF', icon: 'rotate_right' },
      { action: 'compress_pdf', label: 'Compress PDF', icon: 'compress' },
      { action: 'pdf_page_numbers', label: 'Add Page Numbers', icon: 'format_list_numbered' },
      { action: 'watermark_pdf', label: 'Watermark PDF', icon: 'branding_watermark' },
      { action: 'protect_pdf', label: 'Protect PDF', icon: 'lock' },
      { action: 'unlock_pdf', label: 'Unlock PDF', icon: 'lock_open' },
    ],
  },
  {
    id: 'images',
    label: 'Imagery & Graphics',
    icon: 'image',
    blurb: 'Prepare map exports, site photos, and figures for reports, portals, and print.',
    items: [
      { action: 'image_format_convert', label: 'Image Format Converter', icon: 'sync_alt' },
      { action: 'pdf_to_image', label: 'PDF to Image', icon: 'photo_library' },
      { action: 'image_to_pdf', label: 'Image to PDF', icon: 'image' },
      { action: 'remove_background', label: 'Remove Background', icon: 'auto_fix_high' },
    ],
  },
  {
    id: 'archives',
    label: 'Packaging & Delivery',
    icon: 'folder_zip',
    blurb: 'Bundle a deliverable into one archive, or open a client hand-off without extra software.',
    items: [
      { action: 'zip_files', label: 'Zip Files', icon: 'folder_zip' },
      { action: 'unzip_file', label: 'Unzip Archive', icon: 'unarchive' },
    ],
  },
]

export const TOTAL_CONVERSIONS = CONVERSION_GROUPS.reduce(
  (sum, group) => sum + group.items.length,
  0,
)

/** Image output formats offered by the image_format_convert action. */
export const IMAGE_OUTPUT_FORMATS = ['PNG', 'JPG', 'WEBP', 'BMP', 'TIFF', 'GIF', 'ICO'] as const

/** In-browser viewers shipped under components/viewers. */
export const PREVIEW_FORMATS = [
  'PDF',
  'DOCX',
  'XLSX',
  'CSV',
  'PPTX',
  'Markdown',
  'JSON',
  'XML',
  'YAML',
  'Images',
  'Text & code',
] as const

/** The three questions the first screen has to answer. */
export const HERO_ANSWERS = [
  {
    icon: 'hub',
    label: 'What it is',
    text: `A web-based conversion platform with ${TOTAL_CONVERSIONS} tools in one workspace.`,
  },
  {
    icon: 'groups',
    label: 'Who it is for',
    text: 'GIS, surveying, mapping, engineering, and data-processing teams.',
  },
  {
    icon: 'trending_up',
    label: 'Why it matters',
    text: 'Less repetitive file work, one place to do it, a record of every job.',
  },
] as const

export const PROBLEM_POINTS = [
  {
    icon: 'lock_clock',
    title: 'Data arrives in the wrong format',
    text: 'Coordinate lists, attribute tables, and measurements land as PDFs or spreadsheets that the next tool in the chain will not read.',
  },
  {
    icon: 'devices_other',
    title: 'Conversion lives on one desktop',
    text: 'Utilities get installed per machine, so the work waits for whoever has the license and the right version.',
  },
  {
    icon: 'history_toggle_off',
    title: 'No record of what was converted',
    text: 'Files get renamed and re-sent over chat. Nobody can say which version was produced, by whom, or when.',
  },
  {
    icon: 'error_outline',
    title: 'Repetition invites mistakes',
    text: 'The same manual steps repeated across a project are where wrong pages, wrong units, and stale files creep in.',
  },
] as const

export const SOLUTION_POINTS = [
  {
    icon: 'apps',
    title: 'One workspace, every tool',
    text: `All ${TOTAL_CONVERSIONS} conversions sit in a single App Center, grouped and searchable, so nobody hunts for a utility.`,
  },
  {
    icon: 'cloud_done',
    title: 'Runs in the browser',
    text: 'Processing happens on the server. Any team member with an account and permission can do the work from any machine.',
  },
  {
    icon: 'fact_check',
    title: 'Preview before you commit',
    text: 'Built-in viewers show the converted PDF, document, workbook, or image before you download it.',
  },
  {
    icon: 'receipt_long',
    title: 'Every job is logged',
    text: 'Each conversion is stored with its file name, status, cost, and timestamp, and stays downloadable from history.',
  },
] as const

export const AUDIENCES = [
  {
    icon: 'public',
    title: 'GIS & Mapping Teams',
    text: 'Pull attribute and coordinate tables out of supplied PDFs into Excel or CSV, and turn map exports into the image or PDF format a deliverable calls for.',
    tools: ['PDF to Excel', 'Excel to CSV', 'PDF to Image', 'Image Format Converter'],
  },
  {
    icon: 'straighten',
    title: 'Surveying Professionals',
    text: 'Get measurement and control data out of field reports and into spreadsheets, then stamp, secure, and package the plan set you send back.',
    tools: ['PDF to Excel', 'CSV to Excel', 'Watermark PDF', 'Protect PDF'],
  },
  {
    icon: 'engineering',
    title: 'Engineering & Infrastructure',
    text: 'Assemble drawing sets, drop superseded sheets, add page numbers, and compress a package down to something a client portal will accept.',
    tools: ['Merge PDF', 'Remove Pages', 'Add Page Numbers', 'Compress PDF'],
  },
  {
    icon: 'corporate_fare',
    title: 'Organizations & Teams',
    text: 'Give a whole team one conversion platform, decide per person which tools they can run, and see usage across the account.',
    tools: ['Role-based access', 'Per-user tool permissions', 'Usage dashboard'],
  },
] as const

export const SECONDARY_AUDIENCES = [
  {
    icon: 'person',
    title: 'Freelancers & consultants',
    text: 'Professional conversion tooling without a per-seat desktop license.',
  },
  {
    icon: 'terminal',
    title: 'Developers & data teams',
    text: 'A REST API with bearer auth and idempotency keys for scripted work.',
  },
  {
    icon: 'account_balance',
    title: 'Government, NGO & research',
    text: 'Controlled access, a full job record, and an option to deploy privately.',
  },
] as const

export const HOW_IT_WORKS = [
  {
    step: '01',
    icon: 'apps',
    title: 'Pick your tool',
    text: 'Open the App Center and choose from the conversions your account is allowed to run. Search by name if you know it.',
  },
  {
    step: '02',
    icon: 'upload_file',
    title: 'Upload and configure',
    text: 'Add your file and set the options that tool needs — a password, watermark text, target image format, or the pages to keep.',
  },
  {
    step: '03',
    icon: 'bolt',
    title: 'Let it process',
    text: 'The conversion runs on the server. Status moves from processing to success or failed, and the cost is reserved up front.',
  },
  {
    step: '04',
    icon: 'download_done',
    title: 'Preview and download',
    text: 'Check the result in the built-in viewer, download it, and pick it up again later from your conversion history.',
  },
] as const

export const CAPABILITIES = [
  {
    icon: 'grid_view',
    title: `${TOTAL_CONVERSIONS} conversions in one place`,
    text: 'Documents, spreadsheets, PDFs, imagery, and archives all handled from the same workspace, so a project never needs a second tool.',
  },
  {
    icon: 'preview',
    title: 'Preview and adjust in the browser',
    text: 'Viewers for PDF, Word, Excel, CSV, PowerPoint, Markdown, JSON, XML, YAML, images, and code, plus page organizing and a background-removal studio.',
  },
  {
    icon: 'admin_panel_settings',
    title: 'Access you control per person',
    text: 'Four roles and per-user tool permissions mean an account only exposes the conversions that person is meant to run.',
  },
  {
    icon: 'query_stats',
    title: 'Usage you can actually see',
    text: 'A dashboard with 30-day request volume, success and failure share, most-used tools, and recent activity across the account.',
  },
  {
    icon: 'savings',
    title: 'Predictable, refunded on failure',
    text: 'Each conversion costs a flat 3 points. If processing fails, the reserved points go straight back to the balance.',
  },
  {
    icon: 'api',
    title: 'A REST API for scripted work',
    text: 'Every conversion is also an endpoint. Bearer tokens for auth, and an Idempotency-Key header so a retry never bills or runs twice.',
  },
] as const

export const WHY_ROWS = [
  {
    point: 'Where it runs',
    typical: 'Installed per machine, tied to one desktop',
    convater: 'In the browser, from any machine on the team',
  },
  {
    point: 'Tool coverage',
    typical: 'A different single-purpose utility for each job',
    convater: `${TOTAL_CONVERSIONS} conversions in one workspace`,
  },
  {
    point: 'Access control',
    typical: 'Whoever has the file has the tool',
    convater: 'Roles plus per-user permission on each conversion',
  },
  {
    point: 'Record keeping',
    typical: 'Renamed files in a chat thread',
    convater: 'Every job logged with status, cost, and timestamp',
  },
  {
    point: 'Checking the result',
    typical: 'Download first, open it somewhere else, hope',
    convater: 'Preview in the browser before you download',
  },
  {
    point: 'Cost of a failure',
    typical: 'Time spent, credits gone',
    convater: 'Reserved points refunded automatically',
  },
  {
    point: 'Automation',
    typical: 'Manual, one file at a time',
    convater: 'REST API with idempotent requests',
  },
] as const

export const COMMERCIAL_POINTS = [
  {
    icon: 'groups_3',
    title: 'Accounts for your team',
    text: 'Create users, assign roles, and grant or revoke individual conversions per person from an admin control centre.',
  },
  {
    icon: 'monitoring',
    title: 'Oversight across the account',
    text: 'Usage history, point ledgers, top-up records, and per-tool activity for everyone working under the account.',
  },
  {
    icon: 'dns',
    title: 'Private deployment',
    text: 'Run ConvaterPro on your own infrastructure when data needs to stay inside your network.',
  },
  {
    icon: 'support_agent',
    title: 'Direct support',
    text: 'Talk to us about onboarding, the conversions your workflow depends on, and what a commercial arrangement looks like.',
  },
] as const

export const FAQS = [
  {
    q: 'What does ConvaterPro actually convert?',
    a: `${TOTAL_CONVERSIONS} conversions across documents, spreadsheets, PDFs, images, and archives — including PDF to Excel, CSV to Excel, PDF to Word, image format conversion, and a full PDF toolkit for merging, splitting, stamping, and securing files. The complete list is on this page.`,
  },
  {
    q: 'Does it convert GIS formats like Shapefile or DXF?',
    a: 'Not today. ConvaterPro handles the document, tabular, image, and archive conversions that surround geospatial work — the survey report, the coordinate table, the plan set, the map export, the deliverable package. If your workflow needs a specific format we do not list yet, tell us: format coverage is part of what we discuss on a commercial engagement.',
  },
  {
    q: 'Can I try it before buying anything?',
    a: 'Yes. Registration gives you a free 8-day demo account with starter points and your pick of three conversion tools, so you can put real files through the platform before committing. No card is required, and a handful of tools run publicly on this site with no account at all.',
  },
  {
    q: 'How does access control work for a team?',
    a: 'There are four roles — demo, general, admin, and super user — and on top of that, permission for each individual conversion can be granted or revoked per user. Someone only sees and runs the tools you have opened for them.',
  },
  {
    q: 'What happens if a conversion fails?',
    a: 'You are not charged. Points are reserved when the job starts, and if processing fails they are refunded to the balance automatically. The failure stays visible in history with its error message.',
  },
  {
    q: 'How do I avoid double charges when a script retries?',
    a: 'Send an Idempotency-Key header with the request. Retrying with the same key returns the original result instead of running the conversion — or billing for it — a second time.',
  },
  {
    q: 'Can we run it on our own infrastructure?',
    a: 'That is available as a commercial arrangement. Get in touch with your requirements and we will walk through what a private deployment involves.',
  },
  {
    q: 'What happens to the files we upload?',
    a: 'A converted file is stored privately against your account so you can download it again from history. Deleting the conversion from your history removes the stored file with it.',
  },
] as const
