// A simple script to generate placeholder images for the component documentation
const fs = require('fs');
const path = require('path');

// Image configurations for each component
const IMAGES = {
  dialog: [
    { name: 'dialog-default.png', width: 500, height: 300, label: 'Dialog Default' },
    { name: 'dialog-actions.png', width: 500, height: 350, label: 'Dialog with Actions' },
    { name: 'dialog-custom.png', width: 500, height: 400, label: 'Custom Dialog' },
    { name: 'dialog-interaction.gif', width: 500, height: 300, label: 'Dialog Interaction' }
  ],
  pageloader: [
    { name: 'pageloader-default.png', width: 600, height: 400, label: 'PageLoader Default' },
    { name: 'pageloader-progress.png', width: 600, height: 400, label: 'PageLoader with Progress' },
    { name: 'pageloader-interaction.gif', width: 600, height: 400, label: 'PageLoader Interaction' }
  ],
  notification: [
    { name: 'notification-info.png', width: 350, height: 80, label: 'Info Notification' },
    { name: 'notification-success.png', width: 350, height: 80, label: 'Success Notification' },
    { name: 'notification-warning.png', width: 350, height: 80, label: 'Warning Notification' },
    { name: 'notification-error.png', width: 350, height: 80, label: 'Error Notification' },
    { name: 'notification-interaction.gif', width: 350, height: 300, label: 'Notification Interaction' }
  ],
  errorhandler: [
    { name: 'errorhandler-toast.png', width: 350, height: 80, label: 'Error Toast' },
    { name: 'errorhandler-modal.png', width: 500, height: 300, label: 'Error Modal' },
    { name: 'errorhandler-interaction.gif', width: 600, height: 400, label: 'Error Handling' }
  ],
  helpcenter: [
    { name: 'helpcenter-main.png', width: 700, height: 500, label: 'Help Center Main' },
    { name: 'helpcenter-search.png', width: 700, height: 500, label: 'Help Center Search' },
    { name: 'helpcenter-topic.png', width: 700, height: 500, label: 'Help Center Topic' },
    { name: 'helpcenter-navigation.gif', width: 700, height: 500, label: 'Help Center Navigation' }
  ],
  integration: [
    { name: 'dialog-notification.gif', width: 700, height: 500, label: 'Dialog with Notification' }
  ]
};

// Create placeholder text file (since we can't create actual images here)
function createPlaceholder(component, imageConfig) {
  const dirPath = path.join('../../docs/images', component);
  const filePath = path.join(dirPath, imageConfig.name);
  
  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Create a text file describing the image
  const content = `Placeholder for ${imageConfig.label} image
Width: ${imageConfig.width}px
Height: ${imageConfig.height}px
Type: ${imageConfig.name.endsWith('.gif') ? 'Animation (GIF)' : 'Static Image (PNG)'}
Description: Visual example of the ${component} component
`;

  fs.writeFileSync(filePath, content);
  console.log(`Created placeholder: ${filePath}`);
}

// Create all placeholders
Object.keys(IMAGES).forEach(component => {
  IMAGES[component].forEach(imageConfig => {
    createPlaceholder(component, imageConfig);
  });
});

console.log('All placeholder images have been created.'); 