# Builds index.html for the TURNOVA tube package board.
import html, os, pathlib
HERE = pathlib.Path(__file__).parent
MOCK = HERE.parent / ("mockups" if (HERE.parent / "mockups").exists() else "mock")
OYG = "https://global.oliveyoung.com/product/detail?prdtNo="

# group: user / kb / gl ; place: vanity / bath / both ; flags: oct (8각·숫자 선례), pair (형제 구분 사례)
REFS = [
  # 대표님 공유
  ("u01.jpg","user","AESTURA","아토베리어365 크림","80ml","튜브 · 캡 아래로 세움","원형 캡","화이트 + 하단 사선 블루","vanity",[],"배리어 크림 표준 문법. 블루를 하단 블록으로만 쓴다. 터노바 배리어의 출발점.","대표님 공유 이미지"),
  ("u02.jpg","user","d'Alba","비타 토닝 캡슐 크림","55g","튜브","골드 메탈 원형 캡","화이트 + 골드 라인","vanity",[],"캡슐 제형 + 메탈 캡. 터노바 배리어도 미세 캡슐 함유(피에프네이처 1차 피드백)라 가장 가까운 처방 레퍼런스.","대표님 공유 이미지"),
  ("u03.jpg","user","DUA by AB","Balancing Cream Cleanser with TFC5™","125ml","와이드 튜브","원형 캡, 바디 동색","코퍼 무광 + 블루 서체","bath",["pair"],"바더 본 라인(블루+코퍼)을 뒤집은 서브라인. 숫자 코드(TFC5)와 색 반전으로 분리.","대표님 공유 이미지"),
  ("u04.jpg","user","Augustinus Bader","The Rich Conditioner with TFC8®","150ml","슬림 튜브","코퍼 원형 캡","코발트 블루 + 코퍼","bath",[],"욕실 제품도 화장대 제품과 거의 같은 옷. 바더는 장소를 구분하지 않는다.","대표님 공유 이미지"),
  ("u05.jpg","user","medicube","콜라겐 나이트 랩핑 마스크","75ml","튜브 · 캡 아래로 세움","두꺼운 투명 캡","로즈골드 메탈릭 고광택","bath",[],"랩핑 마스크 1위. 고광택 바디 + 투명 캡이 이 카테고리의 굳은 문법.","대표님 공유 이미지"),
  # K-beauty / Olive Young
  ("kb02-aestura-atobarrier365-hydro-soothing.jpg","kb","AESTURA","아토베리어365 하이드로 수딩크림","80ml","같은 튜브","같은 캡","튜브 전체 연블루","vanity",["pair"],"같은 라인 두 튜브를 색 비율로만 구분(흰 바탕+블루 포인트 vs 블루 전체).",OYG+"GA260439766"),
  ("kb03-drjart-ceramidin-barrier-cream.jpg","kb","Dr.Jart+","세라마이딘 스킨배리어 크림","50ml","튜브","화이트 캡(추정 스크류)","화이트 + 옐로 상단","vanity",["pair"],"컬러 블록 위치로 정체성.",OYG+"GA260137027"),
  ("kb04-drjart-ceramidin-ultra-cream.jpg","kb","Dr.Jart+","세라마이딘 울트라 크림","50ml","같은 튜브","같은 캡","옐로 → 골드 메탈릭","vanity",["pair"],"같은 몰드에서 메탈 컬러로 상위 라인을 표시. 터노바 코퍼 운용에 직접 참고.",OYG+"GA260137035"),
  ("kb05-zeroid-intensive-cream.jpg","kb","ZEROID","인텐시브 크림","80ml","튜브","화이트 캡(추정 스크류)","화이트 + 라임","vanity",["pair"],"더마 배리어 크림.",OYG+"GA250732251"),
  ("kb06-zeroid-intensive-oint-cream.jpg","kb","ZEROID","인텐시브 오인트 크림","80ml","같은 튜브","같은 캡","화이트 + 그린 띠","vanity",["pair"],"띠 하나로 형제 구분. 비용 0원 차별화의 한계도 함께 보여줌.",OYG+"GA241227379"),
  ("kb07-illiyoon-ato-concentrate-cream.jpg","kb","ILLIYOON","세라마이드 아토 집중크림","75ml","튜브","넓은 화이트 캡","화이트 + 연블루","vanity",[],"올리브영 배리어 스테디셀러. 매대의 '화이트+블루' 포화를 확인.",OYG+"GA251034628"),
  ("kb08-physiogel-dmt-facial-cream.jpg","kb","PHYSIOGEL","DMT 페이셜 크림","150ml","오벌 튜브","원터치 플립탑(엄지 홈)","화이트 + 블루 웨이브","vanity",[],"데일리 배리어 크림에 원터치를 단 사례. 원터치 = '매일, 한 손' 신호.",OYG+"GA210000212"),
  ("kb10-physiogel-red-soothing-ai-repair.jpg","kb","PHYSIOGEL","레드수딩 AI 리페어 크림","100ml","같은 오벌 튜브","원터치 플립탑","화이트 + 레드 웨이브","vanity",["pair"],"라인 구분은 액센트 컬러로만.",OYG+"GA240121839"),
  ("kb11-abib-heartleaf-creme-calming-tube.jpg","kb","Abib","어성초 크림 카밍 튜브","75ml","슬림 크림프 튜브","다각형 소형 캡, 바디 동색","세이지 그린 무광","vanity",["oct","pair"],"다각형 캡 + 동색 처리로 오브제처럼 보인다. 8각 캡의 국내 근접 사례.","https://mirai-skin.com/products/abib-heartleaf-creme-calming-tube-75ml"),
  ("kb12-abib-hyaluronic-boom-creme-water-tube.jpg","kb","Abib","히알루로닉 붐 크림 워터 튜브","75ml","같은 튜브","같은 다각형 캡","아이스 블루","vanity",["oct","pair"],"바디·캡 색만 바꿔 형제 구분.","https://mirai-skin.com/"),
  ("kb14-medicube-kojic-turmeric-wrapping-mask.jpg","kb","medicube","코직산 강황 나이트 래핑 마스크","75ml","같은 튜브","같은 투명 캡","골드 옐로 고광택","bath",["pair"],"랩핑 2종을 같은 몰드·색 변경으로 운영.",OYG+"GA250832980"),
  ("kb15-medipeel-red-lacto-collagen-wrapping.jpg","kb","MEDI-PEEL","레드 락토 콜라겐 랩핑 마스크","70ml","길고 가는 튜브","투명 캡","레드 고광택","bath",[],"브러시 동봉. '투명 캡 + 원색 고광택' 공식.",OYG+"GA221016494"),
  ("kb16-medipeel-extra-super9-wrapping.jpg","kb","MEDI-PEEL","엑스트라 슈퍼9+ 랩핑 마스크","70ml","같은 튜브 + 스파우트 리필","투명 캡","코발트 블루","bath",["pair"],"블루 랩핑 마스크 선례. 리필 파우치로 재구매 구조.",OYG+"GA250631245"),
  ("kb17-abib-lifting-collagen-wrapping-mask.jpg","kb","Abib","리프팅 콜라겐 래핑 마스크","100ml","소프트 튜브","바디 동색 캡","아이보리 무광","bath",[],"스패출러 동봉. 마스크 = 도구가 따라오는 제품.",OYG+"GA250530794"),
  ("kb18-sulwhasoo-overnight-vitalizing-mask.jpg","kb","Sulwhasoo","여윤 수면팩","120ml","튜브","나팔형 받침 캡, 바디 동색","오렌지 무광","bath",[],"럭셔리 마스크 튜브는 캡을 조각처럼 만든다.","https://int.sulwhasoo.com/products/overnight-vitalizing-mask"),
  ("kb19-sulwhasoo-overnight-recharging-mask.jpg","kb","Sulwhasoo","수면 리차징 마스크","120ml","같은 튜브","같은 나팔 캡","오렌지→화이트 그라데이션","bath",["pair"],"마스크 5종이 한 몰드를 공유, 바디 색만 다름.","https://int.sulwhasoo.com/products/overnight-recharging-mask"),
  ("kb21-cosrx-rice-overnight-spa-mask.jpg","kb","COSRX","라이스 오버나이트 스파 마스크","60ml","튜브","블랙 스크류 캡","반투명 화이트","bath",[],"오버나이트 마스크에 어두운 캡.",OYG+"GA210000608"),
  ("kb23-purito-ceramide-sleeping-pack.jpg","kb","PURITO SEOUL","루미너스 세라마이드 슬리핑팩","100ml","튜브","화이트 원형 캡(추정)","라벤더 퍼플 무광","bath",[],"슬리핑팩을 짙은 무광 바디로.",OYG+"GA250832775"),
  ("kb24-bewants-pdrn-peel-off-jelly-mask.jpg","kb","be:wants","씨위드 PDRN 필오프 젤리 래핑 마스크","100ml","튜브","확인 불가","딥그린 고광택","bath",[],"어두운 바디의 필오프 마스크. 로열블루 랩핑의 근거.",OYG+"GA250631465"),
  ("kb25-ahc-real-eye-cream-for-face.jpg","kb","AHC","텐 레볼루션 리얼 아이크림 포 페이스","35ml","메탈릭 튜브","길고 가는 노즐형 캡","실버 메탈릭","vanity",[],"캡 실루엣만으로 프리미엄을 만든 사례.",OYG+"GA231020660"),
  ("kb26-vt-pdrn-reedle-shot-eye-cream.jpg","kb","VT","PDRN 리들샷 퍼밍 아이크림","확인 못 함","튜브 + 진동 메탈 팁","금속 팁 디스펜서","민트 + 실버","vanity",[],"토출부가 곧 기능. 메탈 팁은 재활용 '어려움' 등급 리스크.",OYG+"GA250832756"),
  # Global prestige
  ("gl01-bader-the-cream.jpg","gl","Augustinus Bader","The Cream","15–100ml","유리 외병 + 에어리스(추정)","풀커버 오버캡","코발트 블루 + 코퍼","vanity",["pair"],"The Rich Cream과 용기가 같고 글자로만 구분. 터노바가 피해야 할 패턴.","https://augustinusbader.com/en-us/products/the-cream"),
  ("gl02-bader-the-rich-cream.jpg","gl","Augustinus Bader","The Rich Cream","15–100ml","같은 용기","같은 오버캡","같은 컬러","vanity",["pair"],"형제 제품 구분 실패 사례(매장에서 라벨을 읽어야 함).","https://augustinusbader.com/en-us/products/the-rich-cream"),
  ("gl03-bader-face-cream-mask.jpg","gl","Augustinus Bader","The Face Cream Mask","50ml","낮고 넓은 자","코퍼 스크류 리드 + 반원 스패출러","블루 + 코퍼","vanity",[],"필름밤 자의 직접 레퍼런스: 자 + 전용 도구.","https://augustinusbader.com/en-us/products/the-face-cream-mask"),
  ("gl04b-bader-body-cream-tube.jpg","gl","Augustinus Bader","The Body Cream (튜브)","100ml","튜브 · 캡 아래로","코퍼 원형 스크류","블루 + 코퍼","bath",[],"같은 처방을 자/튜브로 나눠 판다.","https://augustinusbader.com/en-us/products/the-body-cream"),
  ("gl05-bader-hand-treatment.jpg","gl","Augustinus Bader","The Hand Treatment","50ml","넓적 튜브","코퍼 원형 스크류","블루 + 코퍼","vanity",[],"50ml 튜브의 기준 비율.","https://augustinusbader.com/en-us/products/the-hand-treatment"),
  ("gl08-bader-eye-cream-tube.jpg","gl","Augustinus Bader","The Eye Cream","15ml","에어리스 슬림","오버캡","몸체 전체 코퍼(색 반전)","vanity",["pair"],"같은 브랜드 안에서 색 비율을 뒤집어 구분. 시안 B의 근거.","https://augustinusbader.com/en-us/products/the-eye-cream"),
  ("gl09a-dua-routine-tube-airless.jpg","gl","DUA by AB","루틴 (튜브·보틀·에어리스)","50–125ml","튜브 / 보틀 / 원통 에어리스","형태별 상이","코퍼 + 세룰리안 블루","both",["pair","oct"],"서브라인을 색 반전 + 숫자 코드(TFC5)로 분리. 2025.11 출시. 시안 B의 근거.","https://duabyab.com/products/renewal-cream"),
  ("gl10-chanel-n5-octagonal-stopper.jpg","gl","CHANEL","N°5 Parfum","—","사각 유리병","팔각 컷 스토퍼(1924~)","클리어 + 앰버","vanity",["oct"],"8각을 브랜드 자산으로 만든 대표 선례. 이미지: Wikimedia Commons(내부 참고용, 라이선스 확인 필요).","https://en.wikipedia.org/wiki/Chanel_No._5"),
  ("gl11a-chanel-la-creme-main.jpg","gl","CHANEL","La Crème Main","50ml","조약돌형 용기","일체형 디스펜서(추정)","화이트","vanity",[],"샤넬 스킨케어는 일반 튜브를 쓰지 않고 오브제로 대신한다.","https://violetgrey.com/products/la-creme-main-hand-cream"),
  ("gl11c-chanel-sublimage-jar.jpg","gl","CHANEL","Sublimage La Crème","50g","리필형 유리 자","골드 리드","골드 + 블랙","vanity",[],"메탈 리드 자의 격. 필름밤 자(코퍼 뚜껑) 톤 레퍼런스.","https://www.chanel.com/"),
  ("gl12a-aesop-hand-balm-tube.jpg","gl","Aesop","Reverence Aromatique Hand Balm","75ml","알루미늄 튜브","블랙 스크류 · 캡 쪽으로 세우게 라벨 역인쇄","향별 파스텔","vanity",[],"화장대용은 금속 튜브 + 스크류.","https://www.bluemercury.com/products/aesop-reverence-aromatique-hand-balm"),
  ("gl12b-aesop-body-cleanser-pump.jpg","gl","Aesop","Eleos Body Cleanser","500ml","앰버 PET 병","펌프","앰버 + 블랙","bath",[],"욕실용은 소재·개폐 방식부터 다르다. 장소별 구분의 교과서.","https://www.bluemercury.com/"),
  ("gl12d-aesop-night-masque-jar.jpg","gl","Aesop","Sublime Replenishing Night Masque","60ml(추정)","자","블랙 스크류 리드","블랙 + 크림 라벨","vanity",[],"나이트 마스크를 자로 운영하는 경우.","https://www.bluemercury.com/"),
  ("gl13-byredo-hand-cream-octagon-cap.jpg","gl","BYREDO","Bal d'Afrique Hand Cream","30ml","알루미늄 튜브","다각형 플랜지 캡(8각 추정)","무광 화이트","vanity",["oct"],"프레스티지 튜브에 다각 캡을 쓴 실제 선례.","https://www.bluemercury.com/products/byredo-bal-d-afrique-hand-cream"),
  ("gl14-arden-eight-hour-cream.jpg","gl","Elizabeth Arden","Eight Hour Cream","50ml","튜브","원형 스크류","전면 '8' 패턴","vanity",["oct"],"숫자 8 그래픽의 선점자(1930~). 터노바는 그래픽 8이 아닌 구조적 8(8각)로 가야 겹치지 않는다.","https://www.elizabetharden.com/products/eight-hour-cream-skin-protectant"),
  ("gl15a-rhode-barrier-restore-cream.jpg","gl","rhode","Barrier Restore Cream","50ml","슬림 튜브","플랫 원형 스크류","진한 그레이","vanity",["pair"],"데일리 배리어 = 길고 슬림.","https://www.rhodeskin.com/products/barrier-restore-cream"),
  ("gl15b-rhode-barrier-butter.jpg","gl","rhode","Barrier Butter (나이트)","100ml","짧고 넓은 튜브","넓은 플랫 캡","밝은 그레이","both",["pair"],"터노바와 같은 숙제(데일리 vs 나이트 형제 튜브)를 비율·캡 지름으로 푼 사례.","https://www.rhodeskin.com/products/barrier-butter"),
  ("gl16a-tatcha-rice-wash-fliptop.jpg","gl","TATCHA","The Rice Wash","120ml","튜브","디스크형 플립탑(원터치)","라벤더 그라데이션","bath",[],"젖은 손으로 쓰는 세면대 제품에 원터치. 프레스티지 선례.","https://tatcha.com/products/rice-wash-soft-cream-cleanser"),
  ("gl16b-tatcha-dewy-skin-cream-jar.jpg","gl","TATCHA","The Dewy Skin Cream","50ml","자","골드 리본 리드","라벤더","vanity",[],"같은 브랜드에서 화장대=자, 세면대=원터치 튜브.","https://tatcha.com/"),
  ("gl17a-lamer-hand-treatment.jpg","gl","LA MER","The Hand Treatment","100ml(추정)","화이트 튜브","크롬 원형 스크류","화이트 + 베이지","vanity",["pair"],"형제 튜브가 거의 같다(반면교사).","https://www.bluemercury.com/products/la-mer-the-hand-treatment"),
  ("gl17b-lamer-intensive-revitalizing-mask.jpg","gl","LA MER","The Intensive Revitalizing Mask","75ml(추정)","같은 튜브","같은 크롬 캡","같은 컬러","vanity",["pair"],"마스크와 핸드크림이 한눈에 구분되지 않음.","https://www.bluemercury.com/products/la-mer-the-intensive-revitalizing-mask"),
  ("gl18b-kiehls-advanced-repair-barrier-cream.jpg","gl","Kiehl's","Ultra Facial Advanced Repair Barrier Cream","50ml(추정)","슬림 튜브","화이트 스크류","화이트 + 레드 띠","vanity",[],"데일리는 자, 배리어 집중은 튜브로 나눔.","https://www.bluemercury.com/"),
  ("gl19-lrp-cicaplast-baume-b5.jpg","gl","La Roche-Posay","Cicaplast Baume B5+","100ml","튜브","화이트 플랫 캡","화이트 + 블루 블록","both",[],"배리어 밤의 글로벌 표준 형식.","https://www.lookfantastic.com/"),
  ("gl20-avene-cicalfate.jpg","gl","Avène","Cicalfate+","40/100ml","튜브","화이트 스크류","화이트","both",[],"더마 배리어 튜브 기준.","https://www.bluemercury.com/products/avene-cicalfate-restorative-protective-cream"),
  ("gl21a-necessaire-hand-cream-tube-key.jpg","gl","NÉCESSAIRE","Hand Cream + Tube Key","65ml(추정)","알루미늄 튜브 + 스틸 키","소형 스크류","화이트","vanity",[],"튜브에 금속 키를 붙여 '의식'으로 만든 아이디어. 8시 리추얼 굿즈 후보.","https://necessaire.com/products/hand-cream-key"),
  ("gl22b-sturm-hand-cream-tube.jpg","gl","Dr. Barbara Sturm","Hand Cream","50ml","튜브","스크류","올화이트","vanity",[],"페이스는 자, 핸드·바디는 튜브라는 공식.","https://violetgrey.com/"),
]

