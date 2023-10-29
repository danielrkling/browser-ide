(function (React, ReactDOM, monaco) {
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

    const isCallback = (maybeFunction) => typeof maybeFunction === "function";
    function createStore2(input) {
        const subscriptions = new Set();
        let { state, actions } = input(setState, getState);
        Object.assign(actions, { setState });
        console.log(state, actions);
        function setState(set, isEqual) {
            const oldState = state;
            const newState = isCallback(set) ? set(oldState) : set;
            console.log(oldState, newState);
            const equals = isEqual ?? Object.is;
            if (!equals(oldState, newState)) {
                state = newState;
                for (const listener of subscriptions) {
                    listener();
                }
            }
        }
        function getState() {
            return () => state;
        }
        function subscribe(listener) {
            subscriptions.add(listener);
            return () => {
                subscriptions.delete(listener);
            };
        }
        function useStore() {
            return React.useSyncExternalStore(subscribe, getState());
        }
        return Object.assign(useStore, actions);
    }

    // interface RootFolderState{
    //   folders: Map<string,FileSystemDirectoryHandle>
    //   add: (folder: FileSystemDirectoryHandle)=>void
    //   remove: (folder: FileSystemDirectoryHandle)=>void
    //   clear: ()=>void
    // }
    // const useRootFolders = createStore<RootFolderState>((set,get)=>({
    //   folders: new Map(),
    //   add: (folder: FileSystemDirectoryHandle)=>{
    //     set('folders',(prev: RootFolderState['folders'])=>{
    //       prev.set(folder.name,folder)
    //       return new Map(prev)
    //     })
    //   },
    //   remove: (folder: FileSystemDirectoryHandle)=>{
    //     set('folders',(prev: RootFolderState['folders'])=>{
    //       prev.delete(folder.name)s
    //       return new Map(prev)
    //     })
    //   },
    //   clear: ()=>{
    //     set('folders',(prev: RootFolderState['folders'])=>{
    //       return new Map()
    //     })
    //   }
    // }))
    const useFolderStore = createStore2((set, get) => ({
        state: new Map(),
        actions: {
            add: (folder) => {
                set((prev) => {
                    let map = new Map(prev);
                    map.set(folder.name, folder);
                    return map;
                });
            },
            remove: (folder) => {
                set((prev) => {
                    let map = new Map(prev);
                    map.set(folder.name, folder);
                    return map;
                });
            },
            clear: () => {
                set(new Map());
            }
        }
    }));
    function App() {
        const rootFolders = useFolderStore();
        const add = useFolderStore.add;
        console.log(rootFolders);
        return (React.createElement("div", { className: "w-screen h-screen flex" },
            React.createElement("div", null,
                React.createElement("button", { onClick: async () => {
                        const folder = await window.showDirectoryPicker({
                            startIn: "desktop",
                        });
                        folder.requestPermission({ mode: "readwrite" });
                        add(folder);
                    } }, "Open Folder"),
                React.createElement("ul", null, [...rootFolders.values()].map((folder) => (React.createElement("div", { key: folder.name, children: folder.name })))),
                React.createElement("ol", null, monaco__namespace.editor.getModels().map((model) => {
                    return React.createElement("li", { key: model.uri.toString() }, model.uri.toString());
                }))),
            React.createElement("div", { className: "w-full h-screen" })));
    }
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(App, null));
    monaco__namespace.editor.setTheme("vs-dark");

})(React, ReactDOM, monaco);
