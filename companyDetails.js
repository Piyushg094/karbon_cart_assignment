const puppeteer = require("puppeteer");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let browser;
let companyData = [];

const searchCompanies = async (companyNames) => {
  try {
    browser = await puppeteer.launch({ headless: true });
    const [page] = await browser.pages();

    await page.setRequestInterception(true);
    page.on("request", request => {
      request.resourceType() === "document" ? request.continue() : request.abort();
    });

    for (const companyName of companyNames) {
      console.log(`Performed Google search for: ${companyName} LinkedIn`);

      await page.goto("https://www.google.com/", { waitUntil: "networkidle2", timeout: 0 });

      await page.waitForSelector('textarea[title="Search"]', { visible: true });
      await page.type('textarea[title="Search"]', `${companyName} LinkedIn`);
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 }),
        page.keyboard.press("Enter"),
      ]);

      await page.waitForSelector(".LC20lb", { visible: true });

      const firstResult = await page.$(".LC20lb");

      if (firstResult) {
        const title = await page.evaluate(el => el.innerText, firstResult);
        const link = await page.evaluate(el => el.parentElement.href, firstResult);

        companyData.push({ company: companyName, title, link, companyLink: '',ceoLinkedinUrl : '' , ceoName: '' , companyEmailAddress:''});

        console.log('Title:', title);
        console.log('Link:', link);
      } else {
        console.log(`No matching result found for ${companyName}.`);
        companyData.push({ company: companyName, title: 'Not Found', link: 'Not Found', companyLink: '' ,ceoLinkedinUrl : '' , ceoName : '' , companyEmailAddress:''});
      }
    }

    // Now let's search for the company website link
    for (const companyName of companyNames) {
      console.log(`Performed Google search for: ${companyName} company site`);

      await page.goto("https://www.google.com/");

      await page.waitForSelector('textarea[title="Search"]', { visible: true });
      await page.type('textarea[title="Search"]', `${companyName} company site`);
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 }),
        page.keyboard.press("Enter"),
      ]);

      await page.waitForSelector(".LC20lb", { visible: true });

      const firstResult = await page.$(".LC20lb");

      if (firstResult) {
        const companyLink = await page.evaluate(el => el.parentElement.href, firstResult);

        // Update the corresponding entry in companyData
        const index = companyData.findIndex(item => item.company === companyName);
        if (index !== -1) {
          companyData[index].companyLink = companyLink;
          console.log('Company Link:', companyLink);
        }
      } else {
        console.log(`No matching result found for ${companyName}.`);
      }
    }

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
      const ceoLinkedinUrl = await page.evaluate(() => {
        const result = document.querySelector('.tF2Cxc a');
        return result ? result.href : null;
      });
      

    const ceoName = await page.evaluate(() => {
      const result = document.querySelector('.tF2Cxc h3');
      return result ? result.textContent : null;
    });

    if (ceoLinkedinUrl) {
      const index = companyData.findIndex(item => item.company === companyName);
      if (index !== -1) {
        companyData[index].ceoLinkedinUrl = ceoLinkedinUrl;
      // console.log(`LinkedIn URL for ${companyName} CEO: ${linkedinUrl}`)
      companyData[index].ceoName = ceoName; 
      console.log('linkedinUrl:', ceoLinkedinUrl , ceoName);
      }

    } else {
      console.log(`No matching result found for ${ceoLinkedinUrl}. and ${ceoName}`);
    }
  }

  for(const companyName of companyNames){

    await page.goto('https://www.google.com/');
    
  // Wait for the textarea to be present
  
  await page.waitForSelector('textarea' , { waitUntil: "networkidle2", timeout: 0 });

  // Type into the textarea
  await page.type('textarea', `${companyName} company email address`);

 
  // Wait for navigation to complete after pressing "Enter"
  await Promise.all([
      page.waitForNavigation(), // The promise resolves after navigation has finished
      page.keyboard.press('Enter'), // Clicking the link will indirectly cause a navigation
  ]);
    
 

  const tableEmail = await page.evaluate(() => {
    const emailElement = document.querySelector('.Crs1tb b');
    return emailElement ? emailElement.innerText : null;
  });

  if (tableEmail) {
    const index = companyData.findIndex(item => item.company === companyName);
    if (index !== -1) {
        companyData[index].companyEmailAddress = tableEmail;
        console.log('Company Gmail ID:', tableEmail);
        
    }
  } else {
    // If the first attempt fails, try the second attempt
        const email = await page.evaluate(() => {
        const span = document.querySelector('.ILfuVd b');
        return span ? span.innerText : null;
      });

    if (email) {
      const index = companyData.findIndex(item => item.company === companyName);
      if (index !== -1) {
        companyData[index].companyEmailAddress = email;
        console.log('Company Gmail ID:', email);
      
    }
    } else {
      console.log(`No search result found for ${companyName}.`);
      
    }
  }
}
  } catch (err) {
    console.error(err);
  } finally {
    await browser?.close();



    // Log the entire companyData array
    console.log('Company Data:', companyData);

    // Write data to CSV file
    const csvWriter = createCsvWriter({
      path: 'company_data.csv',
      header: [
        { id: 'company', title: 'Company' },
        { id: 'title', title: 'Title' },
        { id: 'link', title: 'Link' },
        { id: 'companyLink', title: 'Company Link' },
        { id: 'ceoLinkedinUrl', title: 'Ceo  LinkedInLink' },
        { id: 'ceoName', title: 'Ceo Name' },
        { id: 'companyEmailAddress', title: 'company Email Address' },
        
      ],
    });

    await csvWriter.writeRecords(companyData);
    console.log('CSV file written successfully.');
  }
};