PLACE = {"vanity":"화장대","bath":"화장실","both":"겸용"}
GROUP = {"user":"대표님 공유","kb":"올리브영·K뷰티","gl":"글로벌 프레스티지"}

def card(r):
    f,g,brand,name,vol,cont,cap,finish,place,flags,why,src = r
    e = html.escape
    tags = [f'<span class="tag gold">{e(cap)}</span>', f'<span class="tag">{PLACE[place]}</span>']
    if "oct" in flags: tags.append('<span class="tag warn">8·8각 선례</span>')
    if "pair" in flags: tags.append('<span class="tag ok">형제 구분 사례</span>')
    src_html = e(src) if not src.startswith("http") else f'<a href="{e(src)}" target="_blank" rel="noopener">{e(src.replace("https://","").rstrip("/"))[:64]}</a>'
    return f'''<article class="ref" data-g="{g}" data-p="{place}" data-f="{' '.join(flags)}">
  <div class="img"><img src="refs/{e(f)}" alt="{e(brand)} {e(name)} 제품 이미지" loading="lazy"></div>
  <div class="meta">
    <div class="brand">{e(brand)} · {GROUP[g]}</div>
    <div class="name">{e(name)} <span style="color:var(--muted);font-weight:400">{e(vol)}</span></div>
    <div class="tags">{''.join(tags)}</div>
    <p class="why">{e(cont)} · {e(finish)}. {e(why)}</p>
    <div class="src">{src_html}</div>
  </div>
</article>'''

