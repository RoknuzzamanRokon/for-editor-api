"""Shared HTML template for outbound marketing email.

Kept separate from `services.email` because every function in that module
owns its own full template — this one is reused across every campaign send,
so the branded header/footer only need to be right in one place.
"""

import html
import re

# The app ships six selectable in-app themes, but an outbound email has no
# access to the recipient's (or even the sending admin's) live theme — so the
# header is pinned to one fixed brand color rather than mirroring whichever
# theme happens to be selected in-app. This matches the marketing site's own
# `theme.primary`/`buttonBg` (frontend/config/marketingTheme.tsx).
BRAND_COLOR = "#f97316"

# Fixed every send — never a compose-form field. Only the subject and body
# change per campaign.
SIGNATURE_HTML = """\
<p style="margin:0 0 4px; font-size:13px; line-height:1.6; color:#334155;">Best regards,</p>
<p style="margin:0; font-size:13px; font-weight:700; line-height:1.6; color:#0f172a;">Md Rokunuzzaman Rokon</p>
<p style="margin:0 0 4px; font-size:13px; line-height:1.6; color:#334155;">Developer, ConvaterPro</p>
<p style="margin:0; font-size:13px; line-height:1.6;"><a href="https://convaterpro.innsightmap.com/" style="color:#f97316; text-decoration:none;">https://convaterpro.innsightmap.com/</a></p>"""

SIGNATURE_TEXT = """Best regards,
Md Rokunuzzaman Rokon
Developer, ConvaterPro
https://convaterpro.innsightmap.com/"""


_TAG_RE = re.compile(r"<[^>]+>")
_BLOCK_END_RE = re.compile(r"</(p|div|li|h[1-6])>|<br\s*/?>", re.IGNORECASE)


def html_to_text(body_html: str) -> str:
    """A best-effort plain-text alternative for the multipart email — not a
    full HTML parser, just enough to keep spam filters and non-HTML clients
    happy. The body only ever contains the limited tag set the compose
    editor's rich-text toolbar can produce (paragraphs, lists, bold/italic,
    links, headings), so this doesn't need to handle arbitrary markup."""
    with_breaks = _BLOCK_END_RE.sub("\n", body_html)
    text = _TAG_RE.sub("", with_breaks)
    text = html.unescape(text)
    lines = [line.strip() for line in text.splitlines()]
    # Collapse runs of blank lines left behind by stripped block tags.
    collapsed: list[str] = []
    for line in lines:
        if line or (collapsed and collapsed[-1]):
            collapsed.append(line)
    return "\n".join(collapsed).strip()


def build_marketing_email_html(subject: str, body_html: str, unsubscribe_url: str) -> str:
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(subject)}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(15,23,42,0.08);">
          <tr>
            <td style="background-color:{BRAND_COLOR}; padding:28px 32px;">
              <span style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:0.02em;">ConvaterPro</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px; font-size:14px; line-height:1.6; color:#334155;">
              {body_html}
              <div style="margin:28px 0 0; padding-top:20px; border-top:1px solid #e2e8f0;">
                {SIGNATURE_HTML}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:11px; color:#cbd5e1;">
                <a href="{unsubscribe_url}" style="color:#cbd5e1; text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def build_marketing_email_text(body_html: str, unsubscribe_url: str) -> str:
    return f"""{html_to_text(body_html)}

{SIGNATURE_TEXT}

Unsubscribe: {unsubscribe_url}
"""
