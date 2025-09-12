# CSI Madhya Kerala Diocese Premarital Counseling Application - User Guide

## Overview
The CSI Madhya Kerala Diocese Premarital Counseling Application is a comprehensive Progressive Web Application (PWA) designed to manage premarital and general counseling registrations, sessions, and feedback for the Church of South India Madhya Kerala Diocese.

**Key Features:**
- Multi-language support (English and Malayalam)
- Three types of registrations: Premarital, General, and Pre-confirmational
- Admin dashboard for registration management
- Session configuration and management
- Feedback and questionnaire system
- File upload capabilities
- Email notifications
- Certificate generation
- Analytics and reporting

---

## Accessing the Application

### Website URL
Visit the application at: **[Your Production URL]**

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- JavaScript enabled
- For mobile: iOS 12+ or Android 8+

### Language Selection
- Available languages: English and Malayalam
- Language selector located in the top navigation
- Settings are saved automatically

---

## Public Features (No Login Required)

### 1. About Page
- **Access:** Click "About Us" in navigation or visit homepage
- **Features:**
  - Information about CSI MKD Premarital Counseling Centre
  - Mission and vision
  - Contact details

### 2. Team Members
- **Access:** Click "Our Team" in navigation
- **Features:**
  - Meet the counseling team
  - Staff profiles and contact information

### 3. Available Sessions
- **Access:** Click "Sessions" in navigation
- **Features:**
  - View all upcoming counseling sessions
  - Sessions grouped by year and month
  - Registration status (Active/Unavailable)
  - Session dates and names
  - Direct registration links

### 4. Registration System

#### A. Premarital Registration
**Access:** Go to "Register" → "Premarital Registration" or click "Register" on a session

**Required Information:**
- **Personal Details:**
  - First Name, Last Name
  - Age (1-120 years)
  - Sex (Male/Female)
  - Father's Name
  - Address
  - Occupation, Education

- **Church Information:**
  - CSI MKD membership status
  - Clergy District and Church Name (auto-populated from database)
  - Manual church entry for non-members

- **Church Activities:**
  - Choir Member
  - Sunday School Teacher
  - Youth Fellowship
  - Other activities (text field)

