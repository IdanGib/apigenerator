window.view = (async () => {

    let view = null;

    function appendList({ element, list, itemClass, listClass, attrs }) {
        if(element) {
            const ul = document.createElement('ul');
            if(listClass) {
                ul.classList.add(listClass);
            }
    
            list.forEach((item, index) => {
                const li = document.createElement('li');
                if(itemClass) {
                    li.classList.add(itemClass);
                }
                li.setAttribute('data-index', index);
                for(const a in (attrs || [])) {
                    if(a && attrs[a]) {
                        li.setAttribute(a, attrs[a](item));
                    }
                }
                li.innerText = item;
                ul.appendChild(li);
            });
            element.appendChild(ul);
        }

        return element;
    }

    async function clickButtonHandler(action, button) {
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
    }

    async function update() {

    }

    async function openApi(event) {
        
    }

    async function deleteApi(event) {
        
    }

    async function createApi(event) {
        
    }

    async function installPackage(event) {
        
    }

    async function pushPackage(event) {
        
    }
    
    async function saveApi(event) {
        
    }   

    function create() {
        const  code = document.getElementById('code');
        const api_name = document.getElementById('api_name');
        const package_name = document.getElementById('package_name');
        const  packages_list = document.getElementById('packages_list');
        const api_list = document.getElementById('api_list');


        const open_api = document.getElementById('open_api');
        open_api.addEventListener('click', clickButtonHandler(openApi, open_api));

        const delete_api = document.getElementById('delete_api');
        delete_api.addEventListener('click', clickButtonHandler(deleteApi, delete_api));

        const create_api = document.getElementById('create_api');
        create_api.addEventListener('click', clickButtonHandler(createApi, create_api));
        
        const install_package = document.getElementById('install_package');
        install_package.addEventListener('click', clickButtonHandler(installPackage, install_package));

        const push_package = document.getElementById('push_package');
        push_package.addEventListener('click', clickButtonHandler(pushPackage, push_package));

        const save_api = document.getElementById('save_api');
        save_api.addEventListener('click', clickButtonHandler(saveApi, save_api));

        view = {
            input: {
                screen: { 
                    code, api_name,
                    package_name
                },
                actions: { 
                    open_api, 
                    delete_api, 
                    create_api, 
                    install_package, 
                    save_api,
                    push_package
                }   
            },
            output: {
                screen: {
                    packages_list,
                    api_list
                },
                actions: {}
            }
        };
    }

    return {
        clickButtonHandler,
        appendList,
        create
    };
})();