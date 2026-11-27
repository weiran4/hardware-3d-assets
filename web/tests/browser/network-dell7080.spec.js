import {test,expect} from '@playwright/test';
for(const width of [1200,390])test(`7080 Micro traces management Ethernet at ${width}px`,async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width,height:900});
 await page.goto('./#rtds-presentation-25');
 const root=page.locator('#rtds-three-networks'),stage=root.locator('.network-stage');
 const button=view=>root.locator('button[data-gs316-view='+view+']');
 await expect(stage).toHaveAttribute('data-loaded','true');
 await expect(stage).toHaveAttribute('data-workstation-nic','rear-rj45-mouth');
 await root.locator('[data-example=correct]').click();
 const links=await root.locator('.network-wires li').allTextContents();
 expect(links.some(s=>s.includes('PC.lan ↔ LAN.p0'))).toBe(true);
 await expect(stage).toHaveAttribute('data-wires','5');
 await expect(root.locator('[data-workstation-photo]')).toHaveAttribute('href',/optiplex-7080-micro/);
 for(const face of ['pc-front','pc-rear']){
  await button(face).focus();await page.keyboard.press('Enter');
  await expect(stage).toHaveAttribute('data-gs316-view',face);
  await expect(button(face)).toHaveAttribute('aria-pressed','true');
  await expect(root.locator('.network-labels button')).toHaveCount(0);
  await expect(root.locator('[data-act=play]')).toBeDisabled();
  await stage.screenshot({path:`screenshots/DELL-P25-${face}-${width}.png`});
 }
 await button('wiring').click();
 await expect(stage).toHaveAttribute('data-gs316-view','wiring');
 expect(await root.locator('.network-wires li').allTextContents()).toEqual(links);
 await expect(root.locator('[data-result=lan]')).toHaveAttribute('data-valid','true');
 await root.locator('[data-example=udp]').click();
 await expect(root.locator('[data-result=lan]')).toHaveAttribute('data-valid','false');
 await expect(root.locator('[data-result=sync]')).toHaveAttribute('data-valid','true');
 await button('pc-rear').click();
 await page.evaluate(()=>location.hash='#rtds-presentation-30');
 await expect(stage).toHaveAttribute('data-gs316-view','wiring');
 await expect(stage).toHaveAttribute('data-workstation-nic','rear-rj45-mouth');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
