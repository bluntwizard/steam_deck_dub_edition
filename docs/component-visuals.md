# Component Visual Documentation

This document provides visual examples for all modular components in the Steam Deck DUB Edition project.

## How to Create and Add Visual Examples

1. **Create screenshots or GIFs** using the component showcase page.
2. **Save the images** in the appropriate directory: `docs/images/[component-name]/`.
3. **Add references** to these images in the component documentation.

## Standard Screenshot Formats

For consistency, use the following formats:

- **Component Preview**: Show the component in its default state.
- **Component Variants**: Show different states or variants of the component.
- **Component Interaction**: Use an animated GIF to show interaction with the component.
- **Component Integration**: Show how the component integrates with other components.

## Visual Examples

### Dialog Component

![Dialog Component - Default State](images/dialog/dialog-default.png)
*A simple dialog with title, content, and close button.*

![Dialog Component - With Actions](images/dialog/dialog-actions.png)
*Dialog with multiple action buttons for confirmation.*

![Dialog Component - Custom Content](images/dialog/dialog-custom.png)
*Dialog with custom HTML content.*

![Dialog Interaction](images/dialog/dialog-interaction.gif)
*Animated demonstration of opening, interacting with, and closing a dialog.*

### PageLoader Component

![PageLoader - Default](images/pageloader/pageloader-default.png)
*Default PageLoader with spinner.*

![PageLoader - With Progress](images/pageloader/pageloader-progress.png)
*PageLoader showing progress bar and loading status.*

![PageLoader - Interaction](images/pageloader/pageloader-interaction.gif)
*Animated demonstration of PageLoader showing loading progress and completion.*

### NotificationSystem Component

![Notification System - Info](images/notification/notification-info.png)
*Information notification example.*

![Notification System - Success](images/notification/notification-success.png)
*Success notification example.*

![Notification System - Warning](images/notification/notification-warning.png)
*Warning notification example.*

![Notification System - Error](images/notification/notification-error.png)
*Error notification example.*

![Notification System - Interaction](images/notification/notification-interaction.gif)
*Multiple notifications appearing and dismissing automatically.*

### ErrorHandler Component

![Error Handler - Toast Error](images/errorhandler/errorhandler-toast.png)
*Error handler showing a toast notification for an error.*

![Error Handler - Modal Error](images/errorhandler/errorhandler-modal.png)
*Error handler showing a modal dialog for a critical error.*

![Error Handler - Interaction](images/errorhandler/errorhandler-interaction.gif)
*Demonstration of error being caught and handled by the ErrorHandler component.*

### HelpCenter Component

![Help Center - Main View](images/helpcenter/helpcenter-main.png)
*Main view of the Help Center component.*

![Help Center - Search](images/helpcenter/helpcenter-search.png)
*Help Center with search results.*

![Help Center - Topic View](images/helpcenter/helpcenter-topic.png)
*Specific topic view in the Help Center.*

![Help Center - Navigation](images/helpcenter/helpcenter-navigation.gif)
*Navigating between topics in the Help Center.*

## Integration Examples

![Component Integration Example](images/integration/dialog-notification.gif)
*Example showing Dialog and NotificationSystem components working together.*

## Adding Visual Examples to Documentation

When adding visual examples to the component documentation, use the following format:

```markdown
### Visual Examples

![Component Name - State](path/to/image.png)
*Short description of what the image shows.*

For interactive examples:

![Component Name - Interaction](path/to/animation.gif)
*Description of the interaction being demonstrated.*
```

This format ensures visual examples are consistently presented across all component documentation. 