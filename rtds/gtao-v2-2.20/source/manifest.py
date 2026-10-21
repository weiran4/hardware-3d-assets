"""Version-pinned GTAO V2 2.20 interface records; no mating validation."""
import json
from pathlib import Path
A='gtao-v2-2.20';P=Path(__file__).resolve().parents[1]
MAN={'source_id':'manual-user-compilation','chapter':'GTAO V2 6A','chapter_revision':'20240924'}
PHOENIX='https://www.phoenixcontact.com/en-us/products/pcb-plug-mc-15-2-st-381-1803578'
def manifest():
 ports=[]
 def add(pid,label,group,pos,q,n,up,contacts,pages,**kw):
  p={'id':A+'.'+pid,'parent_id':A+'.root','anchor_name':A+'.'+pid,'label':label,'group':group,'connector':kw.pop('connector',group),'signal_type':group,'direction':kw.pop('direction','unknown'),'position_m':pos,'orientation_wxyz':q,'normal':n,'keyed_up':up,'visible_contact_count':contacts,'physical_compatibility':'unknown','electrical_constraints':None,'validated_mating':False,'interactive':group!='service_unresolved','accuracy':{'count':'documented' if contacts is not None else 'unresolved','layout':'observed','keying':'observed_not_mechanically_certified','placement':'photo_estimated','mechanical_dimensions':'photo_estimated','electrical_compatibility':'not_validated'},'evidence':[{**MAN,'pdf_pages':pages}],**kw};ports.append(p);return p
 for ch in range(1,17):
  y=.0815-(ch-1)*.0103-(.006 if ch>8 else 0)
  p=add('channel'+str(ch),'OUTPUT '+str(ch),'analog_output',[.05855,y,.01315],[.5,.5,.5,.5],[1,0,0],[0,0,1],2,[276,278,279,289,290],connector='phoenix_1803578_populated_visual',direction='output',channel=ch,contact_labels=['+','RETURN'],contact_order='component side upright top (+Y) to bottom (-Y)',plug_part_number='1803578',pitch_mm=3.81,plug_dimensions_mm_W_H_L=[8.41,11.1,16.1],plug_center_m=[.0505,y,.01315],population='all sixteen removable plugs installed as manual Figure6.2 and6.10',availability='NovaCor only' if ch>12 else 'documented hardware output')
  p['accuracy']['plug_pitch_and_envelope']='manufacturer_documented';p['evidence'].append({'source_id':'phoenix-1803578','url':PHOENIX,'accessed':'2026-10-21'})
 for i,y in [(1,.075),(2,-.078)]:
  add('power'+str(i),'POWER '+str(i),'power',[-.043,y,.021],[1,0,0,0],[0,0,1],[0,1,0],4,[279,281,282],connector='keyed_1x4_power_header_visual',direction='power',contact_labels=['+24V','GND','GND','NC'] if i==1 else [None]*4,pinout_status='verified_upper_header_only' if i==1 else 'unknown_lower_header_pin_order',contact_order='board top (+Y) to bottom (-Y)',key_profile='two corner chamfers on left long side in component-side view',power_role='primary supply' if i==1 else 'power daisy-chain')
 for i,y in [(1,.026),(2,-.025)]:
  add('gt'+str(i),'GT'+str(i),'optical',[-.053,y,.012],[.5,.5,-.5,-.5],[-1,0,0],[0,0,1],2,[279,280],connector='lc_duplex_sfp_visual',direction='bidirectional',chain_role='upstream' if i==1 else 'downstream')
 for pid,label,pos in [('service_header','SERVICE HEADER',[-.022,.091,.015]),('service_usb','SERVICE RECEPTACLE',[.002,.091,.011])]:
  p=add(pid,label,'service_unresolved',pos,[1,0,0,0],[0,0,1],[0,1,0],None,[279],connector='observed_service_outline_only');p['accuracy']['contact_geometry']='unresolved_not_modelled';p['unresolved']='Exact contacts and keying unvalidated; hollow outline only, no invented contacts.'
 return {'schema_version':'rtds.ports.v1','asset_id':A,'asset_version':'0.1.0','hardware_version':'GTAO V2','pcb_revision':'2.20','appearance_revision':'PCB 2.20 manual Figure6.2, all 16 terminal plugs populated','unit':'m','frame':'BLENDER_Z_UP_FRONT_NEG_Y; PCB component side +Z, board label top +Y','board_dimensions_m_estimated':[.100,.190,.0016],'critical_interface_status':'core signal/power/optical geometry grounded; two auxiliary service details unresolved','ports':ports}
if __name__=='__main__':(P/'metadata/ports.json').write_text(json.dumps(manifest(),indent=2)+'\n')
