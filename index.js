const readline = require('readline');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
let chrome = require('selenium-webdriver/chrome');

const { Builder, By, until } = webdriver;

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

const yesOrNotQuestion = async (question) => {
  let answer = await askQuestion(question + ' ');
  while (answer !== 'y' && answer !== 'n') {
    let answer = await askQuestion('invalid answer: y or n?');
  }
  if (answer === 'n') {
    throw new Error(`test failed: ${question}`);
  }
};

const delay = (ms) => {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, ms);
  });
};

const firefoxOptions = new firefox.Options().setPreference(
  'media.navigator.permission.disabled',
  true
);

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--disable-user-media-security=true');
chromeOptions.addArguments('--use-fake-ui-for-media-stream');

const connect = async (driver) => {
  driver.findElement(By.id('toggleConnect')).click();
  const publishButton = driver.findElement(By.css("[data-action='publish']"));
  await driver.wait(until.elementIsVisible(publishButton));
  publishButton.click();
  const connectionsRoot = await driver.wait(
    until.elementLocated(
      By.xpath(
        "//div[@id='connections-root']//button[contains(text(),'Subscribe')]"
      )
    )
  );
  driver
    .findElement(
      By.xpath(
        "//div[@id='connections-root']//button[contains(text(),'Subscribe')]"
      )
    )
    .click();
};

const toggleMute = async (driver) => {
  // const publisher = () => driver.findElement(By.css('.OT_publisher'));
  // const muteButton = () =>
  driver.executeScript(
    "document.querySelector('.OT_publisher > .OT_mute').click();"
  );
  // driver.findElement(By.css('.OT_publisher > .OT_mute'));
  // const actions = await driver.actions();
  // await actions.move(publisher()).move(muteButton()).click().build().perform();
  // await delay(1000);
  // driver.findElement(By.css('.OT_publisher > .OT_mute')).click();
};

(async () => {
  const driver1 = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    // .withCapabilities(chromeCapabilities)
    .build();
  const driver2 = new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(firefoxOptions)
    .build();

  const runTest = async () => {
    await driver1.get('http://localhost:3000/room/test-1');
    await driver2.get('http://localhost:3000/room/test-1');
    const connectingDriver1 = connect(driver1);
    const connectingDrive2 = connect(driver2);
    await Promise.all([connectingDriver1, connectingDrive2]);
    // await delay(10000);
  };

  try {
    await runTest();
    await toggleMute(driver1);
    await yesOrNotQuestion('Is video quality good?');
    await yesOrNotQuestion(
      'Try making a noise as you make a gesture. Do you see and hear the gesture at the same time?'
    );
    await toggleMute(driver1);
    await toggleMute(driver2);

    await yesOrNotQuestion(
      'Same question now publishing audio from other browser. Try making a noise as you make a gesture. Do you see and hear the gesture at the same time?'
    );
  } catch {}

  driver1.quit();
  driver2.quit();
})();
