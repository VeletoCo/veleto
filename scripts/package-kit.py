"""Package portable project sources and brand assets; exclude runtime/cache data."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
archive = root / 'public' / 'launch-kit' / 'downloads' / 'veleto-launch-kit.zip'
folders = ['src', 'public', 'scripts', 'tests']
files = ['index.html', 'vite.config.js', 'package.json', 'package-lock.json', 'README.md', 'REPOSITORY-INSPECTION.txt', '.gitignore']
with ZipFile(archive, 'w', ZIP_DEFLATED) as out:
    for folder in folders:
        for path in (root / folder).rglob('*'):
            if path.is_file() and path != archive and '__pycache__' not in path.parts:
                out.write(path, Path('veleto') / path.relative_to(root))
    for name in files:
        out.write(root / name, Path('veleto') / name)
print(f'Packaged {archive.name}: {archive.stat().st_size:,} bytes')
