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

export function File(props: {
    handle: FileSystemFileHandle;
    parentPath: string[];
    parentChecked: boolean;
}) {
    const client = useQueryClient()
    const [checked, setChecked] = React.useState(props.parentChecked);
    const path = [...props.parentPath, props.handle.name];
    const model = useQuery([...path, checked], {
        queryFn: async () => {
            let uri = monaco.Uri.file(path.join("/"));
            let model = monaco.editor.getModel(uri);
            if (checked) {
                if (model) {
                    return model;
                } else {
                    let text = await (await props.handle.getFile()).text();
                    return monaco.editor.createModel(text, null, uri);
                }
            } else {
                if (model) {
                    model.dispose();
                }
                return null;
            }
        },
        initialData: null,
    });

    const [activeModel, setActiveModel] =
        useGlobalState<monaco.editor.ITextModel>("model");

    React.useEffect(() => {
        setChecked(props.parentChecked);
    }, [props.parentChecked]);

    return (
        <li>
            {model.isLoading && <i className="fa-solid fa-rotate fa-spin"></i>}
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
            />
            <span
                onClick={() => {
                    setActiveModel(model.data);
                }}
            >
                {props.handle.name}
            </span>
        </li>
    );
}
