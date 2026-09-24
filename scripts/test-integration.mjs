import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const origin=process.env.TEST_ORIGIN||'http://localhost:5173';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw new Error('Integration tests may only run against loopback development.');
let cookie='';let checks=0;const passed=[];
async function request(path,body,expected=200,options={}){const res=await fetch(origin+'/api/'+path,{method:options.method||(body?'POST':'GET'),headers:{Origin:options.origin||origin,...(body?{'Content-Type':'application/json'}:{}),...(options.anonymous?{}:{Cookie:cookie})},body:body?JSON.stringify(body):undefined});const raw=await res.text();let content;try{content=JSON.parse(raw)}catch{content={error:raw}}assert.equal(res.status,expected,path+': '+JSON.stringify(content));checks++;return content}
function test(name){passed.push(name);console.log('PASS '+name)}
const catalog=await request('products');assert.equal(catalog.total,12);test('Persistent seeded catalog');
const filtered=await request('products?category=Tech%20%26%20audio&sort=price_asc&limit=2&page=1');assert.equal(filtered.items.length,2);assert.ok(filtered.items[0].price<=filtered.items[1].price);assert.ok(filtered.total>2);test('Filtering, sorting and pagination');
await request('orders',undefined,401,{anonymous:true});await request('cart',{productId:catalog.items[0].id,quantity:1},403,{origin:'https://evil.invalid'});test('Authentication and cross-origin mutation guards');
const login=await fetch(origin+'/signin-with-chatgpt?return_to=/account',{redirect:'manual'});assert.equal(login.status,302);cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');const me=await request('me');assert.equal(me.user.role,'admin');test('Local identity and configured admin role');
const product={name:'QA limited-stock item',brand:'QA Studio',category:'Tech & audio',description:'Integration test product. Not for real sale or fulfillment.',price:150000,comparePrice:180000,stock:2,image:'/images/headphones.jpg',badge:'TEST',active:1};
await request('products',product);const found=await request('products?q=QA%20limited-stock');const p=found.items.find(p=>p.name===product.name);assert.ok(p);test('Admin product creation');
await request('cart',{productId:p.id,quantity:-1},400);await request('cart',{productId:p.id,quantity:3,replace:true},409);await request('cart',{productId:p.id,quantity:2,replace:true});test('Quantity validation and stock checks');
const address=await request('addresses',{name:'QA Customer',phone:'+919999999999',line1:'123 Test Street',city:'Test City',state:'Test State',postalCode:'110001',country:'IN'},201);
await request('checkout',{addressId:randomUUID(),coupon:'',provider:'demo',idempotencyKey:randomUUID()},400);test('Address ownership enforced');
const before=(await request('product/'+p.id)).product.stock;const key=randomUUID();const checkout={addressId:address.id,coupon:'NOVA10',provider:'demo',idempotencyKey:key};
const placed=await request('checkout',checkout,201);assert.equal(placed.simulated,true);const repeat=await request('checkout',checkout,201);assert.equal(repeat.orderId,placed.orderId);const after=(await request('product/'+p.id)).product.stock;assert.equal(before-after,2);test('Demo checkout, atomic inventory and idempotent retries');
const orders=await request('orders');const order=orders.items.find(o=>o.id===placed.orderId);assert.equal(order.paymentStatus,'simulated');assert.equal(order.discount,Math.min(Math.floor(order.subtotal*.1),100000));assert.equal(order.total,order.subtotal-order.discount+order.shipping);test('Server-authoritative totals and coupon');
await request('reviews',{productId:p.id,rating:5,body:'A useful integration test review.'},403);await request('order-status',{orderId:order.id,status:'delivered'},409);await request('order-status',{orderId:order.id,status:'shipped',tracking:'QA-TRACK-001'});await request('order-status',{orderId:order.id,status:'delivered'});await request('reviews',{productId:p.id,rating:5,body:'A useful integration test review.'});test('Fulfillment transitions and delivered-purchase reviews');
await request('returns',{orderId:order.id,reason:'Integration test return request.'},201);await request('returns',{orderId:order.id,reason:'Duplicate return should be rejected.'},409);test('Returns and duplicate prevention');
await request('wishlist',{productId:p.id});assert.ok((await request('wishlist')).items.some(i=>i.id===p.id));await request('wishlist',{productId:p.id});test('Persistent wishlist toggle');
await request('notifications',{});assert.ok((await request('notifications')).items.every(n=>n.read===1));test('Notification read state');
await request('products/'+p.id,{...product,stock:0,active:0});await request('product/'+p.id,undefined,404);test('Archived products are hidden');
const hook=await fetch(origin+'/api/webhooks/stripe',{method:'POST',body:'{}'});assert.equal(hook.status,503);test('Unconfigured payment webhook fails closed');
console.log(JSON.stringify({checks,passed},null,2));

