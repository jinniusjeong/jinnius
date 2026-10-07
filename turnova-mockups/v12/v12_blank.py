import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json'))
def up(k,p):
    if k not in R: R[k]=hc.upload_file(p); json.dump(R,open('refs.json','w'))
    return R[k]
M='/home/user/jinnius/turnova-mockups/'
SRC={'tube':(M+'v9/v9_1_tube_master.png','3:4'),'ampoule':(M+'v10/v10_1_airless_ampoule.png','3:4'),'serum':(M+'v10/v10_3_serum_pump.png','3:4'),'stick':(M+'v11/v11_2_stick_all_blue.png','3:4'),'jar':(M+'v11/v11_1_jar_copper_lid.png','4:3')}
OUT='blank'; os.makedirs(OUT,exist_ok=True)
P=('Reproduce reference image 1 EXACTLY — identical container shape, size, position in frame, camera angle, lighting, shadows, background, cap, pump and any parts beside it — with ONE change: the matte royal blue body is completely BLANK. Remove ALL text, the wordmark, the flower symbol and every printed mark from the blue surfaces (keep the copper lid and anything on the lid exactly as it is), leaving only smooth even matte royal blue with its natural soft cylindrical shading. Do not add anything.')
def go(k):
    src,ar=SRC[k]
    try:
        r=hc.subscribe('marketing-studio/image/flare',arguments={'prompt':P,'image_urls':[up('src_'+k,src)],'resolution':'2k','aspect_ratio':ar,'quality':'high','enhance_prompt':False})
        urllib.request.urlretrieve(r['images'][0]['url'],f'{OUT}/{k}.png'); return k,'ok'
    except Exception as e: return k,'ERR '+repr(e)[:200]
ks=sys.argv[1:] or list(SRC)
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(go,ks): print(*r,flush=True)