const companyNames = [
  "ADRENALIN ESYSTEMS LIMITED",
  "ADV DETAILING AND DESIGN APPLICATIONS INDIA PRIVATE LIMITED",
  "ADVA OPTICAL NETWORKING INDIA PRIVATE LIMITED",
  "ADVAITA INDIA CONSULTING PRIVATE LIMITED",
  "ADVAIYA SOLUTIONS (P) LTD.",
  "ADVANCED BUSINESS & HEALTHCARE SOLUTIONS INDIA PRIVATE LIMITED",
  "ADVANCED INVESTMENT MECHANICS INDIA PRIVATE LIMITED",
  "ADVANTEST INDIA PRIVATE LIMITED",
  "ADVANTMED INDIA LLP",
  "ADVANZ PHARMA SERVICES (INDIA) PRIVATE LIMITED",
  "ADVARRA INDIA PRIVATE LIMITED",
  "ADVISOR360 SOFTWARE PRIVATE LIMITED",
  "AECO TECHNOSTRUCT PRIVATE LIMITED",
  "AECOM INDIA GLOBAL SERVICES PRIVATE LIMITED",
  "AECOR DIGITAL INTERNATIONAL PRIVATE LIMITED",
  "AEGIS CUSTOMER SUPPORT SERVICES PVT LTD",
  "AEL DATASERVICES LLP",
  "AEON COMMUNICATION PRIVATE LIMITED",
  "AEREN IP SERVICES PVT. LTD.",
  "AEREN IT SOLUTIONS PVT. LTD.",
  "AEREON INDIA PRIVATE LIMITED.",
  "AEROSPIKE INDIA PRIVATE LIMITED",
  "AEXONIC TECHNOLOGIES PRIVATE LIMITED",
  "AFFINITY ANSWERS PRIVATE LIMITED",
  "AFFINITY GLOBAL ADVERTISING PVT. LTD.",
  "AFOUR TECHNOLOGIES PVT. LTD.",
  "AGASTHA SOFTWARE PVT. LTD.",
  "AGATHSYA TECHNOLOGIES PRIVATE LIMITED",
  "AGCO TRADING (INDIA) PRIVATE LIMITED",
  "AGGRANDIZE VENTURE PRIVATE LIMITED",
  "AGILE ICO PVT LTD",
  "AGILE LINK TECHNOLOGIES",
  "AGILENT TECHNOLOGIES INTERNATIONAL PVT.LTD.",
  "AGILIANCE INDIA PVT LTD",
  "AGILITY E SERVICES PRIVATE LIMITED",
  "AGILON HEALTH INDIA PRIVATE LIMITED",
  "AGNEXT TECHNOLOGIES PRIVATE LTDAGNISYS TECHNOLOGY (P) LTD.",
  "AGNITIO SYSTEMS",
  "AGNITY COMMUNICATIONS PVT. LTD.",
  "AGNITY INDIA TECHNOLOGIES PVT LTD",
  "AGNITY TECHNOLOGIES PRIVATE LIMITED",
  "AGREETA SOLUTIONS PRIVATE LIMITED",
  "AGS HEALTH PVT. LTD",
  "AGT ELECTRONICS LTD",
  "AGTECHPRO PRIVATE LIMITED",
  "AHANA RAY TECHNOLOGIES INDIA PRIVATE LIMITED",
  "AI COGITO INDIA PRIVATE LIMITED",
  "AI SQUARE GLOBAL SOLUTIONS LLP",
  "AIDASTECH INDIA PRIVATE LIMITED",
  "AIE FIBER RESOURCE AND TRADING (INDIA) PRIVATE LIMITED",
  "AIGENEDGE PRIVATE LIMITED",
  "AIGILX HEALTH TECHNOLOGIES PVT LTD",
  "AIMBEYOND INFOTECH PRIVATE LIMITED",
  "AIML SQUARE PRIVATE LIMITED",
  "AIMTRONICS SEMICONDUCTOR INDIA PVT LTD",
  "AINS INDIA PVT LTD",
  "AINSURTECH PVT LTD",
  "AIOPSGROUP COMMERCE INDIA PRIVATE LIMITED",
  "AIRAMATRIX PRIVATE LIMITED",
  "AIRAVANA SYSTEMS PRIVATE LIMITED",
  "AIRBUS GROUP INDIA PVT. LTD.",
  "AIRCHECK INDIA PVT. LTD.",
  "AIRDATA TECHNOLOGIES PRIVATE LIMITED",
  "AIREI INDIA PRIVATE LTD",
  "AIRMEET NETWORKS PRIVATE LIMITED",
  "AIRO DIGITAL LABS INDIA PRIVATE LIMITED",
  "AIRO GLOBAL SOFTWARE PRIVATE LIMITED",
  "AIROHA TECHNOLOGY INDIA PRIVATE LIMITED",
  "AIRTEL INTERNATIONAL LLP",
  "AITHENT TECHNOLOGIES PVT. LTD.",
  "AJIRA AI SOFTWARE INDIA PVT LTD",
  "AJOSYS TECHNOLOGY SOLUTIONS PVT LTD",
  "AJRITH TECH PRIVATE LIMITED",
  "AJS SOFTWARE TECHNOLOGIES PRIVATE LIMITED",
  "AJUBA COMMERCE PVT. LTD.",
  "AK AEROTEK SOFTWARE CENTRE PVT. LTD.",
  "AK SURYA POWER MAGIC PVT LTD",
  "AKEO SOFTWARE SOLUTIONS PRIVATE LIMITED",
  "AKIKO SHERMAN INFOTECH PRIVATE LIMITED",
  "AKOTS INDIA PVT. LTD.",
  "AKRIDATA INDIA PRIVATE LIMITED",
  "AKSA LEGACIES PRIVATE LIMITED",
  "AKSHAY RAJENDRA SHANBHAG",
  "AKSHAY VANIJYA & FINANCE LTD",
  "ALAMY IMAGES INDIA (P) LTD",
  "ALAN SOLUTIONSALATION INDIA PRIVATE LIMITED",
  "ALCAX SOLUTIONS",
  "ALCODEX TECHNOLOGIES PVT. LTD.",
  "ALE INDIA PVT LTD.",
  "ALEKHA IT PRIVATE LIMITED",
  "ALEPT CONSULTING PRIVATE LIMITED",
  "ALERTOPS INDIA PRIVATE LIMITED",
  "ALETHEA COMMUNICATIONS TECHNOLOGIES PVT LTD",
  "ALFA KPO PVT. LTD.",
  "ALFANAR ENGINEERING SERVICES INDIA PVT LTD",
  "ALGONICS SYSTEMS PRIVATE LIMITED",
  "ALGORHYTHM TECH PVT LTD"

];

searchCompanies(companyNames);