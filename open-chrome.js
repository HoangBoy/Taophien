const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

function parseLiveSessions(rawData) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const yyyy = tomorrow.getFullYear();
  const dateStr = `${dd}/${mm}/${yyyy}`;

  const lines = rawData.split('\n'); // KHÔNG trim() ở đây

  let currentOrderId = '';
  let currentRoom = '';
  let currentAssistant = '';
  let sessionList = [];

  function convertTime(str) {
    return str
      .replace(/h30/gi, ':30')
      .replace(/h/gi, ':00');
  }

  lines.forEach(line => {
    if (!line.trim()) return; // bỏ hẳn dòng trắng (không có tab nào)

    const parts = line.split('\t').map(p => p.trim()); // trim từng ô

    const orderId = parts[0] || '';
    const timeRange = parts[2] || '';
    const mainHost = parts[3] || '';
    const assistant = parts[4] || '';
    const note = parts[5] || '';
    const roomName = parts[6] || '';

    if (orderId) currentOrderId = orderId;
    if (roomName) currentRoom = roomName;
    if (assistant) currentAssistant = assistant;

    if (timeRange && timeRange.includes('-')) {
      const [startRaw, endRaw] = timeRange.split('-').map(s => s.trim());
      const start = convertTime(startRaw);
      const end = convertTime(endRaw);

      const session = {
        orderId: currentOrderId,
        startTime: `${start} ${dateStr}`,
        endTime: `${end} ${dateStr}`,
        note: note,
        assistant: currentAssistant,
        roomName: currentRoom
      };

      if (mainHost) session.mainHost = mainHost;

      sessionList.push(session);
    }
  });

  console.log("const sessionList =", JSON.stringify(sessionList, null, 2));
  return sessionList;
}
// run



// ✅ Đăng nhập và trả về driver
async function loginToWebsite(email, password) {
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();

  try {
    await driver.manage().window().maximize();
    await driver.get('https://gmv.vn/admin/sessions/create');
    const emailInput = await driver.wait(until.elementLocated(By.name('email')), 10000);
    await emailInput.sendKeys(email);

    const passwordInput = await driver.wait(until.elementLocated(By.name('password')), 10000);
    await passwordInput.sendKeys(password);

    const loginButton = await driver.wait(until.elementLocated(By.xpath("//button[.//span[text()='Đăng nhập']]")), 10000);
    await loginButton.click();

    console.log('✅ Đăng nhập thành công.');
    await driver.sleep(1000);
    return driver;
  } catch (err) {
    console.error('❌ Lỗi đăng nhập:', err);
    await driver.quit();
  }
}

// ✅ Chọn đơn hàng theo mã
async function selectOrder(driver, orderId) {
  try {
    const inputWrapper = await driver.wait(
      until.elementLocated(By.css('.el-input__wrapper')),
      10000
    );
    await inputWrapper.click();

    const inputField = await driver.wait(
      until.elementLocated(By.css('.el-input__inner')),
      10000
    );
    await inputField.clear();
    await inputField.sendKeys(orderId);

    await driver.sleep(2000);

    const matchedItem = await driver.wait(
      until.elementLocated(By.xpath(`//li[contains(@class,'el-select-dropdown__item')]//div[contains(text(), '${orderId}')]`)),
      5000
    );
    await matchedItem.click();
    console.log(`✅ Đã chọn đơn hàng: ${orderId}`);
  } catch (err) {
    console.warn(`⚠️ Không tìm thấy đơn hàng: ${orderId}`);
    
    // // Fallback nếu chưa phải là fallback rồi
    // if (true) {
    //   console.log('🔁 Đang fallback với orderId: 210924GAXP');
    //   await selectOrder(driver, '210924GAXP');
    // } else {
    //   console.error(`❌ Fallback thất bại: Không tìm được đơn hàng nào phù hợp.`);
    // }
  }
}


