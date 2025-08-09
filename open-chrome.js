const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ✅ Đăng nhập và trả về driver
async function loginToWebsite(email, password) {
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();

  try {
    await driver.manage().window().maximize();
    await driver.get('https://cms.gmv.vn/admin/sessions/create');
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
    await driver.get('https://cms.gmv.vn/admin/sessions/create');

    await createSession(driver, session);
  } catch (err) {
    console.error('❌ Lỗi tạo phiên ở tab mới:', err);
  }
}

// ✅ Danh sách phiên cần tạo


const sessionList = [
  { orderId: '080624KPIR', startTime: '21:00 31/07/2025', endTime: '23:00 31/07/2025', note: '', mainHost: 'Ngọc Anh', assistant: 'Tiktok', roomName: 'P KT cũ' },
  { orderId: '100625CPMZ', startTime: '08:00 31/07/2025', endTime: '10:00 31/07/2025', note: '', mainHost: 'Hòa', assistant: '', roomName: 'Phòng live 5' },
  { orderId: '100625CPMZ', startTime: '12:00 31/07/2025', endTime: '14:00 31/07/2025', note: '', mainHost: 'Hòa', assistant: '', roomName: '' },
  { orderId: '130625AFNP', startTime: '09:00 31/07/2025', endTime: '11:00 31/07/2025', note: '', mainHost: 'Ma Hà', assistant: 'Tiktok', roomName: '' },
  { orderId: '130625AFNP', startTime: '20:00 31/07/2025', endTime: '22:00 31/07/2025', note: '', mainHost: 'Ma Hà', assistant: '', roomName: 'Phòng live 3' },
  { orderId: '100725DCVZ', startTime: '15:00 31/07/2025', endTime: '17:00 31/07/2025', note: 'Lấy thêm sò mát máy', mainHost: 'Hiền', assistant: 'Tiktok', roomName: '' },
  { orderId: '100725DCVZ', startTime: '17:00 31/07/2025', endTime: '19:00 31/07/2025', note: 'Lấy thêm sò mát máy', mainHost: 'Trinh', assistant: '', roomName: 'Phòng live 7' },
  { orderId: '100725DCVZ', startTime: '19:00 31/07/2025', endTime: '21:00 31/07/2025', note: 'Lấy thêm sò mát máy', mainHost: 'Hải', assistant: '', roomName: '' },
  { orderId: '100725DCVZ', startTime: '21:00 31/07/2025', endTime: '23:00 31/07/2025', note: 'Lấy thêm sò mát máy', mainHost: 'Thơm', assistant: '', roomName: '' },
  { orderId: '270525REAX', startTime: '09:00 31/07/2025', endTime: '11:00 31/07/2025', note: 'máy 26 live đúng máy', mainHost: 'Nhung', assistant: 'Tiktok', roomName: '' },
  { orderId: '270525REAX', startTime: '11:30 31/07/2025', endTime: '13:30 31/07/2025', note: 'máy 26 live đúng máy', mainHost: 'Duyên', assistant: '', roomName: 'Phòng live 4' },
  { orderId: '270525REAX', startTime: '20:00 31/07/2025', endTime: '22:00 31/07/2025', note: 'máy 3', mainHost: 'Thảo', assistant: '', roomName: '' },
  { orderId: '130625JEZQ', startTime: '19:00 31/07/2025', endTime: '21:00 31/07/2025', note: 'T3, T5, T7, CN', mainHost: 'Lan Anh', assistant: 'Tiktok', roomName: 'Phòng live 9' },
  { orderId: 'Femfresh', startTime: '10:30 31/07/2025', endTime: '12:30 31/07/2025', note: '', mainHost: 'Hiền', assistant: 'Tiktok', roomName: 'Phòng live 8' },
  { orderId: 'Batiste', startTime: '18:00 31/07/2025', endTime: '20:00 31/07/2025', note: '', mainHost: 'Thơm', assistant: 'Tiktok', roomName: 'Phòng live 8' },
  { orderId: 'Trangia', startTime: '20:30 31/07/2025', endTime: '22:30 31/07/2025', note: 'Oxiclean-->60%, aff', mainHost: 'Duyên', assistant: 'Tiktok', roomName: 'Phòng live 8' },
  { orderId: 'Aimi', startTime: '20:00 31/07/2025', endTime: '22:00 31/07/2025', note: '', mainHost: 'Tăng Hà', assistant: 'Tiktok', roomName: 'Phòng live 3' },
  { orderId: 'LINGROUP', startTime: '11:30 31/07/2025', endTime: '13:30 31/07/2025', note: '', mainHost: 'Trinh', assistant: 'Tiktok', roomName: 'Phòng live 9' },
  { orderId: 'Ru mơ', startTime: '11:30 31/07/2025', endTime: '13:30 31/07/2025', note: '', mainHost: 'Nhung', assistant: 'Tiktok', roomName: 'Phòng live 6' },
  { orderId: 'Monnyny', startTime: '', endTime: '', note: 'báo nhãn đổi giờ', mainHost: '', assistant: 'Tiktok', roomName: 'Phòng live 5' },
  { orderId: 'Monnyny', startTime: '17:30 31/07/2025', endTime: '19:30 31/07/2025', note: '', mainHost: 'Thảo', assistant: 'Tiktok', roomName: '' },
  { orderId: 'Thuka Garden', startTime: '11:00 31/07/2025', endTime: '13:00 31/07/2025', note: '', mainHost: 'Hải', assistant: 'Tiktok', roomName: 'Phòng live 5' },
  { orderId: 'Thuka Garden', startTime: '20:00 31/07/2025', endTime: '22:00 31/07/2025', note: '', mainHost: 'Trinh', assistant: 'Tiktok', roomName: '' }
];


// ✅ Gọi hàm chính
(async () => {
  const driver = await loginToWebsite('hoangboytq@gmail.com', 'MxRKPGFhKj@5BXZ');
  if (driver) {
    for (const session of sessionList) {
      await createSessionInNewTab(driver, session);
      await driver.sleep(1000);
    }
    console.log('🎉 Tạo xong toàn bộ phiên.');
  }
})();
