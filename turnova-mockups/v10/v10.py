import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json'))
def up(k,p):
    if k not in R: R[k]=hc.upload_file(p); json.dump(R,open('refs.json','w'))
    return R[k]
I='../images/'
up('v9_1.png','/home/user/jinnius/turnova-mockups/v9/v9_1_tube_master.png')
for k,f in [('f_pen','17.png'),('f_jar','18.png'),('f_mist','19.png'),('f_stick','20.jpg'),('f_kit','21.jpg')]: up(k,I+f)
OUT='/home/user/jinnius/turnova-mockups/v10'; os.makedirs(OUT,exist_ok=True)
M=('Reference image 1 is the APPROVED MASTER design of the brand "TURNOVA": keep exactly its style — deep royal ultramarine blue, peach-copper accents, the same wordmark letterforms, the same typography and vertical centered hierarchy ("TURNOVA" / small eight-petal symbol / product name / "TRX-8™" / benefit line / volume). Reference image 2 is the wordmark, reference image 3 the exact eight-petal symbol (exactly 8 petals, small: about 12% of the panel width). '
 'Reference image 4 shows ONLY the container SHAPE and structure to borrow — do NOT copy its brand, logo, colors, layout or any of its words (no "Augustinus Bader", no "RoC", no "CLINICALLY PROVEN", no French text, no patented/ingredient claims). '
 'Finish: every surface MATTE (soft velvety matte, zero sheen, plain royal blue, no pattern); ONLY the wordmark and the symbol are mirror-glossy copper foil; other text matte copper ink; caps/pumps/bands brushed copper. Photorealistic product photo. Only use the exact words given. Avoid: patterns, gold, silver, rose gold, invented words, extra claims.')
J={
 'v10_1_airless_ampoule':('3:4','f_pen',M+' A slim tall cylindrical AIRLESS PUMP tube (shape like reference 4) with a brushed copper collar band near the top, matte royal blue body, standing on a pale warm grey background. Text top to bottom: "TURNOVA", symbol, "THE AMPOULE", "TRX-8™", "OVERNIGHT RESURFACING · SMOOTHER-LOOKING SKIN", and at the bottom "30 mL / 1.0 fl oz".'),
 'v10_2_jar':('4:3','f_jar',M+' A wide low round CREAM JAR with a deep screw lid (shape like reference 4). Jar body and lid both matte royal blue; a thin brushed copper line where lid meets body. Front of jar body, centered: "TURNOVA", symbol, "THE CREAM", "TRX-8™", "30 mL / 1.0 fl oz". White background, slight top-down three-quarter angle.'),
 'v10_3_serum_pump':('3:4','f_mist',M+' A 30 mL cylindrical GLASS bottle with matte royal blue coating and a brushed copper pump and copper overcap lying beside it; the cap top is plain brushed copper with the eight-petal symbol printed small in matte. Bottle front: "TURNOVA", symbol, "THE SERUM", "TRX-8™", "30 mL / 1.0 fl oz". Pale grey background.'),
 'v10_4_stick':('1:1','f_stick',M+' A twist-up BALM STICK (shape like reference 4): matte royal blue cylindrical body, the white balm dome exposed at top with a clear threaded inner collar, matte royal blue cap standing to the right. Body text centered: "TURNOVA", symbol, "THE PEELING BALM", "STICK", "TRX-8™", "15 g / 0.53 oz". White background.'),
 'v10_5_trial_kit':('3:4','f_kit',M+' A TRIAL KIT: an open-front matte royal blue paperboard display carton (like reference 4) holding EIGHT identical 3 mL mini squeeze tubes standing upright in a row, caps down in brushed copper. Each mini tube: matte royal blue, "TURNOVA" and "TRIAL · 3 mL" only (no symbol on tubes). Carton front face: "TURNOVA", symbol, "THE PEELING BALM CREAM", "TRX-8™", "8 × 3 mL". Soft light grey background, product photo.'),
}
sel=sys.argv[1:]
def go(item):
    n,(ar,f,p)=item
    try:
        r=hc.subscribe('marketing-studio/image/flare',arguments={'prompt':p,'image_urls':[R['v9_1.png'],R['logo.png'],R['sym_copper_blue.png'],R[f]],'resolution':'2k','aspect_ratio':ar,'quality':'high','enhance_prompt':False})
        urllib.request.urlretrieve(r['images'][0]['url'],f'{OUT}/{n}.png'); return n,'ok'
    except Exception as e: return n,'ERR '+repr(e)[:300]
with cf.ThreadPoolExecutor(5) as ex:
    for r in ex.map(go,[i for i in J.items() if not sel or i[0] in sel]): print(*r,flush=True)
