#Workflow
- Landing page, just enough styles and scripts to display it, lazy loading the cards
- cards section with direct entry ability, styles for the cards, lazy load edit card component
- edit card section, styles and scripts for edit card related activity

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
    - script.js
        - lazy loading component based on url
        - shared element hooks/handlers
        - helper functions
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
- cards.js
    - load showdown.js for rendering md cards
    - fetching cards info
    - load the html template, render into the page
    - listeners to load/call edit card function
- cards.css
    - cards container
    - a card & within
## Edit Card
- editcard.html
    - imgupload component
    - template for changed card
    - message explaining the review process
- editcard.js
    - enter edit mode for a card
    - handle img upload
    - finish edit mode
    - display messages
    - generating markdown for changed card
- editcard.css
    - img upload widget
    - edited card
    - message box