#!/usr/bin/env python3
import re

# Ler arquivos
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('nutrition-update.html', 'r', encoding='utf-8') as f:
    nutrition = f.read()

with open('supplements-update.html', 'r', encoding='utf-8') as f:
    supplements = f.read()

# Substituir seção de nutrição
nutrition_pattern = r'<!-- Seção de Nutrição -->.*?<!-- Seção de Suplementos -->'
html = re.sub(nutrition_pattern, nutrition + '\n\n            <!-- Seção de Suplementos -->', html, flags=re.DOTALL)

# Substituir seção de suplementos
supplements_pattern = r'<!-- Seção de Suplementos -->.*?<!-- Seção de Horários -->'
html = re.sub(supplements_pattern, supplements + '\n\n            <!-- Seção de Horários -->', html, flags=re.DOTALL)

# Salvar
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ index.html atualizado com sucesso!")
print("✅ Dieta: Alto Carbo e Baixo Carbo adicionados")
print("✅ Suplementos: Protocolo atualizado")
