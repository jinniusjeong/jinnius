import os,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json')); refs=[R['logo.png'],R['turnova-symbol.png'],R['layout.png']]
OUT='/home/user/jinnius/turnova-mockups'
BOX=('Skincare carton for the brand "TURNOVA" (exact spelling T-U-R-N-O-V-A). Reference image 1 is the exact wordmark typeface: copy its letterforms exactly. Reference image 2 is the brand symbol: an eight-petal line-drawn flower, copy it exactly. Reference image 3 is the owner\'s front-panel layout sketch: follow its layout exactly but NOT its colors. '
 'Carton front, flat matte bright cobalt blue leaning azure (Pantone 2935C-like), not navy, not purple, uncoated-paper matte with zero sheen. Layout, all centered: a thin light-blue printed inset frame line around the front panel; inside it near the top the "TURNOVA" wordmark in mirror-polished yellow-gold flat hot foil catching one crisp highlight (the only reflective element), with one thin gold wavy underline directly beneath it; below, a small white product illustration printed with the eight-petal flower symbol in fine line; below that the product name "THE PEELING BALM CREAM" on two lines in white bold sans-serif matte ink; under it small white text "TRX-8™"; empty blue space; near the bottom small white text "50 mL / 1.7 fl oz". '
 'Avoid: rose gold, copper, orange text, gradient, wave patterns other than the single underline, extra text, misspelling, embossing.')
JOBS={
 'v2_front':('9:16',BOX+' Straight-on flat orthographic view of the carton front only, on a light grey background, even diffuse studio light, packaging mockup.'),
 'v2_hero':('3:4',BOX+' Photorealistic studio product photo: the tall slim carton standing at a slight three-quarter angle on a light grey seamless background, soft light from upper left so only the gold foil wordmark and underline catch a highlight while the matte blue stays flat.'),
 'v2_hand':('9:16',BOX+' Casual iPhone photo in a pharmacy aisle: a left hand holds the tall slim carton at chest height, turned at a three-quarter angle so the front and the right side panel are visible; the right side panel is matte cobalt with a large white "94%" and two small stacked before/after skin photos. White and beige shelves blurred behind, cool store lighting, the gold foil wordmark catches the ceiling light. Natural phone-camera look, no retouching.'),
}
def go(item):
    name,(ar,p)=item
    try:
        r=hc.subscribe('marketing-studio/image/flare',arguments={'prompt':p,'image_urls':refs,'resolution':'2k','aspect_ratio':ar,'quality':'high','enhance_prompt':False})
        url=r['images'][0]['url']; path=f'{OUT}/{name}.png'; urllib.request.urlretrieve(url,path); return name,'ok'
    except Exception as e: return name,'ERR '+repr(e)[:300]
with cf.ThreadPoolExecutor(3) as ex:
    for r in ex.map(go,JOBS.items()): print(*r,flush=True)
