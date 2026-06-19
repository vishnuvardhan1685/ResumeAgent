from tools.pdf_tools import extract_text_from_pdf_bytes


def test_extract_text_from_invalid_pdf_raises():
    try:
        extract_text_from_pdf_bytes(b"not a pdf")
    except Exception as exc:
        assert exc is not None
    else:
        raise AssertionError("Expected invalid PDF bytes to raise")
