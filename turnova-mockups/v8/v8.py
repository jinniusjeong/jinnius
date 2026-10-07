import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json')); REFS=[R['logo.png'],R['sym_copper_blue.png']]
OUT='/home/user/jinnius/turnova-mockups/v8'; os.makedirs(OUT,exist_ok=True)
SYM='the TURNOVA symbol from reference image 2, copied exactly: a thin single-line outline flower with EXACTLY EIGHT identical long narrow petals (up, down, left, right and four diagonals) all meeting at one center point; flat line drawing, no ribbon, no 3D, never 5, 6 or 7 petals'
BASE=('Luxury skincare brand "TURNOVA" (exact spelling T-U-R-N-O-V-A). Reference image 1 is the exact wordmark: bold geometric sans-serif capitals with wide letter spacing, copy its letterforms. Reference image 2 is the exact brand symbol. '
 'Look: deep royal ultramarine blue leaning slightly violet (Pantone 2736C-like) soft matte bodies, one warm peach-orange copper accent (not pink rose gold, not yellow gold). The wordmark and the symbol are mirror-polished copper hot foil, the only glossy printed elements; caps and pumps are brushed satin copper metal. Product name in bold sans-serif capitals in matte copper ink; "TRX-8™" in light weight. Photorealistic, true-to-life color. '
 f'The symbol is {SYM}. Avoid: monogram, serif logo, ribbon symbol, wave emblem, gold, silver, gradients, misspelling, invented claims or extra product names.')
CH=(" Layout in the restrained manner of classic Parisian couture-house packaging: perfect central symmetry, generous margins, few refined elements. "
 "Front proportions: the TURNOVA wordmark spans about 62% of the panel width, top at about 20% of the height; the eight-petal symbol is about 18% of the panel width; the gap wordmark-to-symbol equals the gap symbol-to-product-name; "
 "product name on ONE line in semibold capitals with wide letter spacing, cap height about 40-45% of the wordmark cap height, clearly readable in a small online thumbnail; "
 "\"TRX-8\u2122\" (no spaces) directly below in regular weight at about 60% of the product-name size; under it one short benefit line in small regular capitals: \"OVERNIGHT RESURFACING \u00b7 SMOOTHER-LOOKING SKIN\"; "
 "net quantity in clearly readable regular weight with its baseline at about 90% of the height, not touching the bottom; the rest is calm, completely plain royal blue with NO background pattern, no lines, no motifs, no watermark — only a very fine uniform sand-like etched texture that is invisible from a distance. "
 "All small text is matte copper ink; only the wordmark and the symbol are glossy copper foil.")
J={
 'v8_1_carton_front':('9:16',BASE+CH+' IMPORTANT: the symbol width only 18% of the carton width; plain background with no pattern. Straight-on flat view of a tall carton front on light grey background. Exact text only: "TURNOVA", "THE PEELING BALM CREAM", "TRX-8\u2122", "OVERNIGHT RESURFACING \u00b7 SMOOTHER-LOOKING SKIN", "80 mL / 2.7 fl oz".'),
 'v8_2_tube':('3:4',BASE+CH+' Product shot of the 80 mL squeeze tube standing upright on its brushed copper cap on a light grey background, plain blue body with no pattern. Exact text only: "TURNOVA", "THE PEELING BALM CREAM", "TRX-8\u2122", "OVERNIGHT RESURFACING \u00b7 SMOOTHER-LOOKING SKIN", "80 mL / 2.7 fl oz".'),
 'v8_3_etching_macro':('3:4',BASE+' Macro close-up of the royal blue carton front under low raking side light: soft-touch MATTE laminated surface with an all-over, very fine, uniform sand-grain etched UV texture (no pattern, no lines, no motif) that catches only a faint micro-sparkle where light grazes it; the mirror-polished copper foil "TURNOVA" wordmark and the small eight-petal copper foil symbol are the brightest, glossiest elements. "THE PEELING BALM CREAM" and "TRX-8\u2122" (exactly this, no stray marks) in matte copper ink lower in frame. Shallow depth of field.'),
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
