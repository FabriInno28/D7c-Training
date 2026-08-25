
const BASE='#f5f5f0',YEL='#FFD400';
function L(x1,y1,x2,y2,c=BASE){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`}
function C(cx,cy,r,c=BASE,f='none'){return `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${c}" stroke-width="8" fill="${f}"/>`}
function svg(inner){return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`}

const ICONS={
 kniebeuge:svg(C(60,22,10)+L(60,32,60,58)+L(60,34,40,46)+L(60,34,80,46)
  +L(60,58,46,78,YEL)+L(46,78,48,104,YEL)+L(60,58,74,78,YEL)+L(74,78,72,104,YEL)),

 bergsteiger:svg(C(24,44,10)+L(34,50,82,58)+L(34,50,30,92)+L(82,58,106,92)
  +L(82,58,60,70,YEL)+L(60,70,50,54,YEL)),

 einbeinstand:svg(C(60,22,10)+L(60,34,36,40)+L(60,34,84,40)+L(60,34,60,58)+L(60,58,66,104)
  +L(60,58,46,72,YEL)+L(46,72,56,66,YEL)),

 freeze:svg(C(60,22,10)+L(60,34,44,48)+L(60,34,78,26)+L(60,34,60,58)
  +L(60,58,48,76)+L(48,76,44,100)+L(60,58,74,74)+L(74,74,84,96)
  +L(90,8,90,20,YEL)+C(90,28,4,YEL)),

 unterarmstuetz:svg(C(22,52,10)+L(32,56,84,62,YEL)+L(32,56,30,90)+L(84,62,110,94)),

 'knie-hoch':svg(C(60,22,10)+L(60,34,60,58)+L(60,34,46,22)+L(60,34,76,50)+L(60,58,70,104)
  +L(60,58,50,44,YEL)+L(50,44,58,58,YEL)),

 standwaage:svg(C(28,36,10)+L(36,44,64,58)+L(64,58,70,104)+L(36,44,18,56)+L(36,44,50,32)
  +L(64,58,98,48,YEL)),

 blickwechsel:svg(C(60,22,10)+C(56,20,2,BASE,BASE)+C(64,20,2,BASE,BASE)+L(60,34,60,58)
  +L(60,36,48,58)+L(60,36,72,58)+L(60,58,50,104)+L(60,58,70,104)
  +L(40,8,80,8,YEL)+L(40,8,46,4,YEL)+L(40,8,46,12,YEL)+L(80,8,74,4,YEL)+L(80,8,74,12,YEL)),

 wandsitz:svg(L(104,8,104,112)+C(86,26,10)+L(86,36,86,60)+L(86,38,70,50)
  +L(86,60,54,60,YEL)+L(54,60,54,104,YEL)),

 ausfallschritt:svg(C(40,24,10)+L(42,36,46,60)+L(42,36,24,48)
  +L(46,60,44,82,YEL)+L(44,82,46,104,YEL)+L(46,60,78,88,YEL)+L(78,88,96,98,YEL)),

 antippen:svg(C(60,22,10)+L(60,34,60,58)+L(60,34,38,44)+L(60,34,82,44)+L(60,58,68,104)
  +L(60,58,42,78,YEL)+L(42,78,38,98,YEL)
  +'<path d="M38,98 Q14,84 22,60" stroke="'+YEL+'" stroke-width="4" fill="none" stroke-dasharray="3 6" stroke-linecap="round"/>'),

 kopfrechnen:svg(C(52,22,10)+L(52,34,52,58)+L(52,36,38,52)+L(52,36,66,52)+L(52,58,42,104)+L(52,58,62,104)
  +C(96,20,14)+C(78,32,3,BASE,BASE)+C(86,25,2,BASE,BASE)
  +'<text x="96" y="25" font-size="14" font-weight="900" fill="'+YEL+'" text-anchor="middle" font-family="Arial,sans-serif">−3</text>')
};
