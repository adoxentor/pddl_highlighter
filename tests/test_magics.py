import pytest
from IPython import InteractiveShell
from IPython.display import HTML
from pddl_highlighter.magics import pddl_magic

@pytest.fixture
def ip():
    """Fixture to create a clean IPython shell for each test."""
    return InteractiveShell.instance()

def test_pddl_variable_assignment(ip):
    """Test that PDDL code is correctly stored in a variable."""
    pddl_code = """
    (define (domain example)
        (:predicates (on ?x ?y))
    )
    """
    result = pddl_magic('test_var', pddl_code, shell=ip)
    assert 'test_var' in ip.user_ns
    assert ip.user_ns['test_var'].strip() == pddl_code.strip()

def test_pddl_syntax_highlighting(ip):
    """Test that syntax highlighting produces HTML output."""
    pddl_code = "(define (domain test))"
    result = pddl_magic('test_var', pddl_code, shell=ip)
    
    # Check that HTML output is generated
    assert isinstance(result, HTML)
    html_data = result.data if hasattr(result, 'data') else str(result)
    assert 'highlight' in html_data  # Basic check for highlighted content

def test_pddl_missing_variable_name(ip):
    """Test that an error is raised when no variable name is provided."""
    with pytest.raises(ValueError) as exc_info:
        pddl_magic('', '(define (domain test))', shell=ip)
    assert "Please specify a variable name" in str(exc_info.value) 