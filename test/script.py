import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

// Mở trình duyệt và điều hướng đến trang đăng nhập
WebUI.openBrowser('')
WebUI.navigateToUrl(GlobalVariable.BaseUrl + '/auth/login')

// Chờ trang load hoàn tất
WebUI.waitForPageLoad(30)

// Nhập email hợp lệ
WebUI.setText(findTestObject('' \
'Page_Login/input_Email'), 'thienthien')

// Nhập mật khẩu không hợp lệ
WebUI.setEncryptedText(findTestObject('Page_Login/input_Password'), '123') // Mật khẩu sai: wrongpass

// Nhấp nút đăng nhập
WebUI.click(findTestObject('Page_Login/btn_Login_Submit'))

// Chờ thông báo lỗi xuất hiện
WebUI.waitForElementPresent(findTestObject('Page_Login/text_Error_Message'), 10)

// Xác minh thông báo lỗi hiển thị
WebUI.verifyElementText(findTestObject('Page_Login/text_Error_Message'), 'Email hoặc mật khẩu không đúng')

// Chụp màn hình để làm bằng chứng
WebUI.takeScreenshot()

// Đóng trình duyệt
WebUI.closeBrowser()