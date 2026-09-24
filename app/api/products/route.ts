import {listProducts} from '@/lib/catalog';
import {boundary,json} from '@/lib/server';
export async function GET(req:Request){return boundary(async()=>json(await listProducts(new URL(req.url))))}
import {POST as postProduct} from '../[...path]/route';
export async function POST(req:Request){return postProduct(req,{params:Promise.resolve({path:['products']})})}
