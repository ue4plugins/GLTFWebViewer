export const screenshotElement = async (selector: string, padding = 0) => {
  const rect = await page.evaluate((selector: string) => {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element "${selector}" not found`);
    }
    const { x, y, width, height } = element.getBoundingClientRect();
    return { left: x, top: y, width, height, id: element.id };
  }, selector);

  return page.screenshot({
    clip: {
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    },
  });
};
