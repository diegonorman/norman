const videos = [
  // PEITO
  { title: 'Supino Reto', url: 'https://youtube.com/shorts/ZSLSanHSuf0', category: 'Peito', muscle_group: 'Peitoral', difficulty: 'intermediate', description: 'Exercício básico para peito' },
  { title: 'Supino Inclinado', url: 'https://youtube.com/shorts/exemplo1', category: 'Peito', muscle_group: 'Peitoral Superior', difficulty: 'intermediate', description: 'Foco no peitoral superior' },
  { title: 'Crucifixo', url: 'https://youtube.com/shorts/exemplo2', category: 'Peito', muscle_group: 'Peitoral', difficulty: 'beginner', description: 'Alongamento do peitoral' },
  
  // COSTAS
  { title: 'Puxada Frontal', url: 'https://youtube.com/shorts/exemplo3', category: 'Costas', muscle_group: 'Dorsal', difficulty: 'intermediate', description: 'Exercício para dorsal' },
  { title: 'Remada Curvada', url: 'https://youtube.com/shorts/exemplo4', category: 'Costas', muscle_group: 'Dorsal', difficulty: 'intermediate', description: 'Espessura das costas' },
  
  // PERNAS
  { title: 'Agachamento Livre', url: 'https://youtube.com/shorts/Zw8kGqE5pZv', category: 'Pernas', muscle_group: 'Quadríceps', difficulty: 'advanced', description: 'Rei dos exercícios' },
  { title: 'Leg Press', url: 'https://youtube.com/shorts/d1W2YnVMtJs', category: 'Pernas', muscle_group: 'Quadríceps', difficulty: 'intermediate', description: 'Exercício para pernas' },
  { title: 'Cadeira Extensora', url: 'https://youtube.com/shorts/exemplo5', category: 'Pernas', muscle_group: 'Quadríceps', difficulty: 'beginner', description: 'Isolamento de quadríceps' },
  { title: 'Stiff', url: 'https://youtube.com/shorts/exemplo6', category: 'Pernas', muscle_group: 'Posterior', difficulty: 'intermediate', description: 'Posterior de coxa' },
  
  // OMBROS
  { title: 'Desenvolvimento', url: 'https://youtube.com/shorts/exemplo7', category: 'Ombros', muscle_group: 'Deltoides', difficulty: 'intermediate', description: 'Ombros completos' },
  { title: 'Elevação Lateral', url: 'https://youtube.com/shorts/exemplo8', category: 'Ombros', muscle_group: 'Deltoides', difficulty: 'beginner', description: 'Deltoides lateral' },
  
  // BRAÇOS
  { title: 'Rosca Direta', url: 'https://youtube.com/shorts/exemplo9', category: 'Braços', muscle_group: 'Bíceps', difficulty: 'beginner', description: 'Bíceps básico' },
  { title: 'Rosca Martelo', url: 'https://youtube.com/shorts/exemplo10', category: 'Braços', muscle_group: 'Bíceps', difficulty: 'beginner', description: 'Bíceps e antebraço' },
  { title: 'Tríceps Corda', url: 'https://youtube.com/shorts/exemplo11', category: 'Braços', muscle_group: 'Tríceps', difficulty: 'beginner', description: 'Tríceps na polia' },
  { title: 'Tríceps Testa', url: 'https://youtube.com/shorts/exemplo12', category: 'Braços', muscle_group: 'Tríceps', difficulty: 'intermediate', description: 'Tríceps com barra' },
  
  // ABDÔMEN
  { title: 'Abdominal Supra', url: 'https://youtube.com/shorts/exemplo13', category: 'Abdômen', muscle_group: 'Reto Abdominal', difficulty: 'beginner', description: 'Abdominal básico' },
  { title: 'Prancha', url: 'https://youtube.com/shorts/exemplo14', category: 'Abdômen', muscle_group: 'Core', difficulty: 'beginner', description: 'Isometria de core' }
];

console.log('📋 Lista de vídeos para cadastrar:\n');
console.log(JSON.stringify(videos, null, 2));
console.log(`\n✅ Total: ${videos.length} vídeos`);
console.log('\n💡 Copie e cole esses vídeos manualmente no painel admin');
console.log('   ou use a API /api/admin/videos\n');
