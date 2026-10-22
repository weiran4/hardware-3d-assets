"""Original GTFPI PCB 2.01 capped visual-variant metadata. No electrical validation."""
import json,math
from pathlib import Path
A='gtfpi-v2-2.01-capped';P=Path(__file__).resolve().parents[1]
MAN={'source_id':'rtds-hardware-manual','title':'RTDS Hardware Manual','chapter':'10 GTFPI V2','chapter_revision':'20240924','printed_pages':[2,3,4]}
PHOTO='https://knowledge.rtds.com/hc/article_attachments/360100284873'
def manifest():
 ports=[]
 def add(pid,label,group,pos,q,n,up,contacts,**kw):
  p={'id':A+'.'+pid,'parent_id':A+'.root','anchor_name':A+'.'+pid,'label':label,'group':group,'connector':kw.pop('connector',group),'signal_type':group,'direction':kw.pop('direction','unknown'),'position_m':pos,'orientation_wxyz':q,'normal':n,'keyed_up':up,'visible_contact_count':contacts,'physical_compatibility':'unknown','electrical_constraints':None,'validated_mating':False,'insertion_animation_ready':False,'interactive':group!='service_unresolved','accuracy':{'count':'observed' if contacts is not None else 'unresolved','layout':'observed','keying':'observed_not_manufacturer_fit_verified','placement':'photo_estimated','mechanical_dimensions':'photo_estimated','electrical_compatibility':'not_validated'},'evidence':[dict(MAN),{'source_id':'official-gtfpi-photo','url':PHOTO}],**kw};ports.append(p);return p
 for key,y,n in [('hv',.046,25),('lv',-.056,17)]:
  add(key,('HIGH' if key=='hv' else 'LOW')+' VOLTAGE INTERFACE PANEL','ribbon_header',[.043,y,.019],[math.sqrt(.5),0,0,-math.sqrt(.5)],[0,0,1],[1,0,0],2*n,connector='observed_shrouded_male_2x'+str(n),contact_rows=2,contacts_per_row=n,pin_pitch_m_estimated=.00254,key_profile='central gap in outer (+X board) long wall',observed_end_marks={'board_footer_outer':'1','board_footer_inner':'2'} if key=='lv' else {},pinout_status='not_established',panel_role='external HV-panel bridge; no high-voltage rating asserted for this header' if key=='hv' else 'external LV-panel bridge; up to sixteen digital inputs and outputs')
 for i,y in [(1,.080),(2,-.080)]:
  add('power'+str(i),'24 V POWER '+str(i),'power',[-.044,y,.022],[1,0,0,0],[0,0,1],[0,1,0],4,connector='observed_white_1x4_power_header',contact_labels=[None]*4,unordered_functions=['+24V','GND','GND','NC'],pinout_status='viewpoint_of_diagrams_not_aligned_no_spatial_mapping',power_role='supply / jumper connection; position-specific electrical pinout withheld')
 add('hv5v','HV PANEL 5 V','aux_power',[.043,-.015,.019],[1,0,0,0],[0,0,1],[0,1,0],2,connector='observed_green_open_1x2_header',key_profile='two concave lobes on inner (-X board) cavity wall',contact_labels=[None]*2,unordered_functions=['+5V','RET'],pinout_status='polarity_position_not_established')
 for i,y in [(1,.026),(2,-.026)]:
  add('gt'+str(i),'GT PORT '+str(i),'optical',[-.056,y,.0125],[.5,.5,-.5,-.5],[-1,0,0],[0,0,1],0,connector='observed_capped_duplex_sfp_assembly',population='black_dust_cap_on',under_cap_geometry='not_modelled_not_observed',direction='bidirectional',chain_role='upstream' if i==1 else 'downstream',optical_paths=2,duplex=True,gt_links=1)
 for pid,label,pos in [('service_header','SERVICE HEADER',[-.020,.062,.014]),('service_receptacle','SERVICE RECEPTACLE',[.002,.096,.011])]:
  add(pid,label,'service_unresolved',pos,[1,0,0,0],[0,0,1],[0,1,0],None,connector='observed_outline_only',unresolved='Exact contact count, mouth/key geometry and electrical role not established; non-interactive outline only.')
 return {'schema_version':'rtds.ports.v1','asset_id':A,'asset_version':'0.1.0','hardware_version':'GTFPI V2','pcb_revision':'2.01','appearance_revision':'Official PCB 2.01 photo, black dust caps on both GT ports','unit':'m','frame':'BLENDER_Z_UP_FRONT_NEG_Y; PCB component face +Z, board top +Y; ribbon key +X','board_dimensions_m_estimated':[.104,.196,.0016],'critical_interface_status':'source-grounded visible topology; no hidden optical geometry or spatial power pinout','ports':ports}
if __name__=='__main__':(P/'metadata/ports.json').write_text(json.dumps(manifest(),indent=2)+'\n')
