"""Convert Natural Earth's public-domain 110m countries to bundled SVG paths.
Usage: python3 scripts/build-map.py /path/to/ne_110m_admin_0_countries.geojson
Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson
Projection: equirectangular; x=(longitude+180)*2, y=(85-latitude)*2.
"""
import json
import sys
from pathlib import Path

source = json.loads(Path(sys.argv[1]).read_text())
countries = []
for feature in source['features']:
    properties = feature['properties']
    if properties['ADM0_A3'] == 'ATA':
        continue
    geometry = feature['geometry']
    polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    paths = []
    for polygon in polygons:
        for ring in polygon:
            points = [f'{(lon + 180) * 2:.1f},{(85 - lat) * 2:.1f}' for lon, lat in ring]
            paths.append('M' + 'L'.join(points) + 'Z')
    countries.append({'id': properties['ADM0_A3'], 'name': properties['ADMIN'], 'path': ''.join(paths)})
Path('src/data/world-map.json').write_text(json.dumps(countries, separators=(',', ':')) + '\n')
print(f'Bundled {len(countries)} country outlines')
