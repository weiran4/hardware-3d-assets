"""Layout unaltered rendered previews as a labeled evidence sheet (no image retouch)."""
from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1]; OUT=R/'deliverables'; OUT.mkdir(exist_ok=True)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(n,bold=False): return ImageFont.truetype(BOLD if bold else FONT,n)
ink=(43,53,52); bg=(241,236,224)
canvas=Image.new('RGB',(1800,1460),bg); d=ImageDraw.Draw(canvas)
d.text((60,38),'FIELD NOTES / 01',fill=ink,font=font(24,True)); d.text((60,78),'Generic hardware practice set',fill=ink,font=font(45,True))
d.text((62,140),'Original 3D assets  /  Blender + GLB  /  CPU-rendered orthographic views',fill=(92,99,93),font=font(21))
def tile(asset,xy,size):
 im=Image.open(R/'generic'/asset/'previews/iso.png').convert('RGB'); im=im.resize((size,size),Image.Resampling.LANCZOS);canvas.paste(im,xy)
tile('sample-scene',(45,205),1140)
for i,(a,title,subtitle) in enumerate([('oscilloscope','01  OSCILLOSCOPE','0.28 x 0.16 x 0.13 m body'),('trigger-controller','02  PULSE CONTROLLER','0.18 x 0.12 x 0.07 m body'),('signal-cable','03  SIGNAL CABLE','0.60 m centerline / 5 mm diameter')]):
 y=203+i*365;tile(a,(1250,y),310);d.text((1245,y+300),title,fill=ink,font=font(21,True));d.text((1245,y+330),subtitle,fill=(92,99,93),font=font(17))
d.line((60,1354,1740,1354),fill=(188,187,174),width=2)
d.text((60,1380),'Concept geometry only. Loose cable shown unplugged. Compatibility and electrical limits unknown.',fill=ink,font=font(20))
d.text((60,1413),'Freestyle outlines and studio presentation are Blender-only; GLB contains reusable static assets and semantic anchors.',fill=(92,99,93),font=font(17))
canvas.save(OUT/'contact-sheet.png',optimize=True)
# Separate 4x8 view grid for diagnostic review, every image is a true rendered file.
assets=['oscilloscope','trigger-controller','signal-cable','sample-scene'];views=['iso','neutral','wireframe','front','rear','left','right','top']
qa=Image.new('RGB',(2240,1310),bg);dq=ImageDraw.Draw(qa)
for row,a in enumerate(assets):
 y=45+row*315;dq.text((10,y-28),a,fill=ink,font=font(19,True))
 for col,v in enumerate(views):
  im=Image.open(R/'generic'/a/'previews'/f'{v}.png').convert('RGB').resize((274,274),Image.Resampling.LANCZOS);qa.paste(im,(col*280,y));dq.text((col*280+8,y+277),v,fill=ink,font=font(16))
qa.save(OUT/'qa-all-views.png',optimize=True)
print('PASS contact sheets',OUT)
