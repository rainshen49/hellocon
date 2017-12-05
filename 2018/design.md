#Workflow
- Landing page, just enough styles and scripts to display it, lazy loading the cards
- cards section with direct entry ability, styles for the cards, lazy load edit card component
- edit card section, styles and scripts for edit card related activity
#Loading method
- load js first, which will in turn load html and css
#Components overview
## Global
- html(index): minimal container
    - layout
        - banner/splash
        - content/cards
    - shared elements
        - reload
        - navbar+toc
        - modal
        - social media
    - web app metas + manifest
- script: dependencies + global handler
    - Rx.js
    - helper.js
        - versatile functions
    - script.js
        - lazy load additional assets
        - shared element hooks/handlers
- style:
    - box sizing, touch scrolling, font, colors, global variables etc.
    - layout
    - common elements styles
    - (lazy) icons
    - (lazy) animations
## Cards
- cards.html:
    - a card template
    - a sample new card
    - imgupload component    
    - message explaining the review process
- cards.js
    - load showdown.js for rendering md cards
    - fetching cards info
    - load the html template, render into the page
    - handler expand procedure
    - listeners to load/call edit card function
    - edit mode for a card
    <!-- here -->
    - generating markdown for changed card
- cards.css
    - cards container
    - a card & within
    - edited card
    - message box
## Imgupload
- imgupload.js
    - handle img upload/compress etc
- imgupload.css
    - img upload widget