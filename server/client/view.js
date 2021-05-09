window.view = (async () => {
    return {
        clickButtonHandler = async (action, button) => {
            return async event => {
                let result = null;
                button.setAttribute('disabled', '');
                try {
                    result = await action(event);
                } catch(e) {
                    console.error(e);
                }
                button.removeAttribute('disabled');
                return result;
            }
        },
        create: (containersIds) => {
            let element = null;
           
        }
    };
})();