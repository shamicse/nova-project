import {DatabaseSync} from 'node:sqlite';
import {readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const origin='http://localhost:5173';
const directory=resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
const filename=readdirSync(directory).find(n=>n.endsWith('.sqlite'));
if(!filename)throw new Error('Run local setup first.');
const db=new DatabaseSync(resolve(directory,filename));db.exec('PRAGMA busy_timeout=5000');
const login=await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});const cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
const original=db.prepare('SELECT role FROM users WHERE id=?').get('local_seedy')?.role;if(!original)throw new Error('Create the local account first.');
let checks=0;
async function check(path,expected,body){const r=await fetch(origin+'/api/'+path,{method:body?'POST':'GET',headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});assert.equal(r.status,expected,path);checks++;return r.json()}
try{
db.prepare('UPDATE users SET role=? WHERE id=?').run('customer','local_seedy');
await check('dashboard',403);await check('products',403,{});await check('coupons',403,{});await check('approve-seller',403,{});await check('order-status',403,{});
db.prepare('UPDATE users SET role=? WHERE id=?').run('seller','local_seedy');
const dash=await check('dashboard',200);assert.ok(dash.products.every(p=>p.sellerId==='local_seedy'));assert.ok(dash.items.every(p=>p.sellerId==='local_seedy'));
const product=(await check('product/orbit-headphones',200)).product;
await check('products/'+product.id,403,product);await check('coupons',403,{});await check('approve-seller',403,{});
console.log(JSON.stringify({checks,passed:['Customer cannot read dashboard or mutate products, coupons, sellers or fulfillment','Seller dashboard limits products and orders to the authenticated seller','Seller cannot edit another seller product or access admin operations']},null,2));
}finally{db.prepare('UPDATE users SET role=? WHERE id=?').run(original,'local_seedy');db.close()}
