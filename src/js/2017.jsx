const fileList = []
class Image extends React.Component {
    onClick(ev) {
        // will implement lazy load later
        ev.target.classList.toggleClass("view")
    }
    render() {
        <img src={this.props.image} alt={this.props.alt} onClick={this.onClick.bind(this)} />
    }
}

class Video extends React.Component{
    
    componentWillMount() {
        // request the thumnail
    }
    onClick(ev){
        // show iframe fullscreen
    }
    render(){
        <img src="thumnail" alt="thumnail" onClick={this.onClick.bind(this)}/>
    }
}