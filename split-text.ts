import fs from 'fs/promises';

function listFiles(dir: string): Promise<string[]> {
    return fs.readdir(dir);
}

function readFiles(files: string[], dir: string): Promise<{ file: string, text: string }[]>[] {
    return files.map(async (file) => {
        const text = await fs.readFile(`${dir}/${file}`, { encoding: 'utf-8' });
        return text.split('\n\n').filter(text => text.trim()).map(text => ({ file, text, id: Math.random() }));
    });
}

export async function executeAll(dir: string) {
    return readFiles(await listFiles(dir), dir);
}