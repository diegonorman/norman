#!/bin/bash

echo "🎬 Processando vídeos locais..."
echo "Origem: vdeo/"
echo "Destino: public/videos/"
echo ""

cd /home/norman/norman/gh-personal
node scripts/process-videos.js

echo ""
echo "✅ Vídeos prontos para uso!"
