
window.view = (async () => {
    class Menu {
        menuListener;
        element;
        menu = {};

        constructor(id) {
            this.element = document.getElementById(id);
            window.addEventListener('click', event => {
                if(!event.path.includes(this.element)) {
                    this.element.classList.remove('show');
                }
            });

            this.element.addEventListener('click', async event => {
                const { dataset } = event.target;
                if(this.menuListener) {
                    this.menuListener(dataset, event.target);
                }
            });

            window.oncontextmenu = event => {
                const { hasmenu, menukey, value } = event.target.dataset;
                if(!hasmenu || !menukey || !value) {
                    this.element.classList.remove('show');
                    return;
                }
                
                const x = event.clientX;
                const y = event.clientY;
                this.element.style.top = `${y}px`;
                this.element.style.left = `${x}px`;
                const items = this.menu[menukey];
                this.createView(this.element, items , value);
                
                if(this.element.childNodes.length > 0) {
                    this.element.classList.add('show');
                }

                event.preventDefault();
            }
        }

        createView(element, items, value) {
            if(!items || !value || !element) {
                return;
            }
            element.innerHTML = '';
            for(const m of items) {
                const me = document.createElement('button');
                me.classList.add('m-item');
                for(const  k in m) {
                    if(k) {
                        me.setAttribute('data-' + k, m[k]);
                    }
                }
                
                me.setAttribute('data-value', value);

                me.innerText = m.display;
                element.appendChild(me);
            }
        }

        setMenuActionListener(listener) {
            if(typeof listener === 'function') {
                this.menuListener = listener;
            }
        }

        addMenuItem(key, value) {
            this.menu[key] = value;
        }
        removeMenuItem(key) {
            delete this.menu[key];
            this.element.innerHTML = null;
        }
    }



    let view = null;
    let selected = null;

    function userMessage(text, open) {
        const { user_msg } = view.output.screen;
        if(!user_msg) {
            return;
        }
        const action = !!open ? 'add' : 'remove';
        user_msg.classList[action]('open');
        const msg = user_msg.querySelector('#msg');
        msg.innerText = text;
    }

    function setDisabled(button, disabled) {
        const action = disabled ?  'setAttribute' : 'removeAttribute';
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

    function clearEditor(codeEditor) {
        
        selected_name.value = '';
        api_url.innerText = '';
        api_url.href = '';
        codeEditor.setValue('');
    }

    function updateUrl(name, api) {
        if(!api_url) {
            return;
        }
        const apiUrl = api.getUrl(name);
        api_url.innerText = apiUrl;
        api_url.href = apiUrl;
    }

    async function update(api, codeEditor) {
        const { save_api, delete_api } = view.input.actions;
        
        if(selected) {
            const { value } = selected.dataset;
            const { data } = await api.read(value);
            const changed = data !== codeEditor.getValue();
            setDisabled(save_api, !changed);
            setDisabled(delete_api, false);
        } else {
            setDisabled(delete_api, true);
            setDisabled(save_api, true);
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
            attrs: { 
                'data-value': item => item
            },
            itemClass: 'dep',
            listClass: ''
        });

        api_list.innerHTML = '';
        appendList({
            list: aList,
            element: api_list,
            attrs: { 
                'data-value': item => item,
                'data-hasmenu': item => item,
                'data-menukey': item => 'apiitem' 
            },
            itemClass: 'item',
            listClass: ''
        });

        const apiListItems = Array.from(api_list.querySelectorAll(".item"));
        
        apiListItems.forEach(element => {
            const itemValue = element.dataset.value;
            const selectedValue = selected?.dataset.value;
            const action = (itemValue === selectedValue) ? 'add' : 'remove';
            element.classList[action]('selected');
        });

        if(!selected) {
            clearEditor(codeEditor);
        }
    }

    const clickButtonHandler = (action, button, api, codeEditor) => {
        return async event => {
            let result = null;
            setDisabled(button, true);
            try {
                result = await action(event, api, codeEditor);
            } catch(e) {
                console.error(e);
            }
            setDisabled(button, false);
            update(api, codeEditor);
            return result;
        }
    };

    async function selectApi(event, api, codeEditor) {
        const { value } = event.target?.dataset;
        if(!value) {
            return console.error(`[selectApi] name: ${value}`);
        }
        if(selected_name.value === value) {
            selected = null;
            return;
        }
        const { data } = await api.read(value);

        if(data) {
            codeEditor.setValue(data);
            selected_name.value = value;
            selected = event.target;
            updateUrl(value, api);
        }
        
    }   

    async function deleteApi(event, api) {
        

        const { value } = selected?.dataset;
        const ans = confirm(`You sure you whant to delete '${value}' api ?`);
        if(!ans) {
            return;
        }
        if(!value) {
            return console.error(`[deleteApi] api name: ${value}`);
        }
        const { data } = await api.delete(value);
        if(data) {
            selected = null;
        }
    }

    async function createApi(event, api) {
        const { api_name } = view.input.screen;
        const { value } = api_name;
        if(!value) {
            return console.error(`[createApi] api name: ${value}`);
        }
        const { data } = await api.create(value);
        api_name.value = '';
    }

    async function installPackage(event, api) {
        const { package_name } = view.input.screen;
        const { value } = package_name;
        if(!value) {
            return console.error(`[installPackage] api name: ${value}`);
        }
        const { data } = await api.install(value);
        return data;
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
        const { value } = selected?.dataset;
        if(value) {
            const content = codeEditor.getValue();
            const { data } = await api.update(value, content);
        }
    }   

    const initEditor = (api, codeEditor, container) => {
        codeEditor.create(container);
        codeEditor.setChangedListener((cm, data) => {
           update(api, codeEditor);        
        });
        const { save_api } = view.input.actions;
        codeEditor.setSaveListener(value => {
            save_api.click();
        });
    }

    const initMenu = (api, codeEditor) => {
        const menu = new Menu('menu');
            
        const menuActionsMap = {};
    
        menuActionsMap['i1'] = async (dataset, target) => {
            console.log(dataset, target);
        };

        menuActionsMap['i2'] = async (dataset, target) => {
            console.log(dataset, target);
        };

        menuActionsMap['i3'] = async (dataset, target) => {
            console.log(dataset, target);
        };

        menu.addMenuItem("apiitem", [
            { display: 'item 1', id: 'i1' },
            { display: 'item 2', id: 'i2' },
            { display: 'item 3', id: 'i3' }
        ]);

        menu.setMenuActionListener((dataset, target) => {
            const { id } = dataset;
            menuActionsMap[id](dataset, target);
        });
    }

    function create(api, codeEditor) {
        const code = document.getElementById('code');
        const api_name = document.getElementById('api_name');
        const package_name = document.getElementById('package_name');
        const packages_list = document.getElementById('packages_list');
        const api_list = document.getElementById('api_list');
        const api_url = document.getElementById('api_url');
        const user_msg = document.getElementById('user_msg');

        user_msg.addEventListener('click', event => {
            if(event.target.id === 'user_msg') {
                userMessage('', false);
            }
        });

        api_list.addEventListener('click', clickButtonHandler(selectApi, api_list, api, codeEditor));

        const create_api = document.getElementById('create_api');
        create_api.addEventListener('click', clickButtonHandler(createApi, create_api, api, codeEditor));
        
        const delete_api = document.getElementById('delete_api');
        delete_api.addEventListener('click', clickButtonHandler(deleteApi, delete_api, api, codeEditor));

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
                    create_api, 
                    install_package, 
                    save_api,
                    delete_api,
                    push_package
                }   
            },
            output: {
                screen: {
                    packages_list,
                    api_list,
                    api_url,
                    user_msg
                },
                actions: {}
            }
        };

        initMenu(api, codeEditor);
        initEditor(api, codeEditor, code);
        update(api, codeEditor);
        
        return view;
    }

    return {
        create
    };
});