import {notFound} from 'next/navigation';
import {Shop,ProductDetail,CartPage,CheckoutPage,OrdersPage,AccountPage} from '@/components/commerce-pages';
import PublicPage from '@/components/public-pages';
import Dashboard from '@/components/dashboard';
import {pages} from '@/lib/content';
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){const{slug}=await params;const title=pages[slug[0]]?.title||slug[0].replaceAll('-',' ');return{title,robots:['account','orders','checkout','seller','admin','cart','wishlist'].includes(slug[0])?{index:false,follow:false}:undefined}}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const{slug}=await params;const [s,id]=slug;if(s==='product'&&id)return <ProductDetail productId={id}/>;if(slug.length!==1)notFound();if(s==='shop'||s==='menu')return <Shop/>;if(s==='deals')return <Shop deals/>;if(s==='wishlist')return <Shop wishlist/>;if(s==='cart')return <CartPage/>;if(s==='checkout')return <CheckoutPage/>;if(s==='orders')return <OrdersPage/>;if(s==='account')return <AccountPage/>;if(s==='seller'||s==='admin')return <Dashboard admin={s==='admin'}/>;if(pages[s]||['categories','contact','seller-onboarding'].includes(s))return <PublicPage slug={s}/>;notFound()}
