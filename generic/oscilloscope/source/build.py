import math
from asset_common import *
def build_asset(config):
    a=config['asset_id']; r=root(a)
    box(a,'body',(0,0,.077),config['body_dimensions_m'],'blue',r,.005)
    box(a,'panel_front',(0,-.081,.077),(.267,.005,.118),'cream',r,.003)
    box(a,'top_strip',(0,-.084,.129),(.253,.0015,.006),'coral',r,.0003)
    box(a,'screen_bezel',(-.061,-.086,.083),(.137,.008,.083),'ink',r,.003)
    box(a,'screen',(-.061,-.0905,.083),(.124,.0015,.071),'screen',r,.001)
    for i in range(1,8): box(a,'grid_v_'+str(i),(-.123+i*.0155,-.0914,.083),(.0003,.00025,.065),'grid',r,0)
    for i in range(1,5): box(a,'grid_h_'+str(i),(-.061,-.0915,.0475+i*.0142),(.119,.00025,.0003),'grid',r,0)
    pts=[(-.120+i*.118/68,-.092,.083+.021*math.sin(i/68*math.pi*4)) for i in range(69)]
    path_curve(a,'trace',pts,.0008,'trace',r)
    text_label(a,'screen_caption','CH1',(-.117,-.092,.112),.004,'trace',r)
    text_label(a,'model','OSCILLOSCOPE',(-.122,-.085,.025),.005,'ink',r)
    knob(a,'knob',(.048,-.095,.099),.015,r,'cream')
    knob(a,'knob_time',(.104,-.095,.099),.011,r,'coral')
    text_label(a,'label_level','LEVEL',(.048,-.085,.121),.004,'ink',r,'CENTER')
    text_label(a,'label_time','TIME',(.104,-.085,.117),.004,'ink',r,'CENTER')
    for i,x in enumerate([.035,.058,.081,.104]):
        o=box(a,'button' if i==0 else 'button_'+str(i),(x,-.087,.070),(.014,.008,.007),'sage' if i==0 else 'white',r,.001)
        o['motion']='translation'; o['motion_axis_local']='Y'
    socket(a,'ch1',(.047,-.085,.040),r,'CH1','input','coral')
    socket(a,'trig',(.104,-.085,.040),r,'TRIG','input','sage')
    text_label(a,'label_ch1','CH1',(.047,-.085,.022),.0047,'ink',r,'CENTER')
    text_label(a,'label_trig','TRIG',(.104,-.085,.022),.0047,'ink',r,'CENTER')
    for i in range(6): box(a,'vent_'+str(i),(.141,.032-i*.012,.090),(.001,.006,.036),'ink',r,.0005)
    box(a,'rear_panel',(0,.0805,.077),(.246,.002,.098),'blue',r,.001)
    for ix in [-1,1]:
        for iy in [-1,1]: box(a,f'foot_{ix}_{iy}',(ix*.104,iy*.054,.006),(.032,.031,.012),'rubber',r,.002)
    for ix in [-1,1]:
        box(a,'handle_post_'+str(ix),(ix*.067,.015,.148),(.012,.020,.012),'ink',r,.002)
    box(a,'handle',(0,.015,.154),(.145,.019,.010),'rubber',r,.002)
    return result(a,r)
