"""Original GTAI V2 2.31 visual semantics; not a wiring or mating validator."""
import json
from pathlib import Path
A='gtai-v2-2.31';P=Path(__file__).resolve().parents[1]
MAN={'source_id':'private-manual-2026-compilation','chapter':'GTAI V2','chapter_revision':'20240924'}
PHOENIX='https://www.phoenixcontact.com/en-us/products/pcb-plug-mc-15-3-st-381-1803581'
def manifest():
 ports=[]
 def add(pid,label,group,pos,q,n,up,count,pages,**kw):
  r={'id':A+'.'+pid,'parent_id':A+'.root','anchor_name':A+'.'+pid,'label':label,'group':group,'connector':kw.pop('connector',group),'signal_type':group,'direction':kw.pop('direction','unknown'),'position_m':pos,'orientation_wxyz':q,'normal':n,'keyed_up':up,'visible_contact_count':count,'physical_compatibility':'unknown','electrical_constraints':None,'validated_mating':False,'interactive':group!='service_unresolved','accuracy':{'count':'documented' if count is not None else 'unresolved','layout':'observed','keying':'observed_not_mechanically_certified','placement':'photo_estimated','mechanical_dimensions':'photo_estimated','electrical_compatibility':'not_validated'},'evidence':[{**MAN,'pdf_pages':pages}],**kw};ports.append(r);return r
 for ch in range(1,13):
  y=.075-(ch-1)*.0134-(.0062 if ch>6 else 0)
  p=add(f'input{ch}',f'INPUT {ch}','analogue_input',[.0575,y,.0132],[.5,.5,.5,.5],[1,0,0],[0,0,1],3,[337,339,347],connector='phoenix_1803581_populated_visual',direction='input',channel=ch,contact_labels=['+','-','GND'],contact_order='upright component side top (+Y) to bottom (-Y)',plug_part_number='1803581',pitch_mm=3.81,plug_dimensions_mm_W_H_L=[12.22,11.1,16.1],population='right-angle PCB header with removable plug installed')
  p['accuracy']['plug_pitch_and_envelope']='manufacturer_documented';p['evidence'].append({'source_id':'phoenix-1803581','url':PHOENIX,'accessed':'2026-10-21'})
 for i,y in [(1,.070),(2,-.073)]:
  add('power'+str(i),'POWER '+str(i),'power',[-.043,y,.021],[1,0,0,0],[0,0,1],[0,1,0],4,[337,341],connector='keyed_1x4_power_header_visual',direction='power',contact_labels=['+24V','GND','GND','NC'] if i==1 else [None]*4,pinout_status='verified_upper_header_only' if i==1 else 'unknown_lower_header_pin_order',contact_order='board top (+Y) to bottom (-Y)',key_profile='left long-side corner chamfers in component-side view',power_role='primary supply' if i==1 else 'power daisy-chain')
 for i,y in [(1,.023),(2,-.025)]:
  p=add('gt'+str(i),'GT'+str(i),'optical',[-.053,y,.012],[.5,.5,-.5,-.5],[-1,0,0],[0,0,1],2,[337,343,344],connector='lc_duplex_sfp_visual',direction='bidirectional',chain_role='upstream' if i==1 else 'downstream');p['accuracy']['internal_keying']='visual_approximation_no_exact_transceiver_part';p['unresolved']='Exact module part, Tx/Rx mapping and internal mating geometry are not established for this card revision.'
 for pid,label,pos in [('service_jtag','SERVICE HEADER',[-.018,.055,.015]),('service_usb','SERVICE RECEPTACLE',[-.006,.088,.011])]:
  p=add(pid,label,'service_unresolved',pos,[1,0,0,0],[0,0,1],[0,1,0],None,[337],connector='observed_service_outline_only');p['accuracy']['contact_geometry']='unresolved_not_modelled';p['unresolved']='Exact contact count, keyed insert and connector standard need revision-matched close-ups. Hollow outline only.'
 return {'schema_version':'rtds.ports.v1','asset_id':A,'asset_version':'0.1.0','hardware_version':'GTAI V2','pcb_revision':'2.31','appearance_revision':'manual Figure7.1 PCB 2.31, chapter20240924','unit':'m','frame':'BLENDER_Z_UP_FRONT_NEG_Y; PCB component side +Z, upright board top +Y','board_dimensions_m_estimated':[.100,.180,.0016],'critical_interface_status':'core signal/power/optical visual candidate; service and exact mating details unresolved','ports':ports}
if __name__=='__main__':(P/'metadata/ports.json').write_text(json.dumps(manifest(),indent=2)+'\n')
