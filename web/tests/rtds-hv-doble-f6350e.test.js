import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3 } from 'three';
import { buildDobleF6350eExterior, DOBLE_F6350E_PHOTO_URL } from '../src/rtds-hv-doble-f6350e.js';

test('F6350e photo exterior has plausible case proportions and independent front features', () => {
  const model = buildDobleF6350eExterior();
  const bounds = new Box3().setFromObject(model);
  const [w,h,d] = bounds.getSize(new Vector3()).toArray();
  assert.ok(Math.abs(w-.380)<.009 && Math.abs(h-.240)<.008 && Math.abs(d-.457)<.008, [w,h,d]);
  assert.ok(Math.abs(bounds.min.y)<.001);
  assert.ok(Math.abs(bounds.getCenter(new Vector3()).z)<.008);
  assert.equal(DOBLE_F6350E_PHOTO_URL, 'https://www.doble.com/wp-content/uploads/f6350e@2x.png');
  const group = (name) => {
    const feature = model.getObjectByName(name);
    assert.ok(feature, name);
    return feature;
  };
  assert.equal(group('case-ribs').children.length, 3);
  assert.equal(group('side-handles').children.length, 2);
  const banks = group('source-output-banks').children;
  assert.equal(banks.length, 3);
  assert.deepEqual(banks.map(row => row.children.length), [6,6,6]);
  assert.deepEqual(banks.map(row => row.children[0].children[0].material.color.getHex()), [0xd72527,0x292624,0xd72527]);
  const bank = banks[0].children;
  assert.ok(bank[3].position.x-bank[2].position.x > 1.25*(bank[1].position.x-bank[0].position.x));
  assert.ok(new Box3().setFromObject(group('battery-simulator-pair')).max.x < bank[0].position.x);
  assert.equal(group('battery-simulator-pair').children.length, 2);
  assert.equal(group('communications-jacks').children.length, 3);
  for (const name of ['blank-vfd-window','iec-inlet','usb-type-b','low-level-d-sub']) {
    assert.ok(new Box3().setFromObject(group(name)).min.z > .205);
  }
  assert.equal(model.getObjectByName('rear-connectors'), undefined);
});
