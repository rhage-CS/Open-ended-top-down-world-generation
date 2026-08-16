from PIL import Image

sheet = Image.open('assets/tilemap_packed.png').convert('RGBA')

def tile(i):
    r, c = divmod(i, 12)
    return sheet.crop((c * 16, r * 16, c * 16 + 16, r * 16 + 16))

print('--- CHECK 1: fence conflict, rows 3-5 vs row 6 ---')
for a, b in [(44, 80), (45, 81), (46, 82)]:
    A, B = list(tile(a).getdata()), list(tile(b).getdata())
    d = sum(1 for u, v in zip(A, B) if u != v)
    verdict = 'DUPLICATE, one entry is wrong' if d < 10 else 'distinct, both entries stand'
    print(f'  {a} vs {b}: diff={d:3d}/256  {verdict}')

print()
print('--- CHECK 2: roof row 5 over facade row 6 seam ---')
for c in range(8):
    lower = tile(60 + c).load()
    upper = tile(72 + c).load()
    d = sum(1 for x in range(16) if lower[x, 15] != upper[x, 0])
    print(f'  col {c}: (5,{c}) y15 vs (6,{c}) y0  mismatched={d:2d}/16')
