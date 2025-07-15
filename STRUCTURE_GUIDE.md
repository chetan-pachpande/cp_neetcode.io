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

#### **MANDATORY Technical Stack:**
- **TailwindCSS CDN** - `<script src="https://cdn.tailwindcss.com"></script>` - ALWAYS use CDN, never custom CSS conflicts
- **Mermaid.js** - `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>` - For tree/graph visualizations
- **Inter Font** - Google Fonts Inter for consistent typography
- **Gradient Background** - `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)` with `min-height: 100vh`

#### **CSS Architecture Rules:**
- **NO custom CSS conflicts** - Use TailwindCSS classes exclusively for layout
- **Minimal custom CSS** - Only for specific styling not available in Tailwind
- **No inline styles** - Avoid mixing inline styles with CSS classes
- **No JavaScript style overrides** - Don't use JS to force styling
- **Consistent card styling** - Use `.card` class with consistent padding and shadows

#### **Visualization Standards:**
- **Use proven libraries** - Mermaid.js for diagrams, avoid custom SVG unless necessary
- **Clean state management** - Use `JSON.parse(JSON.stringify())` for deep cloning
- **Consistent animations** - Use CSS transitions, not complex JavaScript animations
- **Responsive design** - Use Tailwind grid/flex utilities, test on mobile

### File Structure:

For each problem (e.g., `subsets_ii.html`), create:
- `subsets_ii.html` - The visualization file
- `subsets_ii.java` - The Java solution code

### Reference Implementation:

Use Two Sum and Subsets II as the gold standard for structure. ALL other problems must follow this exact pattern.

### Completed Implementations:

✅ **Two Sum** (`two_sum.html`) - Complete interactive visualizer
✅ **Subsets** (`subsets.html`) - Complete interactive visualizer with:
- Clean TailwindCSS + Mermaid.js architecture
- Interactive decision tree visualization
- Step-by-step algorithm execution
- Call stack visualization
- Responsive design with proper grid layout
- Working gradient background without conflicts

✅ **Subsets II** (`subsets_ii.html`) - Complete interactive visualizer with:
- Full backtracking algorithm visualization
- Live tree representation showing recursive calls
- Duplicate handling demonstration
- Step-by-step code execution
- Interactive controls and real-time state display

## ENFORCEMENT CHECKLIST - MUST FOLLOW BEFORE IMPLEMENTATION:

### Pre-Implementation Checklist:
- [ ] **Review working examples** - Study subsets.html and subsets_ii.html structure
- [ ] **Use TailwindCSS CDN** - Never mix custom CSS with Tailwind
- [ ] **Include Mermaid.js** - For any tree/graph visualizations
- [ ] **Test gradient background** - Ensure no CSS conflicts
- [ ] **Plan state management** - Use simple, clean state tracking
- [ ] **Choose proven libraries** - Avoid custom implementations when libraries exist

### Implementation Rules:
1. **SIMPLICITY FIRST** - If it's complex, there's probably a simpler way
2. **USE WORKING PATTERNS** - Copy structure from working examples
3. **NO OVER-ENGINEERING** - Avoid complex custom solutions
4. **TEST INCREMENTALLY** - Build and test each section separately
5. **FOLLOW EXACT STRUCTURE** - Don't deviate from the layout requirements

### Post-Implementation Verification:
- [ ] **Gradient background displays correctly** - No gray backgrounds
- [ ] **All interactive controls work** - Play/pause/step functionality
- [ ] **Responsive design works** - Test on different screen sizes
- [ ] **Navigation works** - "Back to Home" button functions
- [ ] **No console errors** - Check browser console for errors
- [ ] **Code follows working examples** - Structure matches proven implementations

## LEARNING FROM MISTAKES:

### What NOT to do (learned from subsets.html debugging):
- ❌ **Don't mix CSS approaches** - Stick to TailwindCSS
- ❌ **Don't use complex custom SVG** - Use Mermaid.js instead
- ❌ **Don't add debug logging in production** - Keep code clean
- ❌ **Don't force styles with JavaScript** - Fix CSS conflicts properly
- ❌ **Don't over-complicate state management** - Keep it simple
- ❌ **Don't reinvent the wheel** - Use proven libraries

### What TO do (learned from working implementation):
- ✅ **Use TailwindCSS exclusively** - Clean, consistent styling
- ✅ **Use Mermaid.js for diagrams** - Reliable, feature-rich
- ✅ **Keep state management simple** - Clean functions, clear data flow
- ✅ **Test frequently** - Build incrementally and test each part
- ✅ **Follow working patterns** - Copy from successful implementations
- ✅ **Prioritize simplicity** - Simple solutions are usually better

## DO NOT DEVIATE FROM THIS STRUCTURE!

Consistency is crucial for student learning experience.
