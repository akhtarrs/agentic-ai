from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import os
from collections import Counter

# === CONFIGURATION ===
APP_PATH = r"D:\repo\python\ai_agent_dev_engineer\file_manager\index.html"   # <-- update your local path
SAMPLE_FILES_DIR = r"D:\repo\python\ai_agent_dev_engineer\file_manager\sample_uploads"  # folder containing test files

# ==========================================================

# Setup Chrome driver
options = Options()
options.add_argument("--start-maximized")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

try:
    # Load your local web app
    driver.get("file:///" + APP_PATH.replace("\\", "/"))
    wait = WebDriverWait(driver, 10)
    actions = ActionChains(driver)

    # Locate upload button and hidden input
    upload_button = wait.until(EC.element_to_be_clickable((By.ID, "uploadBtn")))
    file_input = driver.find_element(By.ID, "fileUpload")

    # Upload files (you can add duplicates intentionally)
    files_to_upload = [
        os.path.join(SAMPLE_FILES_DIR, "report1.txt"),
        os.path.join(SAMPLE_FILES_DIR, "report1.txt"),  # duplicate
        os.path.join(SAMPLE_FILES_DIR, "data.csv"),
        os.path.join(SAMPLE_FILES_DIR, "image.png"),
        os.path.join(SAMPLE_FILES_DIR, "image.png"),   # duplicate
    ]
    file_input.send_keys("\n".join(files_to_upload))
    time.sleep(1)

    # Fetch all filenames from the table
    time.sleep(1)
    rows = driver.find_elements(By.CSS_SELECTOR, "#fileTable tbody tr")
    filenames = [row.find_elements(By.TAG_NAME, "td")[1].text for row in rows]
    print("Uploaded files:", filenames)

    # Find duplicates
    duplicates = [name for name, count in Counter(filenames).items() if count > 1]
    if not duplicates:
        print("✅ No duplicates found.")
    else:
        print("⚠ Found duplicates:", duplicates)

        for dup in duplicates:
            # Select all rows having the duplicate name except the first occurrence
            count_seen = 0
            for row in rows:
                name = row.find_elements(By.TAG_NAME, "td")[1].text
                if name == dup:
                    count_seen += 1
                    if count_seen > 1:  # skip the first occurrence
                        checkbox = row.find_element(By.CSS_SELECTOR, 'input[type="checkbox"]')
                        driver.execute_script("arguments[0].click();", checkbox)

        # Click Delete button
        delete_button = driver.find_element(By.ID, "deleteBtn")
        delete_button.click()
        time.sleep(0.5)

        # Confirm deletion in alert popup
        alert = driver.switch_to.alert
        alert.accept()
        print("🗑 Deleted duplicate file entries successfully.")

    # Print final list of files
    time.sleep(1)
    rows = driver.find_elements(By.CSS_SELECTOR, "#fileTable tbody tr")
    remaining = [row.find_elements(By.TAG_NAME, "td")[1].text for row in rows]
    print("✅ Remaining files:", remaining)

finally:
    time.sleep(3)
    driver.quit()
