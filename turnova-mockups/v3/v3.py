import os,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json')); LOGO=[R['logo.png']]
OUT='/home/user/jinnius/turnova-mockups/v3'; os.makedirs(OUT,exist_ok=True)
SYM=('the TURNOVA symbol: a single Mobius strip loop, a twisted ribbon band that forms a figure-8 / infinity shape, repeated four times rotated by 45 degrees so the loops create eight petals that read as an eight-pointed star; the flower is deliberately unfinished, the ribbon visibly twists and overlaps so it looks like it is still turning')
BASE=('Luxury skincare brand "TURNOVA" (exact spelling T-U-R-N-O-V-A); reference image 1 is the exact wordmark: bold geometric sans-serif capitals with wide letter spacing, copy its letterforms. '
 'Brand look benchmarked on prestige European skincare: deep royal ultramarine blue leaning slightly violet (Pantone 2736C-like) bodies, one metal accent in warm peach-orange copper (not pink rose gold, not yellow gold, not brown bronze). '
 'Finish: blue surfaces soft matte with zero sheen; the wordmark and the symbol are mirror-polished copper hot foil and are the only glossy printed elements; caps and pumps are brushed satin copper metal. '
 'Typography: wordmark large at top; product name in bold sans-serif capitals in matte copper ink; sub-line "TRX-8™" in light weight. Photorealistic, true-to-life color. '
 'Avoid: monogram initials, serif logo, wave emblem, gold, rose gold, silver, gradients, misspelling, extra brand names.')
J={
 'v3_1_symbol':('1:1',f'Brand symbol design sheet on a matte royal blue background, three versions side by side in copper: (1) {SYM}, rendered as a dimensional copper foil ribbon with visible twist; (2) the same symbol drawn as one continuous thin single line; (3) a single elegant numeral "8" that echoes the twisted ribbon. Under them small copper labels "CARTON", "CONTAINER", "ICON". Clean, minimal, identity-guide style, no other text.'),
 'v3_2_carton_front':('9:16',BASE+f' Straight-on flat view of a tall carton front on light grey background. Layout centered, top to bottom: "TURNOVA" wordmark in copper foil; generous blue space; a small copper foil {SYM} about a quarter of the wordmark width; product name "THE PEELING" / "BALM CREAM" on two lines; "TRX-8™"; large empty blue space; at the bottom "80 mL / 2.7 fl oz" in light copper. A barely visible tone-on-tone fine line pattern of interlocking infinity loops in a slightly darker blue covers the blue background, visible only up close.'),
 'v3_3_lineup':('16:9',BASE+f' Studio hero shot of the full product lineup on a pale stone surface with a soft light grey backdrop: an 80 mL squeeze tube with copper screw cap, a tiny 3 mL mini tube, two cream jars (15 mL and 30 mL) in royal blue glass with brushed copper lids showing a small copper symbol on top, a 30 mL glass dropper ampoule bottle with copper dropper collar, a 30 mL serum pump bottle with copper pump, and one tall royal blue carton standing behind. Every item shows the copper "TURNOVA" wordmark and a small {SYM}. Consistent family, elegant spacing, soft directional light making the copper foil logos glint.'),
 'v3_4_tube':('3:4',BASE+f' Close product shot of the 80 mL squeeze tube standing upright on its brushed copper cap, light grey background. Tube front centered: "TURNOVA" copper foil wordmark near the top, a small single-line {SYM} lower down, product name "THE PEELING BALM CREAM" in bold copper caps, "TRX-8™", and "80 mL / 2.7 fl oz" near the cap. Subtle tone-on-tone fine line pattern of interlocking infinity loops in the blue, visible only up close.'),
 'v3_5_shelf':('3:4',BASE+' A luxury department store pale oak wall shelf with warm integrated lighting, four shelves filled with TURNOVA products: royal blue tubes, jars with copper lids, dropper and pump bottles, royal blue cartons and a few peach-copper colored gift set boxes, forming a strong wall of royal blue with copper accents; small acrylic signage cards. Realistic retail photography.'),
 'v3_6_hand':('9:16',BASE+f' Casual iPhone photo in a pharmacy aisle: a left hand holds the tall royal blue carton at chest height, turned three-quarter so the front (copper foil "TURNOVA" wordmark at top, small copper {SYM}, "THE PEELING BALM CREAM", "TRX-8™") and the right side panel (large copper "94%" and two small stacked before/after skin photos) are visible. White shelves blurred behind, cool store light, the copper foil wordmark catches the ceiling light. Natural phone look, no retouching.'),
}
def go(item):
    n,(ar,p)=item
    a={'prompt':p,'resolution':'2k','aspect_ratio':ar,'quality':'high','enhance_prompt':False}
    if n!='v3_1_symbol': a['image_urls']=LOGO
    try:
        r=hc.subscribe('marketing-studio/image/flare',arguments=a); urllib.request.urlretrieve(r['images'][0]['url'],f'{OUT}/{n}.png'); return n,'ok'
    except Exception as e: return n,'ERR '+repr(e)[:300]
with cf.ThreadPoolExecutor(6) as ex:
    for r in ex.map(go,J.items()): print(*r,flush=True)
