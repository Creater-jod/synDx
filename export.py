import os
import zipfile

OUTPUT_ZIP = "syndx-rare-disease-ai-source.zip"

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    ".build-outputs",
    "__pycache__",
    ".gradle",
    "build",
}

EXCLUDE_EXTENSIONS = {
    ".zip",
    ".tar.gz",
    ".tgz",
    ".log",
}

EXCLUDE_FILES = {
    OUTPUT_ZIP,
}

def make_zip():
    print(f"Exporting project source code to {OUTPUT_ZIP}...")
    if os.path.exists(OUTPUT_ZIP):
        os.remove(OUTPUT_ZIP)

    count = 0
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # Filter directories in place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
            
            for file in files:
                if file in EXCLUDE_FILES or file.startswith('.'):
                    continue
                if any(file.endswith(ext) for ext in EXCLUDE_EXTENSIONS):
                    continue
                
                file_path = os.path.join(root, file)
                # Archive name relative to current directory
                arcname = os.path.relpath(file_path, ".")
                zipf.write(file_path, arcname)
                count += 1

    size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"✅ Export complete! {count} files packaged into {OUTPUT_ZIP} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    make_zip()
