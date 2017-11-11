# Global:
- index.html
    - splash image, become a top banner info when scrolled down
        - Intro, date, location, social media/contact buttons
    - FAB Table of Content + Banner
        - Social media buttons
        - Cards related
    - Cards
        - Title
        - Brief/Detail
        - Image

- style.css
    - box-sizing, touch scrolling
    - preset animations
        - appearing, disappearing
        - highlighting
        - sizing
    - global styles
        - font, action elements, colors

- helper.js
    - some common helper functions

- script.js
    - handling splashing transition
    - loading cards and corresponding titles into TOC

- common dependencies
    - icons
    - redux
    - rxjs
- Redux design
    - actions
        - nav toggle
        - splash toggle
    - reducers
        - change nav state
        - change banner state
        - change card state
        - load cards & manage duplicates
    - store
        - UI states
        - Data states