// ✅ Điền thời gian bắt đầu / kết thúc
async function fillStartEndTime(driver, startTime, endTime) {
  try {
    const startInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Chọn thời gian bắt đầu ']")), 10000);
    await startInput.click();
    await startInput.clear();
    await startInput.sendKeys(startTime);
    console.log(`✅ Bắt đầu: ${startTime}`);
    const noteArea = await driver.wait(until.elementLocated(By.xpath("//textarea[@placeholder='Note phiên live']")), 10000);
    await noteArea.click();
    const endInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Chọn thời gian kết thúc ']")), 10000);
    await endInput.click();
    await endInput.clear();
    await endInput.sendKeys(endTime);
    console.log(`✅ Kết thúc: ${endTime}`);
  } catch (err) {
    console.error('❌ Lỗi thời gian:', err);
  }
}

// ✅ Điền ghi chú
async function fillNote(driver, assistant, orderId, mainHost, roomName) {
  try {
    const noteArea = await driver.wait(until.elementLocated(By.xpath("//textarea[@placeholder='Note phiên live']")), 10000);
    await noteArea.clear();
    await noteArea.sendKeys('Đơn hàng : ');
    await noteArea.sendKeys(orderId);
    await noteArea.sendKeys(` Live chính: ' ${mainHost}  Phòng live : `);
    await noteArea.sendKeys(' Trợ Live :');
    await noteArea.sendKeys(assistant);
    await noteArea.sendKeys(' Phòng : ');
    await noteArea.sendKeys(roomName);
    console.log(`✅ Ghi chú: ${note + sessionList}`);
  } catch (err) {
    console.error('❌ Lỗi ghi chú:', err);
  }
}

// ✅ Chọn hub live
async function fillHublive(driver) {
  try {
    const wrapper = await driver.wait(
      until.elementLocated(By.xpath("//input[@placeholder='Chọn Hublive']/ancestor::div[contains(@class,'el-input__wrapper')]")),
      10000
    );
    await wrapper.click();
    await driver.sleep(1000);

    const hubOption = await driver.wait(
      until.elementLocated(By.xpath("//li[contains(@class, 'el-select-dropdown__item')]//span[contains(text(), 'Hub Hà Nội')]")),
      10000
    );
    await hubOption.click();
    console.log(`✅ Đã chọn Hub Hà Nội`);
  } catch (err) {
    console.error('❌ Lỗi chọn hub live:', err);
  }
}

// ✅ Chọn phụ live (assistant)
async function selectAssistant(driver, assistant) {
  try {
    const wrapper = await driver.wait(
      until.elementLocated(By.xpath("//input[@placeholder='Chọn phụ live']/ancestor::div[contains(@class, 'el-input__wrapper')]")),
      10000
    );
    await wrapper.click();

    const dynamicInput = await driver.wait(until.elementLocated(By.css("input.el-select__input")), 5000);
    await dynamicInput.sendKeys(assistant);

    await driver.sleep(1000);

    const email = 'tvdtazan112@gmail.com';

const emailDiv = await driver.wait(
  until.elementLocated(
    By.xpath(`//div[@class='description' and text()='${email}']`)
  ),
  10000
);

await driver.executeScript("arguments[0].scrollIntoView(true);", emailDiv); // đảm bảo thấy được
await emailDiv.click();

console.log(`✅ Đã click vào email: ${email}`);



    console.log(`✅ Đã chọn trợ live: ${assistant}`);
  } catch (err) {
    console.error('❌ Lỗi chọn trợ live:', err);
  }
}

// ✅ Chọn main host
async function selectMainHost(driver, mainHost) {
  try {
    const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const searchInput = await driver.wait(
      until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm streamer']")),
      5000
    );

    await searchInput.click();
    await searchInput.clear();
    await searchInput.sendKeys(mainHost);
     await driver.sleep(1000);
    await searchInput.sendKeys(' ');

    // Đợi phần tử xuất hiện
    await driver.sleep(2000);

    // Chờ cho các streamer được render (ít nhất 1 item có class cụ thể)
    await driver.wait(
      until.elementLocated(By.css(".py-3.px-4.flex.gap-2.cursor-pointer")),
      5000
    );

    const hostCards = await driver.findElements(By.css(".py-3.px-4.flex.gap-2.cursor-pointer"));

    for (const card of hostCards) {
      const nameElement = await card.findElement(By.css("h5.text-sm.font-semibold"));
      const nameText = await nameElement.getText();

      if (normalize(nameText).includes(normalize(mainHost))) {
        await driver.executeScript("arguments[0].scrollIntoView(true);", card);
        await card.click();
        console.log(`✅ Đã chọn host khớp: ${nameText}`);
        return;
      }
    }

    console.warn("❌ Không tìm thấy host khớp.");
  } catch (err) {
    console.error(`❌ Lỗi khi chọn main host '${mainHost}':`, err);
  }
}




