import { until } from 'selenium-webdriver';
import Bluebird from 'bluebird';

export class TestUtils {
  constructor(driver) {
    this.driver = driver;
  }

  async clickBy(by) {
    const element = await this.findBy(by);
    await element.click();
    await Bluebird.delay(100);
  }

  async findBy(by) {
    const element = await this.driver.wait(until.elementLocated(by));
    await this.driver.wait(until.elementIsVisible(element));
    return element;
  }
}
