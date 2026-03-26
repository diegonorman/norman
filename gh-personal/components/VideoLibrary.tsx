'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Search, Grid, List, Folder, X, Info } from 'lucide-react';

interface Video {
  id: string;
  name: string;
  file: string;
  path: string;
  category: string;
  thumbnail?: string | null;
  description?: string;
  duration?: number | null;
}

interface VideoLibraryProps {
  videos: { [category: string]: Video[] };
}

export default function VideoLibrary({ videos }: VideoLibraryProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  const categories = Object.keys(videos);
  
  const filteredVideos = Object.entries(videos)
    .filter(([cat]) => selectedCategory === 'all' || cat === selectedCategory)
    .flatMap(([cat, vids]) => vids)
    .filter(v => 
      v.name.toLowerCase().includes(search.toLowerCase())
    );

  // Gerar thumbnail do vídeo
  const generateThumbnail = (videoPath: string, videoId: string) => {
    if (thumbnails[videoId]) return;

    const video = document.createElement('video');
    video.src = videoPath;
    video.crossOrigin = 'anonymous';
    video.currentTime = 1; // Pegar frame em 1 segundo

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        setThumbnails(prev => ({ ...prev, [videoId]: thumbnail }));
      }
    };
  };

  // Gerar thumbnails para vídeos visíveis
  useEffect(() => {
    filteredVideos.slice(0, 20).forEach(video => {
      if (!thumbnails[video.id]) {
        generateThumbnail(video.path, video.id);
      }
    });
  }, [filteredVideos]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-800">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar exercício..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 ring-blue-500 text-white"
          >
            <option value="all">📁 Todas as categorias ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                📂 {cat} ({videos[cat].length})
              </option>
            ))}
          </select>

          <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-gray-700 shadow-sm' : 'hover:bg-gray-700'}`}
              title="Visualização em grade"
            >
              <Grid className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-gray-700 shadow-sm' : 'hover:bg-gray-700'}`}
              title="Visualização em lista"
            >
              <List className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Categorias em destaque */}
      {selectedCategory === 'all' && (
        <div className="bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Categorias</h3>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <Folder className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">{cat}</span>
                <span className="text-sm text-blue-400 bg-gray-700 px-2 py-0.5 rounded-full">{videos[cat].length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de vídeos */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
        {filteredVideos.map((video) => (
          <button
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className={`${
              viewMode === 'grid' 
                ? 'group relative aspect-video bg-gray-900 rounded-lg overflow-hidden hover:ring-2 ring-blue-500' 
                : 'flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md border'
            } transition-all`}
          >
            {viewMode === 'grid' ? (
              <>
                {/* Thumbnail */}
                <div className="relative w-full h-full">
                  {thumbnails[video.id] ? (
                    <img 
                      src={thumbnails[video.id]} 
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                  
                  {/* Overlay com play */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                    <div className="font-medium text-white text-sm line-clamp-2">{video.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-300 bg-black/50 px-2 py-0.5 rounded">
                        {video.category}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Thumbnail pequeno */}
                <div className="w-24 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                  {thumbnails[video.id] ? (
                    <img 
                      src={thumbnails[video.id]} 
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate text-white">{video.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400">{video.category}</span>
                  </div>
                </div>

                <Play className="w-5 h-5 text-blue-400 flex-shrink-0" />
              </>
            )}
          </button>
        ))}
      </div>

      {/* Modal de vídeo */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-gray-900 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 text-white">{selectedVideo.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Folder className="w-4 h-4" />
                    {selectedVideo.category}
                  </span>
                </div>
                {selectedVideo.description && (
                  <p className="mt-2 text-sm text-gray-400 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {selectedVideo.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Player - ajustado para vídeos verticais */}
            <div className="flex justify-center bg-black">
              <video
                ref={videoRef}
                src={selectedVideo.path}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Contador */}
      <div className="text-center py-4 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-white">{filteredVideos.length}</span> {filteredVideos.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
          {selectedCategory !== 'all' && <span className="text-blue-400"> em {selectedCategory}</span>}
        </p>
      </div>
    </div>
  );
}
