import re
import html


def sanitise_input_text(text):
    # Escape HTML characters
    sanitized_text = html.escape(text)

    # Remove potential script tags
    sanitized_text = re.sub(r'<\s*script[^>]*>(.*?)<\s*/\s*script\s*>', '', sanitized_text,
                            flags=re.IGNORECASE | re.MULTILINE | re.DOTALL)

    return sanitized_text


def unescape_text(text):
    return html.unescape(text)
