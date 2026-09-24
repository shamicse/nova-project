'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="wrap empty"><h1>A small detour.</h1><p>We couldn’t load this page. Your saved information is still in your account.</p><button className="btn" onClick={reset}>Try again</button></main>}
