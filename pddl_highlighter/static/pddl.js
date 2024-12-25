// Create a custom mode for PDDL in Jupyter's CodeMirror editor
(function() {
    console.log("Starting PDDL highlighter initialization");

    // Function to initialize once we have CodeMirror
    function initialize(CodeMirror) {
        console.log("Initializing with CodeMirror:", CodeMirror);

        CodeMirror.defineMode("pddl", function(config, parserConfig) {
            var keywords = "define domain problem predicates actions precondition effect";
            var operators = "and or not exists forall";
            var types = "int bool object";

            // Define tokenizers for the language
            var tokenBase = function(stream, state) {
                var ch = stream.next();
                
                // Handle keywords
                if (ch === "(") {
                    state.parenLevel++;
                    stream.eatWhile(/\w/);  // Eat identifier until space
                    var word = stream.current();
                    if (keywords.indexOf(word.substring(1)) !== -1) {
                        return "keyword";
                    }
                    stream.backUp(word.length - 1);  // Back up to just after the paren
                    return "bracket";
                }
                if (ch === ")") {
                    state.parenLevel = Math.max(0, state.parenLevel - 1);
                    return "bracket";
                }
                if (ch === ":") {
                    return "operator";
                }

                // Handle operators
                if (operators.indexOf(stream.current()) !== -1) {
                    return "operator";
                }
                if (keywords.indexOf(stream.current()) !== -1) {
                    return "keyword";
                }

                // Handle types and variables
                if (types.indexOf(stream.current()) !== -1) {
                    return "type";
                }
                
                // Handle variables starting with ?
                if (ch === "?") {
                    stream.eatWhile(/\w/);
                    return "variable";
                }
                
                // Default tokenization
                stream.eatWhile(/\w/);
                return null;
            };
            
            return {
                startState: function() { 
                    return {
                        parenLevel: 0,
                        lastParenLine: -1
                    }; 
                },
                token: function(stream, state) {
                    // Skip whitespace
                    if (stream.eatSpace()) return null;
                    
                    // Track line changes for paren matching
                    if (stream.lineOracle.line !== state.lastParenLine) {
                        state.lastParenLine = stream.lineOracle.line;
                    }
                    
                    return tokenBase(stream, state);
                },
                indent: function(state, textAfter) {
                    if (textAfter.charAt(0) === ")") {
                        return state.parenLevel * config.indentUnit;
                    }
                    return (state.parenLevel + 1) * config.indentUnit;
                },
                electricChars: ")",
                lineComment: ";",
                fold: "brace"
            };
        });

        // Load the custom mode for the Jupyter notebook editor
        CodeMirror.defineMIME("text/x-pddl", "pddl");

        console.log("Adding CSS styles...");
        // Add custom CSS for unclosed parentheses visualization
        var style = document.createElement('style');
        style.textContent = `
            .CodeMirror-line .bracket {
                color: #666;
            }
            .CodeMirror-line[data-unclosed="true"] {
                background: linear-gradient(to right, 
                    transparent calc({{INDENT}}ch - 2px),
                    #8885 calc({{INDENT}}ch - 2px),
                    #8885 calc({{INDENT}}ch),
                    transparent calc({{INDENT}}ch)
                );
            }
            .cm-keyword {
                font-weight: normal;
            }
            .cm-keyword[data-word="define"] {
                font-weight: bold !important;
            }
        `;
        document.head.appendChild(style);

        // Function to set up PDDL editor
        function setupPDDLEditor(cell) {
            console.log("Setting up PDDL editor for cell:", cell);
            if (cell.cell_type === 'code') {
                console.log("Cell is code type, configuring editor...");
                var editor = cell.code_mirror;
                editor.setOption("mode", "text/x-pddl");
                editor.setOption("theme", "monokai");
                editor.setOption("lineNumbers", true);
                editor.setOption("matchBrackets", true);
                editor.setOption("autoCloseBrackets", true);
                
                // Track unclosed parentheses and handle keyword styling
                editor.on("change", function(cm, change) {
                    console.log("Editor content changed");
                    var parenLevel = 0;
                    var lineStarts = [];
                    
                    cm.eachLine(function(line) {
                        var lineText = line.text;
                        if (lineText.includes('define')) {
                            console.log("Found 'define' in line:", lineText);
                        }
                        var lineParens = 0;
                        
                        // Count parens in this line
                        for (var i = 0; i < lineText.length; i++) {
                            if (lineText[i] === '(') {
                                lineParens++;
                                parenLevel++;
                                if (lineParens === 1) {
                                    lineStarts.push(line.lineNo());
                                }
                            } else if (lineText[i] === ')') {
                                parenLevel = Math.max(0, parenLevel - 1);
                                if (parenLevel === 0) {
                                    lineStarts.pop();
                                }
                            }
                        }
                        
                        // Update line styling
                        var lineInfo = cm.lineInfo(line);
                        if (lineInfo) {
                            var indent = lineText.search(/\S/);
                            if (indent === -1) indent = 0;
                            
                            var element = lineInfo.handle.element || lineInfo.handle;
                            if (lineStarts.includes(line.lineNo())) {
                                element.setAttribute('data-unclosed', 'true');
                                var css = style.textContent.replace(/{{INDENT}}/g, indent);
                                if (element._customStyle !== css) {
                                    element._customStyle = css;
                                    element.style.background = `linear-gradient(to right, 
                                        transparent ${indent}ch,
                                        #8885 ${indent}ch,
                                        #8885 ${indent + 0.2}ch,
                                        transparent ${indent + 0.2}ch
                                    )`;
                                }
                            } else {
                                element.removeAttribute('data-unclosed');
                                element.style.background = '';
                            }
                        }
                    });

                    // Add data attribute for 'define' keyword
                    cm.eachLine(function(line) {
                        var lineText = line.text;
                        if (lineText.includes('define')) {
                            console.log("Processing 'define' keyword in line:", lineText);
                            var lineHandle = cm.getLineHandle(line.lineNo());
                            var tokens = cm.getLineTokens(line.lineNo());
                            console.log("Line tokens:", tokens);
                            tokens.forEach(function(token) {
                                if (token.type === 'keyword' && token.string === 'define') {
                                    console.log("Found 'define' token, attempting to style");
                                    var span = lineHandle.markedSpans || [];
                                    console.log("Marked spans:", span);
                                    span.forEach(function(s) {
                                        if (s.marker.className === 'cm-keyword') {
                                            console.log("Setting data-word attribute for define");
                                            s.marker.attributes = {'data-word': 'define'};
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
                
                console.log("Triggering initial refresh");
                editor.refresh();
            }
        }

        // Wait for Jupyter to be ready
        function initializeWhenReady() {
            console.log("Checking if JupyterLab is ready...");
            
            // For JupyterLab
            if (window.jupyterapp && window.jupyterapp.shell) {
                console.log("JupyterLab detected, setting up notebook panel handler");
                
                // Watch for new notebook panels
                window.jupyterapp.shell.layoutModified.connect(function() {
                    var widgets = window.jupyterapp.shell.widgets('main');
                    var iter = widgets.next();
                    
                    while (iter) {
                        var widget = iter.value;
                        if (widget.content && widget.content.model && widget.content.model.cells) {
                            console.log("Found notebook widget, setting up cells");
                            widget.content.model.cells.forEach(function(cell) {
                                if (cell.type === 'code') {
                                    setupPDDLEditor(cell);
                                }
                            });
                            
                            // Watch for new cells
                            widget.content.model.cells.changed.connect(function(cells, change) {
                                if (change.type === 'add') {
                                    change.newValues.forEach(function(cell) {
                                        if (cell.type === 'code') {
                                            setupPDDLEditor(cell);
                                        }
                                    });
                                }
                            });
                        }
                        iter = widgets.next();
                    }
                });
            } else {
                // For classic Jupyter Notebook
                if (window.Jupyter && window.Jupyter.notebook) {
                    console.log("Classic Jupyter Notebook detected, setting up cells");
                    var cells = Jupyter.notebook.get_cells();
                    cells.forEach(setupPDDLEditor);
                    
                    Jupyter.notebook.events.on('create.Cell', function(event, data) {
                        console.log("New cell created, setting up PDDL editor");
                        setupPDDLEditor(data.cell);
                    });
                } else {
                    setTimeout(initializeWhenReady, 100);
                }
            }
        }

        console.log("Starting initialization check");
        initializeWhenReady();
    }

    // Try to get CodeMirror from different possible sources
    function tryGetCodeMirror() {
        console.log("Attempting to find CodeMirror...");
        
        // Try different ways to get CodeMirror
        if (window.CodeMirror) {
            console.log("Found CodeMirror in window");
            initialize(window.CodeMirror);
        } else if (window.jupyterapp) {
            console.log("Found JupyterLab, looking for CodeMirror...");
            // Give JupyterLab a moment to initialize
            setTimeout(function() {
                if (window.CodeMirror) {
                    initialize(window.CodeMirror);
                } else {
                    console.log("CodeMirror not found, retrying...");
                    setTimeout(tryGetCodeMirror, 1000);
                }
            }, 1000);
        } else {
            console.log("Neither window.CodeMirror nor JupyterLab found, retrying...");
            setTimeout(tryGetCodeMirror, 1000);
        }
    }

    // Start trying to get CodeMirror
    tryGetCodeMirror();
})();
