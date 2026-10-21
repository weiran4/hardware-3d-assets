export async function selectPhysical(page,id){
 const notes=page.locator('.rtds-model-notes');if(await notes.getAttribute('open')===null)await notes.locator('summary').click();
 await page.locator('#rtds-physical-port').selectOption(id);
}
