import Store from "electron-store";

export const store = new Store();



const save = (obj) => {
    for(const key in obj){
        const value = obj[key];
        store.set(key, value)
    }
}

const get = (key) => {
    if(store.has(key)){
        return store.get(key);
    }
    throw new Error(`NOT FOUND key=(${key})`);
}
const has = (key) => {
    return store.has(key);
}
export const ApConfig = {
    get : get,
    save : save,
    has: has,
}
