#!/usr/bin/env python3
"""
Generate blank placeholder HTML files for all NeetCode 150 problems.
Run: python3 scripts/generate_placeholders.py
"""
import os

# List of problems with slug and title
problems = [
    ("contains_duplicate.html", "Contains Duplicate | LC 217"),
    ("valid_anagram.html", "Valid Anagram | LC 242"),
    ("two_sum.html", "Two Sum | LC 1"),
    ("group_anagrams.html", "Group Anagrams | LC 49"),
    ("top_k_frequent_elements.html", "Top K Frequent Elements | LC 347"),
    ("product_except_self.html", "Product of Array Except Self | LC 238"),
    ("valid_sudoku.html", "Valid Sudoku | LC 36"),
    ("encode_decode_strings.html", "Encode and Decode Strings | LC 271 (Premium)"),
    ("longest_consecutive_sequence.html", "Longest Consecutive Sequence | LC 128"),
    # Two Pointers
    ("valid_palindrome.html", "Valid Palindrome | LC 125"),
    ("two_sum_ii.html", "Two Sum II - Input Array Is Sorted | LC 167"),
    ("three_sum.html", "3Sum | LC 15"),
    ("container_with_most_water.html", "Container With Most Water | LC 11"),
    ("trapping_rain_water.html", "Trapping Rain Water | LC 42"),
    # Add remaining problems similarly...
]

TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} Visualizer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-800">
  <div class="container mx-auto p-8">
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold">{title}</h1>
      <p class="mt-2 text-gray-600">Placeholder page - Coming Soon</p>
    </header>
    <main class="text-center">
      <p>This visualization is not yet implemented.</p>
      <a href="../index.html" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">Back to Home</a>
    </main>
  </div>
</body>
</html>'''

# Ensure scripts folder has execute permission
if __name__ == '__main__':
    for slug, title in problems:
        path = os.path.join(os.getcwd(), slug)
        if not os.path.exists(path):
            with open(path, 'w') as f:
                f.write(TEMPLATE.format(title=title))
            print(f"Created placeholder: {slug}")
        else:
            print(f"Exists: {slug}")
