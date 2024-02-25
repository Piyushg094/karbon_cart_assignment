const puppeteer = require('puppeteer');
let browser;
let companyData = [];
async function getLinkedInUrl(companyNames) {
  browser = await puppeteer.launch({ headless: false }); // Set headless to true for a headless browser
  const page = await browser.newPage();

  try {
    // Navigate to Google

    for( const companyName of companyNames){
    await page.goto('https://www.google.com/', { waitUntil: "networkidle2", timeout: 0 });
    
    // Wait for the textarea to be present
    
    await page.waitForSelector('textarea');

    // Type into the textarea
    await page.type('textarea', `${companyName} CEO LinkedIn`);

   
    // Wait for navigation to complete after pressing "Enter"
    await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 }), // The promise resolves after navigation has finished
        page.keyboard.press('Enter'), // Clicking the link will indirectly cause a navigation
    ]);

    // Extract the first LinkedIn URL
    const linkedinUrl = await page.evaluate(() => {
      const result = document.querySelector('.tF2Cxc a');
      return result ? result.href : null;
    });

    const ceoName = await page.evaluate(() => {
      const result = document.querySelector('.tF2Cxc h3');
      return result ? result.textContent : null;
    });


    if (linkedinUrl) {
      console.log(`LinkedIn URL for ${companyName} CEO: ${linkedinUrl}`)
      companyData.push({ company: companyName,linkedinUrl , 'ceoName' : ceoName});
      console.log('linkedinUrl:', linkedinUrl , ceoName);

    } else {
     
      console.log(`No LinkedIn URL found for ${companyName} CEO`);
      companyData.push({ company: companyName,linkedinUrl : 'NOT Found', ceoName : 'NOT Found'});
    }
  }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }


    // Log the entire companyData array
    console.log('Company Data:', companyData);

}

// Replace 'YourCompanyName' with the desired company name
const companyNames = [
  "ADRENALIN ESYSTEMS LIMITED",
  "ADV DETAILING AND DESIGN APPLICATIONS INDIA PRIVATE LIMITED",
  "ADVA OPTICAL NETWORKING INDIA PRIVATE LIMITED",
  "ADVAITA INDIA CONSULTING PRIVATE LIMITED",
  "ADVAIYA SOLUTIONS (P) LTD.",
  "ADVANCED BUSINESS & HEALTHCARE SOLUTIONS INDIA PRIVATE LIMITED",
  "ADVANCED INVESTMENT MECHANICS INDIA PRIVATE LIMITED",
  "ADVANTEST INDIA PRIVATE LIMITED",
]

getLinkedInUrl(companyNames);