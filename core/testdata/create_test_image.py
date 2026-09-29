import os
import io
import sqlite3
import zipfile

BASE = "testdata"
IMAGE = os.path.join(BASE, "forensic_test_image.bin")

os.makedirs(BASE, exist_ok=True)

# Minimal JPEG-like test object
jpeg = bytes([
    0xFF, 0xD8, 0xFF, 0xE0,
    0x00, 0x10,
    0x4A, 0x46, 0x49, 0x46,
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0xFF, 0xD9
])

# Minimal PNG-like object with PNG signature + IEND
png = (
    b"\x89PNG\r\n\x1a\n"
    b"\x00\x00\x00\x0DIHDR"
    b"\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00"
    b"\x00\x00\x00\x00"
    b"\x49\x45\x4E\x44\xAE\x42\x60\x82"
)

# Small PDF
pdf = (
    b"%PDF-1.4\n"
    b"1 0 obj\n"
    b"<< /Type /Catalog >>\n"
    b"endobj\n"
    b"%%EOF\n"
)

# Real ZIP/DOCX-style container
zip_buffer = io.BytesIO()

with zipfile.ZipFile(
    zip_buffer,
    "w",
    zipfile.ZIP_DEFLATED
) as z:
    z.writestr(
        "[Content_Types].xml",
        '<?xml version="1.0"?><Types></Types>'
    )
    z.writestr(
        "word/document.xml",
        "<document><body>Forensic Test</body></document>"
    )

docx = zip_buffer.getvalue()

# Real SQLite database
sqlite_path = os.path.join(BASE, "sample.sqlite")

if os.path.exists(sqlite_path):
    os.remove(sqlite_path)

conn = sqlite3.connect(sqlite_path)
conn.execute(
    "CREATE TABLE evidence "
    "(id INTEGER PRIMARY KEY, name TEXT, relevance INTEGER)"
)
conn.execute(
    "INSERT INTO evidence(name, relevance) "
    "VALUES ('Forensic Test Record', 95)"
)
conn.commit()
conn.close()

with open(sqlite_path, "rb") as f:
    sqlite_data = f.read()

# Build a 10 MiB forensic image
image_size = 10 * 1024 * 1024

with open(IMAGE, "wb") as image:
    image.write(b"\x00" * image_size)

objects = [
    (1024, jpeg, "JPEG"),
    (65536, png, "PNG"),
    (131072, pdf, "PDF"),
    (262144, docx, "DOCX"),
    (524288, sqlite_data, "SQLite"),
]

with open(IMAGE, "r+b") as image:

    for offset, data, name in objects:
        image.seek(offset)
        image.write(data)
        print(
            f"Inserted {name:<8} "
            f"offset={offset:<8} "
            f"size={len(data)}"
        )

print()
print("Created:", IMAGE)
print("Size:", os.path.getsize(IMAGE), "bytes")
