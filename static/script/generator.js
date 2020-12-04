var root = $('#root')
var img_src = 'static/img/sprites.png'
var size = { original: { x: 0, y: 0 }, divided: { x: 0, y: 0 } }
var box_size = 48
var scale = 0.5
var game_size = 30
var selected_box = null
var context_menu_children = []
var clipboard = []
var pastle_flag = false

var cut_flag = false
var cut_boxes = []

function $(param) {
    if (param.charAt(0) == '<' && param.charAt(param.length - 1) == '>')
        return document.createElement(param.substring(0, param.length - 1).substr(1))
    else if (document.querySelectorAll(param).length == 1)
        return document.querySelectorAll(param)[0]
    else if (document.querySelectorAll(param).length > 1)
        return document.querySelectorAll(param)
    else
        return null
}

(function () {
    create_ui()
    create_events()
})()

function create_ui() {
    var panel = $('<div>')
    panel.setAttribute('id', 'panel')
    panel.classList.add('container')
    panel.style.width = 16 * 24 + 'px';
    root.appendChild(panel)

    for (var y = 0; y < 20; y++) {
        for (var x = 0; x < 16; x++) {
            var elem = new Box({ src: img_src, left: x, top: y, scale: scale }).getImage()
            elem.style.left = (x * box_size * scale) + 'px'
            elem.style.top = (y * box_size * scale) + 'px'
            elem.onclick = (e) => { set_box(e) }
            $('#panel').appendChild(elem)
        }
        for (var x = 0; x < 16; x++) {
            var elem = new Box({ src: img_src, left: (x + 16), top: y, scale: scale }).getImage()
            elem.style.left = (x * box_size * scale) + 'px'
            elem.style.top = ((y + 20) * box_size * scale) + 'px'
            elem.onclick = (e) => { set_box(e) }
            $('#panel').appendChild(elem)
        }
    }

    var game_container = $('<div>')
    game_container.classList.add('game_container')
    game_container.setAttribute('id', 'game-container')
    game_container.style.left = 16 * (box_size * scale) + 50 + 'px'
    root.appendChild(game_container)

    var automat = $('<input>')
    automat.setAttribute('type', 'checkbox')
    automat.classList.add('automat')
    automat.setAttribute('id', 'automat')
    $('#game-container').appendChild(automat)

    for (let y = 0; y < game_size; y++) {
        for (let x = 0; x < game_size; x++) {
            var elem = new Box({ scale: scale, select_effect: false, selective: true }).getImage()
            elem.style.left = (x * box_size * scale) + 'px'
            elem.style.top = (y * box_size * scale) + 'px'
            elem.position = { x: x, y: y }
            elem.setAttribute('x', x)
            elem.setAttribute('y', y)
            $('#game-container').appendChild(elem)
        }
    }

    var file = $('<input>')
    file.setAttribute('type', 'file')
    file.setAttribute('id', 'file')
    $('body').appendChild(file)
}
var field
function create_events() {
    field = $('<div>')
    field.classList.add('select-field')
    $('body').appendChild(field)

    var draw = false
    var pos = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }
    $('#game-container').onmousedown = e => {
        draw = true
        pos.start.x = e.pageX
        pos.start.y = e.pageY
        pos.end.x = e.pageX + 5
        pos.end.y = e.pageY + 5
    }
    document.onmousemove = e => {
        if (draw === true) {
            console.log('move')
            var flip_x, flip_y
            if (pos.start.x > pos.end.x)
                flip_x = true
            else
                flip_x = false
            if (pos.start.y > pos.end.y)
                flip_y = true
            else
                flip_y = false

            pos.end.x = e.pageX
            pos.end.y = e.pageY

            draw_select(
                (flip_x === false) ? pos.start.x : pos.end.x,
                (flip_y === false) ? pos.start.y : pos.end.y,
                (flip_x === false) ? pos.end.x - pos.start.x : pos.start.x - pos.end.x,
                (flip_y === false) ? pos.end.y - pos.start.y : pos.start.y - pos.end.y
            )
        }
    }
    document.onmouseup = e => {
        if (draw === true) {
            console.log('out')
            draw_select(0, 0, 0, 0, false)
            draw = false
        }
    }

    // Undo
    var option_undo = $('<div>')
    option_undo.classList.add('context_option')
    option_undo.innerText = "Undo"
    option_undo.onclick = e => {

    }
    context_menu_children.push(option_undo)

    // Redo
    var option_redo = $('<div>')
    option_redo.classList.add('context_option')
    option_redo.innerText = "Redo"
    option_redo.onclick = e => {

    }
    context_menu_children.push(option_redo)

    // Copy
    var option_copy = $('<div>')
    option_copy.classList.add('context_option')
    option_copy.innerText = "Copy"
    option_copy.onclick = e => {
        clipboard = (Array.isArray(selected_box)) ? selected_box : [selected_box]
    }
    context_menu_children.push(option_copy)

    // Cut
    var option_cut = $('<div>')
    option_cut.classList.add('context_option')
    option_cut.innerText = "Cut"
    option_cut.onclick = e => {
        clipboard = (Array.isArray(selected_box)) ? selected_box : [selected_box]


        cut_boxes = (Array.isArray(selected_box)) ? selected_box : [selected_box]
        cut_flag = true
    }
    context_menu_children.push(option_cut)

    // Pastlredfg
    var option_pastle = $('<div>')
    option_pastle.classList.add('context_option')
    option_pastle.innerText = "Pastle"
    option_pastle.onmousedown = e => {
        $('.game_container').addEventListener('click', pastle)
    }
    option_pastle.onmouseup = e => {
        pastle_flag = true
    }

    context_menu_children.push(option_pastle)

    // Remove
    var option_remove = $('<div>')
    option_remove.classList.add('context_option')
    option_remove.innerText = "Remove"
    option_remove.onclick = e => {
        if (!Array.isArray(selected_box))
            selected_box.style.background = 'black'
        else
            selected_box.forEach(_e => {
                _e.style.background = 'black'
            })
    }
    context_menu_children.push(option_remove)

    // Import
    var option_import = $('<div>')
    option_import.classList.add('context_option')
    option_import.innerText = "Import"
    option_import.onclick = e => {
        $("#file").click()
    }
    $("#file").addEventListener('change', () => {
        startRead()
    })
    context_menu_children.push(option_import)

    // Export
    var option_export = $('<div>')
    option_export.classList.add('context_option')
    option_export.innerText = "Export"
    option_export.onclick = e => {
        var _content = []
        $('.select').forEach(_elem => {
            _content.push({
                background: _elem.style.background,
                x: _elem.getAttribute('x'),
                y: _elem.getAttribute('y')
            })
        })

        var filename = 'data.txt'

        var file = new Blob([JSON.stringify(_content)], { type: 'plain/text' })
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
    context_menu_children.push(option_export)


    var contextmenu = $('<div>')
    contextmenu.classList.add('context_menu')

    var boxes = $('.box[x][y]')
    boxes.forEach(box => {
        box.oncontextmenu = e => {
            e.preventDefault();

            context_menu_children.forEach(e => {
                contextmenu.appendChild(e)
            })
            //console.log(e)
            contextmenu.style.top = e.clientY + 'px'
            contextmenu.style.left = e.clientX + 'px'
            $('body').appendChild(contextmenu)
        }
    })

    document.onclick = () => {
        try {
            $('body').removeChild(contextmenu)
        } catch (e) {

        }
    }
}

