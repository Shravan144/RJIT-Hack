import re
import os

filepath = r"c:\Users\PARTH\Downloads\WebDev\RJIT-Hack\frontend\src\DealerSection\Profile.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded backgrounds
content = content.replace('bg-[#0d0d0d]', 'bg-brand-bg')
content = content.replace('bg-[#111]', 'bg-brand-surface')
content = content.replace('bg-[#1a1a1a]', 'bg-brand-elevated')

# Replace hardcoded borders
content = content.replace('border-[#1a1a1a]', 'border-brand-border')
content = content.replace('border-[#333]', 'border-brand-border')

# Replace hardcoded text colors 
content = content.replace('text-[#22c55e]', 'text-green-500')
content = content.replace('bg-[#22c55e]', 'bg-green-500')
content = content.replace('border-[#22c55e]', 'border-green-500')
content = content.replace('shadow-[#22c55e]', 'shadow-green-500')
content = content.replace('hover:bg-[#1ea84f]', 'hover:bg-green-600')

# Text neutral colors
content = content.replace('text-[#111]', 'text-brand-inverted')
content = content.replace('text-white', 'text-brand-base')
content = content.replace('text-gray-300', 'text-brand-base')
content = content.replace('text-gray-400', 'text-brand-muted')
content = content.replace('text-gray-500', 'text-brand-muted')
content = content.replace('text-gray-600', 'text-brand-muted')
content = content.replace('text-slate-300', 'text-brand-muted')
content = content.replace('text-slate-400', 'text-brand-muted')

# Replace hardcoded hover surfaces
content = content.replace('hover:bg-[#111]', 'hover:bg-brand-surface')
content = content.replace('hover:bg-[#1a1a1a]', 'hover:bg-brand-elevated')

# Remove forced dark color-scheme so we rely on tailwind
content = content.replace('[color-scheme:dark]', '')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacements complete!")
