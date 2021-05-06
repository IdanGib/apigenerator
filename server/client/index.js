function g(id) {
    return document.getElementById(id);
}
const elements = {
    apis: g('apis'),
    dependencies: g('dependencies'),
    createbtn: g('createbtn'),
    createname: g('createname'),
    pkg: g('pkg'),
    pkgcontent: g('pkg-content'),
    codeediitor: g('codeediitor'),
    updatename: g('updatename'),
    updatebtn: g('updatebtn'),
    saveLoader: g('saveloader'),
    npminstallbtn: g('npminstallbtn'),
    npmpackagename: g('npmpackagename'),
    allowpackages: g('allowpackages')
};
const env = { url: `http://localhost:3000` };

api.init({ elements, env }).then(async api => {

    const { 
        apis,
        dependencies,
        createbtn, 
        codeediitor, 
        updatebtn, 
        updatename,
        saveLoader,
        npminstallbtn,
        npmpackagename,
        allowpackages
    } = elements;

    let current = '';
    let selected = '';

    async function getAllowPackages() {
        const { data } = await api.allowPackages();
        return data;
    }


    async function appendList({ element, list, itemClass, listClass, attrs }) {
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
    
    getAllowPackages().then(list => {
        appendList({ 
            element: allowpackages, 
            list, 
            itemClass: 'allow-package', 
            listClass: 'allows' });
    });

    async function save() {
        saveLoader.innerText = 'saving...';
        const content = codeMirror.getValue();
        const name =  updatename.value;   
        const { data, err } = await api.update(name, content);
        saveLoader.innerText = '';
        current = codeMirror.getValue();
    }

    function unselectfile() {
        selected = '';
        codeMirror.setValue('');
    }

    async function selectFile(name){
        await loadApiItem(name);
        selected = name;
    }

    const codeMirror = CodeMirror(codeediitor, {
        mode:  "javascript",
        lineNumbers: true,
        autoCloseBrackets: true,
        autocorrect: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete", 
            "Ctrl-S": save,
        }
    });

    codeMirror.on('change', (cm, data) => {
        const changed = current !== cm.getValue();
        const action = changed ? 'removeAttribute' :  'setAttribute';
        updatebtn[action]('disabled', '');
    });

    dependencies?.addEventListener('click', async event => {
        const package = event.target?.dataset?.value;
        if(package) {
            const value = codeMirror.getValue();
            const varname = package.replaceAll('-', '_');
            const canAdd = value && (!value.includes(`require('${package}')`));
            if(canAdd) {
                codeMirror.setValue( `const ${varname} = require('${package}');\n${value}`);
            }
        }
    });

    async function editor(name, content) {
        codeMirror.setValue(content);
        updatename.value = name;
    }

    async function loadApiItem(name) {
        const { data, err } = await api.read(name);
        const content = data || '';
        current = content;
        editor(name, content);
    }

    async function updateList() {
        const { data } = await api.list();

        const list = data.map(name => {
            const item = document.createElement('div');
            item.innerText = name;
            item.classList.add('item');

            const open = document.createElement('button');
            open.innerText = 'open';
            open.onclick = async event => {
                await selectFile(name);
            };
            const removebtn = document.createElement('button');
            removebtn.innerText = 'delete';
            removebtn.onclick = async event => {
                await api.delete(name);
                updateView();
            };
            const actions = document.createElement('div');

            actions.appendChild(open);
            actions.appendChild(removebtn);
            item.appendChild(actions);
            return item;  
        });
        apis.innerText = '';
        for(const li of list) {
            apis.appendChild(li);
        }

    }

    async function getDependencies() {
        const json = await api.package();
        const deps = Object.keys(json.dependencies);
        dependencies.innerHTML = '';
        appendList({
            list: deps,
            element: dependencies,
            attrs: { 'data-value': item => item },
            itemClass: 'dep',
            listClass: 'dependencies'
        });
    }

    async function updateView() {
        await updateList();
        editor('', '');
        getDependencies();
    }

    async function installPackage(packageName) {
        console.log('installPackage: ', packageName);
        const { data } = await api.install(packageName);
        console.log('installPackage: ', data);
        return data;
    }

    npminstallbtn?.addEventListener('click', async event => {
        const name = npmpackagename.value;
        if(!name) {
            return console.error('no npm package name');
        }
        const result = await installPackage(name);
        console.log('click', result);
        updateView();

    });

    updatebtn?.addEventListener('click', save);

    createbtn?.addEventListener('click', async event => {
        const name = createname.value;
        if(name) {
            await api.create(name);
            createname.value = '';
            updateView();
        }
    });

    updateView();

 

}).catch(console.error);