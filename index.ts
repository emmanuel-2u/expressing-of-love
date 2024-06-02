import loadData from './load-data';
import { performSearch } from './perform-search';

async function findLove(dir: string) {
    loadData(dir);
    performSearch(dir);
}

findLove('./star');