var pastle = function (e) {
    if (pastle_flag === false || Array.isArray(selected_box))
        return

    console.log(e.target)

    var x = parseInt(selected_box.getAttribute('x'))
    var y = parseInt(selected_box.getAttribute('y'))

    var _x = parseInt(clipboard[0].getAttribute('x'))
    var _y = parseInt(clipboard[0].getAttribute('y'))

    var x_remove = _x - x
    var y_remove = _y - y
    //console.log(x_remove, y_remove)

    clipboard.forEach(elem => {
        var __x = parseInt(elem.getAttribute('x'))
        var __y = parseInt(elem.getAttribute('y'))
        try {
            var _box = $(".box[x='" + (__x - x_remove) + "'][y='" + (__y - y_remove) + "']")
            _box.style.background = (elem.style.background != '') ? elem.style.background : 'black'
        } catch (e) {
            console.log(e)
        }
    })

    if (cut_flag === true) {
        cut_flag = false
        cut_boxes.forEach(_e => {
            _e.style.background = 'black'
        })
    }

    pastle_flag = false
    $('.game_container').removeEventListener('click', pastle)
}

function draw_select(x, y, width, height, select = true) {
    field.style.top = y + 'px'
    field.style.left = x + 'px'
    field.style.width = width + 'px'
    field.style.height = height + 'px'
    if (select)
        runtime_select(x, y, width, height)
}

function runtime_select(x, y, width, height) {
    // clear selected
    if ($('.click')) {
        var sels = $('.click').length > 1 ? $('.click') : []
        sels.forEach(sel => {
            sel.classList.remove('click')
        })
    }

    var elems = $('.box[x][y]')
    selected_box = []
    elems.forEach(elem => {
        var rect = elem.getBoundingClientRect()
        rect.x = rect.x + window.scrollX
        rect.y = rect.top + window.scrollY
        if (rect.x + rect.width > x && rect.x < x + width && rect.y + rect.height > y && rect.y < y + height) {
            elem.classList.add('click')
            selected_box.push(elem)
        }
    });
}

function set_box(e) {
    if (selected_box == null)
        return

    e.target.tmp = { x: 0, y: 0 }
    if (selected_box.length > 1) {
        selected_box.forEach(elem => {
            elem.style.background = e.target.style.background
        })
    } else {
        selected_box.style.background = e.target.style.background

        if ($('#automat').checked) {
            var _x, _y
            if (selected_box.position.x >= game_size - 1) {
                _x = 0
                _y = selected_box.position.y + 1
            } else {
                _x = selected_box.position.x + 1
                _y = selected_box.position.y
            }

            selected_box.classList.remove('click')
            selected_box = $("div[x='" + _x + "'][y='" + _y + "']")
            selected_box.classList.add('click')
        }
    }
}

function startRead() {
    // obtain input element through DOM

    var file = document.getElementById('file').files[0];
    if (file) {
        console.log('Reading file', file)
        getAsText(file);
    }
}

function getAsText(readFile) {

    var reader = new FileReader();

    // Read file into memory as UTF-16
    reader.readAsText(readFile, "UTF-8");

    // Handle progress, success, and errors
    reader.onprogress = updateProgress;
    reader.onload = loaded;
    reader.onerror = errorHandler;
}

function updateProgress(evt) {
    if (evt.lengthComputable) {
        // evt.loaded and evt.total are ProgressEvent properties
        var loaded = (evt.loaded / evt.total);
        if (loaded < 1) {
            // Increase the prog bar length
            // style.width = (loaded * 200) + "px";
        }
    }
}

function loaded(evt) {
    // Obtain the read file data
    var fileString = evt.target.result;

    var content = JSON.parse(fileString)
    content.forEach(elem => {
        $(".box[x='"+elem.x+"'][y='"+elem.y+"']").style.background = (elem.background != '')? elem.background : 'black'
    })
    // xhr.send(fileString)
}

function errorHandler(evt) {
    console.log(evt)
    if (evt.target.error.name == "NotReadableError") {
        // The file could not be read
    }
}