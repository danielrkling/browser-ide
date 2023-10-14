(function (React, ReactDOM, reactQuery) {
    'use strict';

    // Create a client
    const queryClient = new reactQuery.QueryClient();
    function App() {
        const [rootFolders, setRootFolders] = React.useState([]);
        return (
        // Provide the client to your App
        React.createElement(React.Fragment, null,
            React.createElement("div", { className: 'w-full h-full bg-slate-100' },
                React.createElement("button", { onClick: async () => {
                        const folder = await window.showDirectoryPicker({ startIn: "documents" });
                        folder.requestPermission({ mode: 'readwrite' });
                        setRootFolders(prev => [...prev, folder]);
                    } }, "Open Folder")),
            rootFolders.map(folder => React.createElement(Folder, { handle: folder, path: [] }))));
    }
    function Folder(props) {
        const path = [...props.path, props.handle.name];
        const children = reactQuery.useQuery(path, {
            queryFn: () => gen2array(props.handle.entries()),
            initialData: []
        });
        return (React.createElement("div", null, children.data.map(([name, handle]) => {
            if (handle.kind === 'directory') {
                return React.createElement(Folder, { handle: handle, key: name, path: path });
            }
            else if (handle.kind === 'file') {
                return React.createElement(File, { handle: handle, key: name, path: path });
            }
        })));
    }
    function File(props) {
        const path = [...props.path, props.handle.name];
        return (React.createElement("div", null, path.join('/')));
    }
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(reactQuery.QueryClientProvider, { client: queryClient },
        React.createElement(App, null)));
    async function gen2array(gen) {
        const out = [];
        for await (const x of gen) {
            out.push(x);
        }
        return out;
    }

})(React, ReactDOM, reactQuery);
