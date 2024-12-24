// Create a custom mode for PDDL in Jupyter's CodeMirror editor
(function() {
    // Wait for CodeMirror to be available
    function waitForCodeMirror(callback) {
        if (window.CodeMirror) {
            callback(window.CodeMirror);
        } else {
            setTimeout(function() {
                waitForCodeMirror(callback);
            }, 100);
        }
    }

    waitForCodeMirror(function(CodeMirror) {
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
        `;
        document.head.appendChild(style);

        // Function to set up PDDL editor
        function setupPDDLEditor(cell) {
            if (cell.cell_type === 'code') {
                var editor = cell.code_mirror;
                editor.setOption("mode", "text/x-pddl");
                editor.setOption("theme", "monokai");
                editor.setOption("lineNumbers", true);
                editor.setOption("matchBrackets", true);
                editor.setOption("autoCloseBrackets", true);
                
                // Track unclosed parentheses
                editor.on("change", function(cm, change) {
                    var parenLevel = 0;
                    var lineStarts = [];
                    
                    cm.eachLine(function(line) {
                        var lineText = line.text;
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
                });
                
                // Trigger initial paren matching
                editor.refresh();
            }
        }

        // Wait for Jupyter to be ready
        function initializeWhenReady() {
            if (window.Jupyter && window.Jupyter.notebook) {
                // Set up all existing cells
                var cells = Jupyter.notebook.get_cells();
                cells.forEach(setupPDDLEditor);
                
                // Set up new cells as they're created
                Jupyter.notebook.events.on('create.Cell', function(event, data) {
                    setupPDDLEditor(data.cell);
                });
            } else {
                setTimeout(initializeWhenReady, 100);
            }
        }

        initializeWhenReady();
    });
})();
