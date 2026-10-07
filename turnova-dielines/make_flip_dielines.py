"""TURNOVA 플립(앞표지 개폐형) 단상자 칼선 — 샬롯 틸버리식.
앞표지(C)를 열면 안쪽 정면(I)에 비포/애프터·클레임이 보이고, 우측면(R)에도 % 클레임.
펼친 순서: [앞표지 C][좌측 L][후면 B][우측 R][안쪽 정면 I][접착날개 → L 안쪽에 접착]
C는 L의 앞모서리에 경첩으로 연결, 자유단은 정면 우측 모서리에서 열림.
치수는 내치수(mm) 가정값 — 용기 업체 도면 수령 후 SKUS만 수정해 재실행."""
import cairosvg, os
OUT=os.path.dirname(os.path.abspath(__file__))
SKUS={'tube-80ml':(58,38,157,'튜브 Ø35×L150, 실링부 폭 약 55mm'),
 'jar-30ml':(60,60,52,'자 Ø56×H48'),'jar-15ml':(48,48,42,'자 Ø45×H38'),
 'ampoule-30ml':(36,36,115,'스포이드 병 Ø33×H110'),'serum-30ml':(36,36,130,'펌프 병 Ø33×H125')}
BLEED,SAFE,GLUE,TUCK,CW=3,3,13,15,1.0  # CW: 표지가 안쪽 정면을 감싸도록 폭 +1mm
CUT,CRE,BLD,SAF,FOIL,NOTE,KO,ETCH='#E3001B','#0070C0','#BFD7EA','#22A06B','#C8743A','#333','#D97706','#7A5CC2'
def make(name,W,D,H,assume):
    X0=40; top=40+D+TUCK; bot=top+H
    Wc=W+CW
    xs=[X0, X0+Wc, X0+Wc+D, X0+Wc+D+W, X0+Wc+2*D+W, X0+Wc+2*D+2*W]  # C|L|B|R|I|glue
    dust=min(D*0.75,W*0.5); nr=min(6,H*0.06)
    bx0,bx1=xs[2],xs[3]  # 후면(턱 연결)
    p=[(xs[0],top+H/2-nr)]
    # 표지 자유단(왼쪽) 위로 + 엄지 홈
    p=[(xs[0],top),(xs[1],top),
       (xs[1]+1,top),(xs[1]+1,top-dust+4),(xs[1]+5,top-dust),(xs[2]-8,top-dust),(xs[2]-1,top-4),(xs[2]-1,top),
       (bx0,top),(bx0,top-D),(bx0+3,top-D-TUCK+3),(bx0+6,top-D-TUCK),(bx1-6,top-D-TUCK),(bx1-3,top-D-TUCK+3),(bx1,top-D),(bx1,top),
       (xs[3]+1,top),(xs[3]+1,top-4),(xs[3]+8,top-dust),(xs[4]-5,top-dust),(xs[4]-1,top-dust+4),(xs[4]-1,top),
       (xs[4],top),(xs[5],top),(xs[5]+GLUE,top+GLUE*0.27),(xs[5]+GLUE,bot-GLUE*0.27),(xs[5],bot),(xs[4],bot),
       (xs[4]-1,bot),(xs[4]-1,bot+dust-4),(xs[4]-5,bot+dust),(xs[3]+8,bot+dust),(xs[3]+1,bot+4),(xs[3]+1,bot),
       (bx1,bot),(bx1,bot+D),(bx1-3,bot+D+TUCK-3),(bx1-6,bot+D+TUCK),(bx0+6,bot+D+TUCK),(bx0+3,bot+D+TUCK-3),(bx0,bot+D),(bx0,bot),
       (xs[2]-1,bot),(xs[2]-1,bot+4),(xs[2]-8,bot+dust),(xs[1]+5,bot+dust),(xs[1]+1,bot+dust-4),(xs[1]+1,bot),
       (xs[1],bot),(xs[0],bot)]
    poly=' '.join(f'{x:.1f},{y:.1f}' for x,y in p)
    # 엄지 홈(표지 자유단 중앙, 반원) — 별도 path로 그리고 외곽선과 겹침
    cy=top+H/2
    notch=f'M{xs[0]},{cy-nr} A{nr},{nr} 0 0,1 {xs[0]},{cy+nr}'
    cre=[(x,top,x,bot) for x in xs[1:6]]+[(xs[1],top,xs[5],top),(xs[1],bot,xs[5],bot),(bx0,top-D,bx1,top-D),(bx0,bot+D,bx1,bot+D)]
    Wt=xs[5]+GLUE+40; Ht=bot+D+TUCK+110
    s=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{Wt}mm" height="{Ht}mm" viewBox="0 0 {Wt} {Ht}" font-family="Noto Sans CJK KR,WenQuanYi Zen Hei,sans-serif">',
       '<rect width="100%" height="100%" fill="#fff"/>',
       f'<polygon points="{poly}" fill="#E8EEFA" stroke="{BLD}" stroke-width="{BLEED*2}"/><polygon points="{poly}" fill="#1E22AA" fill-opacity="0.10"/>']
    def box(x,y,w,h,c,lab,fs=None):
        s.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="none" stroke="{c}" stroke-width="0.3"/>')
        if lab: s.append(f'<text x="{x+w/2:.1f}" y="{y+h/2+0.8:.1f}" font-size="{fs or min(2.4,max(1.3,w/14)):.1f}" fill="{c}" text-anchor="middle">{lab}</text>')
    for a,b in zip(xs[:5],xs[1:6]):
        s.append(f'<rect x="{a+SAFE:.1f}" y="{top+SAFE:.1f}" width="{b-a-2*SAFE:.1f}" height="{H-2*SAFE:.1f}" fill="none" stroke="{SAF}" stroke-width="0.25" stroke-dasharray="1,1"/>')
    # C 앞표지 = 마스터 시안 배치 (가이드 v5.7)
    fx,fw=xs[0],Wc
    wm=0.62*fw; wmh=wm*0.15; sy=0.12*fw
    st=[('wm',wmh),('g',sy*0.9),('sym',sy),('g',sy*0.9),('name',max(2.5,wmh*0.42)),('g',1.2),('trx',max(2.2,wmh*0.25)),('g',1.2),('ben',1.8)]
    qy=top+0.90*H-3.2; tot=sum(h for _,h in st)
    y=top+0.20*H if top+0.20*H+tot<qy-3 else top+SAFE+1
    if y+tot>qy-2:
        k=(qy-2-y-sum(h for n,h in st if n!='g'))/max(.1,sum(h for n,h in st if n=='g')); st=[(n,h*max(.2,min(1,k)) if n=='g' else h) for n,h in st]
    for n,h in st:
        if n=='wm': box(fx+(fw-wm)/2,y,wm,h,FOIL,'워드마크 62% 유광 포일')
        if n=='sym': box(fx+(fw-sy)/2,y,sy,sy,FOIL,'심볼12%',1.2)
        if n=='name': box(fx+.1*fw,y,.8*fw,h,NOTE,'제품명')
        if n=='trx': box(fx+.3*fw,y,.4*fw,h,NOTE,'TRX-8™')
        if n=='ben': box(fx+.12*fw,y,.76*fw,h,NOTE,'효능 한 줄')
        y+=h
    box(fx+.25*fw,qy,.5*fw,3.2,NOTE,'용량 3.2mm↑')
    s.append(f'<text x="{fx+fw/2}" y="{top-3}" font-size="2.6" fill="{FOIL}" text-anchor="middle">① 앞표지 (닫힌 정면)</text>')
    # I 안쪽 정면 (표지 열면 보임)
    ix=xs[4]; short=H<80
    box(ix+SAFE+1,top+SAFE+1,W-2*SAFE-2,0.10*H,NOTE,'헤드라인 클레임')
    if not short:
        box(ix+SAFE+4,top+0.17*H,W-2*SAFE-8,0.24*H,NOTE,'비포 사진'); box(ix+SAFE+4,top+0.44*H,W-2*SAFE-8,0.24*H,NOTE,'애프터 사진')
        box(ix+SAFE+1,top+0.71*H,W-2*SAFE-2,0.24*H,NOTE,'체크리스트 □ + 시험 조건 *')
    else:
        box(ix+SAFE+1,top+0.17*H,(W-2*SAFE-2)/2-1,0.5*H,NOTE,'비포'); box(ix+W/2+0.5,top+0.17*H,(W-2*SAFE-2)/2-1,0.5*H,NOTE,'애프터')
        box(ix+SAFE+1,top+0.72*H,W-2*SAFE-2,0.24*H,NOTE,'체크리스트 + 조건 *')
    s.append(f'<text x="{ix+W/2}" y="{top-3}" font-size="2.6" fill="{NOTE}" text-anchor="middle">② 안쪽 정면 (표지 열면)</text>')
    # R 우측면
    rx=xs[3]
    box(rx+SAFE+1,top+SAFE+1,D-2*SAFE-2,0.22*H,NOTE,'% 클레임 3줄')
    if not short:
        box(rx+SAFE+2,top+0.28*H,D-2*SAFE-4,0.22*H,NOTE,'비포'); box(rx+SAFE+2,top+0.53*H,D-2*SAFE-4,0.22*H,NOTE,'애프터')
    box(rx+SAFE+1,top+(0.80 if not short else 0.30)*H,D-2*SAFE-2,(0.14 if not short else 0.6)*H,NOTE,'* 시험 조건·CLINICALLY TESTED' if not short else '% + 비포/애프터')
    s.append(f'<text x="{rx+D/2}" y="{top-3 if dust<8 else top-dust-2}" font-size="2.4" fill="{NOTE}" text-anchor="middle">③ 우측면</text>')
    # L 좌측면 · B 후면
    lx=xs[1]; sz=0.28*H if not short else max(12,0.3*H)
    box(lx+SAFE+1,top+SAFE+1,D-2*SAFE-2,H-2*SAFE-2-sz-2,NOTE,'성분 스토리'); box(lx+SAFE,bot-sz-SAFE,D-2*SAFE,sz,KO,'스티커 존')
    bc_w=min(30,W-2*SAFE-4); bc_h=bc_w*.7
    if not short:
        box(bx0+SAFE+1,top+.06*H,W-2*SAFE-2,.55*H,NOTE,'후면 · 국/영 전성분 · 주의사항 · 책임판매업자')
        box(bx0+SAFE+2,top+.66*H,bc_w,bc_h,'#000','바코드')
        if W-2*SAFE-4-bc_w-3>=15: box(bx0+SAFE+2+bc_w+3,top+.66*H,15,15,'#000','QR')
        else: box(bx0+(W-15)/2,top+.66*H+bc_h+3,15,15,'#000','QR')
    else:
        box(bx0+SAFE+1,top+SAFE+1,W-2*SAFE-19,H-2*SAFE-2,NOTE,'후면 전성분'); box(bx0+W-SAFE-15,top+SAFE+1,15,15,'#000','QR')
    box(bx0+SAFE,top-D+SAFE,W-2*SAFE,D-2*SAFE,FOIL,'상단 TURNOVA (180°)')
    cw=min(40,W-2*SAFE); ch=min(15,D-2*SAFE)
    if short:
        bw=min(30,W-2*SAFE-2); bh=bw*.7; ch=min(12,D-2*SAFE-bh-3)
        box(bx0+(W-bw)/2,bot+SAFE,bw,bh,'#000','바코드'); box(bx0+(W-cw)/2,bot+SAFE+bh+2,cw,ch,KO,'코딩창')
    else: box(bx0+(W-cw)/2,bot+(D-ch)/2,cw,ch,KO,'코딩창 무코팅')
    s.append(f'<rect x="{xs[5]}" y="{top+3}" width="{GLUE-1}" height="{H-6}" fill="#fff" stroke="{KO}" stroke-width="0.3" stroke-dasharray="1,1"/>')
    # 칼선·괘선·엄지홈
    s.append(f'<polygon points="{poly}" fill="none" stroke="{CUT}" stroke-width="0.35"/>')
    s.append(f'<path d="{notch}" fill="#fff" stroke="{CUT}" stroke-width="0.35"/>')
    for x1,y1,x2,y2 in cre: s.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{CRE}" stroke-width="0.35" stroke-dasharray="2,1.2"/>')
    for i,lab in enumerate(['앞표지 C','좌측면 L','후면 B','우측면 R','안쪽 정면 I']):
        s.append(f'<text x="{(xs[i]+xs[i+1])/2}" y="{top+0.975*H}" font-size="2.2" fill="#999" text-anchor="middle">{lab}</text>')
    ly=bot+D+TUCK+10
    leg=[(CUT,'칼선 실선 (앞표지 자유단 엄지 홈 포함)'),(CRE,'괘선 점선 — C·L 경첩 괘선은 개폐용 이중 괘선 권장'),(BLD,'도련 3mm'),(SAF,'안전영역 3mm'),(FOIL,'유광 코퍼 포일: 워드마크·심볼만'),(KO,'녹아웃: 접착부·코딩창·스티커존'),(ETCH,'전면: 무광 라미네이팅 + 에칭 UV(무늬 없는 미세 결)')]
    for i,(c,t) in enumerate(leg): s.append(f'<rect x="40" y="{ly+i*5.5}" width="6" height="3" fill="{c}"/><text x="49" y="{ly+i*5.5+2.6}" font-size="3" fill="#222">{t}</text>')
    spec=[f'TURNOVA 플립 단상자 칼선 · {name} · 내치수 W{W}×D{D}×H{H} mm (가정: {assume})',
      '구조: 앞표지(C)가 좌측면 앞모서리에 경첩 → 열면 안쪽 정면(I)·우측면(R)에 클레임·비포/애프터 (샬롯 틸버리식)',
      '접착날개는 I 끝 → L 안쪽에 접착. 상·하 턱은 후면 B에 연결(STE). 표지 안쪽면은 별도 인쇄(사용법·8 PM 리추얼) 시 양면 인쇄',
      '닫힘 유지: 표지 폭 +1mm 감쌈 + 엄지 홈. 필요 시 투명 원형 씰(Ø15) 또는 마이크로 자석 (업체 확인)',
      '※ 비포/애프터·% 클레임은 인체적용시험 실증 + 시험 조건(*) 병기 후에만 인쇄 (가이드 9-1). 치수는 가정값']
    for i,t in enumerate(spec): s.append(f'<text x="40" y="{ly+len(leg)*5.5+6+i*5}" font-size="3.1" fill="#000">{t}</text>')
    s.append('</svg>'); svg='\n'.join(s); base=f'{OUT}/turnova-flip-dieline-{name}'
    open(base+'.svg','w').write(svg); cairosvg.svg2pdf(bytestring=svg.encode(),write_to=base+'.pdf'); cairosvg.svg2png(bytestring=svg.encode(),write_to=base+'.png',output_width=2200)
for k,v in SKUS.items(): make(k,*v); print('ok',k)
