import{readFileSync as R,writeFileSync as W,mkdirSync as K,readdirSync as E}from'node:fs'
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output',T8=new TextEncoder
const Q=new Uint16Array(84)
for(let k=16;k<35;k++)if(k!=23&&k!=27)Q[k]=512|2<<3|1<<6
for(const[o,i,a,b]of[[1,1,0,1],[2,4,0,1],[3,0,1,0],[4,0,1,2],[5,0,2,2],[6,0,2,3],[7,0,3,3],[23,0,1,1],[27,0,1,1],[48,2,0,0],[49,2,1,0],[50,2,1,0],[51,2,0,0],[52,0,0,0],[64,0,1,1],[65,0,2,0],[80,0,1,0],[81,0,1,0],[82,0,0,1],[83,0,1,0]])Q[o]=512|i|a<<3|b<<6
const F={16:(a,b)=>a+b|0,17:(a,b)=>a-b|0,18:(a,b)=>Math.imul(a,b),24:(a,b)=>a&b,25:(a,b)=>a|b,26:(a,b)=>a^b,28:(a,b)=>a<<(b&31),29:(a,b)=>a>>(b&31),30:(a,b)=>a>>>(b&31)|0,32:(a,b)=>a===b?1:0,33:(a,b)=>a<b?1:0,34:(a,b)=>a>>>0<b>>>0?1:0}
function run(p,x){
let D=[],C=[],m=new Int32Array(256),o=[],pc=0,ip=0,s=0
for(;;){
if(++s>1e6)return[o,10]
if(pc<0||pc>=p.length)return[o,9]
const op=p[pc],v=Q[op]
if(op&&!v)return[o,5]
const im=v&7,po=v>>3&7,pu=v>>6
if(pc+im>=p.length)return[o,9]
if(D.length<po)return[o,2]
if(D.length-po+pu>256)return[o,3]
pc+=1+im
if(op<16)switch(op){
case 0:return[o,0]
case 1:D.push(p[pc-1]<<24>>24);continue
case 2:D.push(p[pc-4]|p[pc-3]<<8|p[pc-2]<<16|p[pc-1]<<24);continue
case 3:D.pop();continue
case 4:D.push(D[D.length-1]);continue
case 5:{const t=D[D.length-2];D[D.length-2]=D[D.length-1];D[D.length-1]=t;continue}
case 6:D.push(D[D.length-2]);continue
case 7:{const a=D[D.length-3];D[D.length-3]=D[D.length-2];D[D.length-2]=D[D.length-1];D[D.length-1]=a;continue}}
if(op<35){
if(op===23){D.push(-D.pop()|0);continue}
if(op===27){D.push(~D.pop());continue}
const b=D.pop(),a=D.pop()
if(b===0&&op>18&&op<23)return[o,4]
if(op===19)D.push(a===-2147483648&&b===-1?a:a/b|0)
else if(op===20)D.push(b===-1?0:a%b|0)
else if(op===21)D.push(Math.floor((a>>>0)/(b>>>0))|0)
else if(op===22)D.push((a>>>0)%(b>>>0)|0)
else D.push(F[op](a,b))
continue}
if(op<51){
const rel=(p[pc-2]|p[pc-1]<<8)<<16>>16
const take=op===48||(op===49?D.pop()===0:D.pop()!==0)
if(take)pc+=rel
continue}
switch(op){
case 51:if(C.length>63)return[o,7];C.push(pc);pc=p[pc-2]|p[pc-1]<<8;continue
case 52:if(!C.length)return[o,8];pc=C.pop();continue
case 64:{const a=D[D.length-1];if(a<0||a>255)return[o,6];D[D.length-1]=m[a];continue}
case 65:{const a=D[D.length-1];if(a<0||a>255)return[o,6];const w=D[D.length-2];D.length-=2;m[a]=w;continue}
case 80:{const b=T8.encode(''+D[D.length-1]);if(o.length+b.length>65536)return[o,11];D.pop();for(const c of b)o.push(c);continue}
case 81:if(o.length>65535)return[o,11];o.push(D.pop()&255);continue
case 82:D.push(ip<x.length?x[ip++]:-1);continue
case 83:return[o,D.pop()&255]}}}
for(const id of E(I).sort()){
const[r,c]=run(new Uint8Array(R(I+'/'+id+'/program.bin')),new Uint8Array(R(I+'/'+id+'/input.bin')))
K(O+'/'+id,{recursive:true})
W(O+'/'+id+'/stdout.bin',Buffer.from(r))
W(O+'/'+id+'/exit.txt',c+'\n')}
