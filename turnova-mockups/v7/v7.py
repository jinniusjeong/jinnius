import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json')); REFS=[R['logo.png'],R['sym_copper_blue.png']]
OUT='/home/user/jinnius/turnova-mockups/v7'; os.makedirs(OUT,exist_ok=True)
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
 'v7_1_etching_macro':('3:4',BASE+' Macro close-up of the royal blue carton front under low raking side light: the carton is wrapped in soft-touch MATTE laminated film (velvety, no shine); over it an ETCHED UV texture of fine interlocking infinity-loop lines, tone-on-tone, slightly gritty and catching a faint subtle sheen only where the light grazes it; the mirror-polished copper foil "TURNOVA" wordmark and the small eight-petal copper foil symbol are the brightest, glossiest elements. Product name "THE PEELING BALM CREAM" in matte copper ink visible lower in frame. Shallow depth of field, tactile luxury print detail.'),
 'v7_2_frosted_glass':('16:9',BASE+' Studio shot: royal blue glass cream jars (15 mL and 30 mL), a 30 mL dropper ampoule and a 30 mL pump serum bottle, all with a FROSTED acid-etched matte glass surface (soft, satin-matte, no gloss), brushed copper lids, collar and pump; each shows the copper "TURNOVA" wordmark, the eight-petal symbol (except the 15 mL jar body), its product name ("THE CREAM", "THE AMPOULE", "THE SERUM") and volume. Light grey backdrop, soft light, only the copper foil glints.'),
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
