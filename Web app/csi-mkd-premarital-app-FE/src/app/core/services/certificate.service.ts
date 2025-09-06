import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { CERTIFICATE_CONSTANTS } from '../../shared/constants/certificate.constants';

export interface CertificateData {
  name: string;
  completionDate?: Date;
  sessionName?: string;
  churchName: string;
  dates: Date[];
  programDuration: string;
  sessionStartDate?: Date;
  sessionEndDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatDates(dates: Date[]): string {
    if (dates.length === 0) return '';
    if (dates.length === 1) return this.formatDate(dates[0]);
    
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const firstDate = this.formatDate(sortedDates[0]);
    const lastDate = this.formatDate(sortedDates[sortedDates.length - 1]);
    
    return `${firstDate} to ${lastDate}`;
  }

  private formatSessionDates(startDate: Date, endDate: Date): string {
    // Generate comma-separated dates like "07, 08, 09 August 2025"
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getTime() === end.getTime()) {
      // Single day session
      return start.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
    
    const dates: string[] = [];
    const current = new Date(start);
    
    // Get month and year from the end date for consistency
    const monthYear = end.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    
    // Generate all dates between start and end
    while (current <= end) {
      const dayNumber = current.getDate().toString().padStart(2, '0');
      dates.push(dayNumber);
      current.setDate(current.getDate() + 1);
    }
    
    return `${dates.join(', ')} ${monthYear}`;
  }


  private async loadTemplate(): Promise<string> {
    try {
      const response = await fetch(CERTIFICATE_CONSTANTS.TEMPLATE_URL);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to load certificate template:', error);
      // Return a fallback template if the external one fails
      return this.getFallbackTemplate();
    }
  }

