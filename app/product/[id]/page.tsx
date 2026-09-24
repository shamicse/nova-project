import {notFound} from 'next/navigation';
import {first,all,productProjection} from '@/lib/server';
import {ProductDetail} from '@/components/commerce-pages';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const{id}=await params;const p=await first('SELECT name,description FROM products WHERE id=? AND active=1',id);return{title:p?.name||'Product not found',description:p?.description?.slice(0,160)}}
export default async function ProductPage({params}:{params:Promise<{id:string}>}){const{id}=await params;const product=await first('SELECT '+productProjection+' FROM products p WHERE id=? AND active=1',id);if(!product)notFound();const reviews=await all('SELECT r.*,u.name FROM reviews r JOIN users u ON u.id=r.userId WHERE productId=? ORDER BY createdAt DESC LIMIT 50',id);return <ProductDetail productId={id} initialData={{product,reviews}}/>}
