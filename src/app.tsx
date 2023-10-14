import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

function App() {
  const [rootFolders, setRootFolders] = React.useState([] as FileSystemDirectoryHandle[]);


  return (
    // Provide the client to your App
<>
    <div className='w-full h-full bg-slate-100'>
      <button onClick={async () => {
        const folder = await window.showDirectoryPicker({ startIn: "documents" });
        folder.requestPermission({ mode: 'readwrite' })
        setRootFolders(prev => [...prev, folder])
      }}>Open Folder</button>
    </div>
    {rootFolders.map(folder=><Folder handle={folder} path={[]} />)}
    </>

  )
}



function Folder(props: { handle: FileSystemDirectoryHandle, path:string[] }) {
  const path = [...props.path,props.handle.name]
  const children = useQuery(path, {
    queryFn: () => gen2array(props.handle.entries()),
    initialData:[]
  })

  return (
    <div>
      {children.data.map(([name,handle])=>{
        if (handle.kind==='directory'){
          return <Folder handle={handle} key={name} path={path} />
        }else if(handle.kind==='file'){
          return <File handle={handle} key={name} path={path} />
        }
      })}
    </div>
  )
}

function File(props: { handle: FileSystemFileHandle, path:string[]}) {
  const path = [...props.path,props.handle.name]

    return(
      <div>
        {path.join('/')}
      </div>
    )
}


const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>);

async function gen2array<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = []
  for await (const x of gen) {
    out.push(x)
  }
  return out
}