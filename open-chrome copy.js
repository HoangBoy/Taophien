const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ✅ Đăng nhập và trả về driver
async function loginToWebsite(email, password) {
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();

  try {
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
    const inputWrapper = await driver.wait(until.elementLocated(By.css('.el-input__wrapper')), 10000);
    await inputWrapper.click();

    const inputField = await driver.wait(until.elementLocated(By.css('.el-input__inner')), 10000);
    await inputField.clear();
    await inputField.sendKeys(orderId);

    await driver.sleep(2000);

    const matchedItem = await driver.wait(
      until.elementLocated(By.xpath(`//li[contains(@class,'el-select-dropdown__item')]//div[contains(text(), '${orderId}')]`)),
      10000
    );
    await matchedItem.click();
    console.log(`✅ Đã chọn đơn hàng: ${orderId}`);
  } catch (err) {
    console.error(`❌ Lỗi chọn đơn hàng ${orderId}:`, err);
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
async function fillNote(driver, note) {
  if (!note) return;
  try {
    const noteArea = await driver.wait(until.elementLocated(By.xpath("//textarea[@placeholder='Note phiên live']")), 10000);
    await noteArea.clear();
    await noteArea.sendKeys(note);
    console.log(`✅ Ghi chú: ${note}`);
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




// ✅ Chọn room
async function clickLiveRoom(driver, roomName) {
  try {
    await driver.executeScript(`
      const roomName = arguments[0];
      const radios = document.querySelectorAll('label.el-radio');

      radios.forEach(label => {
        if (label.textContent.trim().includes(roomName)) {
          const input = label.querySelector('input[type="radio"]');
          if (input) {
            input.click();
            // Dispatch change event nếu cần cho Vue/React
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    `, roomName); // 👈 Truyền roomName vào đây

    console.log(`✅ Đã chọn phòng: ${roomName}`);
  } catch (err) {
    console.error(`❌ Không click được phòng '${roomName}':`, err);
  }
}






// ✅ Gộp tạo session
async function createSession(driver, session) {
  const { orderId, startTime, endTime, note, mainHost, assistant, roomName } = session;
  await selectOrder(driver, orderId);
  await fillStartEndTime(driver, startTime, endTime);
  await fillNote(driver, 'Việt Hoàng');
  await fillHublive(driver);
  await selectAssistant(driver, assistant);
  await selectMainHost(driver, mainHost);
  await clickLiveRoom(driver, roomName);

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
  { orderId: 'Anzani', startTime: '21:00 30/06/2025', endTime: '23:00 30/06/2025', note: 'Tiktok', mainHost: 'Nguyễn Thế Tiến', assistant: 'Không có', roomName: 'P KT cũ' },
  { orderId: '100625CPMZ', startTime: '8:00 30/06/2025', endTime: '10:00 30/06/2025', note: 'Tiktok', mainHost: 'Nguyễn Hồng Hòa', assistant: 'Thảo', roomName: 'Phòng Vip 1' },
  { orderId: '100625CPMZ', startTime: '10:01 30/06/2025', endTime: '12:01 30/06/2025', note: 'Tiktok', mainHost: 'Nguyễn Thu Hiền', assistant: 'Trinh', roomName: 'Phòng Vip 1' },
  { orderId: '100625CPMZ', startTime: '12:02 30/06/2025', endTime: '14:02 30/06/2025', note: 'Tiktok', mainHost: 'Nguyễn Hồng Hòa', assistant: 'Quyên', roomName: 'Phòng Vip 1' },
  { orderId: '100625CPMZ', startTime: '14:03 30/06/2025', endTime: '16:03 30/06/2025', note: 'Tiktok', mainHost: 'Lê Thị Lan Hương', assistant: 'Quyên', roomName: 'Phòng Vip 1' },
  { orderId: 'quần', startTime: '9:00 30/06/2025', endTime: '11:00 30/06/2025', note: 'Tiktok', mainHost: 'Trương Huệ Trinh', assistant: 'Không có', roomName: 'Phòng live 14' },
  { orderId: 'quần', startTime: '20:00 30/06/2025', endTime: '22:00 30/06/2025', note: 'Tiktok', mainHost: 'Ma thị Hà', assistant: 'Không có', roomName: 'Phòng live 14' },
  { orderId: '200625QNXC', startTime: '15:00 30/06/2025', endTime: '17:00 30/06/2025', note: 'Tiktok', mainHost: 'Trần Thị Thanh Bình', assistant: 'Lấy thêm sò mát máy', roomName: 'Phòng live 30' },
  { orderId: '200625QNXC', startTime: '17:00 30/06/2025', endTime: '19:00 30/06/2025', note: 'Tiktok', mainHost: 'Nông Hồng Hải', assistant: 'Lấy thêm sò mát máy', roomName: 'Phòng live 30' },
  { orderId: '200625QNXC', startTime: '19:00 30/06/2025', endTime: '21:00 30/06/2025', note: 'Tiktok', mainHost: 'Dương Thị Thơm', assistant: 'Không có', roomName: 'Phòng live 30' },
  { orderId: '200625QNXC', startTime: '21:00 30/06/2025', endTime: '23:00 30/06/2025', note: 'Tiktok', mainHost: 'Nông Hồng Hải', assistant: 'Không có', roomName: 'Phòng live 30' },
  { orderId: '270525REAX', startTime: '9:00 30/06/2025', endTime: '11:00 30/06/2025', note: 'Tiktok', mainHost: 'Đặng thu Hiền', assistant: 'máy 26 live đúng máy', roomName: 'Phòng live 6' },
  { orderId: '270525REAX', startTime: '20:00 30/06/2025', endTime: '22:00 30/06/2025', note: 'Tiktok', mainHost: 'Dương Thị Hồng Nhung', assistant: 'máy 3', roomName: 'Phòng live 6' },
  { orderId: '130625OVKU', startTime: '20:00 30/06/2025', endTime: '22:00 30/06/2025', note: 'Tiktok', mainHost: 'Phạm thu Thảo', assistant: 'áo 3 lỗ', roomName: 'Phòng live 13' },
  { orderId: '160625SDZE', startTime: '14:00 30/06/2025', endTime: '16:00 30/06/2025', note: 'Tiktok', mainHost: 'Ngô Ngọc Mai', assistant: 'Không có', roomName: 'Phòng live 15' },
  { orderId: 'Hippy', startTime: '12:00 30/06/2025', endTime: '14:00 30/06/2025', note: 'Tiktok', mainHost: 'Đặng thu Hiền', assistant: 'Không có', roomName: 'Phòng live 13' },
  { orderId: 'DDraco', startTime: '20:00 30/06/2025', endTime: '22:00 30/06/2025', note: 'Tiktok', mainHost: 'tăng hoàng Hà', assistant: '19 20', roomName: 'PH1' },
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
