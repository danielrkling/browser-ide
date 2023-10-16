(function (React, ReactDOM, reactQuery, monaco) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var monaco__namespace = /*#__PURE__*/_interopNamespaceDefault(monaco);

    const GLOBAL_STATE_KEY_PREFIX = "globalState";
    function useGlobalState(key, initialState) {
        const queryClient = reactQuery.useQueryClient();
        const stateKey = [GLOBAL_STATE_KEY_PREFIX, key];
        const { data } = reactQuery.useQuery(stateKey, () => initialState, {
            initialData: initialState,
            staleTime: Infinity,
            cacheTime: Infinity
        });
        const setData = (newState) => {
            queryClient.setQueryData(stateKey, newState);
        };
        return [data, setData];
    }

    function File(props) {
        const [checked, setChecked] = React.useState(props.parentChecked);
        const path = [...props.parentPath, props.handle.name];
        const model = reactQuery.useQuery([...path, checked], {
            queryFn: async () => {
                let uri = monaco__namespace.Uri.file(path.join("/"));
                let model = monaco__namespace.editor.getModel(uri);
                if (checked) {
                    if (model) {
                        return model;
                    }
                    else {
                        let text = await (await props.handle.getFile()).text();
                        return monaco__namespace.editor.createModel(text, null, uri);
                    }
                }
                else {
                    if (model) {
                        model.dispose();
                    }
                    return null;
                }
            },
            initialData: null,
        });
        const [activeModel, setActiveModel] = useGlobalState("model");
        React.useEffect(() => {
            setChecked(props.parentChecked);
        }, [props.parentChecked]);
        return (React.createElement("li", null,
            model.isLoading && React.createElement("i", { className: "fa-solid fa-rotate fa-spin" }),
            React.createElement("input", { type: "checkbox", checked: checked, onChange: (e) => setChecked(e.target.checked) }),
            React.createElement("span", { onClick: () => {
                    setActiveModel(model.data);
                } }, props.handle.name)));
    }

    function useFolder(path, handle) {
        const client = reactQuery.useQueryClient();
        const query = reactQuery.useQuery(path, {
            queryFn: async () => {
                const children = new Map();
                const files = new Map();
                const folders = new Map();
                for await (const [key, child] of handle.entries()) {
                    children.set(key, child);
                    if (child.kind === "directory") {
                        folders.set(key, child);
                    }
                    else {
                        files.set(key, child);
                    }
                }
                return { children, folders, files };
            },
        });
        function refresh() {
            client.refetchQueries(path);
        }
        const newFile = reactQuery.useMutation({
            mutationFn: () => {
                let name = prompt();
                return handle.getFileHandle(name, { create: true });
            },
            // Notice the second argument is the variables object that the `mutate` function receives
            onSuccess: (data, variables) => {
                client.refetchQueries(path);
            },
        });
        const newFolder = reactQuery.useMutation({
            mutationFn: () => {
                let name = prompt();
                return handle.getDirectoryHandle(name, { create: true });
            },
            // Notice the second argument is the variables object that the `mutate` function receives
            onSuccess: (data, variables) => {
                client.refetchQueries(path);
            },
        });
        return { query, refresh, newFile, newFolder };
    }
    function Folder(props) {
        const path = [...props.parentPath, props.handle.name];
        const { query, refresh, newFile, newFolder } = useFolder(path, props.handle);
        const [checked, setChecked] = React.useState(props.parentChecked);
        React.useEffect(() => {
            setChecked(props.parentChecked);
        }, [props.parentChecked]);
        return (React.createElement("li", null,
            React.createElement("div", null,
                React.createElement("input", { type: "checkbox", checked: checked, onChange: (e) => setChecked(e.target.checked) }),
                props.handle.name,
                React.createElement("button", { className: "border-2", onClick: () => newFile.mutate() }, "New File"),
                React.createElement("button", { className: "border-2", onClick: () => newFolder.mutate() }, "New Folder"),
                React.createElement("button", { className: "border-2", onClick: refresh }, "Refresh")),
            query.data && React.createElement("ul", { className: "pl-2" },
                [...query.data.folders.values()].map(handle => {
                    return (React.createElement(Folder, { handle: handle, key: handle.name, parentPath: path, parentChecked: checked }));
                }),
                [...query.data.files.values()].map(handle => {
                    return (React.createElement(File, { handle: handle, key: handle.name, parentPath: path, parentChecked: checked }));
                }))));
    }

    // Create a client
    const queryClient = new reactQuery.QueryClient();
    function App() {
        const [rootFolders, setRootFolders] = React.useState([]);
        const [activeModel] = useGlobalState("model", null);
        return (React.createElement("div", { className: "w-screen h-screen flex" },
            React.createElement("div", null,
                React.createElement("button", { onClick: async () => {
                        const folder = await window.showDirectoryPicker({
                            startIn: "desktop",
                        });
                        folder.requestPermission({ mode: "readwrite" });
                        setRootFolders((prev) => [...prev, folder]);
                    } }, "Open Folder"),
                React.createElement("ul", null, rootFolders.map((folder) => (React.createElement(Folder, { handle: folder, parentPath: [], key: folder.name, parentChecked: false })))),
                React.createElement("ol", null, monaco__namespace.editor.getModels().map((model) => {
                    return React.createElement("li", { key: model.uri.toString() }, model.uri.toString());
                }))),
            React.createElement("div", { className: "w-full h-screen" },
                React.createElement(Editor, { model: activeModel }))));
    }
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(reactQuery.QueryClientProvider, { client: queryClient },
        React.createElement(App, null)));
    monaco__namespace.editor.setTheme("vs-dark");
    function Editor(props) {
        const ref = React.useRef();
        const editor = React.useRef();
        React.useEffect(() => {
            if (ref.current instanceof HTMLDivElement) {
                editor.current = monaco__namespace.editor.create(ref.current, {
                    model: null,
                    automaticLayout: true,
                });
            }
        }, [ref.current]);
        React.useEffect(() => {
            if (editor.current) {
                editor.current.setModel(props.model);
            }
        }, [props.model]);
        return React.createElement("div", { className: "w-full h-full", ref: ref });
    }

})(React, ReactDOM, ReactQuery, monaco);
