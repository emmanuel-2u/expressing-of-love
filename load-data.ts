import { parse } from 'node-html-parser';
import { writeFile, mkdir } from 'fs/promises';

import { DESIRING_GOD_URL, TOTAL_PAGES } from './constant';
import { existsSync } from 'fs';

interface File {
    fileName: string
    content: string
}

async function rerunOnError(func: (parameter: string) => Promise<string[]> | Promise<string>, parameter: string) {
    // This retry logic is not correct cause func (scraping functions)
    // will only get called twice
    try {
        return await func(parameter);
    } catch (error) {
        console.log('Error:', error);
        console.log('Retrying');
        await func(parameter);
    }
}

async function getLinkToMessage(link: string): Promise<string[]> {
    console.log('fetching all articles', link);
    const func = async (link: string) => {
        const raw = await fetch(link);
        const romans = await raw.text();

        const html = parse(romans);
        const articles_link = html.querySelectorAll('.card__shadow');
        const individual_links = articles_link.map(value => value.getAttribute('href') as string);
        return individual_links;
    }
    return await rerunOnError(func, link) as string[];
}

async function fetchSingleArticle(link: string): Promise<string> {
    console.log('fetching single article', link);
    const func = async (link: string) => {
        const raw = await fetch(link);
        const article = await raw.text();

        const html = parse(article);
        const article_body = html.querySelectorAll('.resource__body p');
        const all_article_text = article_body.map(value => value.text).join('\n');
        return all_article_text;
    }
    return await rerunOnError(func, link) as string;
}

function getArticleName(link: string): string {
    return link.split('/').pop() as string;
}

function fetchAllArticles(links: string[]): Promise<File>[] {
    return links.map(async link => {
        return {
            fileName: `star/${getArticleName(link)}`,
            content: await fetchSingleArticle(link)
        };
    });
}

function writeArticlesToFile(file: File): Promise<void> {
    console.log('writing', file.fileName, 'to file');
    return writeFile(
        file.fileName + '.txt',
        file.content,
        { encoding: 'utf-8' }
    );
}

function createDir(dir: string) {
    return mkdir(dir);
}

export default async function main(dir: string) {
    // If dir already exists, we assume site has been scraped
    if (existsSync(dir)) return;
    // Create the dir where the articles will be stored
    await createDir(dir);
    // Got 14 from desiring god's site which is the number of pages
    // for the messages on the book or Romans
    for (let i = 1; i < TOTAL_PAGES; i++) {
        const full_url = DESIRING_GOD_URL + (i);
        console.log('fetching page', full_url);
        const individual_links = await getLinkToMessage(full_url);
        const full_individual_links = individual_links.map(value => `https://desiringgod.org${value}`);
        const all_articles = await Promise.all(fetchAllArticles(full_individual_links));
        await Promise.all(all_articles.map(writeArticlesToFile));
    }
    console.log('done scraping');
}