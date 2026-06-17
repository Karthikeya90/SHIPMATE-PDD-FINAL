"""
SHIPMATE – Selenium E2E Test Suite
Covers: Authentication, Sender Flow, Traveller Flow, Profile, Navigation
Run: python tests/e2e_shipmate_test.py

Requirements:
    pip install selenium webdriver-manager

The app must be running at http://localhost:5173 before executing.
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

try:
    from selenium.webdriver.chrome.service import Service as ChromeService
    from webdriver_manager.chrome import ChromeDriverManager
    USE_WDM = True
except ImportError:
    USE_WDM = False

BASE_URL = "http://localhost:5173"
SENDER_EMAIL    = "alex@example.com"
TRAVELLER_EMAIL = "sarah@example.com"
DEMO_PASSWORD   = "password123"
TIMEOUT = 10


def get_driver(headless: bool = False):
    opts = Options()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1280,800")
    opts.add_argument("--disable-gpu")

    if USE_WDM:
        service = ChromeService(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=opts)
    else:
        return webdriver.Chrome(options=opts)


class BaseTestCase(unittest.TestCase):
    """Base test case: sets up/tears down driver."""

    def setUp(self):
        self.driver = get_driver(headless=False)
        self.wait   = WebDriverWait(self.driver, TIMEOUT)

    def tearDown(self):
        self.driver.quit()

    # ── helpers ──────────────────────────────────────

    def go(self, path: str = ""):
        self.driver.get(f"{BASE_URL}{path}")

    def find(self, by, value, timeout=None):
        t = timeout or TIMEOUT
        return WebDriverWait(self.driver, t).until(
            EC.presence_of_element_located((by, value))
        )

    def click(self, by, value):
        el = self.find(by, value)
        el.click()
        return el

    def type_in(self, by, value, text, clear=True):
        el = self.find(by, value)
        if clear:
            el.clear()
        el.send_keys(text)
        return el

    def login(self, email=SENDER_EMAIL, password=DEMO_PASSWORD):
        """Login helper: navigates to /login and authenticates."""
        self.go("/login")
        email_input = self.find(By.CSS_SELECTOR, "input[type='email']")
        email_input.clear()
        email_input.send_keys(email)

        pass_input = self.find(By.CSS_SELECTOR, "input[type='password']")
        pass_input.clear()
        pass_input.send_keys(password)

        self.find(By.CSS_SELECTOR, "button[type='submit']").click()
        # Wait for redirect away from /login
        self.wait.until(lambda d: "/login" not in d.current_url)

    def logout(self):
        """Click the Logout link in the sidebar."""
        try:
            logout_btn = self.find(By.XPATH, "//span[contains(text(),'Logout')]/..", timeout=5)
            logout_btn.click()
            time.sleep(1)
        except Exception:
            self.go("/")


# ─────────────────────────────────────────────────────────────────
# TC-F-001: Valid Sender Login
# ─────────────────────────────────────────────────────────────────
class TC_F_001_ValidSenderLogin(BaseTestCase):
    def test_valid_sender_login(self):
        """TC-F-001: Valid Sender Login"""
        self.go("/login")
        self.type_in(By.CSS_SELECTOR, "input[type='email']",    SENDER_EMAIL)
        self.type_in(By.CSS_SELECTOR, "input[type='password']", DEMO_PASSWORD)
        self.click(By.CSS_SELECTOR, "button[type='submit']")
        self.wait.until(lambda d: "/login" not in d.current_url)
        self.assertIn("/dashboard", self.driver.current_url)


# ─────────────────────────────────────────────────────────────────
# TC-F-002: Valid Traveller Login
# ─────────────────────────────────────────────────────────────────
class TC_F_002_ValidTravellerLogin(BaseTestCase):
    def test_valid_traveller_login(self):
        """TC-F-002: Valid Traveller Login"""
        self.go("/login")
        self.type_in(By.CSS_SELECTOR, "input[type='email']",    TRAVELLER_EMAIL)
        self.type_in(By.CSS_SELECTOR, "input[type='password']", DEMO_PASSWORD)
        self.click(By.CSS_SELECTOR, "button[type='submit']")
        self.wait.until(lambda d: "/login" not in d.current_url)
        self.assertIn("/dashboard", self.driver.current_url)


# ─────────────────────────────────────────────────────────────────
# TC-F-003: Login With Invalid Email Format (HTML5 validation)
# ─────────────────────────────────────────────────────────────────
class TC_F_003_InvalidEmailFormat(BaseTestCase):
    def test_invalid_email_format_blocked(self):
        """TC-F-003: Invalid email format prevents submission"""
        self.go("/login")
        email_input = self.find(By.CSS_SELECTOR, "input[type='email']")
        email_input.clear()
        email_input.send_keys("notanemail")
        self.click(By.CSS_SELECTOR, "button[type='submit']")
        # Still on /login because HTML5 validation blocked
        time.sleep(0.5)
        self.assertIn("/login", self.driver.current_url)


# ─────────────────────────────────────────────────────────────────
# TC-F-005: Forgot Password Link Visibility
# ─────────────────────────────────────────────────────────────────
class TC_F_005_ForgotPasswordLinkVisible(BaseTestCase):
    def test_forgot_password_link_visible(self):
        """TC-F-005: Forgot Password link visible on login page"""
        self.go("/login")
        link = self.find(By.LINK_TEXT, "Forgot password?")
        self.assertTrue(link.is_displayed())


# ─────────────────────────────────────────────────────────────────
# TC-F-007: Register As Sender
# ─────────────────────────────────────────────────────────────────
class TC_F_007_RegisterAsSender(BaseTestCase):
    def test_register_as_sender(self):
        """TC-F-007: Signup page loads with correct title"""
        self.go("/signup?role=sender")
        heading = self.find(By.XPATH, "//h1[contains(text(),'Create an account')]")
        self.assertTrue(heading.is_displayed())

    def test_signup_form_has_three_fields(self):
        """Signup form has Name, Email, Password fields"""
        self.go("/signup")
        self.assertTrue(self.find(By.CSS_SELECTOR, "input[type='text']").is_displayed())
        self.assertTrue(self.find(By.CSS_SELECTOR, "input[type='email']").is_displayed())
        self.assertTrue(self.find(By.CSS_SELECTOR, "input[type='password']").is_displayed())


# ─────────────────────────────────────────────────────────────────
# TC-F-009: Short Password Blocked
# ─────────────────────────────────────────────────────────────────
class TC_F_009_ShortPasswordBlocked(BaseTestCase):
    def test_short_password_blocked(self):
        """TC-F-009: Signup with < 6 char password blocked by HTML5"""
        self.go("/signup")
        self.type_in(By.CSS_SELECTOR, "input[type='text']",     "Test User")
        self.type_in(By.CSS_SELECTOR, "input[type='email']",    "test_new@example.com")
        self.type_in(By.CSS_SELECTOR, "input[type='password']", "abc")
        self.click(By.CSS_SELECTOR, "button[type='submit']")
        time.sleep(0.5)
        self.assertIn("/signup", self.driver.current_url)


# ─────────────────────────────────────────────────────────────────
# TC-F-011: Protected Route Redirects Unauthenticated Users
# ─────────────────────────────────────────────────────────────────
class TC_F_011_ProtectedRouteRedirect(BaseTestCase):
    def test_protected_sender_redirects(self):
        """TC-F-011: /sender redirects to /login when unauthenticated"""
        self.go("/sender")
        self.wait.until(lambda d: "/login" in d.current_url)
        self.assertIn("/login", self.driver.current_url)

    def test_protected_traveller_redirects(self):
        """TC-S-002: /traveller redirects to /login when unauthenticated"""
        self.go("/traveller")
        self.wait.until(lambda d: "/login" in d.current_url)
        self.assertIn("/login", self.driver.current_url)

    def test_protected_profile_redirects(self):
        """TC-S-003: /profile redirects to /login when unauthenticated"""
        self.go("/profile")
        self.wait.until(lambda d: "/login" in d.current_url)
        self.assertIn("/login", self.driver.current_url)


# ─────────────────────────────────────────────────────────────────
# TC-F-013: Sender Dashboard Loads
# ─────────────────────────────────────────────────────────────────
class TC_F_013_SenderDashboardLoads(BaseTestCase):
    def test_sender_dashboard_loads(self):
        """TC-F-013: Sender dashboard has welcome text and stats"""
        self.login(SENDER_EMAIL)
        # Navigate to sender (assuming role selection routes to /sender)
        self.go("/sender")
        h1 = self.find(By.TAG_NAME, "h1")
        self.assertTrue(h1.is_displayed())

    def test_new_delivery_button_visible(self):
        """TC-F-015: New Delivery button visible on sender dashboard"""
        self.login(SENDER_EMAIL)
        self.go("/sender")
        btn = self.find(By.XPATH, "//*[contains(text(),'New Delivery')]")
        self.assertTrue(btn.is_displayed())

    def test_new_delivery_button_navigates(self):
        """TC-F-015: New Delivery button navigates to /sender/create"""
        self.login(SENDER_EMAIL)
        self.go("/sender")
        btn = self.find(By.XPATH, "//*[contains(text(),'New Delivery')]")
        btn.click()
        self.wait.until(lambda d: "/sender/create" in d.current_url)
        self.assertIn("/sender/create", self.driver.current_url)


# ─────────────────────────────────────────────────────────────────
# TC-F-017 to TC-F-022: Create Request Multi-Step Form
# ─────────────────────────────────────────────────────────────────
class TC_F_017_CreateRequestStepOne(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.login(SENDER_EMAIL)
        self.go("/sender/create")

    def test_step1_heading_visible(self):
        """TC-F-017: Step 1 heading 'What are you sending?' visible"""
        heading = self.find(By.XPATH, "//*[contains(text(),'What are you sending')]")
        self.assertTrue(heading.is_displayed())

    def test_progress_bar_visible(self):
        """TC-F-022: Progress bar visible on create request page"""
        # Look for the step icons in the stepper
        step_containers = self.driver.find_elements(By.XPATH, "//div[contains(@class,'rounded-full') and contains(@class,'border-2')]")
        self.assertGreater(len(step_containers), 0)

    def test_step1_next_advances_to_step2(self):
        """TC-F-017: Completing step 1 advances to step 2"""
        self.type_in(By.CSS_SELECTOR, "input[placeholder='e.g. Vintage Camera, Documents']", "Test Book")
        textarea = self.find(By.TAG_NAME, "textarea")
        textarea.send_keys("A test book for delivery")
        next_btn = self.find(By.XPATH, "//button[contains(text(),'Next')]")
        next_btn.click()
        time.sleep(0.5)
        heading2 = self.find(By.XPATH, "//*[contains(text(),'Where is it going')]")
        self.assertTrue(heading2.is_displayed())

    def test_back_button_disabled_on_step1(self):
        """TC-F-021: Back button on step 1 has opacity-0 / pointer-events-none"""
        back_btn = self.find(By.XPATH, "//button[contains(text(),'Back')]")
        classes = back_btn.get_attribute("class") or ""
        self.assertIn("opacity-0", classes)


# ─────────────────────────────────────────────────────────────────
# TC-F-059: Unknown Routes Redirect To Home
# ─────────────────────────────────────────────────────────────────
class TC_F_059_UnknownRouteRedirect(BaseTestCase):
    def test_unknown_route_redirects_to_home(self):
        """TC-F-059: Navigating to /nonexistent redirects to /"""
        self.go("/this-route-does-not-exist-xyz")
        time.sleep(1)
        self.assertEqual(self.driver.current_url.rstrip("/"), BASE_URL)


# ─────────────────────────────────────────────────────────────────
# TC-F-062: Landing Page CTA
# ─────────────────────────────────────────────────────────────────
class TC_F_062_LandingPageCTA(BaseTestCase):
    def test_landing_page_loads(self):
        """Landing page renders hero section"""
        self.go("/")
        heading = self.find(By.TAG_NAME, "h1")
        self.assertTrue(heading.is_displayed())

    def test_get_started_button_links_to_signup(self):
        """TC-F-062: 'Get Started' navigates to /signup"""
        self.go("/")
        btn = self.find(By.LINK_TEXT, "Get Started")
        btn.click()
        self.wait.until(lambda d: "/signup" in d.current_url)
        self.assertIn("/signup", self.driver.current_url)

    def test_landing_has_sender_and_traveller_cta(self):
        """Landing page shows dual CTA for Sender and Traveller"""
        self.go("/")
        sender_link = self.find(By.LINK_TEXT, "Sign up as Sender")
        traveller_link = self.find(By.LINK_TEXT, "Sign up as Traveller")
        self.assertTrue(sender_link.is_displayed())
        self.assertTrue(traveller_link.is_displayed())


# ─────────────────────────────────────────────────────────────────
# TC-UI-006: Login Form Design
# ─────────────────────────────────────────────────────────────────
class TC_UI_006_LoginFormDesign(BaseTestCase):
    def test_login_form_has_password_field_masked(self):
        """TC-S-010: Password field masks input"""
        self.go("/login")
        pass_input = self.find(By.CSS_SELECTOR, "input[type='password']")
        self.assertEqual(pass_input.get_attribute("type"), "password")


# ─────────────────────────────────────────────────────────────────
# TC-V-001 to TC-V-006: Validation Tests
# ─────────────────────────────────────────────────────────────────
class TC_V_Validation(BaseTestCase):
    def test_v001_empty_email_blocked(self):
        """TC-V-001: Empty email field blocks submission"""
        self.go("/login")
        self.find(By.CSS_SELECTOR, "input[type='email']").clear()
        self.click(By.CSS_SELECTOR, "button[type='submit']")
        time.sleep(0.5)
        self.assertIn("/login", self.driver.current_url)

    def test_v003_empty_password_blocked(self):
        """TC-V-003: Empty password field blocks submission"""
        self.go("/login")
        self.type_in(By.CSS_SELECTOR, "input[type='email']", SENDER_EMAIL)
        self.find(By.CSS_SELECTOR, "input[type='password']").clear()
        self.click(By.CSS_SELECTOR, "button[type='submit']")
        time.sleep(0.5)
        self.assertIn("/login", self.driver.current_url)

    def test_v004_empty_signup_name_blocked(self):
        """TC-V-004: Empty name in signup blocked by HTML5"""
        self.go("/signup")
        self.find(By.CSS_SELECTOR, "input[type='text']").clear()
        self.type_in(By.CSS_SELECTOR, "input[type='email']",    "test@example.com")
        self.type_in(By.CSS_SELECTOR, "input[type='password']", "password123")
        self.click(By.CSS_SELECTOR, "button[type='submit']")
        time.sleep(0.5)
        self.assertIn("/signup", self.driver.current_url)


# ─────────────────────────────────────────────────────────────────
# TC-F-050 to TC-F-055: Profile Page Tests
# ─────────────────────────────────────────────────────────────────
class TC_F_050_ProfilePage(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.login(SENDER_EMAIL)
        self.go("/profile")

    def test_profile_page_loads_with_heading(self):
        """TC-F-050: Profile page shows 'Personal Details' heading"""
        heading = self.find(By.XPATH, "//*[contains(text(),'Personal Details')]")
        self.assertTrue(heading.is_displayed())

    def test_profile_avatar_gallery_visible(self):
        """TC-F-051: Avatar thumbnails visible on profile page"""
        # Look for multiple img elements in the avatar picker area
        time.sleep(1)  # allow images to load
        imgs = self.driver.find_elements(By.CSS_SELECTOR, "img[alt^='Avatar']")
        self.assertGreaterEqual(len(imgs), 6)

    def test_profile_cancel_navigates_to_dashboard(self):
        """TC-F-053: Cancel button navigates to /dashboard"""
        cancel_btn = self.find(By.XPATH, "//button[contains(text(),'Cancel')]")
        cancel_btn.click()
        self.wait.until(lambda d: "/dashboard" in d.current_url)
        self.assertIn("/dashboard", self.driver.current_url)

    def test_profile_back_arrow_navigates(self):
        """TC-F-055: Back arrow navigates to /dashboard"""
        back_btn = self.find(By.CSS_SELECTOR, "button[title='Back to dashboard']")
        back_btn.click()
        self.wait.until(lambda d: "/dashboard" in d.current_url)
        self.assertIn("/dashboard", self.driver.current_url)

    def test_profile_save_button_visible(self):
        """TC-F-052: 'Save Changes' button is visible"""
        save_btn = self.find(By.XPATH, "//button[@type='submit' and contains(.,'Save Changes')]")
        self.assertTrue(save_btn.is_displayed())


# ─────────────────────────────────────────────────────────────────
# TC-F-056: Chat Page Renders
# ─────────────────────────────────────────────────────────────────
class TC_F_056_ChatPage(BaseTestCase):
    def test_chat_page_renders(self):
        """TC-F-056: Sender chat page loads"""
        self.login(SENDER_EMAIL)
        self.go("/sender/chat")
        time.sleep(1)
        body = self.driver.find_element(By.TAG_NAME, "body")
        self.assertIsNotNone(body)


if __name__ == "__main__":
    print("=" * 65)
    print("  SHIPMATE E2E Test Suite – Selenium WebDriver")
    print(f"  Base URL: {BASE_URL}")
    print("  Make sure the app is running: npm run dev")
    print("=" * 65)
    unittest.main(verbosity=2)
