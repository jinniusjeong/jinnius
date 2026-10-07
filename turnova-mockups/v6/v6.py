import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json')); REFS=[R['logo.png'],R['sym_copper_blue.png']]
OUT='/home/user/jinnius/turnova-mockups/v6'; os.makedirs(OUT,exist_ok=True)
SYM='the TURNOVA symbol from reference image 2, copied exactly: a thin single-line outline flower with EXACTLY EIGHT identical long narrow petals (up, down, left, right and four diagonals) all meeting at one center point; flat line drawing, no ribbon, no 3D, never 5, 6 or 7 petals'
BASE=('Luxury skincare brand "TURNOVA" (exact spelling T-U-R-N-O-V-A). Reference image 1 is the exact wordmark: bold geometric sans-serif capitals with wide letter spacing, copy its letterforms. Reference image 2 is the exact brand symbol. '
 'Look: deep royal ultramarine blue leaning slightly violet (Pantone 2736C-like) soft matte bodies, one warm peach-orange copper accent (not pink rose gold, not yellow gold). The wordmark and the symbol are mirror-polished copper hot foil, the only glossy printed elements; caps and pumps are brushed satin copper metal. Product name in bold sans-serif capitals in matte copper ink; "TRX-8™" in light weight. Photorealistic, true-to-life color. '
 f'The symbol is {SYM}. Avoid: monogram, serif logo, ribbon symbol, wave emblem, gold, silver, gradients, misspelling, invented claims or extra product names.')
CH=(" Layout in the restrained manner of classic Parisian couture-house packaging: perfect central symmetry, generous margins, few refined elements. "
 "Front proportions: the TURNOVA wordmark spans about 62% of the panel width, top at about 20% of the height; the eight-petal symbol is about 18% of the panel width; the gap wordmark-to-symbol equals the gap symbol-to-product-name; "
 "product name on ONE line in semibold capitals with wide letter spacing, cap height about 40-45% of the wordmark cap height, clearly readable in a small online thumbnail; "
 "\"TRX-8\u2122\" (no spaces) directly below in regular weight at about 60% of the product-name size; under it one short benefit line in small regular capitals: \"OVERNIGHT RESURFACING \u00b7 SMOOTHER-LOOKING SKIN\"; "
 "net quantity in clearly readable regular weight with its baseline at about 90% of the height, not touching the bottom; the rest calm blue with a barely visible tone-on-tone fine-line pattern of interlocking infinity loops in a slightly darker blue, visible only up close and never behind text. "
 "All small text is matte copper ink; only the wordmark and the symbol are glossy copper foil.")
J={
 'v6_1_carton_front':('9:16',BASE+CH+' IMPORTANT: the symbol must be small — its width only 18% of the carton width, clearly narrower than the letters "TURN" of the wordmark. Straight-on flat view of a tall carton front on light grey background. Exact text only: "TURNOVA", "THE PEELING BALM CREAM", "TRX-8\u2122", "OVERNIGHT RESURFACING \u00b7 SMOOTHER-LOOKING SKIN", "80 mL / 2.7 fl oz".'),
 'v6_2_tube_white':('3:4',BASE+CH+' E-commerce main image: the 80 mL squeeze tube standing upright on its brushed copper cap on a pure white seamless background (RGB 255), product filling about 85% of the frame height, soft even light that still lets the copper foil wordmark and symbol glint. Exact text only: "TURNOVA", "THE PEELING BALM CREAM", "TRX-8\u2122", "OVERNIGHT RESURFACING \u00b7 SMOOTHER-LOOKING SKIN", "80 mL / 2.7 fl oz".'),
 'v6_3_lineup':('16:9',BASE+' Same restrained centered layout on every item. Studio shot on a pale stone surface, light grey backdrop, left to right: 80 mL squeeze tube labeled "THE PEELING BALM CREAM" "80 mL"; 3 mL mini tube with NO symbol, only "TURNOVA", "THE PEELING BALM CREAM" small and "TRIAL \u00b7 3 mL"; royal blue glass jar 15 mL labeled "THE CREAM" "15 mL" with the symbol only on its copper lid top, not on the jar body; larger jar 30 mL labeled "THE CREAM" "30 mL"; 30 mL dropper ampoule labeled "THE AMPOULE" "30 mL"; 30 mL pump serum labeled "THE SERUM" "30 mL"; a tall carton behind. Every item (except the 3 mL tube and the 15 mL jar body, which carry no symbol): "TURNOVA" copper foil wordmark, the eight-petal symbol, its product name in copper capitals, "TRX-8\u2122", and its volume clearly readable. Soft directional light, copper foil glints.'),
 'v6_4_hand':('9:16',BASE+CH+' Casual iPhone photo in a pharmacy aisle: a left hand holds the tall royal blue carton at chest height, turned three-quarter so the front and the right side panel are visible. Front exact text only: "TURNOVA", "THE PEELING BALM CREAM", "TRX-8\u2122", "OVERNIGHT RESURFACING \u00b7 SMOOTHER-LOOKING SKIN", "80 mL / 2.7 fl oz". Side panel: a clean large MATTE copper ink "94%" (not foil, no shine), two small stacked before/after skin photos, and one line of tiny copper test-condition text under them. White shelves blurred behind, cool store light, copper foil catches the light. Natural phone look.'),
 'v6_5_unboxing':('3:4',BASE+' Top-down unboxing photo on a light stone surface: hands opening the royal blue carton lid; on the inside of the open lid flap, small copper text "8 PM \u2014 YOUR TURN" next to the small eight-petal symbol; the 80 mL tube nested inside on a royal blue insert; the tube front reads top to bottom exactly: \"TURNOVA\" wordmark, small eight-petal symbol, \"THE PEELING BALM CREAM\", \"TRX-8\u2122\", \"80 mL / 2.7 fl oz\" — no other words. Soft window daylight, phone-camera look.'),
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
