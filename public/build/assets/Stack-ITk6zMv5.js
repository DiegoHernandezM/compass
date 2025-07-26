import{r as C,j as y}from"./app-BvioZF8O.js";import{N as E,i as O,S as D,U as P,V as G,D as K,W as X,f as N,g as T,O as w,X as M,b as W,h as q,s as h,j as u,m as k,t as _,v as H,n as L,o as R}from"./ButtonBase-wecvMaha.js";import{u as J}from"./index-BZd934AE.js";import{c as v}from"./Typography-QI3aQ4H6.js";import{s as Q,u as Y}from"./useThemeProps-zsyYkAH1.js";const Z=w(),rr=Q("div",{name:"MuiStack",slot:"Root"});function er(e){return Y({props:e,name:"MuiStack",defaultTheme:Z})}function tr(e,r){const t=C.Children.toArray(e).filter(Boolean);return t.reduce((a,s,n)=>(a.push(s),n<t.length-1&&a.push(C.cloneElement(r,{key:`separator-${n}`})),a),[])}const ar=e=>({row:"Left","row-reverse":"Right",column:"Top","column-reverse":"Bottom"})[e],or=({ownerState:e,theme:r})=>{let t={display:"flex",flexDirection:"column",...D({theme:r},P({values:e.direction,breakpoints:r.breakpoints.values}),a=>({flexDirection:a}))};if(e.spacing){const a=G(r),s=Object.keys(r.breakpoints.values).reduce((o,i)=>((typeof e.spacing=="object"&&e.spacing[i]!=null||typeof e.direction=="object"&&e.direction[i]!=null)&&(o[i]=!0),o),{}),n=P({values:e.direction,base:s}),f=P({values:e.spacing,base:s});typeof n=="object"&&Object.keys(n).forEach((o,i,c)=>{if(!n[o]){const d=i>0?n[c[i-1]]:"column";n[o]=d}}),t=K(t,D({theme:r},f,(o,i)=>e.useFlexGap?{gap:M(a,o)}:{"& > :not(style):not(style)":{margin:0},"& > :not(style) ~ :not(style)":{[`margin${ar(i?n[i]:e.direction)}`]:M(a,o)}}))}return t=X(r.breakpoints,t),t};function nr(e={}){const{createStyledComponent:r=rr,useThemeProps:t=er,componentName:a="MuiStack"}=e,s=()=>N({root:["root"]},o=>T(a,o),{}),n=r(or);return C.forwardRef(function(o,i){const c=t(o),p=E(c),{component:d="div",direction:m="column",spacing:b=0,divider:l,children:I,className:V,useFlexGap:z=!1,...A}=p,U={direction:m,spacing:b,useFlexGap:z},F=s();return y.jsx(n,{as:d,ownerState:U,ref:i,className:O(F.root,V),...A,children:l?tr(I,l):I})})}function ir(e){return T("MuiLinearProgress",e)}W("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","bar1","bar2","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);const x=4,$=R`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`,sr=typeof $!="string"?L`
        animation: ${$} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      `:null,j=R`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`,lr=typeof j!="string"?L`
        animation: ${j} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
      `:null,B=R`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`,cr=typeof B!="string"?L`
        animation: ${B} 3s infinite linear;
      `:null,ur=e=>{const{classes:r,variant:t,color:a}=e,s={root:["root",`color${u(a)}`,t],dashed:["dashed",`dashedColor${u(a)}`],bar1:["bar","bar1",`barColor${u(a)}`,(t==="indeterminate"||t==="query")&&"bar1Indeterminate",t==="determinate"&&"bar1Determinate",t==="buffer"&&"bar1Buffer"],bar2:["bar","bar2",t!=="buffer"&&`barColor${u(a)}`,t==="buffer"&&`color${u(a)}`,(t==="indeterminate"||t==="query")&&"bar2Indeterminate",t==="buffer"&&"bar2Buffer"]};return N(s,ir,r)},S=(e,r)=>e.vars?e.vars.palette.LinearProgress[`${r}Bg`]:e.palette.mode==="light"?_(e.palette[r].main,.62):H(e.palette[r].main,.5),pr=h("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,r[`color${u(t.color)}`],r[t.variant]]}})(k(({theme:e})=>({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},variants:[...Object.entries(e.palette).filter(v()).map(([r])=>({props:{color:r},style:{backgroundColor:S(e,r)}})),{props:({ownerState:r})=>r.color==="inherit"&&r.variant!=="buffer",style:{"&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}}},{props:{variant:"buffer"},style:{backgroundColor:"transparent"}},{props:{variant:"query"},style:{transform:"rotate(180deg)"}}]}))),fr=h("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.dashed,r[`dashedColor${u(t.color)}`]]}})(k(({theme:e})=>({position:"absolute",marginTop:0,height:"100%",width:"100%",backgroundSize:"10px 10px",backgroundPosition:"0 -23px",variants:[{props:{color:"inherit"},style:{opacity:.3,backgroundImage:"radial-gradient(currentColor 0%, currentColor 16%, transparent 42%)"}},...Object.entries(e.palette).filter(v()).map(([r])=>{const t=S(e,r);return{props:{color:r},style:{backgroundImage:`radial-gradient(${t} 0%, ${t} 16%, transparent 42%)`}}})]})),cr||{animation:`${B} 3s infinite linear`}),dr=h("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.bar,r.bar1,r[`barColor${u(t.color)}`],(t.variant==="indeterminate"||t.variant==="query")&&r.bar1Indeterminate,t.variant==="determinate"&&r.bar1Determinate,t.variant==="buffer"&&r.bar1Buffer]}})(k(({theme:e})=>({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",variants:[{props:{color:"inherit"},style:{backgroundColor:"currentColor"}},...Object.entries(e.palette).filter(v()).map(([r])=>({props:{color:r},style:{backgroundColor:(e.vars||e).palette[r].main}})),{props:{variant:"determinate"},style:{transition:`transform .${x}s linear`}},{props:{variant:"buffer"},style:{zIndex:1,transition:`transform .${x}s linear`}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:{width:"auto"}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:sr||{animation:`${$} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite`}}]}))),mr=h("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.bar,r.bar2,r[`barColor${u(t.color)}`],(t.variant==="indeterminate"||t.variant==="query")&&r.bar2Indeterminate,t.variant==="buffer"&&r.bar2Buffer]}})(k(({theme:e})=>({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",variants:[...Object.entries(e.palette).filter(v()).map(([r])=>({props:{color:r},style:{"--LinearProgressBar2-barColor":(e.vars||e).palette[r].main}})),{props:({ownerState:r})=>r.variant!=="buffer"&&r.color!=="inherit",style:{backgroundColor:"var(--LinearProgressBar2-barColor, currentColor)"}},{props:({ownerState:r})=>r.variant!=="buffer"&&r.color==="inherit",style:{backgroundColor:"currentColor"}},{props:{color:"inherit"},style:{opacity:.3}},...Object.entries(e.palette).filter(v()).map(([r])=>({props:{color:r,variant:"buffer"},style:{backgroundColor:S(e,r),transition:`transform .${x}s linear`}})),{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:{width:"auto"}},{props:({ownerState:r})=>r.variant==="indeterminate"||r.variant==="query",style:lr||{animation:`${j} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite`}}]}))),Cr=C.forwardRef(function(r,t){const a=q({props:r,name:"MuiLinearProgress"}),{className:s,color:n="primary",value:f,valueBuffer:g,variant:o="indeterminate",...i}=a,c={...a,color:n,variant:o},p=ur(c),d=J(),m={},b={bar1:{},bar2:{}};if((o==="determinate"||o==="buffer")&&f!==void 0){m["aria-valuenow"]=Math.round(f),m["aria-valuemin"]=0,m["aria-valuemax"]=100;let l=f-100;d&&(l=-l),b.bar1.transform=`translateX(${l}%)`}if(o==="buffer"&&g!==void 0){let l=(g||0)-100;d&&(l=-l),b.bar2.transform=`translateX(${l}%)`}return y.jsxs(pr,{className:O(p.root,s),ownerState:c,role:"progressbar",...m,ref:t,...i,children:[o==="buffer"?y.jsx(fr,{className:p.dashed,ownerState:c}):null,y.jsx(dr,{className:p.bar1,ownerState:c,style:b.bar1}),o==="determinate"?null:y.jsx(mr,{className:p.bar2,ownerState:c,style:b.bar2})]})}),kr=nr({createStyledComponent:h("div",{name:"MuiStack",slot:"Root"}),useThemeProps:e=>q({props:e,name:"MuiStack"})});export{Cr as L,kr as S};
