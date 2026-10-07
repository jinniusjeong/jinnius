"""TURNOVA 단상자 칼선 생성기 (STE: 상·하 턱 모두 후면에 연결).
치수는 내치수(mm) 가정값 — 용기 업체 도면 수령 후 SKUS만 고쳐 재실행.
출력: SKU별 SVG(mm 실척) + PDF + PNG 미리보기."""
import cairosvg, os
OUT=os.path.dirname(os.path.abspath(__file__))
SKUS={ # name: (W 정면폭, D 측면폭, H 높이, 용기 가정)
 'tube-80ml':(58,38,157,'튜브 Ø35×L150, 실링부 폭 약 55mm → 정면폭 58'),
 'jar-30ml':(60,60,52,'자 Ø56×H48'),
 'jar-15ml':(48,48,42,'자 Ø45×H38'),
 'ampoule-30ml':(36,36,115,'스포이드 병 Ø33×H110'),
 'serum-30ml':(36,36,130,'펌프 병 Ø33×H125'),
}
BLEED,SAFE,GLUE,TUCK=3,3,13,15
CUT,CRE,BLD,SAF,FOIL,ETCH,NOTE='#E3001B','#0070C0','#BFD7EA','#22A06B','#C8743A','#7A5CC2','#333'
def dieline(name,W,D,H,assume):
    X0,Y0=40,40+D+TUCK  # 후면 좌상단
    xs=[X0,X0+W,X0+W+D,X0+2*W+D,X0+2*W+2*D]  # 후면|좌측|정면|우측|(접착)
    top,bot=Y0,Y0+H
    dust=min(D*0.75,W*0.5)
    cut=[]  # 외곽 칼선 폴리곤
    # 위쪽: 후면 위 뚜껑(D)+턱(TUCK), 좌·우측 위 방진날개
    p=[(xs[0],top),(xs[0],top-D),(xs[0]+3,top-D-TUCK+3),(xs[0]+6,top-D-TUCK),(xs[1]-6,top-D-TUCK),(xs[1]-3,top-D-TUCK+3),(xs[1],top-D),(xs[1],top),
       (xs[1]+1,top),(xs[1]+1,top-dust+4),(xs[1]+5,top-dust),(xs[2]-8,top-dust),(xs[2]-1,top-4),(xs[2]-1,top),
       (xs[2],top),(xs[3],top),
       (xs[3]+1,top),(xs[3]+1,top-4),(xs[3]+8,top-dust),(xs[4]-5,top-dust),(xs[4]-1,top-dust+4),(xs[4]-1,top),
       (xs[4],top),(xs[4]+GLUE,top+GLUE*0.27),(xs[4]+GLUE,bot-GLUE*0.27),(xs[4],bot),
       (xs[4]-1,bot),(xs[4]-1,bot+dust-4),(xs[4]-5,bot+dust),(xs[3]+8,bot+dust),(xs[3]+1,bot+4),(xs[3]+1,bot),
       (xs[3],bot),(xs[2],bot),
       (xs[2]-1,bot),(xs[2]-1,bot+4),(xs[2]-8,bot+dust),(xs[1]+5,bot+dust),(xs[1]+1,bot+dust-4),(xs[1]+1,bot),
       (xs[1],bot),(xs[1],bot+D),(xs[1]-3,bot+D+TUCK-3),(xs[1]-6,bot+D+TUCK),(xs[0]+6,bot+D+TUCK),(xs[0]+3,bot+D+TUCK-3),(xs[0],bot+D),(xs[0],bot)]
    poly=' '.join(f'{x:.1f},{y:.1f}' for x,y in p)
    cre=[(xs[1],top,xs[1],bot),(xs[2],top,xs[2],bot),(xs[3],top,xs[3],bot),(xs[4],top,xs[4],bot),
         (xs[0],top,xs[4],top),(xs[0],bot,xs[4],bot),(xs[0],top-D,xs[1],top-D),(xs[0],bot+D,xs[1],bot+D)]
    Wt=xs[4]+GLUE+40; Ht=bot+D+TUCK+90
    s=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{Wt}mm" height="{Ht}mm" viewBox="0 0 {Wt} {Ht}" font-family="Noto Sans CJK KR,Noto Sans KR,WenQuanYi Zen Hei,sans-serif">',
       '<rect width="100%" height="100%" fill="#fff"/>',
       f'<g id="BLEED"><polygon points="{poly}" fill="#E8EEFA" stroke="{BLD}" stroke-width="{BLEED*2}" stroke-linejoin="miter"/><polygon points="{poly}" fill="#1E22AA" fill-opacity="0.10"/></g>']
    fx,fw=xs[2],W  # 정면
    def box(x,y,w,h,c,lab,dash=''):
        s.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="none" stroke="{c}" stroke-width="0.3" {dash}/>')
        if lab: s.append(f'<text x="{x+w/2:.1f}" y="{y+h/2+0.9:.1f}" font-size="{min(2.6,max(1.4,w/12)):.1f}" fill="{c}" text-anchor="middle">{lab}</text>')
    # 안전영역
    for i,(a,b) in enumerate(zip(xs[:4],xs[1:5])):
        box(a+SAFE,top+SAFE,b-a-2*SAFE,H-2*SAFE,SAF,'','stroke-dasharray="1,1"')
    s.append('<defs><pattern id="etch" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0,3 L3,0" stroke="'+ETCH+'" stroke-width="0.25"/></pattern></defs>')
    s.append(f'<rect x="{xs[0]}" y="{top}" width="{xs[4]-xs[0]}" height="{H}" fill="url(#etch)" opacity="0.35"/>')
    # 정면 요소 (가이드 v5.4 비율, mm 스택 — 낮은 상자도 겹치지 않게)
    wm=0.62*fw; wmh=wm*0.15; sy=0.18*fw
    stack=[('wm',wmh),('g',sy*0.6),('sym',sy),('g',sy*0.6),('name',max(2.5,wmh*0.42)),('g',1.2),('trx',max(2.2,wmh*0.25)),('g',1.2),('ben',1.8)]
    tot=sum(h for _,h in stack); qy=top+0.90*H-3.2
    y=top+0.20*H if top+0.20*H+tot<qy-3 else top+max(SAFE+1,(qy-3-top-tot)/2)
    if y+tot>qy-2: # 너무 낮으면 간격 축소
        k=(qy-2-top-SAFE-1-sum(h for n,h in stack if n!='g'))/max(0.1,sum(h for n,h in stack if n=='g')); stack=[(n,h*max(0.2,min(1,k)) if n=='g' else h) for n,h in stack]; y=top+SAFE+1
    for n,h in stack:
        if n=='wm': box(fx+(fw-wm)/2,y,wm,h,FOIL,'워드마크 62% · 포일')
        if n=='sym': box(fx+(fw-sy)/2,y,sy,sy,FOIL,'심볼18%')
        if n=='name': box(fx+0.1*fw,y,0.8*fw,h,NOTE,'제품명 · 코퍼 무광')
        if n=='trx': box(fx+0.3*fw,y,0.4*fw,h,NOTE,'TRX-8™')
        if n=='ben': box(fx+0.12*fw,y,0.76*fw,h,NOTE,'효능 한 줄')
        y+=h
    box(fx+0.25*fw,qy,0.5*fw,3.2,NOTE,'용량 3.2mm↑')
    short=H<80
    rx=xs[3]; box(rx+SAFE+1,top+SAFE+1,D-2*SAFE-2,(0.6*H if not short else H-2*SAFE-2),NOTE,'우측면 USP')
    lx=xs[1]; sz=0.28*H if not short else max(12,0.3*H)
    box(lx+SAFE+1,top+SAFE+1,D-2*SAFE-2,H-2*SAFE-2-sz-2,NOTE,'좌측면 성분')
    box(lx+SAFE,bot-sz-SAFE,D-2*SAFE,sz,'#D97706','스티커 존 · 무코팅')
    bx=xs[0]; bc_w=min(30,W-2*SAFE-4); bc_h=bc_w*0.7
    if not short:
        box(bx+SAFE+1,top+0.06*H,W-2*SAFE-2,0.55*H,NOTE,'후면 · 국/영 전성분 · 주의사항 · 책임판매업자')
        by=top+0.66*H; box(bx+SAFE+2,by,bc_w,bc_h,'#000','바코드 ≥80%')
        if W-2*SAFE-4-bc_w-3>=15: box(bx+SAFE+2+bc_w+3,by,15,15,'#000','QR 15')
        else: box(bx+(W-15)/2,by+bc_h+3,15,15,'#000','QR 15')
    else:
        box(bx+SAFE+1,top+SAFE+1,W-2*SAFE-2-17,H-2*SAFE-2,NOTE,'후면 · 전성분 등')
        box(bx+W-SAFE-15,top+SAFE+1,15,15,'#000','QR 15')
    # 상단·바닥 뚜껑
    box(xs[0]+SAFE,top-D+SAFE,W-2*SAFE,D-2*SAFE,FOIL,'상단: TURNOVA (180° 회전 배치)')
    cw=min(40,W-2*SAFE); ch=min(15,D-2*SAFE)
    if H<80:
        bw=min(30,W-2*SAFE-2); bh=bw*0.7; ch=min(12,D-2*SAFE-bh-3)
        box(xs[0]+(W-bw)/2,bot+SAFE,bw,bh,'#000','바코드 (바닥 이동)')
        box(xs[0]+(W-cw)/2,bot+SAFE+bh+2,cw,ch,'#D97706',f'코딩창 {cw:.0f}×{ch:.0f}')
    else: box(xs[0]+(W-cw)/2,bot+(D-ch)/2,cw,ch,'#D97706',f'코딩창 {cw:.0f}×{ch:.0f} 무코팅')
    # 접착날개 녹아웃
    s.append(f'<rect x="{xs[4]}" y="{top+3}" width="{GLUE-1}" height="{H-6}" fill="#fff" stroke="#D97706" stroke-width="0.3" stroke-dasharray="1,1"/>')
    s.append(f'<text x="{xs[4]+GLUE/2}" y="{(top+bot)/2}" font-size="1.8" fill="#D97706" text-anchor="middle" transform="rotate(-90 {xs[4]+GLUE/2} {(top+bot)/2})">접착부 라미·에칭·잉크 녹아웃</text>')
    # 칼선·괘선
    s.append(f'<polygon id="CUT" points="{poly}" fill="none" stroke="{CUT}" stroke-width="0.35"/>')
    for x1,y1,x2,y2 in cre: s.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{CRE}" stroke-width="0.35" stroke-dasharray="2,1.2"/>')
    for i,lab in enumerate(['후면','좌측면','정면','우측면']):
        s.append(f'<text x="{(xs[i]+xs[i+1])/2}" y="{top+0.97*H}" font-size="2.4" fill="#999" text-anchor="middle">{lab}</text>')
    # 범례·사양
    ly=bot+D+TUCK+10
    legend=[(CUT,'칼선(재단) 실선'),(CRE,'괘선(접힘) 점선'),(BLD,'도련 3mm'),(SAF,'안전영역 3mm(박·바코드·QR·6pt↓는 접선에서 5mm)'),(FOIL,'유광 코퍼 포일 (워드마크·심볼)'),('#D97706','녹아웃: 접착부·코딩창·스티커존 (라미·에칭·잉크 없음)'),(ETCH,'에칭 UV: 무늬 없는 균일 미세 결 = 4면 전체, 단 글자·포일·녹아웃 주변 2mm 제외 (배경 패턴 금지)')]
    for i,(c,t) in enumerate(legend):
        s.append(f'<rect x="40" y="{ly+i*5.5}" width="6" height="3" fill="{c}"/><text x="49" y="{ly+i*5.5+2.6}" font-size="3" fill="#222">{t}</text>')
    spec=[f'TURNOVA 단상자 칼선 · {name} · 내치수 W{W}×D{D}×H{H} mm (가정: {assume})',
          '구조 STE(상·하 턱 후면 연결) · 아이보리(SBS) 350g 내외 · 무광 라미네이팅 → 에칭 UV(무늬 없음) → 코퍼 포일 순 (업체 확인)',
          '※ 치수는 가정값. 용기 업체 도면 수령 후 make_dielines.py 의 SKUS 수치만 수정해 재출력. 최종 칼선은 인쇄소 칼 도면 기준']
    for i,t in enumerate(spec): s.append(f'<text x="40" y="{ly+len(legend)*5.5+6+i*5}" font-size="3.2" fill="#000">{t}</text>')
    s.append('</svg>')
    svg='\n'.join(s); base=f'{OUT}/turnova-dieline-{name}'
    open(base+'.svg','w').write(svg)
    cairosvg.svg2pdf(bytestring=svg.encode(),write_to=base+'.pdf')
    cairosvg.svg2png(bytestring=svg.encode(),write_to=base+'.png',output_width=2000)
for k,(W,D,H,a) in SKUS.items(): dieline(k,W,D,H,a); print('ok',k)
