// Integration adapter for an outbox consumer. Never called on the request path.
export interface EmailMessage{to:string;subject:string;text:string}
export interface EmailAdapter{send(message:EmailMessage,idempotencyKey:string):Promise<{id:string}>}
export class ResendEmailAdapter implements EmailAdapter{
 constructor(private apiKey:string,private from:string){}
 async send(message:EmailMessage,idempotencyKey:string){const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+this.apiKey,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify({from:this.from,...message}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Email provider rejected the delivery.');return await response.json() as {id:string}}
}
// Local fallback: messages remain in the durable outbox, visible to admins.
// Production consumer must claim rows, retry with bounded backoff, and mark sent.
