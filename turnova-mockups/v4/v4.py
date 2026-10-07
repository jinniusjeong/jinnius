import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json')); REFS=[R['logo.png'],R['sym_copper_blue.png']]
OUT='/home/user/jinnius/turnova-mockups/v4'; os.makedirs(OUT,exist_ok=True)
SYM='the TURNOVA symbol from reference image 2, copied exactly: a thin single-line outline flower with EXACTLY EIGHT identical long narrow petals (up, down, left, right and four diagonals) all meeting at one center point; flat line drawing, no ribbon, no 3D, never 5, 6 or 7 petals'
BASE=('Luxury skincare brand "TURNOVA" (exact spelling T-U-R-N-O-V-A). Reference image 1 is the exact wordmark: bold geometric sans-serif capitals with wide letter spacing, copy its letterforms. Reference image 2 is the exact brand symbol. '
 'Look: deep royal ultramarine blue leaning slightly violet (Pantone 2736C-like) soft matte bodies, one warm peach-orange copper accent (not pink rose gold, not yellow gold). The wordmark and the symbol are mirror-polished copper hot foil, the only glossy printed elements; caps and pumps are brushed satin copper metal. Product name in bold sans-serif capitals in matte copper ink; "TRX-8™" in light weight. Photorealistic, true-to-life color. '
 f'The symbol is {SYM}. Avoid: monogram, serif logo, ribbon symbol, wave emblem, gold, silver, gradients, misspelling, invented claims or extra product names.')
J={
 'v4_1_carton_front':('9:16',BASE+' Straight-on flat view of a tall carton front on light grey background. Centered, top to bottom: "TURNOVA" wordmark in copper foil; blue space; the eight-petal symbol in copper foil, small, about one quarter of the wordmark width; "THE PEELING" / "BALM CREAM" on two lines; "TRX-8™"; large empty blue space; "80 mL / 2.7 fl oz" at the bottom in light copper.'),
 'v4_2_tube':('3:4',BASE+' Close product shot of the 80 mL squeeze tube standing upright on its brushed copper cap, light grey background. Tube front centered: "TURNOVA" copper foil wordmark near the top, the small eight-petal copper symbol below it, "THE PEELING BALM CREAM" in two lines, "TRX-8™", and "80 mL / 2.7 fl oz" near the cap.'),
 'v4_3_lineup':('16:9',BASE+' Studio hero shot on a pale stone surface with light grey backdrop: an 80 mL squeeze tube with copper cap, a 3 mL mini tube, two royal blue glass cream jars (15 mL and 30 mL) with brushed copper lids, a 30 mL glass dropper ampoule with copper collar, a 30 mL serum pump bottle with copper pump, and one tall royal blue carton behind. Every item shows only the copper "TURNOVA" wordmark, the small eight-petal symbol and "TRX-8™" — no product names. Soft directional light making the copper foil glint.'),
 'v4_4_hand':('9:16',BASE+' Casual iPhone photo in a pharmacy aisle: a left hand holds the tall royal blue carton at chest height, turned three-quarter so the front ("TURNOVA" copper foil wordmark at top, small eight-petal copper symbol, "THE PEELING BALM CREAM", "TRX-8™") and the right side panel (large copper "94%" and two small stacked before/after skin photos, no other words) are visible. White shelves blurred behind, cool store light, the copper foil catches the ceiling light. Natural phone look.'),
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
