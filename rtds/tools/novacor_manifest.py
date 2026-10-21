"""Original, version-pinned source facts and explicitly estimated placement.
No manufacturer drawings or copyrighted media are included.
"""
import json,math
from pathlib import Path
ASSET='novacor-2.0-2023'
ROOT=Path(__file__).resolve().parents[1]
MAN={'source_id':'manual-user-compilation','chapter':'NovaCor 2.0','chapter_revision':'20250916'}
def build_manifest():
    ports=[]
    def add(pid,group,label,pos,connector,contacts,channel=None,key_up=True,pages=(71,72),direction='bidirectional'):
        rear=pos[1]>0; normal=[0,1 if rear else -1,0]; up=[0,0,1 if key_up else -1]
        # Orthonormal frame columns: horizontal, keyed-up, outward.
        # Front Rx(+90); rear Rx(-90) composed with local Rz(180).
        if rear: q=[0,0,math.sqrt(.5),math.sqrt(.5)] if key_up else [math.sqrt(.5),-math.sqrt(.5),0,0]
        else: q=[math.sqrt(.5),math.sqrt(.5),0,0]
        p={'id':ASSET+'.'+pid,'parent_id':ASSET+'.root','anchor_name':ASSET+'.'+pid,'label':label,'group':group,'channel':channel,'connector':connector,'signal_type':group,'direction':direction,'position_m':pos,'orientation_wxyz':q,'normal':normal,'keyed_up':up,'visible_contact_count':contacts,'physical_compatibility':'unknown','electrical_constraints':None,'validated_mating':False,'accuracy':{'count':'documented','layout':'observed_and_documented','keying':'documented' if group in ['gtio','aurora','irc','gtsync'] else 'observed_not_mechanically_certified','placement':'photo_estimated','mechanical_dimensions':'photo_estimated','electrical_compatibility':'not_validated'},'evidence':[{**MAN,'pdf_pages':list(pages)}, {'source_id':'rtds-nc2-brochure-2023','pdf_page':2}]}
        ports.append(p)
    for i in range(12):
        add('ao'+str(i+1),'analogue',str(i+1),[.059+(i//3)*.0175,-.261,.037-(i%3)*.0105],'round_single_contact_socket_standard_unknown',1,i+1,pages=(70,),direction='output')
    for i in range(3): add('gnd'+str(i+1),'ground','GND '+str(i+1),[.134+i*.013,-.261,.016],'round_single_contact_socket_standard_unknown',1,pages=(70,),direction='reference')
    # Rear positions are photo-normalized, not port-assembly mechanical drawings.
    # Rear screenshot left = global +X. Four blocks: GT1-8, GT9-16, GT17-24, IRC/GTSYNC/ETH.
    columns=[.153,.137,.121,.105,.079,.063,.047,.031,-.011,-.027,-.043,-.059]
    for i,x in enumerate(columns):
        for row in range(2):
            n=i*2+row+1; add('gt'+str(n),'gtio' if n<=20 else 'aurora','GT'+str(n),[x,.261,.038 if row==0 else .020],'lc_duplex_sfp_ftlf8519p3bnl_visual',2,n,key_up=row==0)
    for col in range(3):
        for row in range(2):
            n=col*2+row+1; add('irc'+str(n),'irc','IRC'+str(n),[-.083-col*.016,.261,.038 if row==0 else .020],'lc_duplex_sfp_ftlf8519p3bnl_visual',2,n,key_up=row==0)
    add('gtsync','gtsync','GTSYNC',[-.131,.261,.038],'lc_duplex_sfp_ftlf8519p3bnl_visual',2)
    add('udp','udp','ETH',[-.131,.261,.018],'copper_sfp_8p8c',8,key_up=False)
    add('wif','wif','WIF ETHERNET',[-.161,.261,.040],'8p8c_ethernet',8)
    add('gbh','gbh','GBH',[.188,.261,.019],'gbh_duplex_pof_visual',2,pages=(71,81,82))
    add('front_led_power','front_led_power','FP LED POWER',[.214,.261,.020],'round_dc_power_visual_standard_unknown',2,pages=(71,),direction='power')
    add('ac_power','ac_power','AC POWER',[-.205,.261,.067],'three_blade_ac_inlet_visual',3,pages=(71,),direction='power')
    return {'schema_version':'rtds.ports.v1','asset_id':ASSET,'asset_version':'0.1.0','hardware_version':'NovaCor 2.0','appearance_revision':'2023 brochure, reconciled with 20250916 manual chapter','unit':'m','frame':'BLENDER_Z_UP_FRONT_NEG_Y','envelope_mm_W_D_H':[483,522,178],'envelope_scope':'2023 brochure overall dimensions; individual fascia/rail extents estimated; other manual extents not silently substituted','ports':ports}
if __name__=='__main__':
    p=ROOT/ASSET/'metadata/ports.json'; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(build_manifest(),indent=2)+'\n')
