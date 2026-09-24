import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {cookies} from 'next/headers';
import type {User} from './types';
import {z} from 'zod';
export const config=()=>env as unknown as Record<string,string|undefined>;
export function db(){if(!env.DB)throw new HttpError(503,'Database is unavailable. Please try again.');return env.DB}
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
export const now=()=>new Date().toISOString();
export const id=()=>crypto.randomUUID();
export async function all<T=any>(sql:string,...values:any[]):Promise<T[]>{return (await db().prepare(sql).bind(...values).all<T>()).results}
export async function first<T=any>(sql:string,...values:any[]):Promise<T|null>{return db().prepare(sql).bind(...values).first<T>()}
export async function run(sql:string,...values:any[]){return db().prepare(sql).bind(...values).run()}
export async function user(required=true):Promise<User|null>{const identity=await getChatGPTUser();if(!identity){if(required)throw new HttpError(401,'Please sign in to continue.');return null}const admins=(config().ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase());await run('INSERT OR IGNORE INTO users (id,email,name,role) VALUES (?,?,?,?)',identity.userId,identity.email,identity.displayName,admins.includes(identity.email.toLowerCase())?'admin':'customer');return first<User>('SELECT * FROM users WHERE id=?',identity.userId)}
export async function requireRole(...roles:string[]){const u=(await user())!;if(!roles.includes(u.role))throw new HttpError(403,'This area requires '+roles.join(' or ')+' access.');return u}
export async function cartOwner(){const u=await user(false);if(u)return u.id;const jar=await cookies();let guest=jar.get('nova_guest')?.value;if(!guest||!/^guest_[a-f0-9-]{36}$/.test(guest)){guest='guest_'+id();jar.set('nova_guest',guest,{httpOnly:true,sameSite:'lax',secure:config().APP_ENV==='production',path:'/',maxAge:60*60*24*30})}return guest}
export async function mergeCart(userId:string){const guest=(await cookies()).get('nova_guest')?.value;if(!guest?.startsWith('guest_'))return;await db().batch([db().prepare('INSERT INTO cart_items (owner,productId,quantity) SELECT ?,productId,quantity FROM cart_items WHERE owner=? ON CONFLICT(owner,productId) DO UPDATE SET quantity=MIN(20,cart_items.quantity+excluded.quantity)').bind(userId,guest),db().prepare('DELETE FROM cart_items WHERE owner=?').bind(guest)])}
export async function body<T>(req:Request,schema:z.ZodType<T,any,any>):Promise<T>{if(Number(req.headers.get('content-length')||0)>65536)throw new HttpError(413,'Request is too large.');const raw=await req.text();if(raw.length>65536)throw new HttpError(413,'Request is too large.');try{return schema.parse(JSON.parse(raw))}catch(e){if(e instanceof z.ZodError)throw new HttpError(400,e.issues.map(i=>i.path.join('.')+': '+i.message).join('; '));throw new HttpError(400,'Invalid JSON request.')}}
export async function protect(req:Request){if(req.method==='GET')return;const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new HttpError(403,'Cross-site requests are not allowed.');const actor=(await user(false))?.id??(req.headers.get('cf-connecting-ip')||'anonymous');const bucket=Math.floor(Date.now()/60000);const key=actor+':'+bucket;await run('INSERT INTO rate_limits (key,count,expiresAt) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1',key,bucket+2);const r=await first('SELECT count FROM rate_limits WHERE key=?',key);if(r.count>100)throw new HttpError(429,'Please slow down and try again in a minute.');await run('DELETE FROM rate_limits WHERE expiresAt<?',bucket)}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}})}
export async function boundary(fn:()=>Promise<Response>){try{return await fn()}catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);console.error('commerce_request_failed',e instanceof Error?e.message:'unknown');return json({error:'We could not complete that request. Please try again.'},500)}}
export const productProjection='p.*, COALESCE((SELECT AVG(rating) FROM reviews WHERE productId=p.id),0) rating, (SELECT COUNT(*) FROM reviews WHERE productId=p.id) reviewCount';
export async function notify(userId:string,message:string){await db().batch([db().prepare('INSERT INTO notifications (id,userId,message,createdAt) VALUES (?,?,?,?)').bind(id(),userId,message,now()),db().prepare('INSERT INTO outbox (id,userId,subject,body,createdAt) VALUES (?,?,?,?,?)').bind(id(),userId,'NOVA MARKET update',message,now())])}
export async function audit(actor:string,action:string,target:string){await run('INSERT INTO audit_log (id,actor,action,target,createdAt) VALUES (?,?,?,?,?)',id(),actor,action,target,now())}

