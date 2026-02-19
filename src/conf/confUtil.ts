import {store} from './storeImporter';

const save = (obj:{[key:string]:string}) => {
    for(const key in obj){
        const value = obj[key];
        store.set(key, value)
    }
}

const get = (key:string) => {
    if(store.has(key)){
        return store.get(key);
    }
    throw new Error(`NOT FOUND key=(${key})`);
}
const has = (key:string) => {
    return store.has(key);
}
export const ApConfig = {
    get : get,
    save : save,
    has: has,
}
