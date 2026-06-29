# Use bash by default (works on Linux/macOS CI and Git Bash on Windows)
# Override locally with `set shell := ["powershell", "-c"]` if needed
set shell := ["bash", "-c"]

# Default recipe
default: build

# Build both Pyodide tools and the Vite frontend
build: build-pyodide build-vite

build-vite:
    pnpm run build

# Build the pyodide-tools package and copy the .whl to the public directory
build-pyodide:
    cd pyodide-tools; uv build
    uv run python -c "import shutil, glob, os; [os.remove(f) for f in glob.glob('public/pyodide_tools*.whl')]; [shutil.copy(f, 'public/') for f in glob.glob('pyodide-tools/dist/*.whl')]"

# Clean built artifacts from pyodide-tools and public directories
clean:
    uv run python -c "import shutil, glob, os; shutil.rmtree('pyodide-tools/dist', ignore_errors=True); [os.remove(f) for f in glob.glob('public/pyodide_tools*.whl')]"
