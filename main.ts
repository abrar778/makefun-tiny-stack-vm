// Tiny stack VM, full ISA v1 per vm.mjs (all 38 opcodes, exact 32-bit
// wrapping/unsigned semantics, traps 2-11, reference limits).
import{readFileSync as R,writeFileSync as W,mkdirSync as K,readdirSync as E}from'node:fs'
const IN=process.env.MAKEFUN_INPUT_DIR??'/input',OUT=process.env.MAKEFUN_OUTPUT_DIR??'/output',utf8=new TextEncoder
const OP=new Uint16Array(84)
for(let k=16;k<35;k++)if(k!=23&&k!=27)OP[k]=256|2<<3|1<<6
for(const[o,i,a,b]of[[1,1,0,1],[2,4,0,1],[3,0,1,0],[4,0,1,2],[5,0,2,2],[6,0,2,3],[7,0,3,3],[23,0,1,1],[27,0,1,1],[48,2,0,0],[49,2,1,0],[50,2,1,0],[51,2,0,0],[52,0,0,0],[64,0,1,1],[65,0,2,0],[80,0,1,0],[81,0,1,0],[82,0,0,1],[83,0,1,0]])OP[o]=256|i|a<<3|b<<6
const BIN={16:(a,b)=>a+b|0,17:(a,b)=>a-b|0,18:(a,b)=>Math.imul(a,b),24:(a,b)=>a&b,25:(a,b)=>a|b,26:(a,b)=>a^b,28:(a,b)=>a<<(b&31),29:(a,b)=>a>>(b&31),30:(a,b)=>a>>>(b&31)|0,32:(a,b)=>a===b?1:0,33:(a,b)=>a<b?1:0,34:(a,b)=>a>>>0<b>>>0?1:0}
function run(p,x){
let st=[],call=[],mem=new Int32Array(256),out=[],pc=0,ip=0,steps=0
for(;;){
if(++steps>1e6)return[out,10]
if(pc<0||pc>=p.length)return[out,9]
const op=p[pc],v=OP[op]
if(!v)return[out,5]
const imm=v&7,pops=v>>3&7,push=v>>6
if(pc+imm>=p.length)return[out,9]
if(st.length<pops)return[out,2]
if(st.length-pops+push>256)return[out,3]
pc+=1+imm
if(op<16)switch(op){
case 0:return[out,0]
case 1:st.push(p[pc-1]<<24>>24);continue
case 2:st.push(p[pc-4]|p[pc-3]<<8|p[pc-2]<<16|p[pc-1]<<24);continue
case 3:st.pop();continue
case 4:st.push(st[st.length-1]);continue
case 5:{const t=st[st.length-2];st[st.length-2]=st[st.length-1];st[st.length-1]=t;continue}
case 6:st.push(st[st.length-2]);continue
case 7:{const a=st[st.length-3];st[st.length-3]=st[st.length-2];st[st.length-2]=st[st.length-1];st[st.length-1]=a;continue}}
if(op<35){
if(op===23){st.push(-st.pop()|0);continue}
if(op===27){st.push(~st.pop());continue}
const b=st.pop(),a=st.pop()
if(b===0&&op>18&&op<23)return[out,4]
if(op===19)st.push(a===-2147483648&&b===-1?a:a/b|0)
else if(op===20)st.push(b===-1?0:a%b|0)
else if(op===21)st.push(Math.floor((a>>>0)/(b>>>0))|0)
else if(op===22)st.push((a>>>0)%(b>>>0)|0)
else st.push(BIN[op](a,b))
continue}
if(op<51){
const rel=(p[pc-2]|p[pc-1]<<8)<<16>>16
const take=op===48||(op===49?st.pop()===0:st.pop()!==0)
if(take)pc+=rel
continue}
switch(op){
case 51:if(call.length>63)return[out,7];call.push(pc);pc=p[pc-2]|p[pc-1]<<8;continue
case 52:if(!call.length)return[out,8];pc=call.pop();continue
case 64:{const a=st[st.length-1];if(a<0||a>255)return[out,6];st[st.length-1]=mem[a];continue}
case 65:{const a=st[st.length-1];if(a<0||a>255)return[out,6];const w=st[st.length-2];st.length-=2;mem[a]=w;continue}
case 80:{const b=utf8.encode(''+st[st.length-1]);if(out.length+b.length>65536)return[out,11];st.pop();for(const c of b)out.push(c);continue}
case 81:if(out.length>65535)return[out,11];out.push(st.pop()&255);continue
case 82:st.push(ip<x.length?x[ip++]:-1);continue
case 83:return[out,st.pop()&255]}}}
for(const id of E(IN).sort()){
const[r,c]=run(new Uint8Array(R(IN+'/'+id+'/program.bin')),new Uint8Array(R(IN+'/'+id+'/input.bin')))
K(OUT+'/'+id,{recursive:true})
W(OUT+'/'+id+'/stdout.bin',Buffer.from(r))
W(OUT+'/'+id+'/exit.txt',c+'\n')}
