import manifest from '../../archive-manifest.json';
import matter from 'gray-matter';
import {marked} from 'marked';
export const SITE = 'https://www.onsimplicity.net';
export const PUBLISHED = '2026-11-21T00:00:00.000Z';
export const categories = [ ['simple-living','Simple Living'],['decluttering','Decluttering'],['organization','Home & Organizing'],['house-home','House & Home'],['frugality','Money & Frugality'],['relationships','Relationships'],['happiness','Happiness'],['productivity','Productivity'],['personal-development','Personal Development'],['health','Health'] ].map(([slug,name])=>({slug,name,path:`/category/${slug}/`}));
export const slugify=(s: string)=>s.toLowerCase().replace(/&/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'other';
export const categoryFor=(name:string)=>categories.find(c=>c.name===name || c.slug===name) || categories[0];
export const absolute=(path:string)=>new URL(path,SITE).href;
export const formatDate=(s:string)=>new Date(s).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
export type Entry = {slug:string; title:string; h1:string; description:string; date:string; path:string; category:string; categories:string[]; body_html:string; tags:string[]; partner?:string; schema?:unknown; featured_image?:{url:string;alt:string}; id?:number};
export type Partner = {slug:string;name:string;category:string;city:string;state:string;blurb:string;street?:string;zip?:string;phone?:string;website?:string;gbp_url?:string;map_embed_src?:string};
const isText=(x:unknown):x is string=>typeof x==='string' && x.trim().length>0;
const isSlug=(x:unknown):x is string=>isText(x) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);
const http=(x:unknown):x is string=>{try{return isText(x)&&['http:','https:'].includes(new URL(x).protocol)}catch{return false}};
function parseFiles(raw:Record<string,unknown>,validate:(x:any,file:string)=>any):any[]{return Object.entries(raw).flatMap(([file,text])=>{try { const parsed=JSON.parse(String(text)); const value=validate(parsed,file); if(!value) throw new Error('incomplete or invalid fields'); return [value]; }catch(e){console.warn(`[content] Skipping ${file}: ${e instanceof Error?e.message:e}`); return []}})}
export const partners:Partner[]=parseFiles(import.meta.glob('../partners/*.json',{query:'?raw',import:'default',eager:true}),(v,file)=>{
 if(!v || !isSlug(v.slug)||!file.endsWith(`/${v.slug}.json`)||!['name','category','city','state','blurb'].every(k=>isText(v[k])))return null;
 return {...v,...Object.fromEntries(['street','zip','phone'].map(k=>[k,isText(v[k])?v[k]:undefined])),...Object.fromEntries(['website','gbp_url','map_embed_src'].map(k=>[k,http(v[k])?v[k]:undefined]))};
}).sort((a,b)=>a.name.localeCompare(b.name));
export const posts:Entry[]=parseFiles(import.meta.glob('../posts/*.json',{query:'?raw',import:'default',eager:true}),(v,file)=>{
 if(!v || !isSlug(v.slug)||!file.endsWith(`/${v.slug}.json`)||!['title','description','h1','date','body_html'].every(k=>isText(v[k]))||!Number.isFinite(Date.parse(v.date)))return null;
 const category=isText(v.category)?v.category:'Other';
 return {...v,category,categories:[category],path:`/resource-partners/${v.slug}/`,tags:Array.isArray(v.tags)?v.tags.filter(isText):[],featured_image:v.featured_image&&http(v.featured_image.url)?{url:v.featured_image.url,alt:typeof v.featured_image.alt==='string'?v.featured_image.alt:''}:undefined};
}).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
const archiveJSON:Entry[]=parseFiles(import.meta.glob('../archive/*.json',{query:'?raw',import:'default',eager:true}),(v)=>{
 const expected=manifest.find(m=>m.id===Number(v?.id));
 if(!expected||v.path!==expected.path||v.title!==expected.title||!isText(v.description)||!isText(v.body_html))return null;
 return {...v,id:expected.id,slug:expected.path.split('/').filter(Boolean).at(-1),h1:v.title,categories:expected.categories,category:expected.categories[0],tags:[],date:PUBLISHED};
}).sort((a,b)=>(a.id||0)-(b.id||0));
const archiveMD:Entry[]=Object.entries(import.meta.glob('../archive/*.md',{query:'?raw',import:'default',eager:true})).flatMap(([file,raw])=>{
 try {
  const {data:v,content}=matter(String(raw));
  const year=String(v.year),month=String(v.month).padStart(2,'0');
  const path=`/${year}/${month}/${v.slug}/`;
  const expected=manifest.find(m=>m.path===path);
  const date=v.updated instanceof Date?v.updated.toISOString():String(v.updated);
  if(!expected||v.title!==expected.title||!isText(v.description)||!content.trim()||!Number.isFinite(Date.parse(date))||!file.endsWith(`/${year}-${month}-${v.slug}.md`))throw new Error('invalid archive frontmatter');
  return [{id:expected.id,slug:String(v.slug),path,title:v.title,h1:v.title,description:v.description,categories:expected.categories,category:expected.categories[0],tags:[],date,body_html:marked.parse(content,{async:false}) as string}];
 }catch(e){console.warn(`[content] Skipping ${file}: ${e instanceof Error?e.message:e}`);return []}
});
// JSON is the delegated archive contract; Markdown is also accepted for future editorial updates.
export const archive:Entry[]=[...new Map([...archiveMD,...archiveJSON].map(a=>[a.path,a])).values()].sort((a,b)=>(a.id||0)-(b.id||0));
export const allEntries=[...archive,...posts].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
export const postCategories=[...new Set(posts.map(p=>p.category))].map(name=>({name,slug:slugify(name)}));
export const related=(entry:Entry)=>archive.filter(a=>a.path!==entry.path).sort((a,b)=>Number(b.categories.some(c=>entry.categories.includes(c)))-Number(a.categories.some(c=>entry.categories.includes(c)))).slice(0,3);
export const pagesOf=<T>(items:T[],size:number)=>Array.from({length:Math.max(1,Math.ceil(items.length/size))},(_,i)=>({number:i+1,items:items.slice(i*size,(i+1)*size),total:Math.max(1,Math.ceil(items.length/size))}));
