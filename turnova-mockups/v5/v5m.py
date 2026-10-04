import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json')); REFS=[R['logo.png'],R['sym_copper_blue.png']]
OUT='/home/user/jinnius/turnova-mockups/v5'; os.makedirs(OUT,exist_ok=True)
SYM='the TURNOVA symbol from reference image 2, copied exactly: a thin single-line outline flower with EXACTLY EIGHT identical long narrow petals (up, down, left, right and four diagonals) all meeting at one center point; flat line drawing, no ribbon, no 3D, never 5, 6 or 7 petals'
BASE=('Luxury skincare brand "TURNOVA" (exact spelling T-U-R-N-O-V-A). Reference image 1 is the exact wordmark: bold geometric sans-serif capitals with wide letter spacing, copy its letterforms. Reference image 2 is the exact brand symbol. '
 'Look: deep royal ultramarine blue leaning slightly violet (Pantone 2736C-like) soft matte bodies, one warm peach-orange copper accent (not pink rose gold, not yellow gold). The wordmark and the symbol are mirror-polished copper hot foil, the only glossy printed elements; caps and pumps are brushed satin copper metal. Product name in bold sans-serif capitals in matte copper ink; "TRX-8™" in light weight. Photorealistic, true-to-life color. '
 f'The symbol is {SYM}. Avoid: monogram, serif logo, ribbon symbol, wave emblem, gold, silver, gradients, misspelling, invented claims or extra product names.')
CH=' Layout and proportions in the restrained manner of classic Parisian couture-house packaging: perfect central symmetry, very generous empty margins, few small refined elements. Proportions on the front panel: the TURNOVA wordmark spans about 55% of the panel width, its top at about 20% of the panel height; the eight-petal symbol is SMALL, only about 10% of the panel width (roughly one fifth of the wordmark width), centered at about 38% of the panel height; the product name sits at about 50% of the panel height in small medium-weight capitals with wide letter spacing, cap height about one third of the wordmark cap height; "TRX-8™" directly below at half that size; the net quantity is the smallest text, near the bottom with a wide bottom margin; everything else is calm empty blue.'
J={
 'v5_1_carton_front':('9:16',BASE+CH+' Straight-on flat view of a tall carton front on light grey background, showing: "TURNOVA" copper foil wordmark, the small copper foil eight-petal symbol, "THE PEELING BALM CREAM" on one or two lines, "TRX-8™", and "80 mL / 2.7 fl oz" at the bottom in light copper.'),
 'v5_2_tube':('3:4',BASE+CH+' Close product shot of the 80 mL squeeze tube standing upright on its brushed copper cap, light grey background. Tube front shows the same layout: "TURNOVA" copper foil wordmark, the small eight-petal copper symbol, "THE PEELING BALM CREAM", "TRX-8™", "80 mL / 2.7 fl oz" near the cap.'),
 'v5_3_hand':('9:16',BASE+CH+' The carton front text, exactly and only: "TURNOVA", the small symbol, "THE PEELING BALM CREAM", "TRX-8™", "80 mL / 2.7 fl oz". The side panel shows a clean large copper "94%" with no stray marks. Casual iPhone photo in a pharmacy aisle: a left hand holds the tall royal blue carton at chest height, turned three-quarter so the front and the right side panel (large copper "94%" and two small stacked before/after skin photos, no other words) are visible. White shelves blurred behind, cool store light, the copper foil wordmark catches the ceiling light. Natural phone look.'),
}
sel=sys.argv[1:]
def go(item):
    n,(ar,p)=item
    try:
        r=hc.subscribe('marketing-studio/image/flare',arguments={'prompt':p,'image_urls':REFS,'resolution':'2k','aspect_ratio':ar,'quality':'high','enhance_prompt':False})
        urllib.request.urlretrieve(r['images'][0]['url'],f'{OUT}/{n}.png'); return n,'ok'
    except Exception as e: return n,'ERR '+repr(e)[:300]
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(go,[i for i in J.items() if not sel or i[0] in sel]): print(*r,flush=True)
