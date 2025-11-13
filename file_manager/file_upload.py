# file_upload.py
import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def upload_file(app_url, file_path):
    # Setup Chrome driver
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    service = Service()  # Adjust if chromedriver path is custom
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        # Open the app
        driver.get(app_url)

        # Wait until upload button is present
        wait = WebDriverWait(driver, 10)
        upload_button = wait.until(EC.presence_of_element_located((By.ID, "uploadBtn")))

        # Locate the hidden file input element
        file_input = driver.find_element(By.ID, "fileUpload")

        # Send the file path to the input
        file_input.send_keys(file_path)

        # Optional delay to visualize
        time.sleep(5)
        print(f"✅ Uploaded file: {file_path}")

    finally:
        driver.quit()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python file_upload.py <app_url> <file_path>")
        sys.exit(1)

    app_url = sys.argv[1]
    file_path = sys.argv[2]
    upload_file(app_url, file_path)
