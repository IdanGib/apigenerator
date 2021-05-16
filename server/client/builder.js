window.builder = (async () => {
    const build = async ({ api, view, codeEditor }) => {
        const screen = await view.create(api, codeEditor);
    };
    return {
        build
    };
});