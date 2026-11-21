import rss from '@astrojs/rss';
import {allEntries,SITE} from '../lib/content';
export function GET(){return rss({title:'On Simplicity',description:'Simple Living, Home & Everyday Life',site:SITE,items:allEntries.slice(0,50).map(p=>({title:p.h1,description:p.description,pubDate:new Date(p.date),link:p.path})),customData:'<language>en-us</language>'})}