  private getFallbackTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{CERTIFICATE_TITLE}}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      margin: 0;
      padding: 0;
      background-color: #fff;
    }

    .certificate-container {
      width: 1056px;
      height: 816px;
      background: #fff url('{{BACKGROUND_PATTERN_URL}}') no-repeat center;
      background-size: cover;
      border: 12px solid #b4975a;
      padding: 60px;
      margin: 0 auto;
      position: relative;
      box-sizing: border-box;
      text-align: center;
    }

    .header {
      margin-top: 40px;
    }

    .header .org-name {
      font-size: 20px;
      font-weight: bold;
      color: #7d2c2c;
      margin-top: 5px;
    }

    .certificate-title {
      font-size: 42px;
      font-weight: bold;
      color: #7d2c2c;
      margin-bottom: 20px;
      text-transform: uppercase;
    }

    .description {
      font-size: 20px;
      margin-top: 40px;
      color: #2c1810;
      font-weight: 600;
    }

    .recipient-name {
      font-size: 36px;
      font-weight: bold;
      color: #004b2c;
      text-decoration: underline;
      margin: 15px 0;
      display: inline-block;
    }

    .details {
      font-size: 18px;
      width: 80%;
      margin: 0 auto;
      line-height: 1.6;
      color: #2c1810;
      font-weight: 500;
    }

    .scripture {
      font-size: 16px;
      font-style: italic;
      margin: 25px auto;
      color: #2c1810;
      width: 80%;
      font-weight: 500;
    }

    .date {
      font-size: 18px;
      margin-top: 30px;
      color: #2c1810;
      font-weight: 600;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      position: absolute;
      bottom: 80px;
      width: 85%;
      left: 50%;
      transform: translateX(-50%);
    }

    .sign-box {
      text-align: center;
    }

    .sign-line {
      border-top: 1px solid #000;
      width: 220px;
      margin: 0 auto 5px auto;
    }

    .signature-name {
      font-weight: bold;
      font-size: 16px;
      color: #2c1810;
    }

    .signature-title {
      font-size: 14px;
      color: #2c1810;
      font-weight: 500;
    }

    .logo {
      position: absolute;
      top: 30px;
      left: 30px;
      height: 100px;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <img src="{{LOGO_URL}}" alt="Organization Logo" class="logo" style="display: {{LOGO_DISPLAY}};">

    <div class="header">
      <div class="certificate-title">{{CERTIFICATE_TITLE}}</div>
      <div class="org-name">{{ORGANIZATION_NAME}}</div>
    </div>

    <div class="description">This certifies that</div>
    <div class="recipient-name">{{NAME}}</div>

    <div class="details">{{CERTIFICATE_DESCRIPTION}}</div>

    <div class="scripture">{{SCRIPTURE_VERSE}}</div>

    <div class="date">Completed on <strong>{{DATE}}</strong></div>

    <div class="signatures">
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="signature-name">{{BISHOP_NAME}}</div>
        <div class="signature-title">{{BISHOP_TITLE}}</div>
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="signature-name">{{DIRECTOR_NAME}}</div>
        <div class="signature-title">{{DIRECTOR_TITLE}}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  private populateTemplate(template: string, data: CertificateData): string {
    
    // Use session dates if available, otherwise fall back to the dates array
    const formattedDates = data.sessionStartDate && data.sessionEndDate
      ? this.formatSessionDates(data.sessionStartDate, data.sessionEndDate)
      : this.formatDates(data.dates);

    console.log('Certificate data:', {
      sessionStartDate: data.sessionStartDate,
      sessionEndDate: data.sessionEndDate,
      dates: data.dates,
      formattedDates,
      hasSessionDates: !!(data.sessionStartDate && data.sessionEndDate)
    });

    return template
      .replace(/\{\{CERTIFICATE_TITLE\}\}/g, CERTIFICATE_CONSTANTS.CERTIFICATE_TITLE)
      .replace(/\{\{ORGANIZATION_NAME\}\}/g, CERTIFICATE_CONSTANTS.ORGANIZATION_NAME)
      .replace(/\{\{ORGANIZATION_ADDRESS\}\}/g, CERTIFICATE_CONSTANTS.ORGANIZATION_ADDRESS)
      .replace(/\{\{NAME\}\}/g, data.name)
      .replace(/\{\{CHURCH_NAME\}\}/g, data.churchName)
      .replace(/\{\{PROGRAM_DURATION\}\}/g, data.programDuration)
      .replace(/\{\{PROGRAM_NAME\}\}/g, CERTIFICATE_CONSTANTS.PROGRAM_NAME)
      .replace(/\{\{VENUE\}\}/g, CERTIFICATE_CONSTANTS.VENUE)
      .replace(/\{\{DATES\}\}/g, formattedDates)
      .replace(/\{\{CERTIFICATE_DESCRIPTION\}\}/g, CERTIFICATE_CONSTANTS.CERTIFICATE_DESCRIPTION)
      .replace(/\{\{BISHOP_NAME\}\}/g, CERTIFICATE_CONSTANTS.BISHOP_NAME)
      .replace(/\{\{BISHOP_TITLE\}\}/g, CERTIFICATE_CONSTANTS.BISHOP_TITLE)
      .replace(/\{\{DIRECTOR_NAME\}\}/g, CERTIFICATE_CONSTANTS.DIRECTOR_NAME)
      .replace(/\{\{DIRECTOR_TITLE\}\}/g, CERTIFICATE_CONSTANTS.DIRECTOR_TITLE)
      .replace(/\{\{SCRIPTURE_VERSE\}\}/g, CERTIFICATE_CONSTANTS.SCRIPTURE_VERSE)
      .replace(/\{\{LOGO_URL\}\}/g, CERTIFICATE_CONSTANTS.LOGO_URL)
      .replace(/\{\{BACKGROUND_PATTERN_URL\}\}/g, CERTIFICATE_CONSTANTS.BACKGROUND_URL)
      .replace(/\{\{LOGO_DISPLAY\}\}/g, 'block');
  }

  async generateCertificateHTML(data: CertificateData): Promise<string> {
    const template = await this.loadTemplate();
    console.log('Loaded template length:', template.length);
    console.log('Template preview:', template.substring(0, 300) + '...');
    
    const populatedTemplate = this.populateTemplate(template, data);
    console.log('Populated template length:', populatedTemplate.length);
    console.log('Populated template preview:', populatedTemplate.substring(0, 500) + '...');
    
    return populatedTemplate;
  }

  async generateCertificatePDF(data: CertificateData): Promise<Blob> {
    const htmlContent = await this.generateCertificateHTML(data);
    
    const options = {
      margin: 0,
      filename: `certificate-${data.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'landscape' 
      }
    };

    return html2pdf().set(options).from(htmlContent).outputPdf('blob');
  }

  async previewCertificate(data: CertificateData): Promise<string> {
    return this.generateCertificateHTML(data);
  }

  async downloadCertificate(data: CertificateData): Promise<void> {
    const pdfBlob = await this.generateCertificatePDF(data);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${data.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async downloadCertificateAsImage(data: CertificateData): Promise<void> {
    const htmlContent = await this.generateCertificateHTML(data);
    const imageDataUrl = await this.generateCertificateImage(htmlContent);
    
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `certificate-${data.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async generateCertificateImage(htmlContent: string, isPreview = false, isPrint = false): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '1056px';
      tempContainer.style.height = '816px';
      
      document.body.appendChild(tempContainer);
      
      // Find the certificate container
      const certificateElement = tempContainer.querySelector('.certificate') as HTMLElement;
      
      if (!certificateElement) {
        document.body.removeChild(tempContainer);
        reject(new Error('Certificate container not found'));
        return;
      }
      
      // Apply CSS overrides
      const style = document.createElement('style');
      let styleContent = '';
      
      // For printing, remove background image and adjust positioning
      if (isPrint) {
        styleContent = `
          .certificate {
            background-image: none !important;
          }
        `;
      }
      
      if (styleContent) {
        style.textContent = styleContent;
        tempContainer.appendChild(style);
      }
      
      // Force layout recalculation and wait for fonts
      certificateElement.offsetHeight;
      
      const captureImage = () => {
        // Use html2canvas to convert to image
        html2canvas(certificateElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 1056,
          height: 816,
          scrollX: 0,
          scrollY: 0
        }).then((canvas) => {
          document.body.removeChild(tempContainer);
          resolve(canvas.toDataURL('image/png', 1.0));
        }).catch((error) => {
          document.body.removeChild(tempContainer);
          reject(error);
        });
      };
      
      // Wait for fonts to be ready before capturing
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          setTimeout(captureImage, 100);
        }).catch(() => {
          setTimeout(captureImage, 500);
        });
      } else {
        setTimeout(captureImage, 500);
      }
    });
  }

  async printCertificate(htmlContent: string): Promise<void> {
    try {
      const imageDataUrl = await this.generateCertificateImage(htmlContent, false, true);
      
      const printWindow = window.open('', '_blank', 'width=1300,height=1000,scrollbars=yes,resizable=yes');
      if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups for this site.');
      }
      
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              background: white;
            }
            
            .certificate-wrapper {
              width: 100%;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              page-break-inside: avoid;
            }
            
            img {
              max-width: 95%;
              max-height: 95%;
              width: auto;
              height: auto;
              border: none;
              display: block;
            }
            
            @media print {
              html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
              }
              
              @page {
                size: letter landscape;
                margin: 10mm;
              }
              
              .certificate-wrapper {
                width: 100%;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                page-break-before: auto;
                page-break-after: avoid;
                page-break-inside: avoid;
              }
              
              img {
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate-wrapper">
            <img src="${imageDataUrl}" alt="Certificate" />
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      // Wait for content to load
      printWindow.onload = () => {
        const img = printWindow.document.querySelector('img');
        if (img) {
          // If image is already loaded
          if (img.complete && img.naturalHeight !== 0) {
            this.triggerPrint(printWindow);
          } else {
            // Wait for image to load
            img.onload = () => {
              this.triggerPrint(printWindow);
            };
            img.onerror = () => {
              console.error('Failed to load certificate image for printing');
              this.triggerPrint(printWindow); // Try to print anyway
            };
          }
        } else {
          // Fallback if image not found
          setTimeout(() => this.triggerPrint(printWindow), 1000);
        }
      };
    } catch (error) {
      console.error('Error in printCertificate:', error);
      throw error;
    }
  }

  private triggerPrint(printWindow: Window): void {
    setTimeout(() => {
      printWindow.focus();
      console.log('Triggering print dialog...');
      printWindow.print();
      
      // Handle print completion
      printWindow.onafterprint = () => {
        console.log('Print dialog closed');
        printWindow.close();
      };
      
      // Fallback to close window if onafterprint doesn't work
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      }, 10000); // Close after 10 seconds if still open
    }, 800); // Increased delay to ensure proper loading
  }
}