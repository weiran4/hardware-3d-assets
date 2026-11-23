import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

for(const width of [1200,390]) {
  test(`course 32 GTNETx2 real 3D bench ${width}`, async ({page}) => {
    test.setTimeout(90000);
    await page.setViewportSize({width,height:1000});
    await page.goto('./#rtds-presentation-32');
    const root=page.locator('#rtds-chapter-5b'), bench=root.locator('.x2-bench'), stage=bench.locator('.network-stage');
    const status=bench.locator('.x2-choice'), result=root.locator('#gtnet-x2-result');
    const port=(id)=>bench.locator(`[data-x2-port="${id}"]`);
    const play=root.locator('#gtnet-x2-play'), step=root.locator('#gtnet-x2-step');
    await expect(root).toBeVisible();
    // Deep-link first paint must succeed without a scroll/resize wake-up.
    await expect(stage).toHaveAttribute('data-loaded','true');
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toBeInViewport();
    expect(Number(await stage.getAttribute('data-triangles'))).toBeGreaterThan(1000);
    await expect(stage.locator('canvas')).toHaveCount(1);
    expect(await stage.locator('canvas').evaluate(c=>Boolean(c.getContext('webgl2')))).toBe(true);
    await expect(result).toHaveAttribute('data-status','match');
    await mkdir('screenshots',{recursive:true});
    await stage.screenshot({path:`screenshots/gtnet-x2-normal-${width}.png`});
    await port('N.GT1').focus();
    await page.keyboard.press('Enter');
    await expect(status).toContainText('N.GT1');
    await port('X.GT_A').click();
    await expect(result).toHaveAttribute('data-status','invalid');
    await bench.locator('[data-medium]').selectOption('ethernet');
    await port('N.GT1').click();
    await port('X.GT_A').click();
    await expect(status).toContainText('不匹配');
    await expect(result).toHaveAttribute('data-status','invalid');
    await bench.locator('[data-medium]').selectOption('gt');
    if(width===1200){
      await stage.locator('.network-labels').getByRole('button',{name:'N.GT1',exact:true}).click();
      await expect(status).toContainText('N.GT1');
    }else await port('N.GT1').click();
    await port('X.GT_A').click();
    await expect(result).toHaveAttribute('data-status','match');
    await play.click();
    await expect(root).toHaveAttribute('data-playing','true');
    await page.evaluate(()=>{location.hash='#rtds-presentation-25';});
    await expect(root).toBeHidden();
    await expect(root).toHaveAttribute('data-playing','false');
    await page.goBack();
    await expect(root).toBeVisible();
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toBeInViewport();
    await expect(stage).toHaveAttribute('data-loaded','true');
    await page.goForward();
    await expect(root).toBeHidden();
    await page.goBack();
    await root.locator('[data-gtnet-x2-example="prp"]').click();
    await expect(result).toHaveAttribute('data-status','match');
    await step.click();
    await expect(root.locator('#gtnet-x2-path li[aria-current="true"]')).toHaveCount(2);
    await stage.screenshot({path:`screenshots/gtnet-x2-prp-${width}.png`});
    await root.locator('[data-gtnet-x2-example="lan"]').click();
    await expect(result).toHaveAttribute('data-status','invalid');
    await expect(play).toBeDisabled();
    await page.emulateMedia({reducedMotion:'reduce'});
    await root.locator('[data-gtnet-x2-example="normal"]').click();
    await expect(play).toBeDisabled();
    await expect(step).toBeEnabled();
    await stage.locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await expect(bench.locator('[data-retry]')).toBeVisible();
    await bench.locator('[data-retry]').click();
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toBeInViewport();
    await expect(stage).toHaveAttribute('data-loaded','true');
    await expect(stage.locator('canvas')).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}

for(const width of [1280,390])test(`P32 detached 5U SEL-421 exterior ${width}`,async({page})=>{
 test.setTimeout(60000);
 await page.setViewportSize({width,height:1000});await page.goto('./#rtds-presentation-32');
 const root=page.locator('#rtds-chapter-5b'),bench=root.locator('.x2-bench'),stage=bench.locator('.network-stage'),focus=bench.locator('[data-sel421-focus]'),reset=bench.locator('[data-sel421-reset]');
 const play=root.locator('#gtnet-x2-play'),step=root.locator('#gtnet-x2-step'),replay=root.locator('#gtnet-x2-replay');
 await expect(stage).toHaveAttribute('data-loaded','true');
 await expect(stage).toHaveAttribute('data-sel421','overview');
 await stage.scrollIntoViewIfNeeded();
 await expect(bench.locator('[data-sel421-caption]')).toBeVisible();
 await expect(bench.locator('[data-sel421-caption]')).toContainText('5U 外观参考 · 未接线');
 await expect(bench.getByRole('link',{name:/SEL-421.*实物/})).toHaveAttribute('href',/selinc\.com/i);
 const wires=await stage.getAttribute('data-wires');
 expect(Number(wires)).toBeGreaterThan(1);
 const endpoints=await stage.getAttribute('data-ied-anchors');
 expect(JSON.parse(endpoints)).toEqual({'IED.A':[.51,.035,.07],'IED.B':[.61,.035,.07]});
 const qa=process.env.X2_PHOTO_QA_DIR;
 if(qa){await mkdir(qa,{recursive:true});await stage.screenshot({path:`${qa}/sel421-overview-${width}.png`});}
 await play.click();await expect(root).toHaveAttribute('data-playing','true');
 await focus.focus();await page.keyboard.press('Enter');
 await expect(stage).toHaveAttribute('data-sel421','closeup');
 await expect(stage).toHaveAccessibleName(/SEL-421.*未接线/);
 await expect(bench.locator('.network-labels')).toBeHidden();
 await expect(play).toBeDisabled();await expect(step).toBeDisabled();await expect(replay).toBeDisabled();
 await expect(root).toHaveAttribute('data-playing','false');
 await expect(stage).toHaveAttribute('data-wires',wires);
 await expect(stage).toHaveAttribute('data-ied-anchors',endpoints);
 await stage.scrollIntoViewIfNeeded();
 await expect(stage).toHaveAttribute('data-rendered-wires','0');
 if(qa)await stage.screenshot({path:`${qa}/sel421-front-${width}.png`});
 await reset.click();await expect(stage).toHaveAttribute('data-sel421','overview');await expect(step).toBeEnabled();
 await focus.click();await root.locator('[data-gtnet-x2-example="prp"]').click();
 await expect(stage).toHaveAttribute('data-sel421','hidden');await expect(focus).toBeHidden();await expect(step).toBeEnabled();
 await expect(stage).toHaveAttribute('data-ied-anchors',endpoints);
 await root.locator('[data-gtnet-x2-example="normal"]').click();await expect(stage).toHaveAttribute('data-sel421','overview');
 if(width===1280){
  await focus.click();
  await stage.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  await expect(focus).toBeDisabled();await expect(stage).toHaveAccessibleName(/不可用/);
  await bench.locator('[data-retry]').click();await expect(stage).toHaveAttribute('data-sel421','overview');await expect(stage.locator('canvas')).toHaveCount(1);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
