const MiniSearch = require('minisearch');

import { executeAll } from "./split-text";

interface Data {
    file: string
    text: string
}

export async function performSearch(dir: string) {
    const titleAndLetter = await Promise.all(await executeAll(dir));
    fullTextSearch(titleAndLetter);
}

function fullTextSearch(data: Data[][]) {
    for (let i = 0; i < data.length; i++) {
        const currentData = data[i];
        const result = search(currentData, 'Noel shopping');
        if (result.length) console.log(result);
    }
}

function search(data: Data[], phrase: string): Data[] {
    let miniSearch = new MiniSearch({
        fields: ['text'],
        storeFields: ['file', 'text']
    });
    miniSearch.addAll(data);
    const results = miniSearch.search(phrase);
    return results;
}