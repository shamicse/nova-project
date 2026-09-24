import {config} from '@/lib/server';
import {pages} from '@/lib/content';
export default function sitemap(){const origin=config().APP_URL;if(!origin?.startsWith('https://'))return[];return['','shop','categories','deals',...Object.keys(pages)].map(path=>({url:origin+'/'+path,changeFrequency:'weekly' as const,priority:path?0.6:1}))}
