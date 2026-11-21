(function () {
    var mount = document.getElementById('cxMount');
    var tpl = document.getElementById('cxTpl');
    var host = document.getElementById('calcHost');
    if (!mount || !tpl || !host) return;
    var LAND_KEY = 'nexa.calc.land.v1';
    var started = false;
    var api = null;
    var land = false;
    try { land = localStorage.getItem(LAND_KEY) === '1'; } catch (e) {}
    var btnLand = document.getElementById('calcLand');
    var btnFs = document.getElementById('calcFs');

    function start() {
        started = true;
        var root = mount.attachShadow({ mode: 'open' });
        root.appendChild(tpl.content.cloneNode(true));
        var link = root.querySelector('link');
        var booted = false;
        function boot() {
            if (booted) return;
            booted = true;
            run(root);
            if (api) api.setLand(land);
        }
        if (link) {
            link.addEventListener('load', boot);
            link.addEventListener('error', boot);
            setTimeout(boot, 1500);
        } else boot();
    }

    function run(root) {

        const $=s=>root.querySelector(s);
        const rn=x=>{x=parseFloat((+x).toPrecision(10));return Object.is(x,-0)?0:x};
        let ang=0;const AN=["DEG","RAD","GRA"],ratio=()=>[Math.PI/180,1,Math.PI/200][ang];
        const vars={A:0,B:0,C:0,D:0,E:0,F:0,M:0,X:0,Y:0,Ans:0,PreAns:0};
        let mode='cal',bnBase=0,cmode=false,io=1,nf=['norm',2],mixed=false,cxPolar=false,dmark=false,dsep=false,esym=false;

        const fact=n=>{if(typeof n!=="number"||n<0||n%1||n>69)return NaN;let r=1;for(let i=2;i<=n;i++)r*=i;return r};
        const nCr=(n,r)=>{if(!Number.isInteger(n)||!Number.isInteger(r)||r<0||r>n||n>=1e10)return NaN;r=Math.min(r,n-r);let v=1n;const N0=BigInt(n);for(let i=1;i<=r;i++){v=v*(N0-BigInt(r)+BigInt(i))/BigInt(i);if(v>=10n**100n)return NaN}return Number(v)};
        const nPr=(n,r)=>{if(!Number.isInteger(n)||!Number.isInteger(r)||r<0||r>n||n>=1e10)return NaN;let v=1n;for(let i=0;i<r;i++){v*=BigInt(n-i);if(v>=10n**100n)return NaN}return Number(v)};
        const gcd0=(a,b)=>b?gcd0(b,a%b):Math.abs(a);
        const gcd=(a,b)=>{if(!Number.isInteger(a)||!Number.isInteger(b)||Math.abs(a)>=1e10||Math.abs(b)>=1e10)return NaN;return gcd0(a,b)},lcm=(a,b)=>{if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=1e10||b>=1e10)return NaN;return a&&b?a/gcd0(a,b)*b:0};
        const z0=v=>Math.abs(v)<1e-15?0:v;
        const store={MatA:null,MatB:null,MatC:null,MatD:null,VctA:null,VctB:null,VctC:null,VctD:null};
        const isC=x=>x!==null&&typeof x==="object"&&"re" in x,isM=x=>x!==null&&typeof x==="object"&&"m" in x,isV=x=>x!==null&&typeof x==="object"&&"v" in x;
        const cx=x=>isC(x)?x:{re:x,im:0},mkC=(re,im)=>{const m=Math.max(1,Math.abs(re),Math.abs(im));if(Math.abs(im)<1e-13*m)return re;if(Math.abs(re)<1e-13*m)re=0;return{re,im}};
        const err=()=>{throw new Error("math")};
        const rg=x=>{if(typeof x==="number"&&isFinite(x)){const a=Math.abs(x);if(a>=1e100)err();if(a!==0&&a<1e-99)return 0}return x};
        const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((q,x,k)=>q+x*B[k][j],0)));
        const isN=x=>typeof x==="number";
        function add(a,b,sg=1){if(isS(a)||isS(b)){if(isM(a)||isM(b)||isV(a)||isV(b)||isC(a)||isC(b)){a=nv(a);b=nv(b)}else return sAdd(a,b,sg)}

         if(isM(a)&&isM(b)){if(a.m.length!==b.m.length||a.m[0].length!==b.m[0].length)err();return{m:a.m.map((r,i)=>r.map((x,j)=>x+sg*b.m[i][j]))}}
         if(isV(a)&&isV(b)){if(a.v.length!==b.v.length)err();return{v:a.v.map((x,i)=>x+sg*b.v[i])}}
         if(isM(a)||isM(b)||isV(a)||isV(b))err();
         if(isC(a)||isC(b)){a=cx(a);b=cx(b);return mkC(a.re+sg*b.re,a.im+sg*b.im)}
         return rg(a+sg*b)}
        function mul(a,b){if(isS(a)||isS(b)){if(isM(a)||isM(b)||isV(a)||isV(b)||isC(a)||isC(b)){a=nv(a);b=nv(b)}else return sMul(a,b)}

         if(isM(a)&&isM(b)){if(a.m[0].length!==b.m.length)err();return{m:mm(a.m,b.m)}}
         if(isM(a)&&isN(b))return{m:a.m.map(r=>r.map(x=>x*b))};
         if(isM(b)&&isN(a))return mul(b,a);
         if(isV(a)&&isV(b)){if(a.v.length!==3||b.v.length!==3)err();const[x,y,z]=a.v,[p,q,r]=b.v;return{v:[y*r-z*q,z*p-x*r,x*q-y*p]}}
         if(isV(a)&&isN(b))return{v:a.v.map(x=>x*b)};
         if(isV(b)&&isN(a))return mul(b,a);
         if(isM(a)||isM(b)||isV(a)||isV(b))err();
         if(isC(a)||isC(b)){a=cx(a);b=cx(b);return mkC(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re)}
         return rg(a*b)}
        function dv(a,b){if(isS(a)||isS(b)){if(isM(a)||isM(b)||isV(a)||isV(b)||isC(a)||isC(b)){a=nv(a);b=nv(b)}else return sDiv(a,b)}

         if(isM(a)&&isN(b))return{m:a.m.map(r=>r.map(x=>x/b))};
         if(isV(a)&&isN(b))return{v:a.v.map(x=>x/b)};
         if(isM(a)||isM(b)||isV(a)||isV(b))err();
         if(isC(a)||isC(b)){a=cx(a);b=cx(b);const d=b.re*b.re+b.im*b.im;if(!d)err();return mkC((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d)}
         return rg(a/b)}
        function minv(A){const n=A.length;if(n!==A[0].length)err();const R=gj(A.map((r,i)=>[...r,...A.map((_,j)=>i==j?1:0)]));if(!R)err();return R.map(r=>r.slice(n))}
        function pw(a,b){if(isS(a)){if(Number.isInteger(b)&&Math.abs(b)<=16)return sPowI(a,b);a=nv(a)}if(isS(b))b=nv(b);if(typeof a==='number'&&typeof b==='number'&&Math.abs(b-.5)<1e-15&&a>0)return N.sqrt(a);

         if(isM(a)){if(!Number.isInteger(b)||a.m.length!==a.m[0].length)err();const M=b<0?minv(a.m):a.m;let R=a.m.map((r,i)=>r.map((_,j)=>i==j?1:0));for(let i=0;i<Math.abs(b);i++)R=mm(R,M);return{m:R}}
         if(isV(a)||isM(b)||isV(b))err();
         if(isC(a)||isC(b)||(cmode&&a<0&&!Number.isInteger(b))){if(isC(b)||!Number.isInteger(b)||Math.abs(b)>64){const z=cx(a),w=cx(b);if(!z.re&&!z.im){if(w.re>0&&!w.im)return 0;err()}return cexp(cmul(w,cln(z)))}let R=1;const n=Math.abs(b);for(let i=0;i<n;i++)R=mul(R,a);return b<0?dv(1,R):R}
         if(a===0&&b<=0)err();
         if(a<0&&!Number.isInteger(b)){const f=frac(b);if(f&&f[1]%2)return rg((f[0]%2?-1:1)*Math.pow(-a,b))}
         return rg(Math.pow(a,b))}
        const neg=a=>mul(a,-1);

        const isS=x=>x!==null&&typeof x==="object"&&"sd" in x;
        const sNum=a=>a.sd.reduce((q,[k,p,d])=>q+p/d*Math.sqrt(k),0),nv=v=>isS(v)?sNum(v):v;
        const gI=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1};
        const qAdd=([a,b],[c,d])=>{const n=a*d+c*b,m=b*d,g=gI(n,m);return[n/g,m/g]},qMul=([a,b],[c,d])=>{const n=a*c,m=b*d,g=gI(n,m);return[n/g,m/g]};
        function sqf(n){let o=1,i=n;for(let d=2;d*d<=i;d++)while(i%(d*d)===0){i/=d*d;o*=d}return[o,i]}
        function asQ(n){if(typeof n!=="number"||!isFinite(n))return null;if(Number.isInteger(n))return Math.abs(n)>1e9?null:[n,1];const f=frac(n);if(!f||Math.abs(n-f[0]/f[1])>1e-12*Math.max(1,Math.abs(n)))return null;return f}
        function toTerms(x){if(isS(x))return x.sd.map(t=>[...t]);const q=asQ(x);return q?[[1,q[0],q[1]]]:null}
        function mkS(T){const m=new Map();for(const[k,p,d]of T){const c=qAdd(m.get(k)||[0,1],[p,d]);if(Math.abs(c[0])>1e9||c[1]>1e9)throw new Error("big");m.set(k,c)}
         const o=[...m].filter(([k,c])=>c[0]!==0).sort((a,b)=>a[0]-b[0]).map(([k,c])=>[k,c[0],c[1]]);
         if(!o.length)return 0;if(o.length===1&&o[0][0]===1)return o[0][1]/o[0][2];return{sd:o}}
        const sOp=(f,a,b)=>{try{const A=toTerms(a),B=toTerms(b);return A&&B?f(A,B):null}catch(e){return null}};
        const sAdd=(a,b,sg)=>sOp((A,B)=>mkS([...A,...B.map(([k,p,d])=>[k,sg*p,d])]),a,b)??nv(a)+sg*nv(b);
        function tMul(A,B){const T=[];for(const[k1,p1,d1]of A)for(const[k2,p2,d2]of B){const[o,i]=sqf(k1*k2),c=qMul(qMul([p1,d1],[p2,d2]),[o,1]);T.push([i,c[0],c[1]])}return mkS(T)}
        const sMul=(a,b)=>sOp(tMul,a,b)??nv(a)*nv(b);
        function sDiv(a,b){const r=sOp((A,B)=>{
         if(B.length===1){const[k,p,d]=B[0];if(!p)return null;const y=p*k,x=d;return tMul(A,[[k,y<0?-x:x,Math.abs(y)]])}
         if(B.length===2){const C=[B[0],[B[1][0],-B[1][1],B[1][2]]],den=tMul(B,C);if(typeof den!=="number"||!den)return null;return sDiv(tMul(A,C),den)}
         return null},a,b);return r??nv(a)/nv(b)}
        function sPowI(a,n){if(n<0)return sDiv(1,sPowI(a,-n));let r=1;for(let i=0;i<n;i++)r=sMul(r,a);return r}
        function sSqrt(x){if(isS(x))return Math.sqrt(nv(x));if(!(x>=0))return NaN;const q=asQ(x);if(!q||q[0]*q[1]>1e12)return Math.sqrt(x);const[o,i]=sqf(q[0]*q[1]);return mkS([[i,o,q[1]]])}
        const SR={0:0,30:[[1,1,2]],45:[[2,1,2]],60:[[3,1,2]],90:[[1,1,1]]};
        function sinD(r){let sg=1,a=r;if(r>180){sg=-1;a=r-180}if(a>90)a=180-a;const t=SR[a];if(t===undefined)return;const v=t===0?0:mkS(t);return sg===1?v:neg(v)}
        function sTrig(f,x){if(ang!==0||typeof x!=="number"||!Number.isInteger(x))return;const r=((x%360)+360)%360;if(r%30&&r%45)return;
         if(f===0)return sinD(r);const c=sinD((r+90)%360);if(f===1)return c;const sn=sinD(r);if(!c)throw new Error("math");return sDiv(sn,c)}
        const radHtml=(c,idx)=>'<span class="rt">'+(idx!==undefined?'<sup class="su ix">'+idx+'</sup>':'')+'<span class="rad"><svg viewBox="0 0 12 24" preserveAspectRatio="none"><path d="M0.6 15.5 L3 13.2 L6.2 22.6 L11.6 0.6"/></svg><span class="rc"><span class="ri">'+c+'</span></span></span></span>';
        const absHtml=c=>'<span class="ab"><span class="ri">'+c+'</span></span>';
        function surdHtml(v){const T=v.sd,D=T.reduce((a,[,,d])=>a/gI(a,d)*d,1);let cs=T.map(([k,p,d])=>[k,p*(D/d)]),sg="";
         if(cs.length===1&&cs[0][1]<0){sg="−";cs=[[cs[0][0],-cs[0][1]]]}
         const rad=k=>radHtml(k),co=(k,c)=>k===1?Math.abs(c):(Math.abs(c)===1?"":Math.abs(c));
         const sgn=(c,i)=>c<0?"−":(i?"+":"");
         const h=cs.map(([k,c],i)=>sgn(c,i)+co(k,c)+(k===1?"":rad(k))).join(""),t=cs.map(([k,c],i)=>sgn(c,i)+co(k,c)+(k===1?"":"√"+k)).join("");
         return D===1?[sg+h,sg+t]:[sg+'<span class="fr"><span>'+h+'</span><span>'+D+'</span></span>',sg+(cs.length>1?"("+t+")":t)+"/"+D]}
        const trg=x=>{if(Math.abs(x)>=[9e9,157079632.7,1e10][ang])err()};
        const tn=x=>{const k=x*ratio()/(Math.PI/2),r=Math.round(k);if(r%2&&Math.abs(k-r)<1e-12*Math.max(1,Math.abs(k)))err();return z0(Math.tan(x*ratio()))};
        const cmul=(a,b)=>{a=cx(a);b=cx(b);return{re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re}},cadd=(a,b)=>({re:a.re+b.re,im:a.im+b.im}),csub=(a,b)=>({re:a.re-b.re,im:a.im-b.im});
        const cexp=z=>{z=cx(z);const m=Math.exp(z.re);return mkC(m*Math.cos(z.im),m*Math.sin(z.im))};
        const cln=z=>{z=cx(z);const m=Math.hypot(z.re,z.im);if(!m)err();return{re:Math.log(m),im:Math.atan2(z.im,z.re)}};
        const csqrt=z=>{const m=Math.hypot(z.re,z.im),r=Math.sqrt((m+z.re)/2),i=Math.sqrt(Math.max(0,(m-z.re)/2));return{re:r,im:z.im<0?-i:i}};
        const CZ={sin:z=>({re:Math.sin(z.re)*Math.cosh(z.im),im:Math.cos(z.re)*Math.sinh(z.im)}),cos:z=>({re:Math.cos(z.re)*Math.cosh(z.im),im:-Math.sin(z.re)*Math.sinh(z.im)}),sinh:z=>({re:Math.sinh(z.re)*Math.cos(z.im),im:Math.cosh(z.re)*Math.sin(z.im)}),cosh:z=>({re:Math.cosh(z.re)*Math.cos(z.im),im:Math.sinh(z.re)*Math.sin(z.im)})};
        const cfun=(k,deg,x)=>{const sc=deg?ratio():1,c=cx(x),z={re:c.re*sc,im:c.im*sc};
         if(k==="tan"||k==="tanh"){const a=CZ[k==="tan"?"sin":"sinh"](z),b=CZ[k==="tan"?"cos":"cosh"](z);return dv(mkC(a.re,a.im),mkC(b.re,b.im))}
         const r=CZ[k](z);return mkC(r.re,r.im)};
        const cinv=(k,x)=>{const z=cx(x),I={re:0,im:1},one={re:1,im:0};let r;
         if(k==="asin"||k==="acos"){const w=cln(cadd(cmul(I,z),csqrt(csub(one,cmul(z,z)))));const as=cmul({re:0,im:-1},w);r=k==="asin"?as:csub({re:Math.PI/2,im:0},as)}
         else{const iz=cmul(I,z);r=cmul({re:0,im:.5},csub(cln(csub(one,iz)),cln(cadd(one,iz))))}
         return mkC(r.re/ratio(),r.im/ratio())};
        const lnC=(x,d)=>{const r=cln(x);return mkC(r.re/d,r.im/d)};
        const CPX=new Set("sqrt abs Abs Arg Conjg Re Im Det Trn Dot Ang sin cos tan sinh cosh tanh ln log asin acos atan".split(" "));
        const AR={deriv:2,integ:3,sigma:3,logb:2,root:2,mod:2,gcd:2,lcm:2,nCr:2,nPr:2,RanInt:2,Pol:2,Rec:2,Dot:2,Ang:2,rand:0,And:2,Or:2,Xor:2,Xnor:2};
        const N={sin:x=>isC(x)?cfun("sin",1,x):(trg(x),sTrig(0,x)??z0(Math.sin(x*ratio()))),cos:x=>isC(x)?cfun("cos",1,x):(trg(x),sTrig(1,x)??z0(Math.cos(x*ratio()))),tan:x=>isC(x)?cfun("tan",1,x):(trg(x),sTrig(2,x)??tn(x)),
         asin:x=>isC(x)||(cmode&&Math.abs(x)>1)?cinv("asin",x):Math.asin(x)/ratio(),acos:x=>isC(x)||(cmode&&Math.abs(x)>1)?cinv("acos",x):Math.acos(x)/ratio(),atan:x=>isC(x)?cinv("atan",x):Math.atan(x)/ratio(),
         asinh:Math.asinh,acosh:Math.acosh,atanh:Math.atanh,
         sinh:x=>isC(x)?cfun("sinh",0,x):(Math.abs(x)>230.2585092?err():Math.sinh(x)),cosh:x=>isC(x)?cfun("cosh",0,x):(Math.abs(x)>230.2585092?err():Math.cosh(x)),tanh:x=>isC(x)?cfun("tanh",0,x):Math.tanh(x),
         ln:x=>isC(x)?lnC(x,1):(x<0&&cmode?mkC(Math.log(-x),Math.PI):Math.log(x)),log:x=>isC(x)?lnC(x,Math.LN10):(x<0&&cmode?mkC(Math.log10(-x),Math.PI/Math.LN10):Math.log10(x)),cbrt:Math.cbrt,exp:Math.exp,
         sqrt:x=>isC(x)?pw(x,.5):isS(x)?Math.sqrt(nv(x)):(x<0&&cmode?{re:0,im:Math.sqrt(-x)}:sSqrt(x)),
         abs:x=>isS(x)?(nv(x)<0?neg(x):x):isC(x)?Math.hypot(x.re,x.im):isV(x)?Math.hypot(...x.v):isM(x)?err():Math.abs(x),
         Int:Math.trunc,Floor:Math.floor,Ceil:Math.ceil,round:Math.round,nCr,nPr,gcd,lcm,fact,
         logb:(b,x)=>Math.log(x)/Math.log(b),root:(n,x)=>x<0&&n%2?-Math.pow(-x,1/n):Math.pow(x,1/n),mod:(a,b)=>((a%b)+b)%b,
         rand:()=>Math.random(),RanInt:(a,b)=>{if(!Number.isInteger(a)||!Number.isInteger(b)||a>b||Math.abs(a)>=1e10||Math.abs(b)>=1e10)err();return a+Math.floor(Math.random()*(b-a+1))},
         Pol:(x,y)=>{const r=Math.hypot(x,y),t=parseFloat((Math.atan2(y,x)/ratio()).toPrecision(15));vars.X=r;vars.Y=t;pairOut=["r","θ",parseFloat(r.toPrecision(15)),t];return r},Rec:(r,t)=>{const x=r*nv(N.cos(t)),y=r*nv(N.sin(t));vars.X=x;vars.Y=y;pairOut=["x","y",parseFloat(x.toPrecision(15)),parseFloat(y.toPrecision(15))];return x},
         Arg:x=>{x=cx(x);return Math.atan2(x.im,x.re)/ratio()},Conjg:x=>{x=cx(x);return mkC(x.re,-x.im)},Re:x=>cx(x).re,Im:x=>cx(x).im,
         Det:x=>{if(!isM(x)||x.m.length!==x.m[0].length)err();return det(x.m)},Trn:x=>{if(!isM(x))err();return{m:x.m[0].map((_,j)=>x.m.map(r=>r[j]))}},
         Ident:n=>({m:Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i==j?1:0))}),
         Dot:(a,b)=>{if(!isV(a)||!isV(b)||a.v.length!==b.v.length)err();return a.v.reduce((q,x,i)=>q+x*b.v[i],0)},
         Ang:(a,b)=>{if(!isV(a)||!isV(b))err();return Math.acos(N.Dot(a,b)/(Math.hypot(...a.v)*Math.hypot(...b.v)))/ratio()},
         And:(a,b)=>a&b,Or:(a,b)=>a|b,Xor:(a,b)=>a^b,Xnor:(a,b)=>~(a^b),Not:a=>~a,Neg:a=>-a};
        N.Abs=N.abs;
        const XGK=[0.991455371120812639206854697526329,0.949107912342758524526189684047851,0.864864423359769072789712788640926,0.741531185599394439863864773280788,0.586087235467691130294144838258730,0.405845151377397166906606412076961,0.207784955007898467600689403773245,0],
        WGK=[0.022935322010529224963732008058970,0.063092092629978553290700663189204,0.104790010322250183839876322541518,0.140653259715525918745189590510238,0.169004726639267902826583426598550,0.190350578064785409913256402421014,0.204432940075298892414161999234649,0.209482141084727828012999174891714],
        WG=[0.129484966168869693270611432679082,0.279705391489276667901467771423780,0.381830050505118944950369775488975,0.417959183673469387755102040816327];
        function gk(f,a,b){const c=(a+b)/2,h=(b-a)/2,fc=f(c);let K=fc*WGK[7],G=fc*WG[3];
         for(let j=0;j<7;j++){const x=h*XGK[j],s=f(c-x)+f(c+x);K+=WGK[j]*s;if(j%2)G+=WG[(j-1)/2]*s}
         return[K*h,Math.abs((K-G)*h)]}
        const L={
         deriv:(f,a)=>{const x=a[0],h=1e-4*(Math.abs(x)||1),f1=f(x+2*h),f2=f(x+h),f3=f(x-h),f4=f(x-2*h),v=(-f1+8*f2-8*f3+f4)/(12*h);if(!isFinite(v))err();const sc=(Math.abs(f1)+8*Math.abs(f2)+8*Math.abs(f3)+Math.abs(f4))/(12*h);return Math.abs(v)<1e-12*sc?0:v},
         integ:(f,a)=>{let lo=a[0],hi=a[1];if(!isFinite(lo)||!isFinite(hi))err();if(lo===hi)return 0;let sg=1;if(lo>hi){[lo,hi]=[hi,lo];sg=-1}
          const F=x=>{const y=f(x);if(typeof y!=="number"||!isFinite(y))err();return y};
          const bp=[lo,hi];if(hi-lo>100){if(lo<0&&hi>0)bp.push(0);for(let p=1;p<=1e99;p*=10){if(p>lo&&p<hi)bp.push(p);if(-p>lo&&-p<hi)bp.push(-p);if(p>Math.max(Math.abs(lo),Math.abs(hi)))break}}
          bp.sort((x,y)=>x-y);const segs=[];
          for(let i=0;i<bp.length-1;i++){const u=bp[i],w=bp[i+1];if(w<=u)continue;const n=bp.length>40?1:4;for(let k=0;k<n;k++){const x0=u+(w-u)*k/n,x1=k===n-1?w:u+(w-u)*(k+1)/n,[v,e]=gk(F,x0,x1);segs.push({a:x0,b:x1,v,e})}}
          let tot=0,er=0,it=0;const sum=()=>{tot=0;er=0;for(const q of segs){tot+=q.v;er+=q.e}};sum();
          while(er>Math.max(1e-11*Math.abs(tot),1e-14)&&it<600){it++;let m=0;for(let i=1;i<segs.length;i++)if(segs[i].e>segs[m].e)m=i;const q=segs[m],c=(q.a+q.b)/2;if(!(c>q.a&&c<q.b))break;
           const[v1,e1]=gk(F,q.a,c),[v2,e2]=gk(F,c,q.b);segs.splice(m,1,{a:q.a,b:c,v:v1,e:e1},{a:c,b:q.b,v:v2,e:e2});sum()}
          if(er>Math.max(1e-7*Math.abs(tot),1e-10))err();
          if(Math.abs(tot)<=er*20&&Math.abs(tot)<1e-9)return 0;
          return sg*tot},
         sigma:(f,a)=>{const lo=a[0],hi=a[1];if(!Number.isInteger(lo)||!Number.isInteger(hi)||hi-lo>1e7)err();let q=0;for(let i=lo;i<=hi;i++){const y=f(i);if(typeof y!=="number"||!isFinite(y))err();q+=y}return q}};

        function evalExpr(s,comp){
         let p=0;
         const peek=()=>{while(s[p]===" ")p++;return s[p]};
         const bad=()=>{throw new Error("syntax")};
         const LW=/^(And|Or|Xor|Xnor)(?![a-z])/,isLW=()=>{peek();return LW.test(s.slice(p))};
         function lg(){let l=expr_();for(;;){if(!isLW())return l;const w=LW.exec(s.slice(p))[1];p+=w.length;const a=l,b=expr_(),f=N[w];l=()=>f(a(),b())}}
         function expr_(){let l=term();for(;;){const c=peek();if(c==="+"||c==="-"||c==="−"){p++;const a=l,b=term(),sg=c==="+"?1:-1;l=()=>add(a(),b(),sg)}else return l}}
         const isNC=()=>{peek();return /^(nCr|nPr)(?!\()/.test(s.slice(p))};
         function term(){let l=nc();for(;;){const c=peek();
          if(c==="*"||c==="×"){p++;const a=l,b=nc();l=()=>mul(a(),b())}
          else if(c==="/"||c==="÷"){p++;const a=l,b=nc();l=()=>dv(a(),b())}else return l}}
         function nc(){let l=im();for(;;){peek();
          if(isNC()){const w=s.slice(p,p+3);p+=3;const a=l,b=im();l=()=>N[w](nv(a()),nv(b()))}
          else if(s[p]==="∠"){p++;const a=l,b=im();l=()=>{const r=a(),t=b()*ratio();return mkC(r*Math.cos(t),r*Math.sin(t))}}
          else return l}}
         function im(){let l=unary();for(;;){const c=peek();let q=p-1;while(s[q]===" ")q--;const pv=s[q];
          if(c&&!isLW()&&!isNC()&&(/[(πA-Za-z√]/.test(c)||(/[\d.]/.test(c)&&pv===")"))){const a=l,b=unary();l=()=>mul(a(),b())}else return l}}
         function unary(){const c=peek();if(c==="-"||c==="−"){p++;const a=unary();return()=>neg(a())}if(c==="+"){p++;return unary()}return power()}
         function power(){const b=post();if(peek()==="^"){p++;const e=unary();return()=>pw(b(),e())}return b}
         function post(){let a=primary();for(;;){const c=peek(),q=a;if(c==="!"){p++;a=()=>fact(nv(q()))}else if(c==="%"){p++;a=()=>dv(q(),100)}else if(c==="°"){p++;let ex_=0;const mm=s.slice(p).match(/^(\d+\.?\d*)′/);if(mm){p+=mm[0].length;ex_+=parseFloat(mm[1])/60;const ss=s.slice(p).match(/^(\d+\.?\d*)″/);if(ss){p+=ss[0].length;ex_+=parseFloat(ss[1])/3600}}a=()=>(nv(q())+ex_)*Math.PI/180/ratio()}else return a}}
         function close(){if(peek()===")")p++;else if(peek()!==undefined)bad()}
         function primary(){
          const c=peek();if(c===undefined)bad();
          if(/[\d.]/.test(c)){const m=s.slice(p).match(/^(\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);if(!m)bad();p+=m[0].length;const v=rg(parseFloat(m[0]));return()=>v}
          if(c==="("){p++;const e=lg();close();return e}
          if(c==="π"){p++;return()=>Math.PI}
          if(c==="√"){p++;const a=post();return()=>N.sqrt(a())}
          const m=s.slice(p).match(/^[A-Za-z]+/);if(!m)bad();const nm=m[0];p+=nm.length;
          if(peek()==="("){p++;const args=[];if(peek()!==")"){for(;;){args.push(lg());if(peek()===","){p++;continue}break}}close();
           {const need=AR[nm]===undefined?1:AR[nm];if((L[nm]||N[nm])&&args.length!==need)bad()}
           if(L[nm]){const f=x=>{const o=vars.X;vars.X=x;try{return nv(args[0]())}finally{vars.X=o}};return()=>L[nm](f,args.slice(1).map(a=>nv(a())))}
           if(N[nm]){const ok=nm==='sqrt'||nm==='abs'||nm==='Abs';return()=>{const av=args.map(a=>a());if(!CPX.has(nm)&&av.some(v=>v!==null&&typeof v==='object'&&!isS(v)))err();return N[nm](...av.map(v=>ok?v:nv(v)))}}bad()}
          if(nm==="e")return()=>Math.E;
          if(nm==="i"){if(!cmode)bad();return()=>({re:0,im:1})}
          if(nm in store)return()=>{if(!store[nm])err();return store[nm]};
          if(nm in vars)return()=>vars[nm];bad()}
         const r=lg();if(peek()!==undefined)bad();return comp?r:r();
        }

        function dg(x,sig){const m=x.toExponential(14).match(/^(\d)\.(\d+)e([+-]\d+)$/);let D=m[1]+m[2],e=+m[3];
         if(sig<15){const up=D.charCodeAt(sig)>=53;D=D.slice(0,sig);if(up){let n=(BigInt(D)+1n).toString();if(n.length>sig){n=n.slice(0,sig);e++}D=n}}else D=D.padEnd(sig,"0");
         return{d:D,e}}
        function place(D,pos){let t;if(pos<=0)t="0."+"0".repeat(-pos)+D;else if(pos>=D.length)t=D+"0".repeat(pos-D.length);else t=D.slice(0,pos)+"."+D.slice(pos);
         return t.includes(".")?t.replace(/\.?0+$/,""):t}
        function numStr(v,mode,k,eng){
         if(v===0)return eng>0||mode==="norm"?"0":mode==="fix"?(0).toFixed(k):(0).toFixed(k-1)+"×10^0";
         const neg=v<0,a=Math.abs(v);let t;
         if(eng>0){const{d,e}=dg(a,10),ee=Math.floor(e/3)*3+3*(eng-1);t=place(d,e-ee+1)+(esym&&SI[ee]?SI[ee]:(ee?"×10^"+ee:""))}
         else if(mode==="fix"){if(a>=1e10)return numStr(v,"norm",2,0);const{d,e}=dg(a,15),pos=e+1+k;let N0;
          if(pos<0)N0=0n;else if(pos>=15)N0=BigInt(d+"0".repeat(pos-15));else N0=BigInt(d.slice(0,pos)||"0")+(d.charCodeAt(pos)>=53?1n:0n);
          let q=N0.toString().padStart(k+1,"0");t=k?q.slice(0,-k)+"."+q.slice(-k):q;if(N0===0n)return t}
         else if(mode==="sci"){const{d,e}=dg(a,k);t=d[0]+(k>1?"."+d.slice(1):"")+"×10^"+e}
         else{const{d,e}=dg(a,10);if(e>=10||e<(k===1?-2:-9))t=place(d,1)+"×10^"+e;else t=place(d,e+1)}
         return(neg?"-":"")+t}
        const fmt=v=>typeof v==="number"&&isFinite(v)?numStr(v,"norm",2,0):"Math ERROR";
        function frac(v){if(!isFinite(v)||v%1===0)return null;if(Math.abs(v-Math.round(v))<=2e-14*Math.max(1,Math.abs(v)))return null;const sg=v<0?-1:1,x=Math.abs(v);if(x<1e-9||x>=1e10)return null;let h1=1,h0=0,k1=0,k0=1,b=x;
         for(let i=0;i<40;i++){const a=Math.floor(b);[h1,h0]=[a*h1+h0,h1];[k1,k0]=[a*k1+k0,k1];if(String(h1).length+String(k1).length>9)return null;if(Math.abs(x-h1/k1)<=2e-14*x)return[sg*h1,k1];const r=b-a;if(r<1e-13)break;b=1/r}
         return null}

        const nums=s=>s.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        const mat=s=>s.trim().split(/\n+/).map(r=>r.trim().split(/[\s,]+/).map(Number));
        const mf=M=>M.map(r=>r.map(rn).join("\t")).join("\n");
        const mmul=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0)));
        function det(M){M=M.map(r=>[...r]);const n=M.length;let d=1;for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(M[r][i])>Math.abs(M[p][i]))p=r;if(Math.abs(M[p][i])<1e-12)return 0;if(p!=i){[M[p],M[i]]=[M[i],M[p]];d=-d}d*=M[i][i];for(let r=i+1;r<n;r++){const f=M[r][i]/M[i][i];for(let c=i;c<n;c++)M[r][c]-=f*M[i][c]}}return d}
        function gj(M){M=M.map(r=>[...r]);const n=M.length;for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(M[r][i])>Math.abs(M[p][i]))p=r;if(Math.abs(M[p][i])<1e-12)return null;[M[p],M[i]]=[M[i],M[p]];const d=M[i][i];M[i]=M[i].map(x=>x/d);for(let r=0;r<n;r++)if(r!=i){const f=M[r][i];M[r]=M[r].map((x,c)=>x-f*M[i][c])}}return M}
        const cm=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
        const cd=(a,b)=>{const d=b[0]**2+b[1]**2;return[(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]};
        function roots0(c){const a=c.map(x=>x/c[0]),n=a.length-1;let z=[],b=[1,0];for(let k=0;k<n;k++){z.push(b);b=cm(b,[0.4,0.9])}
         for(let t=0;t<600;t++)for(let i=0;i<n;i++){let v=[1,0];for(let j=1;j<=n;j++){v=cm(v,z[i]);v=[v[0]+a[j],v[1]]}
          let d=[1,0];for(let j=0;j<n;j++)if(j!=i)d=cm(d,[z[i][0]-z[j][0],z[i][1]-z[j][1]]);const q=cd(v,d);z[i]=[z[i][0]-q[0],z[i][1]-q[1]]}
         return z}
        function roots(c){const a=c.slice();
         if(a.length===3){const[A,B,C]=a,D=B*B-4*A*C;
          if(D>=0){let r1,r2;if(D===0)r1=r2=-B/(2*A);else{const q=-(B+(B<0?-1:1)*Math.sqrt(D))/2;r1=q/A;r2=C/q}return[[r1,0],[r2,0]].sort((x,y)=>x[0]-y[0])}
          return[[-B/(2*A),-Math.sqrt(-D)/(2*A)],[-B/(2*A),Math.sqrt(-D)/(2*A)]]}
         const z=roots0(a),n=z.length,used=Array(n).fill(false),out=[];
         const dp=(c,m)=>{let q=c.slice();for(let k=0;k<m;k++){const nn=q.length-1;q=q.slice(0,-1).map((x,i)=>x*(nn-i))}return q};
         const hz=(q,w)=>{let v=[q[0],0],d=[0,0];for(let j=1;j<q.length;j++){d=cm(d,w);d=[d[0]+v[0],d[1]+v[1]];v=cm(v,w);v[0]+=q[j]}return[v,d]};
         const refine=(w,m)=>{if(m<2)return w;const q=dp(a,m-1);for(let i=0;i<40;i++){const[v,d]=hz(q,w);if(!d[0]&&!d[1])break;const st=cd(v,d);w=[w[0]-st[0],w[1]-st[1]]}return w};
         const pv=w=>{let v=[a[0],0],S=Math.abs(a[0]);for(let j=1;j<=n;j++){v=cm(v,w);v[0]+=a[j];S=S*Math.hypot(...w)+Math.abs(a[j])}return[Math.hypot(...v),S]};
         for(let i=0;i<n;i++){if(used[i])continue;const cl=[];for(let j=i;j<n;j++)if(!used[j]&&Math.hypot(z[j][0]-z[i][0],z[j][1]-z[i][1])<=1e-3*Math.max(1,Math.hypot(...z[i])))cl.push(j);
          const w0=[cl.reduce((q,j)=>q+z[j][0],0)/cl.length,cl.reduce((q,j)=>q+z[j][1],0)/cl.length],w1=refine(w0,cl.length),p0=pv(w0),p1=pv(w1),w=p1[0]<=p0[0]?w1:w0,[pm,S]=p1[0]<=p0[0]?p1:p0;
          if(cl.length>1&&pm<=1e-10*S){cl.forEach(j=>used[j]=true);for(let k=0;k<cl.length;k++)out.push(w)}else{used[i]=true;out.push(z[i])}}
         return out.map(([re,im])=>{if(Math.abs(im)<=1e-9*Math.max(1,Math.abs(re)))im=0;return[parseFloat(re.toPrecision(13)),parseFloat(im.toPrecision(13))]}).sort((p,q)=>p[0]-q[0]||p[1]-q[1])}
        const fc=z=>{const a=rn(z[0]),b=rn(z[1]);if(!b)return""+a;const bs=Math.abs(b)==1?"":Math.abs(b);return(a?a+(b<0?" − ":" + "):(b<0?"−":""))+bs+"i"};
        const polar=z=>rn(Math.hypot(...z))+" ∠ "+rn(Math.atan2(z[1],z[0])*180/Math.PI)+"°";
        const cp=s=>{let re=0,im=0;(s.replace(/\s/g,"").match(/[+-]?[^+-]+/g)||[]).forEach(t=>{if(/i$/i.test(t)){const c=t.slice(0,-1);im+=(c===""||c==="+")?1:c==="-"?-1:parseFloat(c)}else re+=parseFloat(t)});return[re,im]};
        const U=[["طول",{m:1,km:1e3,cm:.01,mm:.001,mi:1609.344,ft:.3048,in:.0254,yd:.9144}],["كتلة",{kg:1,g:.001,lb:.45359237,oz:.028349523125}],
        ["حجم",{L:1,mL:.001,"m³":1e3,gal:3.785411784}],["زمن",{s:1,min:60,h:3600,day:86400}],["مساحة",{"m²":1,"km²":1e6,ha:1e4,"ft²":.09290304,acre:4046.8564224}],
        ["سرعة",{"m/s":1,"km/h":1/3.6,mph:.44704}],["طاقة",{J:1,kJ:1e3,cal:4.184,kWh:3.6e6}],["حرارة",{"°C":1,"°F":1,K:1}]];
        const uopts=U.map(([g,o])=>Object.keys(o).map(u=>g+"/"+u+":"+u+" ("+g+")").join("|")).join("|");
        const C=[["c  Speed of light","299792458"],["g  Std gravity","9.80665"],["h  Planck","6.62607015×10^(-34)"],["G  Gravitation","6.6743×10^(-11)"],["Nₐ  Avogadro","6.02214076×10^23"],
        ["R  Gas constant","8.314462618"],["k  Boltzmann","1.380649×10^(-23)"],["e  Elem. charge","1.602176634×10^(-19)"],["mₑ  Electron mass","9.1093837015×10^(-31)"],["mₚ  Proton mass","1.67262192369×10^(-27)"],
        ["ε₀  Permittivity","8.8541878128×10^(-12)"],["μ₀  Permeability","1.25663706212×10^(-6)"],["F  Faraday","96485.33212"],["σ  Stefan–Boltzmann","5.670374419×10^(-8)"],["atm  Std atmosphere","101325"]];
        const CONSTS=C,TOKRE=/asinh\(|acosh\(|atanh\(|asin\(|acos\(|atan\(|sinh\(|cosh\(|tanh\(|sin\(|cos\(|tan\(|logb\(|log\(|ln\(|Abs\(|Int\(|Floor\(|Ceil\(|RanInt\(|Pol\(|Rec\(|Det\(|Trn\(|Ident\(|Dot\(|Ang\(|Arg\(|Conjg\(|Re\(|Im\(|Not\(|Neg\(|Mat[A-D]|Vct[A-D]|\sAnd\s|\sOr\s|\sXor\s|\sXnor\s|nCr\(|nPr\(|nCr|nPr|gcd\(|lcm\(|mod\(|root\(|cbrt\(|deriv\(|integ\(|sigma\(|\^\(|√\(|PreAns|Ans|./gy;
        const DNM={asinh:"sinh⁻¹",acosh:"cosh⁻¹",atanh:"tanh⁻¹",logb:"log",deriv:"d/dx",integ:"∫",sigma:"Σ",asin:"sin⁻¹",acos:"cos⁻¹",atan:"tan⁻¹",cbrt:"∛"};
        const tokAt=(s,i)=>{TOKRE.lastIndex=i;const m=TOKRE.exec(s);return m?m[0]:s[i]};
        const bounds=s=>{const b=[0];let i=0;while(i<s.length){i+=tokAt(s,i).length;b.push(i)}return b};
        const conv=s=>s.replace(/⎡/g,"((").replace(/⎪/g,")/(").replace(/⎦/g,"))").replace(/⎣/g,"(").replace(/⎢/g,"+((").replace(/⎥/g,")))");
        function render(s,caret){
         let i=0;const cu='<span class="cur'+(ovw&&io>=2?' ow':'')+'"></span>';
         const ph=x=>x.replace(cu,"")===""?x+'<span class="ph"></span>':x;
         function seq(end){let h="";
          while(i<s.length&&!(end&&s[i]===end)){
           if(i===caret)h+=cu;
           const c=s[i];
           if(c==="⎡"){i++;const n=seq("⎪");i++;const d=seq("⎦");i++;h+=io>=2?n+"⌟"+d:'<span class="fr"><span>'+ph(n)+'</span><span>'+ph(d)+'</span></span>';continue}
           if(c==="⎣"){i++;const w=seq("⎢");i++;const n=seq("⎪");i++;const d=seq("⎥");i++;h+=io>=2?w+"⌟"+n+"⌟"+d:'<span class="mw">'+ph(w)+'</span><span class="fr"><span>'+ph(n)+'</span><span>'+ph(d)+'</span></span>';continue}
           const t=tokAt(s,i);
           if(t==="^("){const i0=i;i+=2;const x=seq(")");if(s[i]===")")i++;const pc=s[i0-1],opd=pc&&/[0-9.)A-Za-zπ!%°′″⎦⎥]/.test(pc);h+=io>=2?"^("+x+")":(opd?"":'<span class="ph"></span>')+'<sup class="su">'+ph(x)+'</sup>'}
           else if((t==="root("||t==="logb(")&&io<2&&s.indexOf(",",i)>0){i+=t.length;const a1=seq(","),hc=s[i]===",";if(hc)i++;const a2=seq(")");if(s[i]===")")i++;
            h+=t==="root("?radHtml(ph(a2),ph(a1)):'log<span class="lgb">'+ph(a1)+'</span>('+a2+')'}
           else if(t==="√("){i+=2;const x=seq(")");if(s[i]===")")i++;h+=io>=2?"√("+x+")":radHtml(ph(x))}
           else if(t==="cbrt("&&io<2){i+=5;const x=seq(")");if(s[i]===")")i++;h+=radHtml(ph(x),3)}
           else if((t==="Abs("||t==="abs(")&&io<2){i+=4;const x=seq(")");if(s[i]===")")i++;h+=absHtml(ph(x))}
           else if(t.endsWith("(")){i+=t.length;const x=seq(")"),cl=s[i]===")";if(cl)i++;const nm=t.slice(0,-1);h+=(DNM[nm]||nm)+"("+x+(cl?")":"")}
           else{i+=t.length;h+=t==="-"?"−":t==="*"?"×":t}
          }
          if(i===caret)h+=cu;return h}
         return seq("")}
        let ex="",cur=0,justEq=false,sh=false,alp=false,hyp=false,mem=null,tog=false,mtog=false,engN=0,engNow=0,ovw=false,errState=null,off=false,lastV=0,lastTxt="0",hidx=-1,hist=[],clip="";
        const SBI=["S","A","hyp","M","STO","RCL","CMPLX","BASE","MAT","VCT","TABLE","D","R","G","FIX","SCI","Math","▼","▲"];
        function buildSb(){$("#sb").innerHTML=SBI.map(k=>'<i data-k="'+k+'">'+k+'</i>').join("")}
        function sbSet(){const on={S:sh,A:alp,hyp:hyp,M:!!vars.M,STO:mem==="sto",RCL:mem==="rcl",CMPLX:mode==="cx",BASE:mode==="bn",MAT:mode==="mx",VCT:mode==="vc",TABLE:mode==="tb",D:ang===0,R:ang===1,G:ang===2,FIX:nf[0]==="fix",SCI:nf[0]==="sci",Math:io<2,"▼":hidx>=0,"▲":hist.length>0&&hidx<hist.length-1};
         root.querySelectorAll("#sb i").forEach(e=>e.classList.toggle("on",!!on[e.dataset.k]));const bi=root.querySelector('#sb i[data-k="BASE"]');if(bi)bi.textContent=mode==="bn"?"BASE "+["d","h","b","o"][bnBase]:"BASE"}
        let lv=5,bl=false;
        function applyLcd(){const L=Math.min(96,91-(lv-1)*2.5+(bl?8:0)),c=root.querySelector(".calc");c.style.setProperty("--lcd-bg","hsl(219 21% "+L+"%)");c.classList.toggle("bl",bl);try{localStorage.setItem("calc991.lcd",JSON.stringify({lv,bl}))}catch(e){}}
        function loadLcd(){try{const o=JSON.parse(localStorage.getItem("calc991.lcd")||"{}");if(o.lv>=1&&o.lv<=9)lv=o.lv|0;bl=!!o.bl}catch(e){}}
        function placeLc(){const o=$("#ov"),L=$("#lcd"),b=$("#sb"),t=L.offsetTop+8+b.offsetHeight+6;o.style.top=t+"px";o.style.height=(L.offsetTop+L.offsetHeight-t)+"px"}
        function ind(){sbSet();
         root.querySelectorAll("#bt button").forEach((b,i)=>b.classList.toggle("on",i===bnBase&&mode==="bn"));
         root.querySelectorAll(".k.sh").forEach(b=>b.classList.toggle("on",sh));root.querySelectorAll(".k.al").forEach(b=>b.classList.toggle("on",alp))}
        function draw(){if(errState){$("#ex").innerHTML="<b>"+errState+"</b>";$("#rs").innerHTML='<small>[AC] : Cancel<br>[◀][▶] : Goto</small>';hvDraw();return}
         $("#ex").innerHTML=(mode==="tb"?"f(X)=":"")+render(ex,justEq?-1:cur);const c=$(".cur");if(c)c.scrollIntoView({block:"nearest",inline:"nearest"});ind()}
        function leave(opLike){if(justEq){justEq=false;hidx=-1;engN=0;$("#rs").textContent="";ex=opLike?"Ans":"";cur=ex.length}}
        function ins(t){if(errState)return;leave(/^[+−×÷^!%°]/.test(t));
         if(t===")"&&ex[cur]===")")cur++;else{if(ovw&&io>=2&&cur<ex.length){const b=bounds(ex),e2=b[b.indexOf(cur)+1],nx=ex.slice(cur,e2);if(/^(\d|\.|[+−×÷!%°′″]|[A-Za-zπ]+$)/.test(nx)&&!nx.endsWith("("))ex=ex.slice(0,cur)+ex.slice(e2)}ex=ex.slice(0,cur)+t+((t==="root("||t==="logb(")?",)":t.endsWith("(")?")":"")+ex.slice(cur);cur+=t.length}draw()}
        function operandLen(){const pre=ex.slice(0,cur);let m=pre.match(/(?:\d+\.?\d*|\.\d+)$/);if(m)return m[0].length;
         m=pre.match(/(?:PreAns|Ans|[A-FXYM]|π|e|i)$/);if(m&&!/[A-Za-z]$/.test(pre.slice(0,pre.length-m[0].length)))return m[0].length;
         if(pre.endsWith(")")){let d=0;for(let k=pre.length-1;k>=0;k--){if(pre[k]===")")d++;else if(pre[k]==="("){if(!--d){while(k>0&&/[A-Za-z√]/.test(pre[k-1]))k--;return pre.length-k}}}}
         return 0}
        function insFrac(mixed_){if(errState)return;leave(false);const L=operandLen(),st=cur-L,op=ex.slice(st,cur),rest=ex.slice(cur);
         if(mixed_){ex=ex.slice(0,st)+"⎣"+op+"⎢⎪⎥"+rest;cur=st+1+op.length+(L?1:0)}
         else{ex=ex.slice(0,st)+"⎡"+op+"⎪⎦"+rest;cur=st+1+op.length+(L?1:0)}draw()}
        function tplCtx(){const stk=[];for(let i=0;i<cur;i++){const c=ex[i];if(c==="⎡"||c==="⎣")stk.push({o:i,seps:[]});else if(c==="⎪"||c==="⎢"){if(stk.length)stk[stk.length-1].seps.push(i)}else if(c==="⎦"||c==="⎥")stk.pop()}
         if(!stk.length)return null;const t=stk[stk.length-1];let d=0;for(let i=cur;i<ex.length;i++){const c=ex[i];if(c==="⎡"||c==="⎣")d++;else if(c==="⎦"||c==="⎥"){if(!d){t.close=i;break}d--}else if((c==="⎪"||c==="⎢")&&!d)t.seps.push(i)}
         t.mixed=ex[t.o]==="⎣";return t}
        function tplMove(dir){if(errState||justEq)return false;const t=tplCtx();if(!t)return false;const sl=t.seps.filter(p=>p<cur).length,lo=t.mixed?1:0,hi=t.seps.length;
         if(dir<0&&sl>lo){cur=t.seps[sl-1];draw();return true}if(dir>0&&sl<hi&&sl>=lo){cur=t.seps[sl]+1;draw();return true}return false}
        function del(){if(errState)return;if(justEq){justEq=false;$("#rs").textContent="";cur=ex.length}
         if(!cur)return draw();const b=bounds(ex),p=b[b.indexOf(cur)-1],t=ex.slice(p,cur);
         if("⎡⎪⎦⎣⎢⎥".includes(t)){for(const T of["⎡⎪⎦","⎣⎢⎪⎥"])for(let k=1;k<=T.length;k++)if(ex.slice(cur-k,cur-k+T.length)===T){ex=ex.slice(0,cur-k)+ex.slice(cur-k+T.length);cur-=k;return draw()}cur=p;return draw()}
         ex=ex.slice(0,p)+ex.slice(cur);cur=p;if(t.endsWith("(")){if((t==="root("||t==="logb(")&&ex.slice(cur,cur+2)===",)")ex=ex.slice(0,cur)+ex.slice(cur+2);else if(ex[cur]===")")ex=ex.slice(0,cur)+ex.slice(cur+1)}draw()}
        function move(d){
         if(errState){errState=null;$("#rs").textContent="";cur=ex.length;justEq=false;return draw()}
         if(justEq){justEq=false;hidx=-1;engN=0;$("#rs").textContent="";cur=ex.length;return draw()}
         const b=bounds(ex),k=b.indexOf(cur);cur=b[Math.max(0,Math.min(b.length-1,k+d))];draw()}
        function hvDraw(){sbSet()}
        const SI={"-12":"p","-9":"n","-6":"μ","-3":"m",3:"k",6:"M",9:"G",12:"T"};
        const post=t=>{if(dsep)t=t.replace(/^(-?)(\d+)/,(m,g,d)=>g+d.replace(/\B(?=(\d{3})+(?!\d))/g,","));if(dmark)t=t.replace(/\./g,"_").replace(/,/g,".").replace(/_/g,",");return t};
        function fmtOut(v){if(typeof v!=="number"||!isFinite(v))return"Math ERROR";return post(numStr(v,nf[0],nf[1],engNow))}
        const toBase=v=>{const n=Math.trunc(v)|0,b=[10,16,2,8][bnBase];return(b===10?n:n>>>0).toString(b).toUpperCase()};
        const cellH=(x,p)=>!p&&typeof x==="number"&&io<2&&(io===0)!==tog?numHtml(x):fmtOut(x);
        function valHtml(v,p){
         if(isM(v))return'<table class="mx">'+v.m.map(r=>"<tr>"+r.map(x=>"<td>"+cellH(x,p)+"</td>").join("")+"</tr>").join("")+"</table>";
         if(isV(v))return'<table class="mx"><tr>'+v.v.map(x=>"<td>"+cellH(x,p)+"</td>").join("")+"</tr></table>";
         if(cxPolar)return fmtOut(Math.hypot(v.re,v.im))+"∠"+fmtOut(Math.atan2(v.im,v.re)/ratio());
         const a=v.re,b=v.im;return(a?cellH(a,p):"")+(b<0?"−":(a?"+":""))+(Math.abs(b)===1?"":cellH(Math.abs(b),p))+"i"}
        const numHtml=v=>{const f=frac(v);return f?(f[0]<0?"−":"")+'<span class="fr"><span>'+Math.abs(f[0])+'</span><span>'+f[1]+'</span></span>':fmtOut(v)};
        function showRes(v){const r=$("#rs");
         if(isS(v)){if(io<=1&&((io===0)!==tog)){const[h,t]=surdHtml(v);r.innerHTML=h;lastTxt=t}else{engNow=engN;lastTxt=fmtOut(nv(v));engNow=0;r.textContent=lastTxt}return}
         if(typeof v==="object"){r.innerHTML=valHtml(v);const tmp=document.createElement("div");tmp.innerHTML=valHtml(v,true);lastTxt=tmp.textContent||"";return}
         if(!isFinite(v)){errState="Math ERROR";return draw()}
         if(mode==="bn"){lastTxt=toBase(v);r.textContent=lastTxt;return}
         if(io<2&&(io===0)!==tog&&!frac(v)&&/π|asin\(|acos\(|atan\(|Arg\(/.test(ex)){const q=v/Math.PI,pf=Math.abs(q)<1e5&&q%1===0?[q,1]:frac(q);
          if(pf){const[n,d]=pf,an=Math.abs(n),sg=n<0?"−":"",num=(an===1?"":an)+"π";lastTxt=(n<0?"-":"")+num+(d>1?"/"+d:"");r.innerHTML=d===1?sg+num:sg+'<span class="fr"><span>'+num+'</span><span>'+d+'</span></span>';return}}
         const f=frac(v),u=f&&((io%2===0)!==tog);
         if(u){const[n,d]=f,a=Math.abs(n),w=(mixed!==mtog)&&a>d?Math.floor(a/d):0,nn=w?a-w*d:a,sg=n<0?"−":"";lastTxt=n+"/"+d;
          if(io>=2)r.textContent=sg+(w?w+"⌟":"")+nn+"⌟"+d;else r.innerHTML=sg+(w||"")+'<span class="fr"><span>'+nn+'</span><span>'+d+'</span></span>'}
         else{engNow=engN;lastTxt=fmtOut(v);engNow=0;r.textContent=lastTxt}}
        const redraw=()=>{draw();if(justEq)showRes(lastV)};
        function findRoot(f,g){const t0=performance.now(),D=[];for(let i=1;i<=1000;i++)D.push(i*.01);for(let d=10.2;d<1e10;d*=1.02)D.push(d);
         const fv=x=>{try{const y=f(x);return typeof y==="number"?y:NaN}catch(e){return NaN}};
         const bis=(a,b,fa)=>{let x=a,y=b,fl=fa;for(let i=0;i<200;i++){const m=(x+y)/2,fm=fv(m);if(!isFinite(fm))return null;if(fm===0)return m;if(Math.sign(fm)===Math.sign(fl)){x=m;fl=fm}else y=m}
          const r=(x+y)/2,fr=Math.abs(fv(r));return fr<=Math.max(Math.abs(fa),Math.abs(fv(b)))?r:null};
         const tan=(p,q)=>{let a=Math.min(p,q),b=Math.max(p,q);for(let i=0;i<120;i++){const m1=a+(b-a)/3,m2=b-(b-a)/3;if(Math.abs(fv(m1))<Math.abs(fv(m2)))b=m2;else a=m1}const x=(a+b)/2;return Math.abs(fv(x))<1e-11?x:null};
         const side=sd=>{let px=g,pf=fv(g),ppx=null,ppf=null;if(pf===0)return g;
          for(const d of D){const x=g+sd*d,fx=fv(x);if(performance.now()-t0>1500)return null;
           if(isFinite(pf)&&isFinite(fx)){if(pf*fx<0){const r=bis(px,x,pf);if(r!==null)return r}else if(fx===0)return x;
            else if(ppf!==null&&isFinite(ppf)&&Math.abs(pf)<=Math.abs(ppf)&&Math.abs(pf)<=Math.abs(fx)){const r=tan(ppx,x);if(r!==null)return r}}
           ppx=px;ppf=pf;px=x;pf=fx}
          return null};
         const r1=side(1),r2=side(-1);if(r1===null)return r2;if(r2===null)return r1;return Math.abs(r2-g)<Math.abs(r1-g)?r2:r1}
        function solve(s){const q=s.indexOf("="),l=q<0?s:s.slice(0,q),r=q<0?"0":s.slice(q+1)||"0";
         const g=evalExpr("("+l+")-("+r+")",true),f=x=>{vars.X=x;return nv(g())},sv=vars.X;let rt=null,res=0;
         try{rt=findRoot(f,typeof sv==="number"&&isFinite(sv)?sv:0);if(rt!==null){rt=parseFloat(rt.toPrecision(15));res=f(rt)}}catch(e){rt=null}
         vars.X=rt!==null?rt:sv;justEq=true;draw();let html,txt;
         if(rt===null){html="Can't Solve";txt="Can't Solve"}else{html='<div class="sol">x = '+fmtOut(rt).replace("-","−")+"<br>L−R = "+fmtOut(Math.abs(res)<1e-9?0:res).replace("-","−")+"</div>";txt="x="+rt;lastV=rt}
         $("#rs").innerHTML=html;lastTxt=txt;hist.unshift({e:ex,r:txt,h:html,t:lastTxt,v:lastV});hist.length=Math.min(hist.length,30);hidx=0;hvDraw()}
        const cleanN=(x,sc)=>typeof x!=="number"?x:Math.abs(x)<1e-12*sc?0:parseFloat(x.toPrecision(15));
        const cleanMV=v=>{const R=isM(v)?v.m:[v.v],sc=Math.max(1,...R.flat().map(Math.abs)),c=R.map(r=>r.map(x=>cleanN(x,sc)));return isM(v)?{m:c}:{v:c[0]}};
        function finish(v){
         if(typeof v==="number"){try{v=rg(v)}catch(e){errState="Math ERROR";return draw()}if(!isFinite(v)){errState="Math ERROR";return draw()}v=parseFloat(v.toPrecision(15))}else if(isM(v)||isV(v))v=cleanMV(v);
         lastV=v;vars.PreAns=vars.Ans;vars.Ans=v;tog=false;mtog=false;engN=0;justEq=true;showRes(v);if(errState)return;
         if(pairOut&&typeof v==="number"&&v===pairOut[2]&&pairWhole()){const a=fmtOut(pairOut[2]),b=fmtOut(pairOut[3]);$("#rs").innerHTML='<div class="pr">'+pairOut[0]+" = "+a+"<br>"+pairOut[1]+" = "+b+"</div>";lastTxt=pairOut[0]+"="+a+", "+pairOut[1]+"="+b}
         hist.unshift({e:ex,r:lastTxt,h:$("#rs").innerHTML,t:lastTxt,v});hist.length=Math.min(hist.length,30);hidx=0;draw()}
        let pairOut=null;
        function pairWhole(){const t=ex.replace(/\s/g,"");if(!/^(Pol|Rec)\(/.test(t))return false;let d=0;for(let i=3;i<t.length;i++){if(t[i]==="(")d++;else if(t[i]===")"){d--;if(!d)return i===t.length-1}}return false}
        function equals(){if(!ex||errState)return;pairOut=null;let s=conv(ex);
         try{
          if(mode==="sv"||s.includes("="))return solve(s.includes("=")?s:s+"=0");
          if(mode==="tb")return tableSetup(s);
          if(mode==="bn"){if(s.includes("."))throw new Error("syntax");const b=[10,16,2,8][bnBase],DG="0123456789ABCDEF",re=b===16?/(?<![A-Za-z])[0-9A-F]+(?![A-Za-z(])/g:/(?<![A-Za-z])[0-9]+(?![A-Za-z(])/g;
           const cv=t=>{for(const ch of t)if(DG.indexOf(ch)>=b)throw new Error("syntax");let n=parseInt(t,b);if(b===10){if(n>2147483648)err()}else{if(n>4294967295)err();n=n|0}return n};
           const r=Math.trunc(nv(evalExpr(s.replace(re,cv))));if(!(r>=-2147483648&&r<=2147483647))err();return finish(r)}
          finish(evalExpr(s))}
         catch(e){errState=e.message==="math"?"Math ERROR":"Syntax ERROR";draw()}}
        function calcCmd(){if(!ex||errState)return;const s=conv(ex);
         const used=[...new Set(s.match(/(?<![A-Za-z])[A-FXYM](?![A-Za-z])/g)||[])];
         if(!used.length||s.includes("="))return equals();
         gridScreen({title:"CALC",rows:used.length,cols:1,rl:used,data:used.map(v=>[isN(vars[v])?vars[v]:0]),back:closeOv,onDone:d=>{used.forEach((v,i)=>vars[v]=d[i][0]??0);closeOv();justEq=false;equals()}})}
        function ac(){errState=null;ex="";cur=0;justEq=false;hidx=-1;engN=0;tog=false;mtog=false;$("#rs").textContent="0";draw()}
        function showRec(n){hidx=n;const h=hist[n];ex=h.e;cur=ex.length;justEq=true;engN=0;tog=false;mtog=false;lastV=h.v;$("#rs").innerHTML=h.h;lastTxt=h.t;draw()}
        function nav(d){if(errState||!hist.length)return;if(!justEq&&ex!=="")return;const n=hidx+(d>0?1:-1);if(n<-1||n>hist.length-1)return;
         if(n===-1){hidx=-1;justEq=false;ex="";cur=0;$("#rs").textContent="0";draw();return}showRec(n)}
        function dmsShow(){const v=lastV;if(typeof v!=="number"||!isFinite(v)||Math.abs(v)>=1e7)return;let t=Math.round(Math.abs(v)*360000)/100,d=Math.floor(t/3600);t-=d*3600;let m=Math.floor(t/60),sc=Math.round((t-m*60)*100)/100;if(sc>=60){sc=0;m++}if(m>=60){m=0;d++}$("#rs").textContent=(v<0?"-":"")+d+"°"+m+"′"+parseFloat(sc.toFixed(2))+"″"}
        function fact_(){if(!justEq||errState)return;const n=lastV;if(typeof n!=="number"||!(n>=1)||n%1||n>9999999999){errState="Math ERROR";return draw()}let t=n,f={};for(let d=2;d*d<=t;d++)while(t%d==0){f[d]=(f[d]||0)+1;t/=d}if(t>1)f[t]=(f[t]||0)+1;
         $("#rs").textContent=n===1?"1":Object.entries(f).map(([p,e])=>e>1?p+"^"+e:p).join("×")}

        let ovNav=null;
        function closeOv(){$("#ov").hidden=true;ovNav=null}
        function openOv(t,fill){const o=$("#ov");o.className="ov";o.style.top="";o.style.height="";ovNav=null;o.innerHTML='<div class="oh"><b>'+t+'</b><button class="x" onclick="closeOv()">✕</button></div><div id="ob"></div>';fill($("#ob"));o.hidden=false}
        function lcdScreen(title,items,cols,sel,pick,back,cell,kmap){
         openOv(title,el=>{const g=document.createElement("div");g.className=cols>1?"mg":"sl";
          items.forEach((it,i)=>{const d=document.createElement("div");d.className=cols>1?"mt":"sr";d.innerHTML=cell(it,i);d.onclick=()=>{ovNav.sel=i;hl();pick(i)};g.appendChild(d)});el.appendChild(g)});
         $("#ov").classList.add("lc");placeLc();ovNav={n:items.length,items,sel,pick,back,cols,kmap};hl()}
        function hl(){root.querySelectorAll("#ov .mt,#ov .sr").forEach((d,i)=>{d.classList.toggle("sel",i===ovNav.sel);if(i===ovNav.sel)d.scrollIntoView({block:"nearest"})})}
        function ovKey(k){if(ovNav.grid)return gKey(k);
         if(ovNav.adj){const m=typeof k==="string"?k:k[2];if(m==="@left")ovNav.adj(-1);else if(m==="@right")ovNav.adj(1);else if(m==="@ac"||m==="@del"||m==="@mode"||m==="@eq")ovNav.back();return}const m=typeof k==="string"?k:k[2],c=ovNav.cols>1;
         if(m==="@up")ovNav.sel=(ovNav.sel+ovNav.n-(c?3:1))%ovNav.n;else if(m==="@down")ovNav.sel=(ovNav.sel+(c?3:1))%ovNav.n;
         else if(c&&m==="@left")ovNav.sel=(ovNav.sel+ovNav.n-1)%ovNav.n;else if(c&&m==="@right")ovNav.sel=(ovNav.sel+1)%ovNav.n;
         else if(m==="@eq"){ovNav.pick(ovNav.sel);return}
         else if(m==="@ac"||m==="@mode"||m==="@del"){ovNav.back();return}
         else if(ovNav.names&&Array.isArray(k)&&k[6]&&ovNav.names.includes(k[6])){const i=ovNav.names.indexOf(k[6]);ovNav.sel=i;hl();ovNav.pick(i);return}
         else if(/^\d$/.test(m)){const i=(ovNav.kmap||(d=>d===0?9:d-1))(+m);if(i>=0&&i<ovNav.n){ovNav.sel=i;hl();ovNav.pick(i)}return}
         hl()}
        const MENU=[["Calculate","±÷×",()=>{setMode("cal");closeOv()}],["Complex","i",()=>{setMode("cx");closeOv()}],["Base-N","ⁿ",()=>{setMode("bn");closeOv()}],["Matrix","[ ]",()=>{setMode("mx");matEdit()}],["Vector","→",()=>{setMode("vc");vecEdit()}],["Statistics","▂▅▇",statMenu],["Distribution","∩",distMenu],["Table","▦",()=>{setMode("tb");closeOv()}],["Equation/Func","x=",eqMenu]];
        function MODES(){lcdScreen("MENU",MENU,3,0,i=>MENU[i][2](),closeOv,(it,i)=>"<small>"+(i+1)+"</small><b>"+it[1]+"</b><span>"+it[0]+"</span>")}
        const SROWS=["Input/Output","Angle Unit","Number Format","Engineering Symbol","Fraction Result","Complex","Decimal Mark","Digit Separator","Settings & Data","Contrast","Backlight"];
        const SOPT=[["MathI/MathO","MathI/DecimalO","LineI/LineO","LineI/DecimalO"],["Degree","Radian","Gradian"],["Fix","Sci","Norm"],["On","Off"],["ab/c","d/c"],["a+bi","r∠θ"],["Dot","Comma"],["Off","On"],["Initialize Settings","Clear Data","Initialize All"],[],["Off","On"]];
        const sCur=()=>[io,ang,nf[0]==="fix"?0:nf[0]==="sci"?1:2,esym?0:1,mixed?0:1,cxPolar?1:0,dmark?1:0,dsep?1:0,-1,-1,bl?1:0];
        const sTxt=i=>i===8?"":i===9?"Lv "+lv:i===2?(nf[0]==="norm"?"Norm"+nf[1]:nf[0]==="fix"?"Fix "+nf[1]:"Sci "+nf[1]):SOPT[i][sCur()[i]];
        const confirmBox=(msg,yes,back)=>lcdScreen("?",[msg,"[=] : Yes","[AC] : Cancel"],1,1,i=>{if(i===1)yes();else if(i===2)back()},back,t=>t,d=>d);
        function resetAll(j){if(j!==1){ang=0;io=1;nf=["norm",2];mixed=false;cxPolar=false;dmark=false;dsep=false;esym=false;lv=5;bl=false;applyLcd()}
         if(j!==0){"ABCDEFMXY".split("").forEach(k=>vars[k]=0);Object.keys(store).forEach(k=>store[k]=null);vars.Ans=0;vars.PreAns=0;lastV=0}
         setMode("cal",true);ind()}
        function openSetup(sel=0){lcdScreen("SETUP",SROWS,1,sel,i=>setupSub(i),closeOv,(t,i)=>(i+1)+":"+t+"<em>"+sTxt(i)+"</em>")}
        function contrastScreen(){openOv("Contrast",el=>{el.innerHTML='<div class="ct"><span>Light</span><b id="cbar"></b><span>Dark</span></div><div class="ch">[◀][▶] Adjust &nbsp; [AC] Back</div>'});
         $("#ov").classList.add("lc");placeLc();const paint=()=>{$("#cbar").innerHTML=Array.from({length:9},(_,k)=>'<u class="'+(k<lv?"f":"")+'"></u>').join("")};paint();
         $("#cbar").onclick=e=>{const u=e.target.closest("u");if(u){lv=[...u.parentNode.children].indexOf(u)+1;applyLcd();paint()}};
         ovNav={n:1,items:[0],sel:0,pick:()=>{},back:()=>openSetup(9),cols:1,adj:d=>{lv=Math.max(1,Math.min(9,lv+d));applyLcd();paint()}}}
        function setupSub(i){if(i===9)return contrastScreen();const cs=sCur()[i];
         lcdScreen(SROWS[i],SOPT[i],1,Math.max(0,cs),j=>{
          if(i===0){io=j;hist=[];hidx=-1}else if(i===1)ang=j;else if(i===3)esym=j===0;else if(i===4)mixed=j===0;else if(i===5)cxPolar=j===1;else if(i===6)dmark=j===1;else if(i===7)dsep=j===1;else if(i===10){bl=j===1;applyLcd()}else if(i===8)return confirmBox(SOPT[8][j]+"?",()=>{resetAll(j);closeOv()},()=>setupSub(8));else return numFmt(j);
          ind();redraw();openSetup(i)},()=>openSetup(i),(t,k)=>(k+1)+":"+t+(k===cs?"<em>✓</em>":""))}
        function numFmt(j){const fin=()=>{ind();redraw();openSetup(2)};
         if(j===2)return lcdScreen("Norm",["Norm1","Norm2"],1,nf[0]==="norm"?nf[1]-1:1,k=>{nf=["norm",k+1];fin()},()=>setupSub(2),t=>t);
         const lo=j?1:0,arr=[];for(let n=lo;n<=lo+9;n++)arr.push(n);
         lcdScreen(j?"Sci 1~10":"Fix 0~9",arr,1,0,k=>{nf=[j?"sci":"fix",arr[k]];fin()},()=>setupSub(2),t=>String(t),j?undefined:d=>d)}
        const resScreen=(t,lines,back)=>lcdScreen(t,lines,1,0,()=>{},back,x=>x);
        function setMode(m,force){if(m!==mode||force){hist=[];hidx=-1}mode=m;cmode=m==="cx";ex="";cur=0;justEq=false;$("#rs").textContent="0";$("#bt").hidden=m!=="bn";draw()}
        function setBase(i){bnBase=i;if(justEq)showRes(lastV);ind()}

        function gridScreen(o){openOv(o.title,()=>{});$("#ov").classList.add("lc");placeLc();ovNav={grid:{...o,r:0,c:0,buf:""},back:o.back||closeOv,n:0};gdraw()}
        function gdraw(){const g=ovNav.grid,el=$("#ob");
         let h='<div class="hint2">'+g.title+'</div><div class="gw"><table class="gt"><tr><th></th>'+(g.cl||[...Array(g.cols)].map(()=>"")).map(x=>"<th>"+x+"</th>").join("")+"</tr>";
         for(let i=0;i<g.rows;i++){h+="<tr><th>"+(g.rl?g.rl[i]:i+1)+"</th>";for(let j=0;j<g.cols;j++){const sel=i===g.r&&j===g.c,v=g.data[i][j];h+='<td class="'+(sel?"sel":"")+'" data-i="'+i+'" data-j="'+j+'">'+(sel&&g.buf!==""?g.buf:(v==null?"":fmtOut(v)))+"</td>"}h+="</tr>"}
         el.innerHTML=h+"</table></div>";
         el.querySelectorAll("td").forEach(td=>td.onclick=()=>{g.r=+td.dataset.i;g.c=+td.dataset.j;g.buf="";gdraw()});
         const q=el.querySelector("td.sel");if(q)q.scrollIntoView({block:"nearest"})}
        function commit(){const g=ovNav.grid;if(g.buf!==""){try{let v=evalExpr(g.buf);if(isS(v))v=nv(v);if(!isN(v))throw 0;g.data[g.r][g.c]=v}catch(e){g.buf="";gdraw();return false}g.buf=""}return true}
        function gKey(k){const g=ovNav.grid,m=typeof k==="string"?k:k[2];let a=m;
         if(m==="@shift"){sh=!sh;ind();return}if(m==="@alpha"){alp=!alp;ind();return}
         if(typeof k!=="string"&&sh&&k[4])a=k[4];sh=false;alp=false;ind();
         const nr=()=>{g.rows++;g.data.push(Array(g.cols).fill(null))};
         if(a==="@up"){if(g.buf!==""&&!commit())return;g.r=Math.max(0,g.r-1)}
         else if(a==="@down"){if(g.buf!==""&&!commit())return;if(g.r<g.rows-1)g.r++;else if(g.grow&&g.rows<g.grow){nr();g.r++}}
         else if(a==="@left"){if(g.buf!==""&&!commit())return;g.c=Math.max(0,g.c-1)}else if(a==="@right"){if(g.buf!==""&&!commit())return;g.c=Math.min(g.cols-1,g.c+1)}
         else if(a==="@eq"||a==="@calc"){if(!commit())return;
          if(a==="@calc"&&g.onCalc)return g.onCalc(g.data);
          if(g.c<g.cols-1)g.c++;else if(g.r<g.rows-1){g.r++;g.c=0}else if(g.grow&&g.rows<g.grow){nr();g.r++;g.c=0}else{if(g.onDone)g.onDone(g.data);return}}
         else if(a==="@del")g.buf=g.buf.slice(0,-1);
         else if(a==="@ac"||a==="@mode"){if(g.buf!=="")g.buf="";else return ovNav.back()}
         else if(a[0]!=="@")g.buf+=a;
         gdraw()}

        function eqMenu(){lcdScreen("Equation/Func",["Simul Equation","Polynomial","Solver"],1,0,i=>[simulSel,polySel,()=>{setMode("sv");closeOv();$("#rs").textContent="Solve for X"}][i](),closeOv,(t,i)=>(i+1)+":"+t)}
        function simulSel(){lcdScreen("Unknowns?",["2","3","4"],1,0,i=>simul(i+2),eqMenu,t=>t)}
        function simul(n){const nm=["x","y","z","t"].slice(0,n),cl=["a","b","c","d"].slice(0,n).concat("=");
         gridScreen({title:"Simul Equation ("+nm.join(",")+")",rows:n,cols:n+1,cl,data:Array.from({length:n},()=>Array(n+1).fill(0)),back:simulSel,
          onDone:d=>{const R=gj(d.map(r=>r.map(x=>x||0)));resScreen("Simul Equation",R?R.map((r,i)=>nm[i]+" = "+numHtml(r[n])):["No unique solution"],()=>simulSel())}})}
        function polySel(){lcdScreen("Degree?",["2","3","4"],1,0,i=>poly(i+2),eqMenu,t=>t)}
        function poly(n){const cl=["a","b","c","d","e"].slice(0,n+1);
         gridScreen({title:"Polynomial (degree "+n+")",rows:n+1,cols:1,rl:cl,data:Array.from({length:n+1},()=>[0]),back:polySel,
          onDone:d=>{const co=d.map(r=>r[0]||0);if(!co[0])return resScreen("Polynomial",["Math ERROR"],()=>polySel());
           resScreen("Polynomial",roots(co).map((z,i)=>"x"+(i+1)+" = "+(Math.abs(z[1])>1e-9?valHtml({re:z[0],im:z[1]}):numHtml(z[0]))),()=>polySel())}})}

        const SM=[["1-Variable",1],["A+BX","lin"],["_+CX²","quad"],["ln X","ln"],["e^X","exp"],["A·B^X","ab"],["A·X^B","pw"],["1/X","inv"]];
        const sum=a=>a.reduce((q,c)=>q+c,0);
        function statMenu(){lcdScreen("STAT",SM.map(x=>x[0]),1,0,i=>statGrid(SM[i]),closeOv,(t,i)=>(i+1)+":"+t)}
        function statGrid(t){const two=t[1]!==1;gridScreen({title:"STAT "+t[0]+" — CALC = results",rows:6,cols:two?2:1,cl:two?["x","y"]:["x"],data:Array.from({length:6},()=>Array(two?2:1).fill(null)),grow:80,back:statMenu,onCalc:d=>statRes(t,d)})}
        function regress(k,xs,ys){let X=xs,Y=ys;if(k==="ln"||k==="pw")X=xs.map(Math.log);if(k==="inv")X=xs.map(x=>1/x);if(k==="exp"||k==="ab"||k==="pw")Y=ys.map(Math.log);
         const n=X.length;if(k==="quad"){const S=j=>sum(X.map(x=>Math.pow(x,j))),T=j=>sum(X.map((x,i)=>Math.pow(x,j)*Y[i])),R=gj([[n,S(1),S(2),T(0)],[S(1),S(2),S(3),T(1)],[S(2),S(3),S(4),T(2)]]);return R?{A:R[0][3],B:R[1][3],C:R[2][3]}:null}
         const mx=sum(X)/n,my=sum(Y)/n,sxx=sum(X.map(x=>(x-mx)*(x-mx))),sxy=sum(X.map((x,i)=>(x-mx)*(Y[i]-my))),syy=sum(Y.map(y=>(y-my)*(y-my))),b=sxy/sxx,a=my-b*mx,r=sxy/Math.sqrt(sxx*syy);
         return{A:k==="exp"||k==="ab"||k==="pw"?Math.exp(a):a,B:k==="ab"?Math.exp(b):b,r}}
        function statRes(t,d){const two=t[1]!==1,R=d.filter(r=>r[0]!=null&&(!two||r[1]!=null));if(!R.length)return;
         const xs=R.map(r=>r[0]),ys=two?R.map(r=>r[1]):[],n=xs.length,Ls=[],f=(l,v)=>Ls.push(l+"<em>"+fmtOut(v)+"</em>"),ss=a=>{const m=sum(a)/a.length;return sum(a.map(x=>(x-m)*(x-m)))};
         if(two){if(n<2)return resScreen("STAT",["Math ERROR"],()=>statGrid(t));const g=regress(t[1],xs,ys);if(!g)return resScreen("STAT",["Math ERROR"],()=>statGrid(t));f("A =",g.A);f("B =",g.B);if("C"in g)f("C =",g.C);else f("r =",g.r)}
         f("n =",n);f("x̄ =",sum(xs)/n);f("Σx =",sum(xs));f("Σx² =",sum(xs.map(x=>x*x)));f("σx =",Math.sqrt(ss(xs)/n));f("sx =",n>1?Math.sqrt(ss(xs)/(n-1)):NaN);
         if(two){f("ȳ =",sum(ys)/n);f("Σy =",sum(ys));f("Σy² =",sum(ys.map(y=>y*y)));f("Σxy =",sum(xs.map((x,i)=>x*ys[i])));f("σy =",Math.sqrt(ss(ys)/n));f("sy =",n>1?Math.sqrt(ss(ys)/(n-1)):NaN)}
         else{const o=[...xs].sort((a,b)=>a-b),md=a=>a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;f("minX =",o[0]);f("Q1 =",md(o.slice(0,Math.floor(n/2)).length?o.slice(0,Math.floor(n/2)):o));f("Med =",md(o));f("Q3 =",md(o.slice(Math.ceil(n/2)).length?o.slice(Math.ceil(n/2)):o));f("maxX =",o[n-1])}
         resScreen("STAT results",Ls,()=>statGrid(t))}

        const erfc0=x=>{if(x<2.5){let t=x,sm=x;const x2=2*x*x;for(let n=0;n<300;n++){t*=x2/(2*n+3);sm+=t;if(t<1e-17*sm)break}return 1-2/Math.sqrt(Math.PI)*Math.exp(-x*x)*sm}
         if(x>27)return 0;let t=x;for(let k=120;k>=1;k--)t=x+k/2/t;return Math.exp(-x*x)/Math.sqrt(Math.PI)/t};
        const erfc=x=>x>=0?erfc0(x):2-erfc0(-x),ncdf=z=>.5*erfc(-z/Math.SQRT2),nsf=z=>.5*erfc(z/Math.SQRT2);
        const ncdfR=(a,b)=>Math.max(0,a>=0?nsf(a)-nsf(b):b<=0?ncdf(b)-ncdf(a):1-ncdf(a)-nsf(b));
        const ninv=p=>{if(!(p>0&&p<1))err();if(p===.5)return 0;if(p>.5)return-ninv(1-p);let a=-40,b=0;for(let i=0;i<200;i++){const m=(a+b)/2;if(ncdf(m)<p)a=m;else b=m}return(a+b)/2};
        const ck=c=>{if(!c)err()},lft=n=>{const T=[0,0];for(let i=2;i<=n;i++)T[i]=T[i-1]+Math.log(i);return T};
        const bt=(T,x,n,p,lp,lq)=>Math.exp(T[n]-T[x]-T[n-x]+x*lp+(n-x)*lq);
        const bpd=(x,n,p)=>{if(x>n)return 0;if(p===0)return x===0?1:0;if(p===1)return x===n?1:0;return bt(lft(n),x,n,p,Math.log(p),Math.log1p(-p))};
        const bcd=(x,n,p)=>{x=Math.min(x,n);if(p===0)return 1;if(p===1)return x>=n?1:0;const T=lft(n),lp=Math.log(p),lq=Math.log1p(-p);let q=0;for(let i=0;i<=x;i++)q+=bt(T,i,n,p,lp,lq);return Math.min(1,q)};
        const ppd=(x,l)=>Math.exp(-l+x*Math.log(l)-lft(x)[x]),pcd=(x,l)=>{const T=lft(x),ll=Math.log(l);let q=0;for(let i=0;i<=x;i++)q+=Math.exp(-l+i*ll-T[i]);return Math.min(1,q)};
        const bok=v=>{ck(Number.isInteger(v[0])&&Number.isInteger(v[1])&&v[1]>=1&&v[1]<=1e6&&v[0]>=0&&v[2]>=0&&v[2]<=1)},pok=v=>{ck(Number.isInteger(v[0])&&v[0]>=0&&v[0]<=1e6&&v[1]>0)};
        const DM=[["Normal PD",["x","σ","μ"],[0,1,0],v=>{ck(v[1]>0);const z=(v[0]-v[2])/v[1];return[["p",Math.exp(-z*z/2)/(v[1]*Math.sqrt(2*Math.PI))]]}],
        ["Normal CD",["Lower","Upper","σ","μ"],[-1e99,0,1,0],v=>{ck(v[2]>0&&v[0]<=v[1]);return[["p",ncdfR((v[0]-v[3])/v[2],(v[1]-v[3])/v[2])]]}],
        ["Inverse Normal",["Area","σ","μ"],[.5,1,0],v=>{ck(v[1]>0);return[["x",ninv(v[0])*v[1]+v[2]]]}],
        ["Binomial PD",["x","N","p"],[0,1,.5],v=>{bok(v);return[["p",bpd(v[0],v[1],v[2])]]}],
        ["Binomial CD",["x","N","p"],[0,1,.5],v=>{bok(v);return[["p",bcd(v[0],v[1],v[2])]]}],
        ["Poisson PD",["x","λ"],[0,1],v=>{pok(v);return[["p",ppd(v[0],v[1])]]}],
        ["Poisson CD",["x","λ"],[0,1],v=>{pok(v);return[["p",pcd(v[0],v[1])]]}]];
        function distMenu(){lcdScreen("DISTR",DM.map(x=>x[0]),1,0,distForm,closeOv,(t,i)=>(i+1)+":"+t)}
        function distForm(i){const d=DM[i];gridScreen({title:d[0],rows:d[1].length,cols:1,rl:d[1],data:d[2].map(x=>[x]),back:distMenu,onDone:v=>{let Ls;try{Ls=d[3](v.map(r=>r[0]??0)).map(([l,x])=>l+" = "+fmtOut(x))}catch(e){Ls=["Math ERROR"]}resScreen(d[0],Ls,()=>distForm(i))}})}

        const MN=["MatA","MatB","MatC","MatD"],VN=["VctA","VctB","VctC","VctD"],rngi=n=>Array.from({length:n},(_,i)=>i+1);
        function matEdit(){lcdScreen("Matrix",[...MN,"Calculate"],1,0,i=>i===4?closeOv():matDims(MN[i]),closeOv,(t,i)=>(i+1)+":"+t+(i<4?"<em>"+(store[t]?store[t].m.length+"×"+store[t].m[0].length:"—")+"</em>":""))}
        function matDims(nm){const o=store[nm];gridScreen({title:nm+" size (1-4)",rows:2,cols:1,rl:["Rows","Cols"],data:[[o?o.m.length:2],[o?o.m[0].length:2]],back:matEdit,onDone:d=>{
         const R=Math.max(1,Math.min(4,d[0][0]|0)),Cc=Math.max(1,Math.min(4,d[1][0]|0)),c0=o?o.m:[];
         gridScreen({title:nm,rows:R,cols:Cc,cl:rngi(Cc),data:Array.from({length:R},(_,i)=>Array.from({length:Cc},(_,j)=>(c0[i]||[])[j]??0)),back:matEdit,onDone:dd=>{store[nm]={m:dd.map(r=>r.map(x=>x||0))};matEdit()}})}})}
        function vecEdit(){lcdScreen("Vector",[...VN,"Calculate"],1,0,i=>i===4?closeOv():vecDims(VN[i]),closeOv,(t,i)=>(i+1)+":"+t+(i<4?"<em>"+(store[t]?"dim "+store[t].v.length:"—")+"</em>":""))}
        function vecDims(nm){const o=store[nm];gridScreen({title:nm+" dimension (1-4)",rows:1,cols:1,rl:["Dim"],data:[[o?o.v.length:3]],back:vecEdit,onDone:d=>{
         const R=Math.max(1,Math.min(4,d[0][0]|0)),c0=o?o.v:[];
         gridScreen({title:nm,rows:R,cols:1,data:Array.from({length:R},(_,i)=>[c0[i]??0]),back:vecEdit,onDone:dd=>{store[nm]={v:dd.map(r=>r[0]||0)};vecEdit()}})}})}
        function insMenu(t,items,edit){lcdScreen(t,["Edit…",...items],1,0,i=>{if(!i)return edit();closeOv();ins(items[i-1])},closeOv,(x,i)=>(i+1)+":"+x)}
        const matIns=()=>insMenu("MATRIX",[...MN,"Det(","Trn(","Ident("],matEdit),vecIns=()=>insMenu("VECTOR",[...VN,"Dot(","Ang("],vecEdit);
        function cxMenu(){const it=["Abs(","Arg(","Conjg(","Re(","Im(","▶r∠θ","▶a+bi"];lcdScreen("CMPLX",it,1,0,i=>{if(i<5){closeOv();ins(it[i])}else{cxPolar=i===5;closeOv();redraw()}},closeOv,(t,i)=>(i+1)+":"+t)}

        function tableSetup(s){gridScreen({title:"Table: Start / End / Step",rows:3,cols:1,rl:["Start","End","Step"],data:[[1],[5],[1]],back:closeOv,onDone:d=>{
         const g=evalExpr(s,true),a=d[0][0]??1,b=d[1][0]??5,st=d[2][0]||1;
         if(!(st>0)||b<a||Math.floor((b-a)/st+1e-9)+1>45)return resScreen("Table",["Math ERROR"],closeOv);
         const sv=vars.X,L2=[];for(let i=0,x=a;i<45&&x<=b+1e-9*Math.max(1,Math.abs(b));i++,x=a+i*st){vars.X=x;let t;try{const y=nv(g());t=typeof y==="number"&&isFinite(y)?fmtOut(y):"Math ERROR"}catch(e){t="Math ERROR"}L2.push(fmtOut(rn(x))+"<em>"+t+"</em>")}
         vars.X=sv;resScreen("Table  X / f(X)",L2,closeOv)}})}

        const ENU=["Length","Mass","Volume","Time","Area","Speed","Energy","Temperature"];
        function convFlow(){lcdScreen("CONV",ENU,1,0,ci=>{const un=Object.keys(U[ci][1]),F=U[ci][1],t=ENU[ci];
         const ask=(a,b)=>gridScreen({title:un[a]+" → "+un[b],rows:1,cols:1,rl:["Value"],data:[[1]],back:convFlow,onDone:d=>{const x=d[0][0]??0;let r;
          if(ci===7){const k=un[a]==="°C"?x+273.15:un[a]==="°F"?(x-32)*5/9+273.15:x;r=un[b]==="°C"?k-273.15:un[b]==="°F"?(k-273.15)*9/5+32:k}else r=x*F[un[a]]/F[un[b]];
          resScreen("Result",[fmtOut(x)+" "+un[a],"= "+fmtOut(r)+" "+un[b]],convFlow)}});
         const to=a=>lcdScreen(t+": to",un,1,0,b=>ask(a,b),convFlow,(x,i)=>(i+1)+":"+x);
         lcdScreen(t+": from",un,1,0,to,convFlow,(x,i)=>(i+1)+":"+x)},closeOv,(x,i)=>(i+1)+":"+x)}
        function openConst(){lcdScreen("CONST",CONSTS,1,0,i=>{closeOv();ins(CONSTS[i][1])},closeOv,(c,i)=>(i+1)+":"+c[0]+"<em>"+cv(c[1])+"</em>")}
        const cv=e=>{try{return fmt(evalExpr(e,true)())}catch(x){return e}};
        function openHist(){if(!hist.length)return resScreen("History",["No history"],closeOv);
         const rows=[...hist,{clr:1}];
         lcdScreen("History",rows,1,0,i=>{if(rows[i].clr)return confirmBox("Clear history?",()=>{hist=[];hidx=-1;closeOv();ac()},openHist);closeOv();showRec(i)},closeOv,(h,i)=>h.clr?"✕ Clear history":conv(h.e).replace(/-/g,"−")+"<em>"+h.r+"</em>")}
        const VNAMES=["A","B","C","D","E","F","X","Y","M"];
        function varList(kind){lcdScreen(kind,VNAMES,1,0,i=>{closeOv();const n=VNAMES[i];
         if(kind==="STO"){if(ex&&!justEq)equals();if(!errState&&(isN(lastV)||isS(lastV)))vars[n]=nv(lastV);ind()}else ins(n)},closeOv,n=>n+" = "+(isN(vars[n])?fmtOut(vars[n]):"—"));ovNav.names=VNAMES}
        const SPT="</> DEVELOPED-BY  boody_3ta  </>";let spTimer=0,spRun=0;
        function splashFit(){const t=$("#spt"),L=$("#lcd"),m=document.createElement("div");m.className="spt";m.style.cssText="position:absolute;visibility:hidden;left:0;top:0;animation:none";const sp=document.createElement("span");sp.style.whiteSpace="pre";sp.textContent=SPT;m.appendChild(sp);const k=document.createElement("i");k.className="spk";k.style.animation="none";m.appendChild(k);L.appendChild(m);
         let z=16;for(let n=0;n<4;n++){m.style.fontSize=z+"px";const w=m.offsetWidth;if(!w)break;z=Math.max(10,Math.min(26,z*(L.clientWidth*.88)/w))}L.removeChild(m);t.style.fontSize=z.toFixed(1)+"px"}
        function splashStart(){splashFit();const sp=$("#sp"),t=$("#spt"),run=++spRun;clearTimeout(spTimer);sp.classList.remove("done");t.innerHTML="";const k=document.createElement("i");k.className="spk";t.appendChild(k);const chars=[...SPT];let i=0;
         const step=()=>{if(run!==spRun||!off)return;if(i>=chars.length){sp.classList.add("done");return}const c=chars[i],e=document.createElement("span");e.className="sch";e.style.setProperty("--i",i);e.style.color="hsl("+(172+i*11)+",95%,63%)";e.textContent=c===" "?"\u00a0":c;t.insertBefore(e,k);i++;spTimer=setTimeout(step,c===" "?45:60+Math.random()*80)};
         spTimer=setTimeout(step,520)}
        function splashStop(){spRun++;clearTimeout(spTimer);$("#sp").classList.remove("done")}
        function powerOff(){closeOv();sh=false;alp=false;hyp=false;off=true;ex="";cur=0;errState=null;$("#lcd").classList.add("off");ind();splashStart()}
        function wake(){if(!off)return;off=false;splashStop();$("#lcd").classList.remove("off");hist=[];hidx=-1;ac()}
        const clrMenu=()=>{const n3=["Setup Data","Memory","All"];lcdScreen("CLR",n3,1,0,i=>confirmBox("Reset "+n3[i]+"?",()=>{resetAll(i);resScreen("Reset Success",["Reset Success","Press [AC]"],closeOv)},clrMenu),closeOv,(t,i)=>(i+1)+":"+t)};
        const TOOLS=()=>lcdScreen("Tools",["Constants","Unit Conversion","History","Setup","Backlight "+(bl?"On":"Off")],1,0,i=>[openConst,convFlow,openHist,()=>openSetup(),()=>{bl=!bl;applyLcd();closeOv()}][i](),closeOv,(t,i)=>(i+1)+":"+t);

        const K=[[["SHIFT","sh","@shift"],["ALPHA","al","@alpha"],["◀","ar","@left"],["▶","ar","@right"],["MODE","k","@mode","SETUP","@setup"],["2nd","nd","@2nd"]],
        [["CALC","k","@calc","SOLVE","@solve","=","="],["∫dx","k","integ(","d/dx","deriv("],["▲","dk","@up"],["▼","dk","@down"],["x⁻¹","k","^(-1)","x!","!"],["logₐx","k","logb(","Σ","sigma("]],
        [['<span class="fr kf"><span><i class="bx"></i></span><span><i class="bx"></i></span></span>',"k","@frac",'<span class="mxl"><i class="bx"></i><span class="fr kf"><span><i class="bx"></i></span><span><i class="bx"></i></span></span></span>',"@mixed","mod","mod("],['√<span class="ov0 ko"><i class="bx"></i></span>',"k","√(","∛","cbrt("],["x²","k","^(2)","x³","^(3)"],['x<sup class="kx"><i class="bx"></i></sup>',"k","^(",'<sup class="kx"><i class="bx"></i></sup>√<span class="ov0 ko"><i class="bx"></i></span>',"root("],["Log","k","log(","10ˣ","10^("],["Ln","k","ln(","eˣ","e^("]],
        [["(−)","k","-","∠","∠","A","A"],["°′″","k","°","FACT","@fact","B","B"],["hyp","k","@hyp","Abs","Abs(","C","C"],["Sin","k","sin(","sin⁻¹","asin(","D","D"],["Cos","k","cos(","cos⁻¹","acos(","E","E"],["Tan","k","tan(","tan⁻¹","atan(","F","F"]],
        [["RCL","k","@rcl","STO","@sto"],["ENG","k","@eng","CLRv","@clrv","i","i"],["(","k","(","%","%"],[")","k",")",",",",","X","X"],["S⇔D","k","@sd",'<span style="font-size:8px">a b/c⇔d/c</span>',"@abc","Y","Y"],["M+","k","@m+","M−","@m-","M","M"]],
        [["7","dn","7","CONST","@const"],["8","dn","8","CONV","@conv"],["9","dn","9","CLR","@clr"],["DEL","dn or","@del","INS","@ins"],["AC","dn or","@ac","OFF","@off"]],
        [["4","dn","4","MATRIX","@p:mx"],["5","dn","5","VECTOR","@p:vc"],["6","dn","6"],["×","dn","×","nPr","nPr","GCD","gcd("],["÷","dn","÷","nCr","nCr","LCM","lcm("]],
        [["1","dn","1","STAT","@p:st"],["2","dn","2","CMPLX","@p:cx"],["3","dn","3","DISTR","@p:nd"],["+","dn","+","Pol","Pol(","Ceil","Ceil("],["−","dn","−","Rec","Rec(","Floor","Floor("]],
        [["0","dn","0","COPY","@copy","PASTE","@paste"],[".","dn",".","Ran#","@ran","RanInt","RanInt("],["Exp","dn","×10^(","π","π","e","e"],["Ans","dn","Ans","PreAns","PreAns"],["=","dn","@eq","History","@hist"]]];
        function cmd(c){switch(c){
         case"shift":sh=!sh;alp=false;break;case"alpha":alp=!alp;sh=false;break;case"left":move(-1);break;case"right":move(1);break;
         case"up":if(!tplMove(-1))nav(1);break;case"down":if(!tplMove(1))nav(-1);break;case"mode":MODES();break;case"setup":openSetup();break;case"2nd":TOOLS();break;
         case"eq":equals();break;case"calc":calcCmd();break;case"solve":{if(!ex)break;try{solve(conv(ex).includes("=")?conv(ex):conv(ex)+"=0")}catch(e){$("#rs").textContent="Syntax ERROR"}break}
         case"frac":insFrac(false);break;case"mixed":insFrac(true);break;case"abc":if(justEq&&frac(lastV)){mtog=!mtog;showRes(lastV)}break;case"fact":fact_();break;case"hyp":hyp=!hyp;break;case"rcl":varList("RCL");break;case"sto":varList("STO");break;case"clr":clrMenu();break;case"ins":if(io>=2){ovw=!ovw;draw()}break;case"off":powerOff();break;
         case"eng":if(justEq&&isN(lastV)){engN++;showRes(lastV)}break;case"clrv":"ABCDEFMXY".split("").forEach(k=>vars[k]=0);break;
         case"sd":tog=!tog;if(justEq)showRes(lastV);break;case"m+":case"m-":{if(ex&&!justEq)equals();if(isN(lastV)||isS(lastV))vars.M+=(c==="m+"?1:-1)*nv(lastV);break}
         case"const":openConst();break;case"conv":convFlow();break;case"del":del();break;case"ac":ac();break;
         case"copy":clip=lastTxt;try{const pr=navigator.clipboard&&navigator.clipboard.writeText(lastTxt);if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}break;case"paste":ins(clip);break;
         case"ran":ins(Math.random().toFixed(3));break;case"hist":openHist();break;
         default:if(c==="p:mx")matIns();else if(c==="p:vc")vecIns();else if(c==="p:st")statMenu();else if(c==="p:cx")cxMenu();else if(c==="p:nd")distMenu()}}
        function onKey(k){if(off){if(k[2]==="@ac")wake();return}if(ovNav&&!$('#ov').hidden){ovKey(k);return}const[,,m,,s,al]=k;
         if(m==="@shift"||m==="@alpha"){cmd(m.slice(1));ind();return}
         if(mem){const l=k[6]||al;if(l&&l in vars){if(mem==="sto")vars[l]=lastV;else ins(l)}mem=null;ind();return}
         let a=m;const bk=["^(2)","^(","log(","ln("];
         if(mode==="bn"&&!sh&&!alp&&bk.includes(m)){setBase(bk.indexOf(m));return}
         if(mode==="bn"&&bnBase===1&&!sh&&!alp&&/^[A-F]$/.test(k[6]||""))a=k[6];
         else if(sh){a=s;sh=false}else if(alp){a=k[6];alp=false}
         if(!a){ind();return}
         if(hyp&&/^a?(sin|cos|tan)\($/.test(a))a=a.replace("(","h(");if(a!=="@hyp")hyp=false;
         if(a==="°"){if(justEq){dmsShow();ind();return}const pre=ex.slice(0,cur);if(/′\d+\.?\d*$/.test(pre))a="″";else if(/°\d+\.?\d*$/.test(pre))a="′"}
         if(a[0]==="@")cmd(a.slice(1));else ins(a);ind()}
        const kp=$("#kp");
        K.forEach((row,ri)=>{const r=document.createElement("div");r.className="row "+(row.length===6?"c6":"c5");
         row.forEach(k=>{const w=document.createElement("div");
          const lb=document.createElement("div");lb.className="lb";lb.innerHTML='<i class="y">'+(k[3]||"")+'</i><i class="r">'+(k[5]&&k[5]!==k[6]||(k[5]&&k[0]==="CALC")?k[5]:(k[5]||""))+'</i>';
          const b=document.createElement("button");b.className="k "+k[1];b.innerHTML=k[0];b.onclick=e=>{onKey(k);if(e.detail>0)b.blur()};
          const pl=h=>(h||"").replace(/<[^>]*>/g,"").trim(),NM={"@frac":"Fraction","√(":"Square root","^(":"Power","@mode":"Menu","@shift":"Shift","@alpha":"Alpha","@left":"Cursor left","@right":"Cursor right","@up":"Up","@down":"Down","@del":"Delete","@ac":"All clear","@eq":"Equals","@sd":"Switch fraction and decimal","@m+":"Memory plus","@2nd":"Tools"};
          b.setAttribute("aria-label",NM[k[2]]||pl(k[0])||pl(k[2])||"key");const tt=[pl(k[3])&&"SHIFT: "+pl(k[3]),pl(k[5])&&"ALPHA: "+pl(k[5])].filter(Boolean).join("   |   ");if(tt)b.title=tt;
          w.append(lb,b);r.appendChild(w)});kp.appendChild(r)});
        document.addEventListener("keydown",e=>{if(location.hash.indexOf("#/calculator")!==0)return;const tg=(e.composedPath&&e.composedPath()[0])||e.target;if(["INPUT","TEXTAREA","SELECT"].includes(tg.tagName))return;
         if(off){if(!["Shift","Control","Alt","Meta","Tab"].includes(e.key)){e.preventDefault();wake()}return}
         if((e.key==="Enter"||e.key===" ")&&tg.closest&&tg.closest("#kp button"))return;
         if(ovNav){const q={ArrowUp:"@up",ArrowDown:"@down",ArrowLeft:"@left",ArrowRight:"@right",Enter:"@eq",Escape:"@ac",Backspace:"@del"}[e.key]||(/^[0-9.+()^]$/.test(e.key)?e.key:e.key==="*"?"×":e.key==="/"?"÷":e.key==="-"?"−":null);if(q){e.preventDefault();ovKey(q)}return}
         if(!$("#ov").hidden)return;
         const m={"*":"×","/":"÷","-":"−"},k=m[e.key]||e.key;
         if(/^[0-9.+()%^!−]$/.test(k)||k==="×"||k==="÷"){e.preventDefault();ins(k)}
         else if(k==="Enter"||k==="="){e.preventDefault();equals()}else if(k==="Backspace"){e.preventDefault();del()}else if(k==="Escape")ac();
         else if(k==="ArrowLeft"){e.preventDefault();move(-1)}else if(k==="ArrowRight"){e.preventDefault();move(1)}
         else if(k==="ArrowUp"){e.preventDefault();nav(1)}else if(k==="ArrowDown"){e.preventDefault();nav(-1)}});
        ["DEC","HEX","BIN","OCT","And","Or","Xor","Xnor","Not","Neg"].forEach((n,i)=>{const b=document.createElement("button");b.textContent=n;b.onclick=()=>i<4?setBase(i):ins(i<8?" "+n+" ":n+"(");$("#bt").appendChild(b)});
        $("#lcd").onclick=wake;
        function supDom(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),L=[];let n;while(n=w.nextNode())if(/\^[-−]?\d/.test(n.nodeValue)&&!(n.parentNode.closest&&n.parentNode.closest("sup")))L.push(n);
         for(const t of L){const f=document.createElement("span");f.className="sx";const parts=t.nodeValue.split(/\^([-−]?\d+)/);parts.forEach((p,i)=>{if(i%2){const u=document.createElement("sup");u.className="su";u.textContent=p.replace("-","−");f.appendChild(u)}else if(p)f.appendChild(document.createTextNode(p))});t.parentNode.replaceChild(f,t)}}
        const supObs=new MutationObserver(()=>{supObs.disconnect();try{supDom($("#rs"));supDom($("#ov"))}finally{[$("#rs"),$("#ov")].forEach(e=>supObs.observe(e,{childList:true,subtree:true,characterData:true}))}});
        [$("#rs"),$("#ov")].forEach(e=>supObs.observe(e,{childList:true,subtree:true,characterData:true}));
        function fitCalc(){const f=$("#fit"),c=$("#calc"),st=$("#cxs");if(!st||!st.clientWidth||!st.clientHeight)return;c.style.setProperty("--s",1);const w=c.offsetWidth,h=c.offsetHeight,cs=getComputedStyle(st),aw=st.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),ah=st.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom),sc=Math.max(.25,Math.min(aw/w,ah/h,3));c.style.setProperty("--s",sc);f.style.width=w*sc+"px";f.style.height=h*sc+"px"}
        window.addEventListener("resize",fitCalc);window.addEventListener("orientationchange",()=>setTimeout(fitCalc,150));if(window.visualViewport)window.visualViewport.addEventListener("resize",fitCalc);
        buildSb();loadLcd();applyLcd();draw();fitCalc();if(document.fonts){document.fonts.ready.then(fitCalc);document.fonts.load('700 20px "Lemonada"').then(splashFit,splashFit)}splashFit();

        const calcEl=$("#calc");
        if(window.ResizeObserver)new ResizeObserver(()=>fitCalc()).observe($("#cxs"));
        api={fit:fitCalc,setLand:v=>{calcEl.classList.toggle("land",!!v);placeLc();fitCalc()}};

    }

    function active() {
        return location.hash.indexOf('#/calculator') === 0;
    }

    function fsElement() {
        return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    function isFs() {
        return fsElement() === host || host.classList.contains('calc-pfs');
    }

    function paint() {
        var fs = isFs();
        host.classList.toggle('is-fs', fs);
        host.classList.toggle('is-land', land);
        if (btnFs) {
            btnFs.setAttribute('aria-pressed', fs ? 'true' : 'false');
            var t = fs ? 'Exit full screen' : 'Full screen';
            btnFs.dataset.enTitle = t;
            btnFs.dataset.enAria = t;
            var ar = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
            var map = { 'Exit full screen': 'الخروج من ملء الشاشة', 'Full screen': 'ملء الشاشة' };
            var v = ar ? map[t] : t;
            btnFs.title = v;
            btnFs.setAttribute('aria-label', v);
        }
        if (btnLand) {
            btnLand.setAttribute('aria-pressed', land ? 'true' : 'false');
            var lt = land ? 'Portrait view' : 'Landscape view';
            btnLand.dataset.enTitle = lt;
            btnLand.dataset.enAria = lt;
            var ar2 = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
            var map2 = { 'Portrait view': 'عرض رأسي', 'Landscape view': 'عرض أفقي' };
            var v2 = ar2 ? map2[lt] : lt;
            btnLand.title = v2;
            btnLand.setAttribute('aria-label', v2);
        }
        if (api) requestAnimationFrame(function () { api.fit(); });
    }

    function enterFs() {
        var fn = host.requestFullscreen || host.webkitRequestFullscreen;
        if (fn) {
            var p = fn.call(host);
            if (p && p.catch) p.catch(function () { host.classList.add('calc-pfs'); document.body.classList.add('calc-noscroll'); paint(); });
            try {
                if (land && screen.orientation && screen.orientation.lock) {
                    var q = screen.orientation.lock('landscape');
                    if (q && q.catch) q.catch(function () {});
                }
            } catch (e) {}
        } else {
            host.classList.add('calc-pfs');
            document.body.classList.add('calc-noscroll');
            paint();
        }
    }

    function exitFs() {
        if (host.classList.contains('calc-pfs')) {
            host.classList.remove('calc-pfs');
            document.body.classList.remove('calc-noscroll');
        }
        if (fsElement()) {
            var fn = document.exitFullscreen || document.webkitExitFullscreen;
            if (fn) {
                var p = fn.call(document);
                if (p && p.catch) p.catch(function () {});
            }
        }
        try {
            if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        } catch (e) {}
        paint();
    }

    function sync() {
        if (!active()) {
            if (isFs()) exitFs();
            return;
        }
        if (!started) start();
        else if (api) requestAnimationFrame(function () { api.fit(); });
        paint();
    }

    if (btnFs) btnFs.addEventListener('click', function () { if (isFs()) exitFs(); else enterFs(); });
    if (btnLand) btnLand.addEventListener('click', function () {
        land = !land;
        try { localStorage.setItem(LAND_KEY, land ? '1' : '0'); } catch (e) {}
        if (api) api.setLand(land);
        paint();
    });
    document.addEventListener('fullscreenchange', function () {
        if (!fsElement()) {
            try {
                if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
            } catch (e) {}
        }
        paint();
    });
    document.addEventListener('webkitfullscreenchange', paint);
    window.addEventListener('hashchange', sync);
    window.addEventListener('nexa:lang', paint);
    sync();
})();
