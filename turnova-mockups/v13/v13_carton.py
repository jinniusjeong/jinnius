import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
OUT='blank'; os.makedirs(OUT,exist_ok=True)
BASE=('Photorealistic studio product photo: ONE tall rectangular folding paperboard skincare CARTON BOX (proportions width 58 : depth 38 : height 157), standing upright, seen almost straight-on so the front panel faces the camera squarely and fills the middle of the frame, with only a sliver of the right side panel visible. Crisp sharp box edges, tuck flap top. '
 'The box is COMPLETELY BLANK — absolutely no text, logo, symbol or graphics anywhere. Soft even light, soft shadow, light warm grey seamless background. ')
J={'carton_ab':BASE+'Board colour: deep royal ultramarine blue, soft velvety MATTE laminated finish, even colour.',
   'carton_dua':BASE+'Board colour: warm peach-copper / apricot (like soft brushed copper paper), soft velvety MATTE laminated finish with a very faint fine pearly grain, even colour.'}
def go(k):
    try:
        r=hc.subscribe('marketing-studio/image/flare',arguments={'prompt':J[k],'image_urls':[],'resolution':'2k','aspect_ratio':'3:4','quality':'high','enhance_prompt':False})
        urllib.request.urlretrieve(r['images'][0]['url'],f'{OUT}/{k}.png'); return k,'ok'
    except Exception as e: return k,'ERR '+repr(e)[:300]
with cf.ThreadPoolExecutor(2) as ex:
    for r in ex.map(go,J): print(*r,flush=True)
