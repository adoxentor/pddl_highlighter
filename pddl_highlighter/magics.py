from IPython.core.magic import register_cell_magic
from IPython.display import display, HTML, Javascript
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter
from pygments.styles import get_all_styles
import ipywidgets as widgets
import re
import os
import pkg_resources

def get_js_code():
    """Load the JavaScript code from the static file."""
    js_path = pkg_resources.resource_filename('pddl_highlighter', 'static/pddl.js')
    with open(js_path, 'r') as f:
        return f.read()

def format_pddl(code):
    """Format PDDL code with proper indentation."""
    lines = code.split('\n')
    formatted_lines = []
    indent_level = 0
    
    for line in lines:
        # Count opening and closing parentheses
        stripped = line.strip()
        if not stripped:
            formatted_lines.append('')
            continue
            
        # Adjust indent for this line
        if stripped.startswith(')'):
            indent_level = max(0, indent_level - 1)
            
        # Add the line with proper indentation
        formatted_lines.append('    ' * indent_level + stripped)
        
        # Adjust indent for next line
        indent_level += stripped.count('(') - stripped.count(')')
        
    return '\n'.join(formatted_lines)

def validate_pddl(code):
    """Basic PDDL validation."""
    errors = []
    
    # Check parentheses matching
    if code.count('(') != code.count(')'):
        errors.append("Mismatched parentheses")
    
    # Check for required sections in domain
    if '(define' in code and '(domain' in code:
        required_sections = [':predicates', ':action']
        for section in required_sections:
            if section not in code:
                errors.append(f"Missing {section} section in domain")
    
    # Check for required sections in problem
    if '(define' in code and '(problem' in code:
        required_sections = [':init', ':goal']
        for section in required_sections:
            if section not in code:
                errors.append(f"Missing {section} section in problem")
    
    return errors

def pddl_magic(line, cell, shell=None):
    """
    Custom magic command for handling PDDL code in a cell.
    Usage: %%PDDL <variable_name>
    This will store the PDDL code in a variable with the name <variable_name>.
    """
    variable_name = line.strip()
    if not variable_name:
        raise ValueError("Please specify a variable name for storing the PDDL code.")

    # Store the PDDL code in a variable
    if shell is not None:
        shell.user_ns[variable_name] = cell.strip()
    else:
        globals()[variable_name] = cell.strip()

    # Create output div for dynamic updates
    output_div = widgets.Output()
    
    # Create theme selector
    style_names = list(get_all_styles())
    theme_dropdown = widgets.Dropdown(
        options=style_names,
        value='colorful',
        description='Theme:',
        layout=widgets.Layout(width='200px')
    )
    
    def update_display(theme='colorful'):
        """Update the displayed code with the selected theme."""
        with output_div:
            output_div.clear_output()
            formatter = HtmlFormatter(style=theme, full=True)
            lexer = get_lexer_by_name('lisp')
            highlighted = highlight(cell, lexer, formatter)
            
            # Add visual indicators for unclosed sections
            code_lines = cell.split('\n')
            unclosed_count = 0
            indicators = []
            
            for i, line in enumerate(code_lines):
                stripped = line.strip()
                if stripped:
                    unclosed_count += stripped.count('(') - stripped.count(')')
                    if unclosed_count > 0 and stripped.startswith('('):
                        indicators.append(f'<div style="border-left: 2px dotted #888; margin-left: {2*unclosed_count}em; padding-left: 0.5em;">')
                    else:
                        indicators.append('')
            
            # Insert indicators into the HTML
            html_lines = highlighted.split('\n')
            for i, indicator in enumerate(indicators):
                if indicator:
                    html_lines[i] = indicator + html_lines[i]
            
            display(HTML('\n'.join(html_lines)))
    
    def on_theme_change(change):
        """Handle theme change."""
        update_display(change['new'])
    
    theme_dropdown.observe(on_theme_change, names='value')
    
    # Create action buttons
    save_button = widgets.Button(
        description='Save',
        icon='save',
        tooltip='Save to file'
    )
    
    format_button = widgets.Button(
        description='Format',
        icon='indent',
        tooltip='Format code'
    )
    
    validate_button = widgets.Button(
        description='Validate',
        icon='check',
        tooltip='Validate PDDL'
    )
    
    status_label = widgets.Label('')
    
    def on_save_clicked(b):
        """Save PDDL code to file."""
        filename = f"{variable_name}.pddl"
        with open(filename, 'w') as f:
            f.write(cell)
        status_label.value = f"Saved to {filename}"
    
    def on_format_clicked(b):
        """Format the PDDL code."""
        if shell is not None:
            formatted = format_pddl(cell)
            shell.user_ns[variable_name] = formatted
            update_display(theme_dropdown.value)
            status_label.value = "Code formatted"
    
    def on_validate_clicked(b):
        """Validate the PDDL code."""
        errors = validate_pddl(cell)
        if errors:
            status_label.value = f"Validation errors: {', '.join(errors)}"
        else:
            status_label.value = "Validation passed"
    
    save_button.on_click(on_save_clicked)
    format_button.on_click(on_format_clicked)
    validate_button.on_click(on_validate_clicked)
    
    # Create button bar
    button_box = widgets.HBox([
        theme_dropdown,
        save_button,
        format_button,
        validate_button,
        status_label
    ])
    
    # Display UI elements
    display(button_box)
    display(output_div)
    
    # Initial display
    update_display()
    
    return None

def load_pddl_magic():
    """
    Register the PDDL magic command in Jupyter and load the JavaScript.
    """
    # Load and execute the JavaScript code
    js_path = pkg_resources.resource_filename('pddl_highlighter', 'static/pddl.js')
    with open(js_path, 'r') as f:
        js_code = f.read()
    
    # Create a script element and append it to the document head
    script_element = f"""
    (function() {{
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.text = `{js_code}`;
        document.head.appendChild(script);
    }})();
    """
    
    display(Javascript(script_element))
    
    @register_cell_magic
    def PDDL(line, cell):
        return pddl_magic(line, cell)
