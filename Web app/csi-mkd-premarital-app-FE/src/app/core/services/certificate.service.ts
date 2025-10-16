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
  providedIn: 'root',
})
export class CertificateService {
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
        year: 'numeric',
      });
    }

    const dates: string[] = [];
    const current = new Date(start);

    // Get month and year from the end date for consistency
    const monthYear = end.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
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
    return `<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>Certificate (overlay)</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Pinyon+Script&display=swap" rel="stylesheet">
  <style>
    /* Reset default styles to eliminate white space */
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: transparent;
    }

    /* Container set to 11in x 8.5in aspect ratio (landscape).
     Width uses pixels for on-screen, but max-width:100% allows responsive scaling. */
    .certificate {
      /* tweak these three values to nudge entire rendering */
      --cert-width: 1056px;
      /* default on-screen width; change if you need larger */
      --cert-aspect: calc(11 / 8.5);
      /* for reference; not directly used */

      /* Field positions (percentages relative to certificate container).
       If things are off, change these values only. */
      --name-left: 19%;
      --name-top: 47.7%;
      --name-width: 62.1%;
      --name-size: 36px;

      --church-left: 18.04%;
      --church-top: 54.77%;
      --church-width: 72.53%;
      --church-size: 28px;

      --dates-left: 47.3%;
      --dates-top: 66.72%;
      --dates-width: 38.86%;
      --dates-size: 24px;

      width: var(--cert-width);
      max-width: 100%;
      aspect-ratio: 11 / 8.5;
      position: relative;
      margin: 0 auto;
      background-image: url('assets/pre-marital_certificate_bg.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 100% 100%;
      /* stretch to exact aspect, preserving layout */
      font-family: 'Playfair Display', serif;
      color: #000000;
      box-sizing: border-box;
    }

    /* overlay fields are positioned using percentages so they scale with the container */
    .overlay {
      position: absolute;
      white-space: nowrap;
      text-overflow: ellipsis;
      pointer-events: none;
      /* safe: user can't accidentally select/move */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.3 !important;
      height: auto !important;
      overflow: visible !important;
    }

    .name {
      left: var(--name-left);
      top: var(--name-top);
      width: var(--name-width);
      font-size: var(--name-size);
      font-weight: 400;
      text-align: center;
      /* change to center if you want centered text inside dotted line */
      letter-spacing: 2px;
      font-family: 'Pinyon Script', cursive;
      color: #2d1b12;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15), 0.5px 0.5px 1px rgba(45, 27, 18, 0.1);
      filter: drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.08));
    }

    .church {
      left: var(--church-left);
      top: var(--church-top);
      width: var(--church-width);
      font-size: var(--church-size);
      font-weight: 400;
      text-align: left;
      letter-spacing: 1.5px;
      font-family: 'Pinyon Script', cursive;
      color: #2d1b12;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.12), 0.5px 0.5px 1px rgba(45, 27, 18, 0.08);
      filter: drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.06));
    }

    .dates {
      left: var(--dates-left);
      top: var(--dates-top);
      width: var(--dates-width);
      font-size: var(--dates-size);
      font-weight: 400;
      text-align: left;
      letter-spacing: 1.2px;
      font-family: 'Pinyon Script', cursive;
      color: #2d1b12;
      text-shadow: 0.8px 0.8px 1.5px rgba(0, 0, 0, 0.1), 0.3px 0.3px 0.8px rgba(45, 27, 18, 0.06);
      filter: drop-shadow(0 0.3px 0.8px rgba(0, 0, 0, 0.05));
    }

    /* print rules: print at actual 11in x 8.5in */
    @page {
      size: 11in 8.5in;
      margin: 0;
    }

    @media print {
      .certificate {
        width: 11in;
        height: 8.5in;
        background-size: 100% 100%;
      }
    }

    /* optional: scale whole certificate for smaller screens */
    .wrap {
      width: var(--cert-width);
      height: calc(var(--cert-width) / var(--cert-aspect));
      display: flex;
      justify-content: center;
      align-items: flex-start;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</head>

<body>
  <div class="wrap">
    <div class="certificate" role="img" aria-label="certificate background with overlay fields">
      <!-- Only these placeholders remain; replace server-side or via JS -->
      <div class="overlay name">{{NAME}}</div>
      <div class="overlay church">{{CHURCH_NAME}}</div>
      <div class="overlay dates">{{DATES}}</div>
    </div>
  </div>
</body>

</html>`;
  }

  private populateTemplate(template: string, data: CertificateData): string {
    // Use session dates if available, otherwise fall back to the dates array
    const formattedDates =
      data.sessionStartDate && data.sessionEndDate
        ? this.formatSessionDates(data.sessionStartDate, data.sessionEndDate)
        : this.formatDates(data.dates);

    return template
      .replace(/\{\{\s*NAME\s*\}\}/g, data.name)
      .replace(/\{\{\s*CHURCH_NAME\s*\}\}/g, data.churchName)
      .replace(/\{\{\s*DATES\s*\}\}/g, formattedDates);
  }

  async generateCertificateHTML(data: CertificateData): Promise<string> {
    const template = await this.loadTemplate();
    const populatedTemplate = this.populateTemplate(template, data);

    return populatedTemplate;
  }

  async generateCertificatePDF(data: CertificateData): Promise<Blob> {
    const htmlContent = await this.generateCertificateHTML(data);

    const options = {
      margin: 0,
      filename: `certificate-${data.name
        .replace(/\s+/g, '-')
        .toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'landscape',
      },
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
    link.download = `certificate-${data.name
      .replace(/\s+/g, '-')
      .toLowerCase()}.pdf`;
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
    link.download = `certificate-${data.name
      .replace(/\s+/g, '-')
      .toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async generateCertificateImage(
    htmlContent: string,
    isPreview = false,
    isPrint = false
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if this is a full HTML document or just a fragment
      const isFullDocument =
        htmlContent.trim().toLowerCase().startsWith('<!doctype html') ||
        htmlContent.trim().toLowerCase().startsWith('<html');

      if (isFullDocument) {
        // For full HTML documents, create an iframe to properly handle styles and structure
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '1056px';
        iframe.style.height = '816px';
        iframe.style.border = 'none';

        document.body.appendChild(iframe);

        if (!iframe.contentDocument) {
          document.body.removeChild(iframe);
          reject(
            new Error('Unable to create iframe for certificate rendering')
          );
          return;
        }

        iframe.contentDocument.open();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        // Wait for the iframe to load
        const handleLoad = () => {
          try {
            if (!iframe.contentDocument) {
              document.body.removeChild(iframe);
              reject(new Error('Iframe content not available'));
              return;
            }

            let certificateElement = iframe.contentDocument.querySelector(
              '.certificate'
            ) as HTMLElement;
            if (!certificateElement) {
              certificateElement = iframe.contentDocument.querySelector(
                '.certificate-container'
              ) as HTMLElement;
            }

            if (!certificateElement) {
              document.body.removeChild(iframe);
              reject(
                new Error('Certificate container not found in loaded document')
              );
              return;
            }

            // Apply CSS overrides for printing
            if (isPrint) {
              const style = document.createElement('style');
              style.textContent = `
                .certificate {
                  background-image: none !important;
                }
              `;
              iframe.contentDocument.head.appendChild(style);
            }

            // Force layout recalculation and wait for fonts
            certificateElement.offsetHeight;

            const captureImage = () => {
              // Use html2canvas to convert to image
              html2canvas(certificateElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                width: 1056,
                height: 816,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0,
                foreignObjectRendering: false,
                removeContainer: true,
              })
                .then((canvas) => {
                  document.body.removeChild(iframe);
                  resolve(canvas.toDataURL('image/png', 1.0));
                })
                .catch((error) => {
                  document.body.removeChild(iframe);
                  reject(error);
                });
            };

            // Wait for fonts to be ready before capturing
            const fontsReady = iframe.contentDocument?.fonts?.ready;
            if (fontsReady) {
              fontsReady
                .then(() => {
                  setTimeout(captureImage, 100);
                })
                .catch(() => {
                  setTimeout(captureImage, 500);
                });
            } else {
              setTimeout(captureImage, 500);
            }
          } catch (error) {
            document.body.removeChild(iframe);
            reject(error);
          }
        };

        iframe.onload = handleLoad;
        // Fallback timeout
        setTimeout(() => {
          if (iframe.parentNode) {
            handleLoad();
          }
        }, 1000);
      } else {
        // Handle HTML fragments as before
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = htmlContent;
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '1056px';
        tempContainer.style.height = '816px';

        document.body.appendChild(tempContainer);

        let certificateElement = tempContainer.querySelector(
          '.certificate'
        ) as HTMLElement;

        if (!certificateElement) {
          document.body.removeChild(tempContainer);
          reject(new Error('Certificate container not found'));
          return;
        }

        // Apply CSS overrides for printing
        if (isPrint) {
          const style = document.createElement('style');
          style.textContent = `
            .certificate {
              background-image: none !important;
            }
          `;
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
            backgroundColor: null,
            width: 1056,
            height: 816,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            foreignObjectRendering: false,
            removeContainer: true,
          })
            .then((canvas) => {
              document.body.removeChild(tempContainer);
              resolve(canvas.toDataURL('image/png', 1.0));
            })
            .catch((error) => {
              document.body.removeChild(tempContainer);
              reject(error);
            });
        };

        // Wait for fonts to be ready before capturing
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready
            .then(() => {
              setTimeout(captureImage, 100);
            })
            .catch(() => {
              setTimeout(captureImage, 500);
            });
        } else {
          setTimeout(captureImage, 500);
        }
      }
    });
  }

  async printCertificate(htmlContent: string): Promise<void> {
    try {
      const imageDataUrl = await this.generateCertificateImage(
        htmlContent,
        false,
        true
      );

      const printWindow = window.open(
        '',
        '_blank',
        'width=1300,height=1000,scrollbars=yes,resizable=yes'
      );
      if (!printWindow) {
        throw new Error(
          'Could not open print window. Please allow popups for this site.'
        );
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
      printWindow.print();

      // Handle print completion
      printWindow.onafterprint = () => {
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
