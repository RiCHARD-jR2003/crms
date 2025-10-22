# Read Aloud Accessibility Feature

## Overview
The Read Aloud feature provides text-to-speech functionality throughout the PWD RMS application, making content accessible to users with visual impairments or those who prefer audio content.

## Features

### 1. Click-to-Read
- Click on any text element to have it read aloud
- Automatically enabled when Read Aloud is turned on in accessibility settings
- Works with any text content on the page

### 2. Read Page Button
- Floating green button appears when Read Aloud is enabled
- Reads the entire page content (limited to first 2000 characters)
- Button changes to red "Stop" button when reading

### 3. Manual Controls
- "Read Page" button in accessibility settings dialog
- "Stop Reading" button to cancel current reading
- Adjustable reading speed (0.5x to 2.0x)

### 4. Auto-Start Option
- Automatically reads page content when page loads
- Can be enabled/disabled in accessibility settings
- Useful for users who want immediate audio feedback

## How to Use

### For Users:
1. Click the accessibility button (floating button in bottom-right)
2. Enable "Read Aloud" toggle
3. Adjust reading speed if needed
4. Click on any text to hear it read aloud
5. Use the floating green button to read entire page

### For Developers:
```javascript
import { useReadAloud } from '../../hooks/useReadAloud';

function MyComponent() {
  const { readElement, readPage, isReading, stopReading } = useReadAloud();
  
  return (
    <div>
      <button onClick={() => readElement(document.querySelector('.my-text'))}>
        Read This Text
      </button>
      <button onClick={readPage}>
        Read Page
      </button>
      <button onClick={stopReading} disabled={!isReading}>
        Stop Reading
      </button>
    </div>
  );
}
```

## Settings

### Read Aloud Settings:
- **Enable Read Aloud**: Master toggle for the feature
- **Auto-read page content on load**: Automatically reads content when page loads
- **Reading Speed**: Adjustable from 0.5x to 2.0x speed
- **Voice Selection**: Uses the same voice settings as TTS

### Integration with TTS:
- Uses the same voice, pitch, and volume settings as Text-to-Speech
- Respects screen reader settings
- Works independently of screen reader functionality

## Technical Details

### Browser Support:
- Uses Web Speech API (SpeechSynthesis)
- Supported in all modern browsers
- Graceful degradation if not supported

### Performance:
- Limits reading to 2000 characters for page content
- Cancels previous reading when new reading starts
- Efficient event handling for click-to-read

### Accessibility:
- Proper ARIA labels and descriptions
- Keyboard accessible controls
- Screen reader announcements
- Focus management

## Example Implementation

The LandingPage component demonstrates basic integration:

```javascript
import { useReadAloud } from '../../hooks/useReadAloud';

function LandingPage() {
  const { readElement, isReading } = useReadAloud();
  
  return (
    <div className="welcome-content">
      <h1>Welcome</h1>
      <p>Access your PWD services and benefits</p>
      <button 
        onClick={() => readElement(document.querySelector('.welcome-content'))}
        disabled={isReading}
      >
        {isReading ? 'Reading...' : 'Read Welcome Text'}
      </button>
    </div>
  );
}
```

## Best Practices

1. **Target Meaningful Content**: Use `readElement()` on containers with complete thoughts
2. **Provide Visual Feedback**: Show reading state with button text or icons
3. **Respect User Preferences**: Check if Read Aloud is enabled before showing controls
4. **Limit Content**: Don't try to read extremely long content at once
5. **Handle Errors**: Provide fallback behavior if speech synthesis fails

## Troubleshooting

### Common Issues:
- **No speech**: Check if Read Aloud is enabled in accessibility settings
- **Wrong voice**: Verify voice selection in TTS settings
- **Slow/fast speech**: Adjust reading speed slider
- **No auto-read**: Ensure auto-start option is enabled

### Browser Issues:
- **Chrome**: May require user interaction before speech works
- **Safari**: Voice selection may be limited
- **Firefox**: Some voices may not be available

## Future Enhancements

- Highlight text being read
- Pause/resume functionality
- Reading progress indicator
- Custom voice training
- Multi-language support
- Reading history
