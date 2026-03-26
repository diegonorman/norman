'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle, FolderPlus } from 'lucide-react';

const CATEGORIES = [
  'Abdômen', 'Adutores', 'Alongamentos', 'Braço', 'Costas', 
  'Glúteo', 'Ombro', 'Panturrilha', 'Peito', 'Posterior', 'Quadríceps'
];

export default function VideoUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    const finalCategory = showNewCategory ? newCategory : category;
    
    if (!file || !finalCategory || !title) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('category', finalCategory);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setSuccess(true);
        setFile(null);
        setCategory('');
        setTitle('');
        setDescription('');
        setNewCategory('');
        setShowNewCategory(false);
        
        setTimeout(() => {
          setSuccess(false);
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
        <Upload className="w-5 h-5" />
        Upload de Vídeo
      </h2>

      {/* Arquivo */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Vídeo *</label>
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center bg-gray-800">
          {!file ? (
            <label className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-300">Clique para selecionar</p>
              <p className="text-xs text-gray-500 mt-1">.mp4, .mov, .webm</p>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between bg-gray-700 p-3 rounded">
              <span className="text-sm truncate text-white">{file.name}</span>
              <button onClick={() => setFile(null)}>
                <X className="w-5 h-5 text-red-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Categoria */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Categoria *</label>
        {!showNewCategory ? (
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="">Selecione...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewCategory(true)}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg"
              title="Nova categoria"
            >
              <FolderPlus className="w-5 h-5 text-blue-400" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nome da nova categoria"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => {
                setShowNewCategory(false);
                setNewCategory('');
              }}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Título */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Nome do Exercício *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Supino reto com barra"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
      </div>

      {/* Descrição */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Observações (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dicas de execução, cuidados..."
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
      </div>

      {/* Botão */}
      <button
        onClick={handleUpload}
        disabled={!file || (!category && !newCategory) || !title || uploading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {uploading ? 'Enviando...' : 'Fazer Upload'}
      </button>

      {/* Sucesso */}
      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span>Vídeo adicionado! Atualizando...</span>
        </div>
      )}
    </div>
  );
}
