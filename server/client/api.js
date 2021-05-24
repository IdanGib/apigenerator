window.api = (async () => {
    const configUrl = `${location.protocol}//${location.host}/api/config`;
    const res = await fetch(configUrl);

    const { data } = await res.json();
    const { apiUrl } = data;
    const base = `${apiUrl}/api`;

    return {
        getUrl: (name) => {
            return name ? `${apiUrl}/api/${name}` : '';
        },
        list: async () => {
            const path = `${base}/installed`;
            const result = await fetch(path);
            return await result.json();
        },
        create: async (name) => {
           
            const path = `${base}/create/${name}`;

            const result = await fetch(path, { 
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post' 
            });
            return await result.json();
        },
        read: async (name) => {
            const path = `${base}/read/${name}`;
            const result = await fetch(path);
            return await result.json();
        },
        update: async (name, content) => {
            if(!name) {
                return { data: '', err: 'missing name' };
            }
            const path = `${base}/update/${name}`;
            const result = await fetch(path, { 
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });
            return await result.json();
        },
        delete: async (name) => {
            const path = `${base}/delete/${name}`;
            const result = await fetch(path, { method: 'delete' });
            return await result.json();
        },
        package: async () => {
            const path = `${base}/package`;
            const result = await fetch(path);
            return await result.json();
        },
        uninstall: async (name) => {
            const path = `${base}/uninstallpackage`;
            const result = await fetch(path, { 
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify({ name })
            });
            return await result.json();
        },
        install: async (name) => {
            const path = `${base}/installpackage`;
            const result = await fetch(path, { 
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify({ name })
            });
            return await result.json();
        },
        getApiUrl: async name => {
            const path = `${base}/url/${name}`;
            const result = await fetch(path);
            return await result.json();
        }
    };
});