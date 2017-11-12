const { createStore, combineReducers } = Redux
export const actions = {
    togglenav: {
        type: "toggle_nav",
        tobe: undefined
    },
    addcard: {
        type: "add_card",
        title: "",
        dom: null
    }
}

const initialUIState = {
    nav: false,
    cards: {} //keeping the UI state of each card, not any content
    // title:{expanded:boolean}
}

const initialDataState = {
    // [cardtitle]:dom
}

function reduceUI(state = initialUIState, action) {
    switch (action.type) {
        case "toggle_nav":
            if (action.tobe === undefined) {
                return Object.assign({}, state, { nav: !state.nav })
            } else if (action.tobe === state.nav) {
                return state
            } else {
                return Object.assign({}, state, { nav: action.tobe })
            }
            break;
        case "add_card":
            if (action.title !== "") {
                return Object.assign({}, state, {
                        cards: Object.assign({}, state.cards, {
                            [action.title]: false
                        })
                    })
                    // default unexpanded card
            } else return state
        default:
            return state
    }
}

function reduceData(state = initialDataState, action) {
    switch (action.type) {
        case "add_card":
            return Object.assign({}, state, {
                [action.title]: action.dom
            })
        default:
            return state
    }
}

export const UIstore = createStore(reduceUI, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
export const Datastore = createStore(reduceData, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

console.log('loaded redux data')