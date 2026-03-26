const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, '../vdeo');
const targetDir = path.join(__dirname, '../public/videos');
const mapPath = path.join(__dirname, '../lib/video-map.json');

// Função para sanitizar nome de arquivo
function sanitizeFilename(filename) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9.-]/g, '-')  // Substitui caracteres especiais por -
    .replace(/-+/g, '-')               // Remove múltiplos -
    .replace(/^-|-$/g, '')             // Remove - do início/fim
    .toLowerCase();
}

function processVideos() {
  console.log('🎬 Processando e convertendo vídeos...');

  if (!fs.existsSync(sourceDir)) {
    console.log('⚠️  Pasta vdeo/ não encontrada');
    return;
  }

  const categories = fs.readdirSync(sourceDir);
  const videoMap = {};

  categories.forEach(category => {
    const categoryPath = path.join(sourceDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) return;

    const sanitizedCategory = sanitizeFilename(category);
    const targetCategoryPath = path.join(targetDir, sanitizedCategory);
    
    if (!fs.existsSync(targetCategoryPath)) {
      fs.mkdirSync(targetCategoryPath, { recursive: true });
    }

    videoMap[category] = [];

    const files = fs.readdirSync(categoryPath);
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (!['.mov', '.mp4', '.webm'].includes(ext)) return;

      const baseName = path.basename(file, ext);
      const sanitizedName = sanitizeFilename(baseName);
      const outputFile = `${sanitizedName}.mp4`;
      
      const sourcePath = path.join(categoryPath, file);
      const targetPath = path.join(targetCategoryPath, outputFile);

      // Converter se não existir ou se for mais novo
      if (!fs.existsSync(targetPath) || 
          fs.statSync(sourcePath).mtime > fs.statSync(targetPath).mtime) {
        
        console.log(`Convertendo: ${file}`);
        
        try {
          // Converter para MP4 com compressão
          execSync(
            `ffmpeg -i "${sourcePath}" -vcodec libx264 -crf 28 -preset fast -vf "scale=720:-2" -acodec aac -b:a 128k "${targetPath}" -y`,
            { stdio: 'ignore' }
          );
          console.log(`✓ ${outputFile}`);
        } catch (error) {
          console.log(`✗ Erro ao converter ${file}, copiando original...`);
          fs.copyFileSync(sourcePath, targetPath.replace('.mp4', ext));
        }
      }

      videoMap[category].push({
        name: baseName,
        file: outputFile,
        path: `/videos/${sanitizedCategory}/${outputFile}`
      });
    });
  });

  fs.writeFileSync(mapPath, JSON.stringify(videoMap, null, 2));

  const total = Object.values(videoMap).flat().length;
  console.log(`\n✅ ${total} vídeos processados`);
}

processVideos();
module.exports = { processVideos };
