import os,sys,json,urllib.request,concurrent.futures as cf, higgsfield_client as hc
os.environ['HF_KEY']=os.environ['HF_CREDENTIALS']
R=json.load(open('refs.json')); REFS=[R['master.png'],R['logo.png'],R['sym_copper_blue.png']]
OUT='/home/user/jinnius/turnova-mockups/v9'; os.makedirs(OUT,exist_ok=True)
M=('Reference image 1 is the APPROVED MASTER design of the brand "TURNOVA": keep exactly its style — deep royal ultramarine blue, peach-copper accents, the same wordmark letterforms and spacing, the same typography, the same copy and hierarchy ("TURNOVA" / eight-petal symbol / "THE PEELING BALM CREAM" / "TRX-8™" / "OVERNIGHT RESURFACING · SMOOTHER-LOOKING SKIN" / "80 mL / 2.7 fl oz"). Reference image 2 is the wordmark, reference image 3 the exact eight-petal symbol (exactly 8 petals). '
 'Changes versus the master: the background is plain royal blue with NO pattern at all; the eight-petal symbol is SMALLER — its width only about 12% of the panel width (about one fifth of the wordmark width). '
 'Finish: every surface is MATTE laminated (soft velvety matte, zero sheen); ONLY the wordmark and the symbol are mirror-glossy copper foil; all other text is matte copper ink. Photorealistic. Avoid: any pattern, rose gold, gold, silver, invented words.')
J={
 'v9_1_tube_master':('3:4',M+' Recreate the master image exactly (80 mL squeeze tube on its brushed copper cap, pure white background) with only those changes.'),
 'v9_2_carton_closed':('9:16',M+' Show a tall rectangular folding PAPERBOARD CARTON BOX (a box with sharp vertical edges and a tuck lid, NOT a tube), seen straight-on with a slight three-quarter turn so one side edge is visible, standing on a light grey background. Its front panel carries the same layout and copy as the master, printed on plain matte laminated royal blue board.'),
 'v9_3_carton_open':('9:16',M+' Casual iPhone photo in a beauty store: a left hand holds the tall carton whose FRONT COVER is a hinged flap swung open to the left (like a book cover), revealing the inner front panel and the right side panel, in the style of a prestige skincare carton. Inner front panel (matte royal blue, copper text): headline "00% SMOOTHER-LOOKING SKIN*", two stacked close-up skin photos captioned "BEFORE" and "AFTER 4 WEEKS*", a short checklist with copper check boxes ("TEXTURE", "DULLNESS", "UNEVEN TONE"), and a tiny footnote line. Right side panel: "00% AGREE*" three short lines and two small before/after skin photos. The open cover edge shows the copper wordmark. All claims are placeholder "00%". Shelves blurred behind, natural phone look.'),
 'v9_4_lineup':('16:9',M+' Studio shot on pale stone, light grey backdrop: 80 mL tube, 3 mL mini tube ("TRIAL · 3 mL", no symbol), cream jars 15 mL ("THE CREAM", symbol only on lid top) and 30 mL ("THE CREAM"), 30 mL dropper ampoule ("THE AMPOULE"), 30 mL pump serum ("THE SERUM"), and one closed carton. ALL containers including the jars and bottles have a soft matte laminated / matte-coated royal blue surface with zero gloss; only the copper foil wordmark and symbol shine; caps and pumps brushed copper. Each shows "TURNOVA", the small symbol, its name, "TRX-8™" and volume.'),
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
