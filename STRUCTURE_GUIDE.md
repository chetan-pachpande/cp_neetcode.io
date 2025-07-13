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

- **NO TailwindCSS** - Use inline CSS only
- **Consistent CSS classes**: .container, .problem-description, .visualization-container, etc.
- **Responsive design** with proper column layouts
- **Smooth animations** and transitions
- **Consistent color scheme** across all problems

### File Structure:

For each problem (e.g., `same_tree.html`), create:
- `same_tree.html` - The visualization file
- `same_tree.java` - The Java solution code

### Reference Implementation:

Use Two Sum as the gold standard for structure. ALL other problems must follow this exact pattern.

## DO NOT DEVIATE FROM THIS STRUCTURE!

Consistency is crucial for student learning experience.
