# PDDL Highlighter Examples

This folder contains examples demonstrating the features of the PDDL Highlighter extension for Jupyter notebooks.

## Contents

- `example.ipynb`: A Jupyter notebook showcasing all features
  - Syntax highlighting
  - Theme selection
  - Code formatting
  - Validation
  - Save functionality
  - Visual structure indicators

## Running the Examples

1. Install the package:
   ```bash
   pip install pddl-highlighter
   ```

2. Start Jupyter:
   ```bash
   jupyter notebook
   ```

3. Open `example.ipynb`

## Features Demonstrated

### 1. Syntax Highlighting
- Keywords (define, domain, problem, etc.)
- Variables (starting with ?)
- Operators (and, or, not)
- Parentheses and structure

### 2. Interactive Features
- Theme selection dropdown
- Format button for auto-indentation
- Validate button for syntax checking
- Save button for exporting to .pddl files

### 3. Visual Aids
- Vertical lines showing unclosed sections
- Real-time structure visualization
- Proper indentation
- Line numbers

### 4. Code Examples
- Complete blocks world domain
- Example problem instance
- Invalid PDDL example showing validation

## Tips

- Try changing themes to find your preferred style
- Use the format button to clean up messy code
- Watch the vertical lines to track nested structures
- Check validation before saving your PDDL files 