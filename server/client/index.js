(async () => {
    const api = await window.api();
    const codeEditor = await window.codeEditor();
    const view = await window.view();
    const builder = await window.builder();
    builder.build({view, api, codeEditor});
})();