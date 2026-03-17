const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    console.log('Starting PDF generation...');
    try {
        const browser = await puppeteer.launch({
            headless: 'new'
        });
        const page = await browser.newPage();
        
        const htmlPath = path.resolve(__dirname, 'comprehensive_srs.html');
        console.log(`Loading HTML from: ${htmlPath}`);
        
        // Read HTML content
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Output path setup
        const outputPath = path.resolve(__dirname, `Comprehensive_SRS_AI_Job_Matcher_Enterprise_v2.pdf`);
        console.log(`Saving PDF to: ${outputPath}`);

        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            },
            displayHeaderFooter: true,
            headerTemplate: `<div style="font-size: 8px; color: #999; width: 100%; text-align: right; padding-right: 20mm;"><span>AI Job Matcher - Enterprise SRS 2.0</span></div>`,
            footerTemplate: `<div style="font-size: 8px; color: #999; width: 100%; text-align: center;"><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`
        });

        await browser.close();
        console.log('PDF Generated Successfully!');
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

generatePDF();
