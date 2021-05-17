window.codeEditor = (async () => {
    let codeMirror = null;
    let saveListener = null;
    return {
        create: (container) => {
            codeMirror = CodeMirror(container, {
                mode:  "javascript",
                lineNumbers: true,
                autoCloseBrackets: true,
                autocorrect: true,
                extraKeys: {
                    "Ctrl-Space": "autocomplete", 
                    "Ctrl-S": () => {
                        if(saveListener) {
                            saveListener(codeMirror.getValue());
                        }
                    },
                }
            });
        },

        setValue: (value) => {
            return codeMirror?.setValue(value);
        },
        getValue: () => {
            return codeMirror?.getValue();
        },

        setSaveListener: (listener) => {
            if(typeof listener === 'function') {
                saveListener = listener;
            }
        },
        
        setChangedListener: (listener) => {
            if(!codeMirror) {
                return console.error('[setChangedListener] no codeMirror object');
            }
            codeMirror.on('change', listener);
        }
    };
});