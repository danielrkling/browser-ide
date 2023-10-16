import React from "react";
import ReactDOM from "react-dom/client";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as monaco from "monaco-editor";
import { useGlobalState } from "./state";
import {Folder} from './folder'

// Create a client
const queryClient = new QueryClient();

function App() {
  const [rootFolders, setRootFolders] = React.useState(
    [] as FileSystemDirectoryHandle[]
  );
  const [activeModel] = useGlobalState(
    "model",
    null as monaco.editor.ITextModel
  );

  return (
    <div className="w-screen h-screen flex">
      <div>
        <button
          onClick={async () => {
            const folder = await window.showDirectoryPicker({
              startIn: "desktop",
            });
            folder.requestPermission({ mode: "readwrite" });
            setRootFolders((prev) => [...prev, folder]);
          }}
        >
          Open Folder
        </button>
        <ul>
          {rootFolders.map((folder) => (
            <Folder
              handle={folder}
              parentPath={[]}
              key={folder.name}
              parentChecked={false}
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
        <Editor model={activeModel} />
      </div>
    </div>
  );
}



const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
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
