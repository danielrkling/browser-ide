import React from 'react'


let rootFolders = new Map<string,Folder>()
const rootFoldersSubscriptions = new Set<()=>void>()
const subscriptions = new Map<string, Set<()=>void>>()
const state={
    rootFolders: new Map<string,Folder>()
}
let folders = new Map<string,Folder>()
let files = new Map<string,File>()
let children = new Map<string,File|Folder>()

export function useRootFolders(){
    return React.useSyncExternalStore(subscribeToRootFolders,()=>state.rootFolders)
}

function subscribeToRootFolders(listener: ()=>void){
    rootFoldersSubscriptions.add(listener)
    return ()=>rootFoldersSubscriptions.delete(listener)
}


export async function addRootFolder(handle: FileSystemDirectoryHandle){
    const rootFolder = await createFolder(handle)
    const rootFolders = new Map(state.rootFolders)
    rootFolders.set(rootFolder.name,rootFolder)
    state.rootFolders = rootFolders

    for (const listener of rootFoldersSubscriptions){
        listener()
    }
}

export function removeRootFolder(name: string){
    const rootFolders = new Map(state.rootFolders)
    rootFolders.delete(name)
    state.rootFolders = rootFolders

    for (const listener of rootFoldersSubscriptions){
        listener()
    }
}

export function clearRootFolders(){

    state.rootFolders = new Map()
    for (const listener of rootFoldersSubscriptions){
        listener()
    }
}

export function useFolder(path: string){

}

function getFolder(path:string, parentFolder?: Folder){
    const folders = path.split('/')
    const root = folders.shift()
    const rest = folders.join('/')

    if (rest){
        return getFolder(rest,parentFolder.folders.)
    }
}


function subscribeToFolder(path: string){

}

type Folder = Awaited<ReturnType<typeof createFolder>>
async function createFolder(handle:FileSystemDirectoryHandle) {
    const children = new Map()
    const files = new Map()
    const folders = new Map()

    for await (const [name,child] of handle.entries()){
        if (child.kind==='directory'){
            const folder = await createFolder(child);
            children.set(folder.name,folder)
            folders.set(folder.name,folder)
        }else{
            const file = await createFile(child);
            children.set(file.name,file)
            files.set(file.name,file)
        }
    }

    return {
        handle,
        children,
        files,
        folders,
        name: handle.name
    }
}

type File = Awaited<ReturnType<typeof createFile>>
async function createFile(handle:FileSystemFileHandle) {

    const file = await handle.getFile()
    return {
        handle,
        name: handle.name,
        file
    }
}

