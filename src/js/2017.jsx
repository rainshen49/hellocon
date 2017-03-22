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