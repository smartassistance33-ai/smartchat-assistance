from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Arrange: Go to the application's homepage.
            page.goto("http://localhost:3000")

            # 2. Assert: Check for the main heading to ensure the page loaded.
            # Use a robust, user-facing locator.
            heading = page.get_by_role("heading", name="SmartChat Assistant")
            expect(heading).to_be_visible()

            # 3. Assert: Check for the presence of key links.
            expect(page.get_by_role("link", name="GET /mcp")).to_be_visible()
            expect(page.get_by_role("link", name="GET /health")).to_be_visible()

            # 4. Screenshot: Capture the final result for visual verification.
            screenshot_path = "jules-scratch/verification/verification.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()