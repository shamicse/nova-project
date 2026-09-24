import type {Product} from './types';
const rows=[
['orbit-headphones','Orbit wireless headphones','Tech & audio','Sonic Studio',499900,649900,'headphones','THE SOUND EDIT'],
['daybreak-sneakers','Daybreak everyday sneakers','Streetwear','Off Hours',329900,399900,'sneakers','FRESH DROP'],
['transit-backpack','Transit all-day backpack','Everyday carry','Carry Co.',279900,349900,'backpack','EVERYDAY ICON'],
['midnight-watch','Midnight analog watch','Accessories','Form',449900,549900,'watch','LESS IS MORE'],
['frame-camera','Frame compact camera','Tech & audio','Frame Studio',4599900,4999900,'camera','CREATOR PICK'],
['pulse-speaker','Pulse portable speaker','Tech & audio','Sonic Studio',249900,299900,'speaker','TAKE IT OUTSIDE'],
['afterglow-shades','Afterglow sunglasses','Accessories','Off Hours',149900,199900,'sunglasses','SUN CHASER'],
['studio-lamp','Studio task lamp','Home & living','Form',299900,379900,'lamp','SPACE UPGRADE'],
['orbit-pro','Orbit studio edition','Tech & audio','Sonic Studio',749900,899900,'headphones','STUDIO EDIT'],
['weekend-carry','Weekend carry pack','Everyday carry','Carry Co.',399900,499900,'backpack','PACK LIGHT'],
['night-shift','Night shift timepiece','Accessories','Form',599900,699900,'watch','AFTER HOURS'],
['daily-run','Daily run trainers','Streetwear','Off Hours',429900,499900,'sneakers','NEW ARRIVAL']
] as const;
export const sampleProducts:Product[]=rows.map((r,i)=>({id:r[0],name:r[1],category:r[2],brand:r[3],price:r[4],comparePrice:r[5],image:'/images/'+r[6]+'.jpg',badge:r[7],stock:20+i,description:'A considered essential for your everyday rotation. Thoughtful design, versatile styling, and a little personality. This is a sample catalog item; photographs are illustrative. Check the seller’s final specifications before a live purchase.',rating:0,reviewCount:0,sellerId:'nova-studio',active:1,createdAt:new Date(Date.UTC(2026,8,24,0,i)).toISOString()}));
