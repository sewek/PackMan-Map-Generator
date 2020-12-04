
class Box {
    constructor({ src = null, width = 48, height = 48, left = 0, top = 0, scale = 1, select_effect = true, selective = false } = {}) {
        this.src = src
        this.width = width
        this.height = height
        this.left = left
        this.top = top
        this.scale = scale
        this.select_effect = select_effect
        this.selective = selective
    }

    getImage() {
        var elem = $('<div>')
        elem.style.width = (this.width * this.scale) + 'px'
        elem.style.height = (this.height * this.scale) + 'px'
        if (this.src != null) {
            elem.style.background = 'url(' + this.src + ')';
            elem.style.backgroundPosition = (this.left * this.width * this.scale * (-1)) + 'px ' + (this.top * this.height * this.scale * (-1)) + 'px'
            elem.style.backgroundSize = 1536 * this.scale + 'px'
        } else {
            elem.style.backgroundColor = '#000000'
            elem.style.border = '1px dashed white'
        }

        elem.classList.add('box')
        if (this.select_effect)
            elem.classList.add('select_e')
        else
            elem.classList.add('select')

        if (this.selective) {
            elem.onclick = (e) => {
                if (this.flag_clicked == undefined || this.flag_clicked == null || this.flag_clicked == false) {
                    this.flag_clicked = true
                    selected_box = e.target

                    $('div').forEach(element => {
                        element.classList.remove('click')
                    });
                    e.target.classList.add('click')
                } else {
                    this.flag_clicked = false
                    selected_box = null

                    $('div').forEach(element => {
                        element.classList.remove('click')
                    });
                }
            }
        }

        return elem
    }
}