
const YEL='#FFD400',INK='#0b0c0c',BODY='#1a1512',ACCENT='#ffffff';

function seg(x1,y1,x2,y2,c=BODY,w=13){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`}
function circle(cx,cy,r,fill='none',stroke='none',sw=0){return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${stroke!=='none'?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`}
function svg(inner){return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`}

function disc(){return circle(60,62,52,YEL)+circle(60,62,52,'none',INK,5)
 +`<ellipse cx="40" cy="34" rx="16" ry="9" fill="#fff" opacity=".22" transform="rotate(-24 40 34)"/>`}
function shadow(cx=64,cy=110,rx=28,ry=7){return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".22"/>`}
function head(cx=60,cy=32,r=15){return circle(cx,cy,r,BODY)}
function face(cx=60,cy=32,dx=5,dy=-2){return circle(cx-dx,cy+dy,2.6,'#fff')+circle(cx+dx,cy+dy,2.6,'#fff')
 +`<path d="M${cx-5},${cy+7} Q${cx},${cy+11} ${cx+5},${cy+7}" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}
function star(cx,cy,r){const p=[];for(let i=0;i<8;i++){const a=Math.PI/4*i,rr=i%2?r*.45:r;p.push(`${cx+Math.cos(a)*rr},${cy+Math.sin(a)*rr}`)}return `<polygon points="${p.join(' ')}" fill="${ACCENT}"/>`}

const ICONS={
 kniebeuge:svg(disc()+shadow(60,112,26,7)
  +seg(60,48,60,72)+seg(60,50,40,60)+seg(60,50,80,60)
  +seg(60,72,46,88,ACCENT)+seg(46,88,48,108,ACCENT)+seg(60,72,74,88,ACCENT)+seg(74,88,72,108,ACCENT)
  +head()+face()),

 bergsteiger:svg(disc()+shadow(70,100,34,7)
  +seg(38,58,90,66)+seg(38,58,34,96)+seg(90,66,112,96)
  +seg(90,66,68,78,ACCENT)+seg(68,78,58,60,ACCENT)
  +head(26,52)+face(26,52)),

 einbeinstand:svg(disc()+shadow(66,110,16,6)
  +seg(60,48,60,72)+seg(60,50,36,56)+seg(60,50,84,56)+seg(60,72,66,108)
  +seg(60,72,46,86,ACCENT)+seg(46,86,56,80,ACCENT)
  +head()+face()),

 freeze:svg(disc()+shadow(65,110,30,7)
  +seg(60,48,60,72)+seg(60,50,44,62)+seg(60,50,78,38)
  +seg(60,72,48,90)+seg(48,90,44,108)+seg(60,72,74,88)+seg(74,88,86,104)
  +head()+face()
  +star(94,18,11)+circle(94,34,4,ACCENT)),

 unterarmstuetz:svg(disc()+shadow(65,102,36,7)
  +seg(34,60,86,68,ACCENT,15)+seg(34,60,30,96)+seg(86,68,110,98)
  +head(22,56)+face(22,56)),

 'knie-hoch':svg(disc()+shadow(65,110,22,6)
  +seg(60,48,60,72)+seg(60,50,46,36)+seg(60,50,78,64)+seg(60,72,70,108)
  +seg(60,72,50,54,ACCENT)+seg(50,54,58,70,ACCENT)
  +head()+face()),

 standwaage:svg(disc()+shadow(74,110,18,6)
  +seg(32,56,72,66)+seg(72,66,78,108)+seg(32,56,16,66)+seg(32,56,44,42)
  +seg(72,66,110,48,ACCENT)
  +head(24,50)+face(24,50)),

 blickwechsel:svg(disc()+shadow(64,110,24,7)
  +seg(60,48,60,72)+seg(60,50,46,66)+seg(60,50,74,66)+seg(60,72,50,108)+seg(60,72,70,108)
  +head()
  +circle(53,30,7,'#fff')+circle(67,30,7,'#fff')+circle(56,30,3,BODY)+circle(70,30,3,BODY)
  +`<path d="M${60-5},${32+7} Q60,${32+11} ${60+5},${32+7}" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
  +`<path d="M36,9 H84" stroke="${ACCENT}" stroke-width="4" stroke-linecap="round"/>`
  +`<path d="M36,9 L44,4 M36,9 L44,14 M84,9 L76,4 M84,9 L76,14" stroke="${ACCENT}" stroke-width="4" fill="none" stroke-linecap="round"/>`),

 wandsitz:svg(disc()+shadow(70,110,28,6)
  +seg(100,14,100,110)
  +seg(84,48,84,70)+seg(84,50,68,62)
  +seg(84,70,54,70,ACCENT)+seg(54,70,54,108,ACCENT)
  +head(84,34)+face(84,34)),

 ausfallschritt:svg(disc()+shadow(65,108,34,7)
  +seg(42,46,46,70)+seg(42,46,24,58)
  +seg(46,70,44,90,ACCENT)+seg(44,90,46,108,ACCENT)+seg(46,70,78,92,ACCENT)+seg(78,92,96,102,ACCENT)
  +head(40,32)+face(40,32)),

 antippen:svg(disc()+shadow(65,110,24,6)
  +seg(60,48,60,72)+seg(60,50,38,58)+seg(60,50,82,58)+seg(60,72,68,108)
  +seg(60,72,42,86,ACCENT)+seg(42,86,38,104,ACCENT)
  +`<path d="M38,104 Q14,90 22,66" stroke="${ACCENT}" stroke-width="4" fill="none" stroke-dasharray="2 8" stroke-linecap="round"/>`
  +head()+face()),

 kopfrechnen:svg(disc()+shadow(56,110,24,6)
  +seg(52,48,52,72)+seg(52,50,38,64)+seg(52,50,66,64)+seg(52,72,42,108)+seg(52,72,62,108)
  +head(52,32)+face(52,32)
  +circle(78,36,4,ACCENT)+circle(72,44,3,ACCENT)
  +circle(90,20,17,ACCENT,INK,4)
  +`<text x="90" y="26" font-size="17" font-weight="900" fill="${INK}" text-anchor="middle" font-family="Arial,sans-serif">−3</text>`)
};