def svg(name):
    s = (MOCK / name).read_text()
    return s.replace('<svg ', '<svg width="100%" ', 1)

head = (HERE / "head.html").read_text()
body = (HERE / "body.html").read_text()
counts = {k: sum(1 for r in REFS if r[1]==k) for k in GROUP}
body = body.replace("{{WALL}}", "\n".join(card(r) for r in REFS))
body = body.replace("{{N_ALL}}", str(len(REFS))).replace("{{N_USER}}", str(counts["user"])).replace("{{N_KB}}", str(counts["kb"])).replace("{{N_GL}}", str(counts["gl"]))
for k in ["g2-a","g2-b","g2-c","g2-details"]:
    body = body.replace("{{SVG_%s}}" % k, svg(k + ".svg"))
import sys
if "--repo" in sys.argv:
    # 공개 저장소용: 타사 제품 이미지는 넣지 않고 출처 링크만 남긴다
    import re as _re
    body = _re.sub(r'<div class="img"><img src="refs/(?!own-)[^"]+" alt="([^"]+)"[^>]*></div>', r'<div class="img none">\1<br>(이미지는 비공개 아티팩트에서 확인)</div>', body)
    (HERE / "repo-index.html").write_text(head + body)
else:
    (HERE / "index.html").write_text(head + body)
used = {r[0] for r in REFS}
print("refs", len(REFS), counts, "missing:", [u for u in used if not (HERE/"refs"/u).exists()])
