import React from "react";
import ReactDOM from "react-dom/client";

import * as monaco from "monaco-editor";

import { createStore2 } from "./store";

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

interface FolderStoreActions {
  add: (folder: FileSystemDirectoryHandle) => void
  remove: (folder: FileSystemDirectoryHandle) => void
  clear: () => void
}


const useFolderStore = createStore2<Map<string, FileSystemDirectoryHandle>, FolderStoreActions>(
  new Map<string, FileSystemDirectoryHandle>(),
  (set, get) => ({
    add: (folder: FileSystemDirectoryHandle) => {
      set((prev) => {
        let map = new Map(prev)
        map.set(folder.name, folder)
        return map
      })
    },
    remove: (folder: FileSystemDirectoryHandle) => {
      set((prev) => {
        let map = new Map(prev)
        map.set(folder.name, folder)
        return map
      })
    },
    clear: () => {
      set(new Map())
    }

  }))

function App() {
  const rootFolders = useFolderStore()
  const add = useFolderStore.add


  return (
    <div className="w-screen h-screen flex">
      <div>
        <button
          onClick={async () => {
            const folder = await window.showDirectoryPicker({
              startIn: "desktop",
            });
            folder.requestPermission({ mode: "readwrite" });
            add(folder)
          }}
        >
          Open Folder
        </button>
        <ul>
          {[...rootFolders.values()].map((folder) => (
            <div

              key={folder.name}
              children={folder.name}

            />
          ))}
        </ul>

        <ol>
          {monaco.editor.getModels().map((model) => {
            return <li key={model.uri.toString()}>{model.uri.toString()}</li>;
          })}
        </ol>
      </div>
      <div className="w-full h-screen">
        {/* <Editor model={activeModel} /> */}
      </div>
    </div>
  );
}



const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <App />
);


monaco.editor.setTheme("vs-dark");

function Editor(props: { model: monaco.editor.ITextModel }) {
  const ref = React.useRef<HTMLDivElement>();
  const editor = React.useRef<monaco.editor.IEditor>();

  React.useEffect(() => {
    if (ref.current instanceof HTMLDivElement) {
      editor.current = monaco.editor.create(ref.current, {
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

  return <div className="w-full h-full" ref={ref} />;
}
