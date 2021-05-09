window.view = (async () => {

    let view = null;
    let selected = '';

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

    async function update(api, codeEditor) {
        const { save_api } = view.input.screen;

        if(selected) {
            const { data } = await api.read(selected);
            const changed = data !== codeEditor.getValue();
            const action = changed ? 'removeAttribute' :  'setAttribute';
            
            if(save_api) {
                save_api[action]('disabled', '');
            }

        } else {

            if(save_api) {
                save_api.removeAttribute('disabled');
            }

        }

        if(api_url) {
            const apiUrl = api.getUrl(selected || '');
            api_url.innerText = apiUrl;
            api_url.href = apiUrl;
        }

        const {  packages_list, api_list } = view.output.screen;

        if(!packages_list || !api_list) {
            return;
        }
        
        const aList = await api.list();
        const json = await api.package();
        const pList = Object.keys(json.dependencies);

        packages_list.innerHTML = '';
        appendList({
            list: pList,
            element: packages_list,
            attrs: { 'data-value': item => item },
            itemClass: '',
            listClass: ''
        });

        api_list.innerHTML = '';
        appendList({
            list: aList,
            element: api_list,
            attrs: { 'data-value': item => item },
            itemClass: '',
            listClass: ''
        });

        const { api_url } = view.output.screen;
     
    }

    async function clickButtonHandler(action, button, api, codeEditor) {
        return async event => {
            let result = null;
            button.setAttribute('disabled', '');
            try {
                result = await action(event, api, codeEditor);
            } catch(e) {
                console.error(e);
            }
            button.removeAttribute('disabled');
            update(api, codeEditor);
            return result;
        }
    }

    async function selectApi(event, api, codeEditor) {
        const { value } = event.target?.dataset;
        if(!value) {
            return console.error(`[selectApi] name: ${value}`);
        }
        selected = value;
        const { data } = await api.read(value);
        codeEditor.setValue(data);
    }   

    async function deleteApi(event, api) {
        const { api_name } = view.input.screen;
        const { value } = api_name;
        if(!value) {
            return console.error(`[createApi] api name: ${value}`);
        }
        const { data } = await api.delete(value);
    }

    async function createApi(event, api) {
        const { api_name } = view.input.screen;
        const { value } = api_name;
        if(!value) {
            return console.error(`[createApi] api name: ${value}`);
        }
        const { data } = await api.create(value);
    }

    async function installPackage(event, api) {
        const { package_name } = view.input.screen;
        const { value } = package_name;
        if(!value) {
            return console.error(`[createApi] api name: ${value}`);
        }
        const { data } = await api.install_package(value);
    }

    async function pushPackage(event, api, codeEditor) {
        const { value } = event.target?.dataset;
        if(!value) {
            return console.error(`[${pushPackage}] value: ${value}`);
        }
        const content = codeEditor.getValue();
        const varname = package.replaceAll('-', '_');
        const canAdd = content && (!content.includes(`require('${value}')`));
        if(canAdd) {
            codeEditor.setValue( `const ${varname} = require('${value}');\n${content}`);
        }
    }
    
    async function saveApi(event, api, codeEditor) {
        if(selected) {
            const content = codeEditor.getValue();
            const { data } = await api.update(selected, content);
        }
    }   

    function create(api, codeEditor) {

        const  code = document.getElementById('code');
        const api_name = document.getElementById('api_name');
        const package_name = document.getElementById('package_name');
        const  packages_list = document.getElementById('packages_list');
        const api_list = document.getElementById('api_list');
        const api_url = document.getElementById('api_url');

        const select_api = document.getElementById('select_api');
        select_api.addEventListener('click', clickButtonHandler(selectApi, select_api, api, codeEditor));

        const delete_api = document.getElementById('delete_api');
        delete_api.addEventListener('click', clickButtonHandler(deleteApi, delete_api, api, codeEditor));

        const create_api = document.getElementById('create_api');
        create_api.addEventListener('click', clickButtonHandler(createApi, create_api, api, codeEditor));
        
        const install_package = document.getElementById('install_package');
        install_package.addEventListener('click', clickButtonHandler(installPackage, install_package, api, codeEditor));

        const push_package = document.getElementById('push_package');
        push_package.addEventListener('click', clickButtonHandler(pushPackage, push_package, api, codeEditor));

        const save_api = document.getElementById('save_api');
        save_api.addEventListener('click', clickButtonHandler(saveApi, save_api, api, codeEditor));

        view = {
            input: {
                screen: { 
                    code, api_name,
                    package_name
                },
                actions: { 
                    select_api, 
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
                    api_list,
                    api_url
                },
                actions: {}
            }
        };

        update();
    }

    return {
        clickButtonHandler,
        appendList,
        create
    };
})();