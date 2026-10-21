"""Compose verified saved masters, never duplicate their modeling logic."""
from pathlib import Path
import bpy
from asset_common import root,result

def build_asset(config):
    r=root(config['asset_id']); project=Path(config['project_root'])
    for member in config['members']:
        asset=member['asset_id']; src=project/member['path']
        with bpy.data.libraries.load(str(src),link=False) as (data_from,data_to):
            data_to.objects=[name for name in data_from.objects if name.startswith(asset+'.')]
        for obj in data_to.objects:
            if obj: bpy.context.collection.objects.link(obj)
        ar=next(o for o in data_to.objects if o and o.get('sid')==asset+'.root'); ar.parent=r; ar.location=member['position_m']
    bpy.context.view_layer.update()
    objects=[o for o in bpy.context.scene.objects if o.get('sid')]
    return {'asset_id':config['asset_id'],'root':r.name,'parts':{o['sid']:o.name for o in objects if o.get('kind')=='part'},'anchors':{o['sid']:o.name for o in objects if o.get('kind')=='anchor'}}
