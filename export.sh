#!/usr/bin/env bash
# Syndex - Automated Source Code Export Script
set -e

EXPORT_FILENAME="syndx-rare-disease-ai-source.zip"
echo "========================================================"
echo "    Syndex Rare Disease AI - Automated Code Export      "
echo "========================================================"

if command -v python3 &> /dev/null; then
    python3 export.py
elif command -v zip &> /dev/null; then
    rm -f "$EXPORT_FILENAME"
    zip -r "$EXPORT_FILENAME" . \
        -x "node_modules/*" \
        -x ".git/*" \
        -x "dist/*" \
        -x ".build-outputs/*" \
        -x "*.zip" \
        -x "*.log"
    echo "✅ Export complete! Archive created: $EXPORT_FILENAME"
    echo "Size: $(du -h "$EXPORT_FILENAME" | cut -f1)"
else
    echo "⚠️ Falling back to tar archive..."
    TAR_FILENAME="syndx-rare-disease-ai-source.tar.gz"
    tar --exclude='./node_modules' \
        --exclude='./.git' \
        --exclude='./dist' \
        --exclude='./.build-outputs' \
        --exclude='./*.tar.gz' \
        --exclude='./*.zip' \
        --warning=no-file-changed \
        -czf "/tmp/$TAR_FILENAME" .
    mv "/tmp/$TAR_FILENAME" "./$TAR_FILENAME"
    echo "✅ Export complete! Archive created: $TAR_FILENAME"
    echo "Size: $(du -h "$TAR_FILENAME" | cut -f1)"
fi

echo "========================================================"

