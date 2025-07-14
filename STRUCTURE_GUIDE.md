# LeetCode Visualization Structure Guide

## Mandatory Structure for ALL Problem Implementations

This structure MUST be followed consistently across all problems to avoid confusing students.

### Layout Requirements:

1. **Problem Description** (100% width)
   - Full problem statement
   - Examples with input/output
   - Constraints

2. **Java Code** (100% width) 
   - Complete Java solution
   - Well-commented code
   - Refers to corresponding .java file in same directory

3. **Two-Column Layout Below:**

   **Left Column (40% width):**
   - **Intuition Section**
     - Algorithm approach explanation
     - Why this approach works
     - Key insights
   
   - **Step-by-Step Code** (below intuition)
     - Synchronized with code execution
     - Highlights current line being executed
     - Explains what each step does

   **Right Column (60% width):**
   - **Live Visualization & Controls**
     - Interactive visualization
     - Play/Pause/Step/Reset controls
     - Speed controls
     - Sample inputs
     - Custom input
     - Algorithm state display

4. **Log of Step Execution** (100% width)
   - Below the two-column layout
   - Shows execution trace
   - Step-by-step algorithm progress

5. **Full Explanation Script** (100% width)
   - Complete narration script
   - For video/audio explanations
   - Detailed walkthrough

### Technical Requirements:

- **TailwindCSS Integration** - Use Tailwind CDN for consistent styling
- **Gradient Background** - Use `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` for visual consistency
- **Consistent CSS classes**: .card, .visualization-container, .code-block, etc.
- **Responsive design** with proper column layouts using Tailwind flex utilities
- **Smooth animations** and transitions
- **Consistent color scheme** across all problems (white cards, gradient background)
- **Navigation** - Include "Back to Home" button with consistent styling

### File Structure:

For each problem (e.g., `subsets_ii.html`), create:
- `subsets_ii.html` - The visualization file
- `subsets_ii.java` - The Java solution code

### Reference Implementation:

Use Two Sum and Subsets II as the gold standard for structure. ALL other problems must follow this exact pattern.

### Completed Implementations:

✅ **Two Sum** (`two_sum.html`) - Complete interactive visualizer
✅ **Subsets II** (`subsets_ii.html`) - Complete interactive visualizer with:
- Full backtracking algorithm visualization
- Live tree representation showing recursive calls
- Duplicate handling demonstration
- Step-by-step code execution
- Interactive controls and real-time state display

## DO NOT DEVIATE FROM THIS STRUCTURE!

Consistency is crucial for student learning experience.
