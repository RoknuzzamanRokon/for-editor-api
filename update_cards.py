#!/usr/bin/env python3
import re

# Read the file
with open('frontend/app/(marketing)/page.tsx', 'r') as f:
    content = f.read()

# Replace patterns
# 1. bg-white p-8 -> bg-white/90 backdrop-blur-sm p-8
content = re.sub(r'bg-white p-8', r'bg-white/90 backdrop-blur-sm p-8', content)

# 2. [html[data-theme='sunset']_&]:bg-[#7c2d12] -> [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md
content = re.sub(
    r"\[html\[data-theme='sunset'\]_&\]:bg-\[#7c2d12\](?! )",
    r"[html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md",
    content
)

# 3. [html[data-theme='sunset']_&]:border-[#9a3412] -> [html[data-theme='sunset']_&]:border-[#9a3412]/40
content = re.sub(
    r"\[html\[data-theme='sunset'\]_&\]:border-\[#9a3412\](?! )",
    r"[html[data-theme='sunset']_&]:border-[#9a3412]/40",
    content
)

# 4. bg-white px-8 -> bg-white/90 backdrop-blur-sm px-8
content = re.sub(r'bg-white px-8', r'bg-white/90 backdrop-blur-sm px-8', content)

# Write back
with open('frontend/app/(marketing)/page.tsx', 'w') as f:
    f.write(content)

print("Updated page.tsx successfully!")