- **Marriage Details:**
  - Fiancé/Fiancée Name
  - Date of Marriage (future dates only)
  - Number of counseling days (1 day requires bishop's permission, 3 days standard)

- **Contact Information:**
  - Phone number with country code
  - Email address (validated against popular providers)

- **Session Selection:**
  - Choose from available active sessions

- **File Uploads:**
  - Personal photo (max 2MB, JPG/PNG)
  - Vicar's witness letter (max 2MB, PDF/DOC/DOCX/JPG/PNG)

- **Verification:**
  - Declaration agreement checkbox
  - reCAPTCHA verification

**Process:**
1. Fill out all required fields
2. Upload required documents
3. Complete reCAPTCHA
4. Click "Register"
5. Receive confirmation email with payment details

#### B. General Registration
**Access:** Go to "Register" → "General Registration"

**Required Information:**
- Basic personal details (Name, Age, Sex, Father's Name, Address, Education, Occupation)
- Clergy District and Church Name
- Contact information (Phone, Email)
- Marital Status (Single/Married)
- Session Type (In-Person/Online)
- Photo upload
- Declaration and reCAPTCHA

**Purpose:** For general counseling sessions not related to marriage

#### C. Pre-confirmational Registration
**Access:** Go to "Register" → "Pre-confirmational Registration"

**Required Information:**
- Clergy District and Church Name
- Confirmation Date (future date)
- Counseling Date
- List of Participants (Name and Age for each)
- Vicar's witness document upload
- Consent agreement and reCAPTCHA

**Purpose:** For confirmation candidates requiring pre-confirmational counseling

### 5. Feedback and Questionnaire System
**Access:** Go to "Feedback" in navigation

**Process:**
1. **Email Verification:**
   - Enter your registered email address
   - System verifies registration status
   - Access granted only to registered users

2. **Form Selection:**
   - **Feedback Form:** Share experience and suggestions about counseling sessions
   - **Questionnaire Form:** Provide thoughts and opinions for program improvement

3. **Form Completion:**
   - Answer all required questions
   - Submit feedback anonymously or with identification
   - Confirmation provided upon successful submission

---

## Admin Features (Login Required)

### Accessing Admin Panel
- **URL:** `/admin/login`
- **Credentials:** Provided by system administrator
- **Security:** JWT-based authentication with session management

### 1. Admin Dashboard
**Access:** `/admin/dashboard`

**Features:**
- **Registration Counts:**
  - Total Premarital Registrations
  - Total General Registrations
  - Total Pre-confirmational Registrations
- **Quick Overview Cards:** Visual representation of current statistics

### 2. Registration Management

#### A. Premarital Registrations (`/admin/premarital`)
**Features:**
- **Advanced Filtering:**
  - Filter by session year
  - Filter by session name
  - Search by name or email
  - Show only unapproved payments
  - Show only active sessions

- **Registration Table:**
  - Complete registration details in expandable rows
  - Payment status management (Approve/Received)
  - Certificate generation (for paid registrations)
  - Feedback status tracking
  - Question & Answer status monitoring
  - Edit and delete capabilities

- **Bulk Operations:**
  - Download complete registration list
  - Export data for reporting

- **Individual Actions:**
  - **Payment Approval:** Mark payments as received
  - **Certificate Generation:** Generate and download certificates
  - **Edit Registration:** Modify registration details
  - **Delete Registration:** Remove registrations (with confirmation)
  - **View Details:** Expand to see full registration information including uploaded photos and documents

#### B. General Registrations (`/admin/general-list`)
**Features:**
- View and manage all general counseling registrations
- Similar filtering and management options as premarital registrations
- Payment status tracking
- Export capabilities

#### C. Pre-confirmational Registrations (`/admin/pre-confirm-list`)
**Features:**
- Manage confirmation candidate registrations
- View participant lists for each registration
- Document management
- Export and reporting functions

### 3. Session Configuration (`/admin/session-config`)
**Features:**
- **Create New Sessions:**
  - Session name and description
  - Start and end dates
  - Active/inactive status
  - Capacity management

- **Manage Existing Sessions:**
  - Edit session details
  - Activate/deactivate sessions
  - View registration counts
  - Delete sessions (if no registrations)

- **Session Overview:**
  - List all configured sessions
  - Filter by year or status
  - Quick activation toggles

### 4. Session Deactivation (`/admin/deactivate-sessions`)
**Features:**
- **Bulk Deactivation:** Deactivate sessions starting within 3 days
- **Manual Selection:** Choose specific sessions to deactivate
- **Safety Features:** Confirmation required before deactivation
- **Automatic Processing:** Schedule-based deactivation for sessions that have passed

### 5. Instructor Management (`/admin/instructors`)
**Features:**
- **Add New Instructors:**
  - Name, contact information
  - Specialization areas
  - Availability status

- **Manage Existing Instructors:**
  - Edit instructor profiles
  - Update contact information
  - Activate/deactivate instructors
  - Delete instructor records

- **Assignment Tracking:**
  - View instructor assignments
  - Session allocation
  - Workload management

### 6. Feedback Management (`/admin/feedback-list`)
**Features:**
- **View All Feedback:**
  - Chronological listing of all submitted feedback
  - Filter by session, date range, or rating
  - Export feedback data

- **Analytics:**
  - Average ratings by session
  - Common feedback themes
  - Improvement suggestions tracking

- **Response Management:**
  - Mark feedback as reviewed
  - Add admin notes
  - Follow-up actions

### 7. Question & Answer Management (`/admin/question-answers-list`)
**Features:**
- **View All Responses:**
  - Complete questionnaire responses
  - Filter by registration or session
  - Export for analysis

- **Data Analysis:**
  - Response patterns
  - Statistical summaries
  - Trend identification

- **Privacy Controls:**
  - Anonymized viewing options
  - Data retention management
  - Compliance features

---

## Key Application Features

### 1. File Upload System
**Supported Formats:**
- **Images:** JPG, PNG (max 2MB)
- **Documents:** PDF, DOC, DOCX (max 2MB)

**Upload Process:**
1. Click "Choose File" or "Choose Photo" button
2. Select file from device
3. Automatic validation for size and format
4. Progress indicator during upload
5. Success confirmation with file name display

**Storage:** All files securely stored in Azure Blob Storage

### 2. Email System
**Automated Emails:**
- Registration confirmation
- Payment reminders
- Session notifications
- Certificate delivery
- Administrative alerts

**Email Templates:**
- Responsive design
- Multi-language support
- Branded formatting

### 3. Payment Tracking
**Status Types:**
- **Pending:** Payment not yet received
- **Received:** Payment confirmed by admin

**Admin Controls:**
- Manual payment approval
- Payment status updates
- Payment history tracking

### 4. Certificate Generation
**Availability:** Only for participants with approved payments
**Format:** PDF certificates with official formatting
**Content:** Participant name, session details, dates, official signatures
**Download:** Direct download from admin panel

### 5. Search and Filtering
**Global Search:**
- Search across all registration types
- Name and email matching
- Real-time results

**Advanced Filters:**
- Date ranges
- Session types
- Payment status
- Registration status
- Church affiliations

### 6. Data Export
**Export Formats:**
- Excel spreadsheets
- PDF reports
- CSV data files

**Export Options:**
- Complete registration lists
- Filtered datasets
- Custom date ranges
- Summary reports

### 7. Security Features
**User Security:**
- reCAPTCHA protection on all forms
- Email validation
- Domain restrictions for email providers
- Rate limiting on submissions

**Admin Security:**
- JWT-based authentication
- Session management
- Role-based access control
- Audit trail logging

**Data Protection:**
- Encrypted data transmission
- Secure file storage
- Regular backup procedures
- GDPR compliance features

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Registration Problems
**Issue:** Form won't submit
**Solutions:**
- Check all required fields are filled
- Verify file sizes are under 2MB
- Complete reCAPTCHA verification
- Ensure valid email format
- Check internet connection

**Issue:** Email already registered error
**Solutions:**
- Use a different email address
- Contact administrator if this is an error
- Check if you've already registered for this session

#### 2. File Upload Issues
**Issue:** File won't upload
**Solutions:**
- Check file size (max 2MB)
- Verify file format is supported
- Try a different browser
- Check internet connection
- Clear browser cache

#### 3. Admin Login Problems
**Issue:** Cannot access admin panel
**Solutions:**
- Verify correct login URL
- Check username and password
- Clear browser cookies
- Contact system administrator

#### 4. Email Access Issues
**Issue:** Not receiving emails
**Solutions:**
- Check spam/junk folder
- Verify email address is correct
- Wait a few minutes for delivery
- Contact administrator

#### 5. Session Access Problems
**Issue:** Cannot register for session
**Solutions:**
- Check if session is still active
- Verify registration deadline hasn't passed
- Ensure all prerequisites are met
- Try refreshing the page

### Browser Compatibility
**Recommended Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Browsers:**
- Chrome Mobile
- Safari Mobile
- Samsung Internet
- Firefox Mobile

### Performance Tips
1. **Clear Browser Cache:** Regularly clear cache for optimal performance
2. **Stable Internet:** Ensure stable internet connection during registration
3. **File Optimization:** Compress images before uploading when possible
4. **Browser Updates:** Keep browser updated to latest version
5. **JavaScript:** Ensure JavaScript is enabled

---

## Contact and Support

### Technical Support
- **For Registration Issues:** Contact your local parish office
- **For Technical Problems:** Contact system administrator
- **For Admin Access:** Contact Diocese IT department

### Important Notes
1. **Data Privacy:** All personal information is securely stored and processed according to privacy policies
2. **Registration Deadlines:** Register before session start dates
3. **Payment Requirements:** Payment approval required for certificate generation
4. **Document Requirements:** All uploaded documents should be clear and legible
5. **Session Changes:** Monitor email for any session updates or changes

### Emergency Contacts
- Diocese Office: [Phone Number]
- IT Support: [Email Address]
- Administrative Queries: [Contact Information]

---

## Appendix

### Keyboard Shortcuts (Admin Panel)
- **Ctrl+F:** Search within current page
- **Ctrl+R:** Refresh data
- **Ctrl+E:** Export current view
- **Esc:** Close modal dialogs

### Mobile App Features
The application works as a Progressive Web App (PWA):
- **Install:** Add to home screen option available
- **Offline Access:** Limited offline functionality
- **Push Notifications:** Session reminders and updates
- **Responsive Design:** Optimized for mobile devices

### Data Retention
- **Registration Data:** Retained for 7 years
- **Feedback Data:** Retained for 5 years
- **Session Data:** Retained indefinitely
- **File Uploads:** Retained with registration data

---

*This guide covers the major features and functionality of the CSI MKD Premarital Counseling Application. For additional assistance or specific questions, please contact your system administrator.*

**Version:** 1.0  
**Last Updated:** [Current Date]  
**Application Version:** 0.0.112+