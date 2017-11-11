const { createStore, combineReducers } = Redux
export const actions = {
    togglenav: {
        type: "toggle_nav",
        tobe: undefined
    },
    togglebanner: {
        type: "toggle_banner",
        tobe: undefined
    },
    addcard: {
        type: "add_card",
        title: "",
        dom: null
    }
}

const initialUIState = {
    banner: false,
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
                return {...state, nav: !state.nav }
            } else if (action.tobe === state.nav) {
                return state
            } else {
                return {...state, nav: action.tobe }
            }
            break;
        case "toggle_banner":
            if (action.tobe === undefined) {
                return {...state, banner: state.banner }
            } else if (action.tobe === state.banner) {
                return state
            } else {
                return {...state, banner: action.tobe }
            }
            break;
        case "add_card":
            if (action.title !== "") {
                return {...state, cards: {...state.cards, [action.title]: false } }
                // default unexpanded card
            } else return state
        default:
            return state
    }
}

function reduceData(state = initialDataState, action) {
    switch (action.type) {
        case "add_card":
            return {...state, [action.title]: action.dom }
        default:
            return state
    }
}

export const UIstore = createStore(reduceUI, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
export const Datastore = createStore(reduceData, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())