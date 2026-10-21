"""Version-pinned semantic records. Units metres; no mating validation."""
import json
from pathlib import Path
A='gtdi-v2-2.01';ROOT=Path(__file__).resolve().parents[1]
MAN={'source_id':'manual-user-compilation','chapter':'GTDI V2','chapter_revision':'20241219'}
PHOENIX='https://www.phoenixcontact.com/en-us/products/pcb-plug-mc-15-5-st-381-1803604'

def manifest():
 ports=[]
 def add(pid,label,group,pos,q,n,up,contacts,pages,**kw):
  p={'id':A+'.'+pid,'parent_id':A+'.root','anchor_name':A+'.'+pid,'label':label,'group':group,'connector':kw.pop('connector',group),'signal_type':group,'direction':kw.pop('direction','unknown'),'position_m':pos,'orientation_wxyz':q,'normal':n,'keyed_up':up,'visible_contact_count':contacts,'physical_compatibility':'unknown','electrical_constraints':None,'validated_mating':False,'interactive':group!='service_unresolved','accuracy':{'count':'documented' if contacts is not None else 'unresolved','layout':'observed','keying':'observed_not_mechanically_certified','placement':'photo_estimated','mechanical_dimensions':'photo_estimated','electrical_compatibility':'not_validated'},'evidence':[{**MAN,'pdf_pages':pages}],**kw}
  ports.append(p);return p
 for bank in range(1,9):
  yc=.079-(bank-1)*.021-(.006 if bank>4 else 0)
  for tier in ['odd','even']:
   inner=tier=='odd';x=.035 if inner else .0505;z=.023 if inner else .012
   labels=[str((bank-1)*8+i) for i in ([1,3,5,7] if inner else [2,4,6,8])]+(['V+(WET)'] if inner else ['GND'])
   p=add(f'bank{bank}_{tier}',f'BANK {bank} {tier.upper()}','digital_input',[x+.00805,yc,z],[.5,.5,.5,.5],[1,0,0],[0,0,1],5,[405,406,414],connector='phoenix_1803604_populated_visual',direction='input',bank=bank,tier=tier,contact_labels=labels,contact_order='component side: board top (+Y) to bottom (-Y)',plug_part_number='1803604',pitch_mm=3.81,plug_dimensions_mm_W_H_L=[19.84,11.1,16.1],plug_center_m=[x,yc,z],population='plug installed; derived from manual Fig9.9, not inferred from rear-view photograph')
   p['accuracy']['plug_pitch_and_envelope']='manufacturer_documented';p['evidence'].append({'source_id':'phoenix-1803604','url':PHOENIX,'accessed':'2026-10-21'})
 for i,y in [(1,.073),(2,-.079)]:
  add('power'+str(i),'POWER '+str(i),'power',[-.043,y,.021],[1,0,0,0],[0,0,1],[0,1,0],4,[405,408],connector='keyed_1x4_power_header_visual',direction='power',contact_labels=['+24V','GND','GND','NC'] if i==1 else [None]*4,pinout_status='verified_upper_header_only' if i==1 else 'unknown_lower_header_pin_order',contact_order='board top (+Y) to bottom (-Y)',key_profile='two corner chamfers on left long side in component-side view',power_role='primary supply' if i==1 else 'power daisy-chain')
 for i,y in [(1,.027),(2,-.025)]:
  add('gt'+str(i),'GT'+str(i),'optical',[-.053,y,.012],[.5,.5,-.5,-.5],[-1,0,0],[0,0,1],2,[404,405,410,411],connector='lc_duplex_sfp_visual',direction='bidirectional',chain_role='upstream' if i==1 else 'downstream')
 for pid,label,pos in [('aux_pullup_top','PULLUP HEADER',[-.012,.089,.015]),('service_jtag','SERVICE HEADER',[-.011,.058,.015]),('aux_pullup_bottom','AUXILIARY HEADER',[-.011,-.078,.015]),('service_usb','SERVICE RECEPTACLE',[.005,.091,.011])]:
  p=add(pid,label,'service_unresolved',pos,[1,0,0,0],[0,0,1],[0,1,0],None,[405],connector='observed_service_outline_only')
  p['accuracy']['contact_geometry']='unresolved_not_modelled';p['unresolved']='Exact contact count, connector part number and keyed mating profile need a straight-on close-up; hollow silhouette only, no invented contacts.'
 return {'schema_version':'rtds.ports.v1','asset_id':A,'asset_version':'0.1.0','hardware_version':'GTDI V2','pcb_revision':'2.01','appearance_revision':'PCB 2.01 manual Figure9.1, with external terminal plugs populated as Figure9.9','unit':'m','frame':'BLENDER_Z_UP_FRONT_NEG_Y; PCB component side +Z, board label top +Y','board_dimensions_m_estimated':[.100,.190,.0016],'critical_interface_status':'core signal/power/optical geometry grounded; auxiliary service details unresolved','ports':ports}
if __name__=='__main__':
 (ROOT/'metadata/ports.json').write_text(json.dumps(manifest(),indent=2)+'\n')
