window.api = (function() {
    const init = async config => {

        return new Promise((resolve, reject) => {
            const { env } = config;
            const { url } = env;
            const base = `${url}/api`;
            if(!url) {
                return reject();
            }
            setTimeout(() => {
                window.api = {
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
                    allowPackages: async () => {
                        const path = `${base}/allow-packages`;
                        const result = await fetch(path);
                        return await result.json();
                    }
                };
                resolve(window.api);
            }, 0);
        });

    }
    return { init };
})();