import nbformat as nbf

# Create a new notebook
nb = nbf.v4.new_notebook()

# Create cells
cells = [
    nbf.v4.new_markdown_cell("""# PDDL Highlighter Example

This notebook demonstrates the features of the PDDL Highlighter extension for Jupyter notebooks."""),

    nbf.v4.new_code_cell("""# First, let's load our extension
from pddl_highlighter.magics import load_pddl_magic
load_pddl_magic()"""),

    nbf.v4.new_markdown_cell("""## Basic PDDL Domain Example

Let's create a simple blocks world domain. Notice:
- Syntax highlighting for keywords, variables, and operators
- Vertical lines showing structure
- Interactive buttons above the code"""),

    nbf.v4.new_code_cell("""%%PDDL blocks_domain
(define (domain blocks)
    (:predicates
        (on ?x ?y)
        (ontable ?x)
        (clear ?x)
        (handempty)
        (holding ?x)
    )

    (:action pickup
        :parameters (?x)
        :precondition (and (clear ?x) (ontable ?x) (handempty))
        :effect (and (not (ontable ?x))
                     (not (clear ?x))
                     (not (handempty))
                     (holding ?x))
    )

    (:action putdown
        :parameters (?x)
        :precondition (holding ?x)
        :effect (and (not (holding ?x))
                     (clear ?x)
                     (handempty)
                     (ontable ?x))
    )
)"""),

    nbf.v4.new_markdown_cell("""## Try the Interactive Features

1. **Theme Selection**
   - Use the dropdown menu to try different color themes
   - Each theme provides different syntax highlighting styles

2. **Format Button**
   - Click 'Format' to automatically indent the code
   - Helps maintain consistent style

3. **Validate Button**
   - Click 'Validate' to check your PDDL syntax
   - Shows errors in the status message

4. **Save Button**
   - Click 'Save' to export to a .pddl file
   - Uses the variable name as the filename"""),

    nbf.v4.new_markdown_cell("""## Example with Validation Errors

This example shows how the validator catches common errors:"""),

    nbf.v4.new_code_cell("""%%PDDL invalid_domain
(define (domain blocks
    ; Missing closing parenthesis above
    (:predicates
        (on ?x ?y)
    )
    ; Missing required :action section
)"""),

    nbf.v4.new_markdown_cell("""Try clicking the 'Validate' button above. You should see errors about:
- Mismatched parentheses
- Missing required sections"""),

    nbf.v4.new_markdown_cell("""## Example Problem Instance

Here's a complete problem instance that works with the domain above:"""),

    nbf.v4.new_code_cell("""%%PDDL blocks_problem
(define (problem blocks-3)
    (:domain blocks)
    (:objects a b c)
    (:init
        (ontable a)
        (ontable b)
        (ontable c)
        (clear a)
        (clear b)
        (clear c)
        (handempty)
    )
    (:goal
        (and (on a b) (on b c))
    )
)"""),

    nbf.v4.new_markdown_cell("""## Visual Structure Guide

Notice how the vertical lines help track structure:
- Each line starts at the opening parenthesis
- Lines extend until the matching closing parenthesis
- Nested structures have multiple lines
- Lines update in real-time as you type""")
]

# Add cells to notebook
nb.cells = cells

# Write the notebook to a file
with open('example/example.ipynb', 'w', encoding='utf-8') as f:
    nbf.write(nb, f) 