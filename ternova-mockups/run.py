import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
from shots import jobs
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
OUT='/home/user/jinnius/ternova-mockups'
sel=sys.argv[1:]
def go(j):
    name,ar,prompt=j
    try:
        r=hc.subscribe('marketing-studio/image/flare',arguments={'prompt':prompt,'resolution':'2k','aspect_ratio':ar,'quality':'high','enhance_prompt':False})
        url=r['images'][0]['url']; ext=url.split('?')[0].rsplit('.',1)[-1][:4] or 'png'
        p=f'{OUT}/{name}.{ext}'; urllib.request.urlretrieve(url,p); return name,'ok',p
    except Exception as e: return name,'ERR',repr(e)[:300]
js=[j for j in jobs() if not sel or j[0] in sel]
with cf.ThreadPoolExecutor(8) as ex:
    for r in ex.map(go,js): print(*r,flush=True)
