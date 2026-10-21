from asset_common import *
def build_asset(config):
    a=config['asset_id']; r=root(a)
    box(a,'body',(0,0,.045),config['body_dimensions_m'],'coral',r,.004)
    box(a,'panel_front',(0,-.061,.045),(.168,.004,.060),'cream',r,.002)
    text_label(a,'brand','PULSE / 02',(-.077,-.064,.069),.0048,'ink',r)
    knob(a,'knob',(-.047,-.073,.040),.016,r,'blue')
    text_label(a,'label_level','LEVEL',(-.047,-.064,.061),.004,'ink',r,'CENTER')
    box(a,'display',(.014,-.064,.059),(.044,.002,.016),'screen',r,.001)
    pts=[(-.005,-.0655,.057),(.003,-.0655,.057),(.003,-.0655,.063),(.011,-.0655,.063),(.011,-.0655,.057),(.019,-.0655,.057),(.019,-.0655,.063),(.027,-.0655,.063)]
    path_curve(a,'trace',pts,.00045,'trace',r)
    b=box(a,'button',(.012,-.067,.034),(.024,.010,.011),'sage',r,.0013); b['motion']='translation'; b['motion_axis_local']='Y'
    text_label(a,'label_button','ARM',(.012,-.064,.045),.004,'ink',r,'CENTER')
    socket(a,'out',(.061,-.064,.035),r,'OUT','output','coral')
    text_label(a,'label_out','OUT',(.061,-.064,.050),.0045,'ink',r,'CENTER')
    cylinder(a,'indicator',(.061,-.065,.062),.0026,.002,'sage',r,12,0)
    for i in range(5): box(a,'vent_'+str(i),(.0905,.025-i*.012,.045),(.001,.006,.022),'ink',r,.0003)
    for ix in [-1,1]:
        for iy in [-1,1]: box(a,f'foot_{ix}_{iy}',(ix*.064,iy*.039,.005),(.025,.022,.010),'rubber',r,.0015)
    box(a,'top_inset',(0,.009,.0808),(.125,.072,.0015),'coral',r,.001)
    return result(a,r)
