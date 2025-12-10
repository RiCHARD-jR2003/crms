# Date Format Standard - MM/DD/YYYY

## Overview
All dates across the entire system must be displayed in **MM/DD/YYYY** format (e.g., 12/25/2024). This applies to all features, functions, and user types.

## Centralized Utility

### Location
`pwd-frontend/src/utils/dateTimeFormatter.js`

### Available Functions

#### `formatDate(dateString)`
Formats a date as **MM/DD/YYYY**
```javascript
import { formatDate } from '../../utils/dateTimeFormatter';
formatDate('2024-12-25') // Returns: "12/25/2024"
```

#### `formatDateTimeShort(dateString)`
Formats date and time as **MM/DD/YYYY HH:mm AM/PM**
```javascript
import { formatDateTimeShort } from '../../utils/dateTimeFormatter';
formatDateTimeShort('2024-12-25T14:30:00') // Returns: "12/25/2024 02:30 PM"
```

#### `formatDateTime(dateString)`
Formats date and time as **MM/DD/YYYY HH:mm:ss AM/PM**
```javascript
import { formatDateTime } from '../../utils/dateTimeFormatter';
formatDateTime('2024-12-25T14:30:45') // Returns: "12/25/2024, 02:30:45 PM"
```

#### `formatDateMMDDYYYY(dateString)`
Alias for `formatDate` - for backward compatibility

## Implementation Guidelines

### ✅ DO:
- Use the centralized `formatDate` function from `dateTimeFormatter.js`
- Import: `import { formatDate } from '../../utils/dateTimeFormatter';`
- Always display dates as MM/DD/YYYY

### ❌ DON'T:
- Use `toLocaleDateString()` without explicit formatting (may vary by locale)
- Use `toDateString()` (format varies by browser)
- Create custom date formatting functions (use centralized utility)
- Use different date formats (DD/MM/YYYY, YYYY-MM-DD for display, etc.)

## Components Updated

### ✅ Already Using MM/DD/YYYY:
- `ApplicationForm.js` - Uses `formatDateMMDDYYYY` function
- `Announcement.js` - Updated to use centralized utility
- `PWDRecords.js` - Updated to use centralized utility
- `dateTimeFormatter.js` - Centralized utility (MM/DD/YYYY)
- `performanceUtils.js` - Updated to use MM/DD/YYYY

### 🔄 Components to Update:
Components using `toLocaleDateString` should be updated to use the centralized utility:
- `Reports.js` - Has `formatDateMMDDYYYY` but also uses `toLocaleDateString` for month names
- `BarangayPresidentReports.js`
- `RenewalDashboard.js`
- `AdminDashboard.js`
- `PWDCard.js`
- `IDClaimModal.js`
- `PWDMemberBenefits.js`
- `BenefitTracking.js`
- `PublicSchedulePage.js`
- `PublicReschedulePage.js`
- `DisabilityAssessmentPage.js`
- `DisabilityAssessmentForm.js`
- `Analytics.js`
- `LandingPage.js`

## Date Input Fields

### Date Input Format
All date input fields should:
1. Display dates in **MM/DD/YYYY** format
2. Accept user input in **MM/DD/YYYY** format
3. Convert to ISO format (YYYY-MM-DD) when sending to backend
4. Convert from ISO format (YYYY-MM-DD) to MM/DD/YYYY when displaying

### Example Implementation
```javascript
// Display: MM/DD/YYYY
const displayDate = formatDate(isoDateString);

// Input: Accept MM/DD/YYYY, convert to ISO for backend
const handleDateChange = (mmddyyyy) => {
  const isoDate = parseMMDDYYYYToISO(mmddyyyy);
  // Send isoDate to backend
};
```

## Backend Communication

### Storage Format
- Backend stores dates in ISO format: `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss`
- Frontend converts to MM/DD/YYYY for display

### API Response Handling
```javascript
// Backend sends: "2024-12-25T14:30:00"
// Frontend displays: "12/25/2024 02:30 PM"
const displayDate = formatDateTimeShort(apiResponse.date);
```

## Testing Checklist

- [ ] All date displays show MM/DD/YYYY format
- [ ] Date inputs accept MM/DD/YYYY format
- [ ] Date conversions work correctly (ISO ↔ MM/DD/YYYY)
- [ ] All user types see consistent date format
- [ ] All features show dates in MM/DD/YYYY
- [ ] Print/export functions use MM/DD/YYYY format

## Migration Notes

### For Existing Components:
1. Import the centralized utility:
   ```javascript
   import { formatDate, formatDateTimeShort } from '../../utils/dateTimeFormatter';
   ```

2. Replace local date formatting functions:
   ```javascript
   // Before:
   const formatDate = (date) => date.toLocaleDateString('en-US');
   
   // After:
   import { formatDate } from '../../utils/dateTimeFormatter';
   ```

3. Update all date displays:
   ```javascript
   // Before:
   {date.toLocaleDateString()}
   
   // After:
   {formatDate(date)}
   ```

## Examples

### Display Date Only
```javascript
import { formatDate } from '../../utils/dateTimeFormatter';

<Typography>{formatDate(member.created_at)}</Typography>
// Displays: "12/25/2024"
```

### Display Date and Time
```javascript
import { formatDateTimeShort } from '../../utils/dateTimeFormatter';

<Typography>{formatDateTimeShort(announcement.publishDate)}</Typography>
// Displays: "12/25/2024 02:30 PM"
```

### Date Input Field
```javascript
<TextField
  value={formatDate(formData.dateOfBirth)} // Display as MM/DD/YYYY
  onChange={(e) => {
    const isoDate = parseMMDDYYYYToISO(e.target.value);
    setFormData({ ...formData, dateOfBirth: isoDate });
  }}
/>
```

## Support

For questions or issues with date formatting, refer to:
- `pwd-frontend/src/utils/dateTimeFormatter.js` - Centralized utility
- This document - Implementation guidelines