// ✅ Chọn phòng live, thử fallback nếu không chọn được phòng mong muốn
async function clickLiveRoom(driver, preferredRoom) {
  const fallbackRooms = [
    'Phòng live 1', 'Phòng live 2', 'Phòng live 3', 'Phòng live 4',
    'Phòng live 5', 'Phòng live 6', 'Phòng live 13', 'Phòng live 14',
    'Phòng mega 1', 'Phòng mega 3', 'Phòng Vip 1', 'Phòng 30',
    'Phòng Trà Cũ', 'Phòng Hợp 2'
  ];

  // Tạo danh sách thử: phòng mong muốn trước, sau đó là các fallback
  const roomList = [preferredRoom, ...fallbackRooms.filter(r => r !== preferredRoom)];

  for (const roomName of roomList) {
    try {
      const success = await driver.executeScript(`
        const roomName = arguments[0];
        const labels = document.querySelectorAll('label.el-radio');

        for (let label of labels) {
          if (label.textContent.trim().includes(roomName)) {
            const input = label.querySelector('input[type="radio"]');
            if (input) {
              input.click();
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
        }
        return false;
      `, roomName);

      if (success) {
        console.log(`✅ Đã chọn phòng: ${roomName}`);
        return roomName;
      } else {
        console.warn(`⚠️ Không tìm thấy hoặc không click được: ${roomName}`);
      }
    } catch (err) {
      console.error(`❌ Lỗi khi chọn phòng '${roomName}':`, err);
    }
  }

  throw new Error('❌ Không click được bất kỳ phòng nào trong danh sách!');
}


// ✅ Click nút "Tạo phiên"
async function clickCreate(driver) {
  try {
    const createButton = await driver.wait(
      until.elementLocated(By.xpath("//button[.//span[text()='Tạo phiên']]")),
      10000
    );
    await driver.executeScript("arguments[0].scrollIntoView(true);", createButton);
    await driver.sleep(500); // đợi scroll
    await createButton.click();
    console.log("✅ Đã click nút 'Tạo phiên'");
  } catch (err) {
    console.error("❌ Lỗi khi click nút 'Tạo phiên':", err);
  }
}





// ✅ Gộp tạo session
async function createSession(driver, session) {
  const { orderId, startTime, endTime, note, mainHost, assistant, roomName } = session;
  await selectOrder(driver, orderId);
  await fillStartEndTime(driver, startTime, endTime);
  await fillNote(driver,  assistant,orderId, mainHost, roomName);
  await selectAssistant(driver, assistant);

  await fillHublive(driver);
  await selectMainHost(driver, mainHost);
  await clickLiveRoom(driver, roomName);
 // await clickCreate(driver);
}

// ✅ Mỗi phiên trong tab mới
async function createSessionInNewTab(driver, session) {
  try {
    await driver.executeScript("window.open('about:blank', '_blank');");
    const handles = await driver.getAllWindowHandles();
    const newTab = handles[handles.length - 1];
    await driver.switchTo().window(newTab);
    await driver.get('https://gmv.vn/admin/sessions/create');

    await createSession(driver, session);
  } catch (err) {
    console.error('❌ Lỗi tạo phiên ở tab mới:', err);
  }
}

// ✅ Danh sách phiên cần tạo






// ✅ Gọi hàm chính
(async () => {
  const driver = await loginToWebsite('hoangboytq@gmail.com', 'MxRKPGFhKj@5BXZ');


  if (driver) {
    // Gọi hàm chuyển đổi dữ liệu và lấy data
    const rawData = fs.readFileSync('data.txt', 'utf-8');
    const sessionList = parseLiveSessions(rawData);
    for (const session of sessionList) {
      await createSessionInNewTab(driver, session);
      await driver.sleep(1000);
    }
    console.log('🎉 Tạo xong toàn bộ phiên.');
  }
})();
