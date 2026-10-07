import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json'))
def up(k,p):
    if k not in R: R[k]=hc.upload_file(p); json.dump(R,open('refs.json','w'))
    return R[k]
V10='/home/user/jinnius/turnova-mockups/v10/'
up('v10_2.png',V10+'v10_2_jar.png'); up('v10_4.png',V10+'v10_4_stick.png')
up('f_ab_group','/root/.claude/uploads/5a67987a-0199-5184-9408-d4cf55a4acf8/023136a7-image.jpg'); up('f_pouch','/root/.claude/uploads/5a67987a-0199-5184-9408-d4cf55a4acf8/cce6ac05-image.jpg')
OUT='/home/user/jinnius/turnova-mockups/v11'; os.makedirs(OUT,exist_ok=True)
M=('Reference image 1 is the APPROVED MASTER design of the brand "TURNOVA": keep exactly its style — deep royal ultramarine blue, peach-copper accents, the same wordmark letterforms and typography, centered vertical hierarchy. Reference image 2 is the wordmark, reference image 3 the exact eight-petal symbol (exactly 8 petals, small: about 12% of the panel width). '
 'Reference image 4 is our previous draft of this container to edit. Reference image 5 shows ONLY a shape/colour-blocking idea — do NOT copy its brand, logo, emblem, words or layout (no "Augustinus Bader", no "AB", no "POUCH24", no "Queen\'s Balm", no "SEOUL"). '
 'Finish: every blue surface MATTE (soft velvety matte, zero sheen, plain, no pattern); ONLY the wordmark and symbol are mirror-glossy copper foil; other text matte copper ink. Photorealistic product photo. Only use the exact words given. Avoid: patterns, silver, invented words, claims.')
J={
 'v11_1_jar_copper_lid':('4:3','v10_2.png','f_ab_group',M+' Edit the cream jar: REMOVE the thin copper band/line completely. The jar BODY is matte royal blue; the whole LID is solid brushed peach-copper metal (warm copper-gold tone like reference 5 lids), so body and lid are clearly separated by colour only, with no band. Lid top: the eight-petal symbol small, debossed tone-on-tone, centered. Jar body front, centered: "TURNOVA", symbol, "THE CREAM", "TRX-8™", "30 mL / 1.0 fl oz". White background, slight three-quarter top-down angle so the lid top is visible.'),
 'v11_2_stick_all_blue':('3:4','v10_4.png','f_pouch',M+' Edit the twist-up balm stick so it is ALL BLUE: remove the copper base — body, twist base and cap are all matte royal blue, one continuous colour, with only a fine hairline seam between body and twist base (shape like reference 5). Show the stick standing with the cap off beside it, pale balm dome exposed at top inside a clear collar. Body text centered: "TURNOVA", symbol, "THE PEELING BALM", "STICK", "TRX-8™", "15 g / 0.53 oz". Soft white background.'),
}
def go(item):
    n,(ar,a,b,p)=item
    try:
        r=hc.subscribe('marketing-studio/image/flare',arguments={'prompt':p,'image_urls':[R['v9_1.png'],R['logo.png'],R['sym_copper_blue.png'],R[a],R[b]],'resolution':'2k','aspect_ratio':ar,'quality':'high','enhance_prompt':False})
        urllib.request.urlretrieve(r['images'][0]['url'],f'{OUT}/{n}.png'); return n,'ok'
    except Exception as e: return n,'ERR '+repr(e)[:300]
with cf.ThreadPoolExecutor(2) as ex:
    for r in ex.map(go,[i for i in J.items() if not sys.argv[1:] or i[0] in sys.argv[1:]]): print(*r,flush=True)
