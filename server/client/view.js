window.view = (async () => {

    let view = null;
    let selected = '';
    let api = null;

    function setEnabled(button, enabled) {
        const action = enabled ? 'removeAttribute' :  'setAttribute';
        button[action]('disabled', '');
    }

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
        const { save_api } = view.input.actions;

        if(selected) {
            const { data } = await api.read(selected);
            const changed = data !== codeEditor.getValue();
            setEnabled(save_api, changed);
        } else {
            setEnabled(save_api, false);
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
        
        const aListJson = await api.list();
        const aList = aListJson?.data;

        const json = await api.package();
        const pList = Object.keys(json.dependencies);

        packages_list.innerHTML = '';
        appendList({
            list: pList,
            element: packages_list,
            attrs: { 'data-value': item => item },
            itemClass: 'dep',
            listClass: ''
        });

        api_list.innerHTML = '';
        appendList({
            list: aList,
            element: api_list,
            attrs: { 'data-value': item => item },
            itemClass: 'item',
            listClass: ''
        });
    }

    const clickButtonHandler = (action, button, api, codeEditor) => {
        return async event => {
            let result = null;
            setEnabled(button, true);
            try {
                result = await action(event, api, codeEditor);
            } catch(e) {
                console.error(e);
            }
            setEnabled(button, false);
            update(api, codeEditor);
            return result;
        }
    };

    async function selectApi(event, api, codeEditor) {
        const { value } = event.target?.dataset;
        if(!value) {
            return console.error(`[selectApi] name: ${value}`);
        }
        selected = value;
        const { data } = await api.read(value);
        if(data) {
            codeEditor.setValue(data);
            selected_name.value = value;
        }
    }   

    async function deleteApi(event, api) {
        const { api_name } = view.input.screen;
        const { value } = api_name;
        if(!value) {
            return console.error(`[deleteApi] api name: ${value}`);
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
            return console.error(`[installPackage] api name: ${value}`);
        }
        const { data } = await api.install_package(value);
    }

    async function pushPackage(event, api, codeEditor) {
        const { value } = event.target?.dataset;
        if(!value) {
            return console.error(`[${pushPackage}] value: ${value}`);
        }
        const content = codeEditor.getValue();
        const varname = value.replaceAll('-', '_');
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

    const initEditor = (api, codeEditor, container) => {
        codeEditor.create(container);
        codeEditor.setChangedListener((cm, data) => {
           update(api, codeEditor);        
        });
        const { save_api } = view.input.actions;
        codeEditor.setSaveListener(value => {
            console.log('save:', value);
            save_api.click();
        });
    }

    function create(api, codeEditor) {

        const code = document.getElementById('code');
    


        const api_name = document.getElementById('api_name');
        const package_name = document.getElementById('package_name');
        const packages_list = document.getElementById('packages_list');
        const api_list = document.getElementById('api_list');
        const api_url = document.getElementById('api_url');

        api_list.addEventListener('click', clickButtonHandler(selectApi, api_list, api, codeEditor));

        /*
        const delete_api = document.getElementById('delete_api');
        delete_api.addEventListener('click', clickButtonHandler(deleteApi, delete_api, api, codeEditor));
        */
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
                    code, 
                    api_name,
                    package_name
                },
                actions: { 
                   // delete_api, 
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


        initEditor(api, codeEditor, code);
        update(api, codeEditor);
        
        return view;
    }

    return {
        create
    };
});