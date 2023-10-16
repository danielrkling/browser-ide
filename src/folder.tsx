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
import { File } from "./file";

function useFolder(path: string[], handle: FileSystemDirectoryHandle) {
  const client = useQueryClient();

  const query = useQuery(path, {
    queryFn: async () => {
      const children = new Map();
      const files = new Map();
      const folders = new Map();
      for await (const [key, child] of handle.entries()) {
        children.set(key, child);
        if (child.kind === "directory") {
          folders.set(key, child);
        } else {
          files.set(key, child);
        }
      }
      return { children, folders, files };
    },
  });

  function refresh() {
    client.refetchQueries(path);
  }

  const newFile = useMutation({
    mutationFn: () => {
      let name = prompt();
      return handle.getFileHandle(name, { create: true });
    },
    // Notice the second argument is the variables object that the `mutate` function receives
    onSuccess: (data, variables) => {
      client.refetchQueries(path);
    },
  });

  const newFolder = useMutation({
    mutationFn: () => {
      let name = prompt();
      return handle.getDirectoryHandle(name, { create: true });
    },
    // Notice the second argument is the variables object that the `mutate` function receives
    onSuccess: (data, variables) => {
      client.refetchQueries(path);
    },
  });

  return {query,refresh,newFile,newFolder}
}

export function Folder(props: {
  handle: FileSystemDirectoryHandle;
  parentPath: string[];
  parentChecked: boolean;
}) {
  const path = [...props.parentPath, props.handle.name];
  const {query,refresh,newFile,newFolder} = useFolder(path, props.handle)

  const [checked, setChecked] = React.useState(props.parentChecked);
  React.useEffect(() => {
    setChecked(props.parentChecked);
  }, [props.parentChecked]);

  return (
    <li>
      <div>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        {props.handle.name}
        <button className="border-2" onClick={() => newFile.mutate()}>
          New File
        </button>
        <button className="border-2" onClick={()=>newFolder.mutate()}>
          New Folder
        </button>
        <button className="border-2" onClick={refresh}>
          Refresh
        </button>
      </div>
      {query.data && <ul className="pl-2">
        {[...query.data.folders.values()].map(handle=>{
            return (
              <Folder
                handle={handle}
                key={handle.name}
                parentPath={path}
                parentChecked={checked}
              />
            );
        })}
        {[...query.data.files.values()].map(handle=>{
            return (
              <File
                handle={handle}
                key={handle.name}
                parentPath={path}
                parentChecked={checked}
              />
            );
        })}
      </ul>}
    </li>
  );
}
