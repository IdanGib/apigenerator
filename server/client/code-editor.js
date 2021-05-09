window.codeEditor = (async () => {
    let codeMirror = null;
    let getValue = null;
    let setValue = null;

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

            setValue = codeMirror.setValue.bind(codeMirror);
            getValue = codeMirror.getValue.bind(codeMirror);

        },

        setValue,
        getValue,

        setSaveListener: (listener) => {
            if(typeof saveListener === 'function') {
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
})();