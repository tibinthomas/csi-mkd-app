/**
 * Donation and sponsor configuration.
 *
 * Payment details are intentionally empty until the Centre's real
 * UPI ID / Razorpay page / bank account are available — the Donate
 * page only renders a payment method when its value is filled in,
 * and falls back to the office contact details otherwise.
 */

export interface BankTransferDetails {
  readonly accountName: string;
  readonly accountNumber: string;
  readonly ifsc: string;
  readonly bankName: string;
  readonly branch: string;
}

export interface DonationConfig {
  /** UPI VPA, e.g. 'csicounselling@sbi'. Empty string hides the UPI option. */
  readonly upiId: string;
  /** Payee name shown inside UPI apps when paying via the deep link. */
  readonly upiPayeeName: string;
  /** Razorpay hosted payment-page URL, e.g. 'https://rzp.io/l/...'. Empty string hides the option. */
  readonly razorpayPageUrl: string;
  /** Bank account for direct transfer. Null hides the option. */
  readonly bankTransfer: BankTransferDetails | null;
  /** Office contact shown as the fallback (and for donation receipts). */
  readonly contactPhone: string;
  readonly contactEmail: string;
}

export const DONATION_CONFIG: DonationConfig = {
  upiId: '',
  upiPayeeName: 'CSI Counselling Centre, Kottayam',
  razorpayPageUrl: '',
  bankTransfer: null,
  contactPhone: '+91-8129778832',
  contactEmail: 'csimkdmarry@gmail.com',
};

export interface Sponsor {
  readonly name: string;
  /** Optional external website; the sponsor card links to it when set. */
  readonly url?: string;
  /** Optional logo path under assets/; falls back to a text-only card. */
  readonly logo?: string;
  /** Optional short line, e.g. the sponsor's trade or town. */
  readonly tagline?: string;
}

/**
 * Acknowledged supporters shown on the About page. Empty until the
 * first sponsorship is agreed; the section then renders the cards.
 */
export const SPONSORS: readonly Sponsor[] = [];
