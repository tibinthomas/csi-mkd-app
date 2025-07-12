import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
      // You can add other properties here if needed
    };
  }
}
