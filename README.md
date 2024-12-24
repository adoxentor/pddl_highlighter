# PDDL Highlighter for Jupyter

A custom Jupyter extension for handling PDDL code with syntax highlighting. Provides interactive features for working with PDDL (Planning Domain Definition Language) in Jupyter notebooks.

## Features

- Syntax highlighting for PDDL code
- Theme selection for different color schemes
- Auto-formatting of PDDL code
- Basic validation of PDDL syntax
- Visual structure guides for nested expressions
- Save to .pddl files functionality

## Installation

### Local Installation
You can install this package via pip:

```bash
pip install pddl-highlighter
```

### Google Colab Installation
To use in Google Colab, add this to the first cell of your notebook:

```python
!pip install git+https://github.com/adoxentor/pddl_highlighter.git
```

## Usage

Once installed, you can use the `%%PDDL` magic command to define PDDL code blocks in your Jupyter notebook:

```python
# First, load the extension
from pddl_highlighter.magics import load_pddl_magic
load_pddl_magic()

# Then use it in any cell
%%PDDL my_domain
(define (domain example)
    (:predicates (on ?x ?y) (clear ?x))
    (:action stack
        :parameters (?x ?y)
        :precondition (and (clear ?y) (on ?x table))
        :effect (and (not (on ?x table)) (on ?x ?y) (not (clear ?y))))
)
```

### Interactive Features

1. **Theme Selection**
   - Use the dropdown to change syntax highlighting theme
   - Multiple color schemes available

2. **Format Button**
   - Auto-indents PDDL code
   - Maintains consistent style

3. **Validate Button**
   - Checks for basic PDDL syntax errors
   - Validates required sections
   - Shows validation messages

4. **Save Button**
   - Exports code to .pddl files
   - Uses variable name as filename

### Visual Structure Guide
- Vertical lines show structure of nested expressions
- Lines update in real-time as you type
- Makes it easy to track matching parentheses

## Examples

Check out the `example` directory for:
- Complete example notebook
- Sample PDDL domain and problem files
- Usage demonstrations

## Development

To contribute or modify:

1. Clone the repository:
```bash
git clone https://github.com/adoxentor/pddl_highlighter.git
```

2. Install in development mode:
```bash
pip install -e .
```

3. Run tests:
```bash
pip install -r requirements.txt
pytest
```

## License

MIT License - feel free to use in your own projects.
