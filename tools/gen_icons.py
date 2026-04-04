import struct, zlib

def create_png(size, filename):
    pixels = []
    center = size / 2
    for y in range(size):
        row = []
        for x in range(size):
            r, g, b, a = 26, 26, 46, 255
            tri_top = size * 0.15
            tri_bottom = size * 0.72
            tri_height = tri_bottom - tri_top
            if y >= tri_top and y <= tri_bottom:
                progress = (y - tri_top) / tri_height
                half_width = progress * (size * 0.38)
                if abs(x - center) <= half_width:
                    t = (y - tri_top) / tri_height
                    r = int(255 * (1 - t * 0.2))
                    g = int(213 * (1 - t * 0.5))
                    b = int(79 * (1 - t * 0.8))
                    a = 255
            if size >= 32:
                if y >= size * 0.30 and y <= size * 0.38:
                    if x >= center - size * 0.18 and x <= center + size * 0.18:
                        r, g, b = 26, 26, 46
                diag_y_start = size * 0.38
                diag_y_end = size * 0.65
                if y > diag_y_start and y <= diag_y_end:
                    p2 = (y - diag_y_start) / (diag_y_end - diag_y_start)
                    diag_x = center + size * 0.12 - p2 * size * 0.22
                    if abs(x - diag_x) <= size * 0.06:
                        r, g, b = 26, 26, 46
            elif size == 16:
                if y >= 4 and y <= 5:
                    if x >= 5 and x <= 11:
                        r, g, b = 26, 26, 46
                if y > 5 and y <= 11:
                    p2 = (y - 5) / 6
                    diag_x = 10 - p2 * 3.5
                    if abs(x - diag_x) <= 1.2:
                        r, g, b = 26, 26, 46
            corner_r = size * 0.15
            corners = [(corner_r, corner_r), (size - 1 - corner_r, corner_r),
                       (corner_r, size - 1 - corner_r), (size - 1 - corner_r, size - 1 - corner_r)]
            for cx, cy in corners:
                if (x < corner_r or x > size - 1 - corner_r) and (y < corner_r or y > size - 1 - corner_r):
                    dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
                    if dist > corner_r:
                        a = 0
            row.extend([r, g, b, a])
        pixels.append(bytes(row))
    header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    def make_chunk(ctype, data):
        c = ctype + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc
    raw = b''
    for r in pixels:
        raw += b'\x00' + r
    compressed = zlib.compress(raw)
    with open(filename, 'wb') as f:
        f.write(header)
        f.write(make_chunk(b'IHDR', ihdr_data))
        f.write(make_chunk(b'IDAT', compressed))
        f.write(make_chunk(b'IEND', b''))
    print(f'Created {filename} ({size}x{size})')

base = '/Users/jay/Documents/GitHub/7WebLySins/'
create_png(16, base + 'icon16.png')
create_png(48, base + 'icon48.png')
create_png(128, base + 'icon128.png')
print('Done!')
