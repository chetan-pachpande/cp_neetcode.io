# cp_neetcode.io

**Interactive visualizations for the NeetCode 150 problem list.**

## Overview
This repository provides a clean, modern website with interactive algorithm visualizations for each problem in the NeetCode 150 list. Each problem page shows step-by-step explanations, live code animations, flowcharts, and narration support.

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- [Python 3](https://www.python.org/) (for local server)

### Running Locally
```bash
# from project root
git clone https://github.com/chetan-pachpande/cp_neetcode.io.git
cd cp_neetcode.io
# start a simple HTTP server on port 8000
python3 -m http.server 8000
# visit http://localhost:8000 in your browser
```

## Project Structure
```
index.html               # Main landing page with dynamic category links
categories/              # Problem folders organized by category
  <category-slug>/       # Contains placeholder or full visualization HTML files
scripts/                 # Utility scripts to generate structure and placeholders
```

## Contributing
Contributions are welcome! Fork the repo, add your visualization under the appropriate category, ensure each problem page includes a “Back to Home” link, then submit a pull request.