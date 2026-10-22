"""Original source-grounded GTSOC metadata; no copied images or private identifiers."""
import math,json
from pathlib import Path
A='gtsoc-v2-2a-copper16';P=Path(__file__).resolve().parents[1]
MAN={'source_id':'rtds-hardware-manual','chapter':'13A — GTSOC V2','revision':'20240927','printed_pages':[1,2,3]}
def build_manifest():
 ports=[];s=math.sqrt(.5)
 def add(pid,group,label,pos,connector,contacts,channel=None,up=True,role=''):
  rear=pos[1]>0
  q=([0,0,s,s] if up else [s,-s,0,0]) if rear else ([s,s,0,0] if up else [0,0,-s,-s])
  # Front flipped row requires Rx(+90) * Rz(180), represented separately below.
  if not rear and not up:q=[0,0,-s,s]
  r={'id':A+'.'+pid,'parent_id':A+'.root','anchor_name':A+'.'+pid,'label':label,'group':group,'channel':channel,'connector':connector,'signal_type':role,'direction':'power' if group=='ac_power' else 'bidirectional','position_m':pos,'orientation_wxyz':q,'normal':[0,1 if rear else -1,0],'keyed_up':[0,0,1 if up else -1],'visible_contact_count':contacts,'physical_compatibility':'unknown','electrical_constraints':None,'validated_mating':False,'insertion_animation_ready':False,'accuracy':{'inventory':'observed_and_documented','contacts':'observed_visual_topology' if contacts else 'not_confirmed_as_contacts','keying':'observed_not_manufacturer_fit','position':'photo_estimated','mechanical_dimensions':'photo_estimated','electrical_compatibility':'not_validated'},'evidence':[MAN,{'source_id':'official-copper-front'}]}
  if group=='rear_optical':r.update(visible_face_feature_count=2,cap_status='unknown',appearance='blue duplex adapter with white annular faces and neutral filled centers; no asserted internal bore')
  ports.append(r)
 for col,x in enumerate([-.090,-.075,-.060,-.045,-.018,-.003,.012,.027]):
  for row,z in enumerate([.034,.017]):
   n=col*2+row+1;add('front'+str(n),'front_sfp',str(n),[x,-.155,z],'copper_rj45_sfp_visual',8,n,not row,'application-dependent SFP channel')
 for pid,label,x,role in [('monitor_ps','MONITOR PS',-.157,'application/debug UART monitoring'),('monitor_pl','MONITOR PL',-.138,'RTDS hardware-test monitoring'),('prog_jtag','PROG JTAG',-.119,'programming')]:add(pid,'service',label,[x,-.153,.021],'usb_b_shaped_visual',4,role=role)
 add('eth','rear_eth','ETH',[.002,.153,.044],'8p8c_ethernet_visual',8,role='MMC submodule monitoring workstation link')
 for col,x in enumerate([-.031,-.045]):
  for row,z in enumerate([.048,.039]):
   n=col*2+row+1;add('rear'+str(n),'rear_optical',str(n),[x,.154,z],'blue_duplex_observed_exterior',0,n,not row,'general-purpose NovaCor link; firmware-dependent role')
 add('ac','ac_power','AC INPUT',[-.184,.154,.025],'three_blade_switched_fused_inlet_visual',3,role='AC supply')
 return {'schema_version':'rtds.ports.v1','asset_id':A,'asset_version':'0.1.0','hardware_version':'GTSOC V2','model_plate':'GTSOC-2A','front_population':'16 copper RJ45 SFP modules','unit':'m','frame':'BLENDER_Z_UP_FRONT_NEG_Y','envelope_mm_W_D_H':[483,300,88],'envelope_scope':'entire envelope is a visual estimate; no dimensioned mechanical source','asset_state':'source_grounded_visual_variant_with_explicit_secondary_gaps','ports':ports}
if __name__=='__main__':
 m=build_manifest();(P/'metadata/ports.json').write_text(json.dumps(m,indent=2)+'\n')
 c={'asset_id':A,'seed':42,'body_dimensions_m':[.426,.300,.088],'dimension_scope':'estimated visual envelope, not exact fit','triangle_budget':60000,'required_part_ids':[A+'.body',A+'.front_panel',A+'.rear_panel'],'required_anchor_ids':[p['id'] for p in m['ports']],'render':{'engine':'CYCLES','device':'CPU','resolution':1400,'samples':48,'view_transform':'Standard','exposure':0,'camera_direction':[-1,-1.6,1.2],'camera_margin':1.12,'light_position':[-.8,-1.1,1.8],'light_energy':70,'light_size':1,'denoising':False,'world_strength':.65,'fill_energy':30,'outline_px':.5}}
 (P/'parameters.json').write_text(json.dumps(c,indent=2)+'\n')
