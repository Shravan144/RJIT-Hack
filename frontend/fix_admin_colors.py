import os

directory = r"c:\Users\PARTH\Downloads\WebDev\RJIT-Hack\frontend\src\AdminSection"

for filename in os.listdir(directory):
    if filename.endswith(".jsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Same string replacements
        content = content.replace('bg-[hsl(220,16%,12%)]', 'bg-brand-surface')
        content = content.replace('border-[hsl(220,14%,20%)]', 'border-brand-border')
        content = content.replace('text-white', 'text-brand-base')
        content = content.replace('text-slate-200', 'text-brand-base')
        content = content.replace('text-slate-300', 'text-brand-base')
        content = content.replace('text-slate-400', 'text-brand-muted')
        content = content.replace('text-slate-500', 'text-brand-muted')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Admin replacements complete!")
