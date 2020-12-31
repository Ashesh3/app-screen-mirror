/* eslint-disable no-undef */
const adb = require('./adb.js')

async function init() {
    if (await adb.adb_is_connected()) {
        $("#adb_is_connected").show('slow')
        $("#device_connected_msg").html(`Device is connected at <b>${(await adb.get_connected_device())}</b>`)
        await display_apps()
    }
    else {
        $("#adb_not_connected").show('slow')
    }
}

async function connect_device() {
    if (!(await adb.adb_is_connected())) {
        $("#adb_not_connected").hide('slow')
        try {
            $("#adb_connecting_progress").show('slow')
            $("#progress_status_msg").removeClass('text-danger')
            $("#adb_connecting_progress_bar").width('0%')
            $("#progress_status_msg").text("Initializing...")
            await adb.sleep(1000)
            $("#adb_connecting_progress_bar").width('25%')
            $("#progress_status_msg").text("Finding Device on Network...")
            $("#adb_connecting_progress_bar").width('50%')
            await adb.sleep(1000)
            var adb_host = await adb.get_adb_host();
            $("#progress_status_msg").text(`Connecting to ${adb_host} ...`)
            $("#adb_connecting_progress_bar").width('75%')
            await adb.sleep(1000)
            var res = await adb.adb_connect(adb_host)
            $("#progress_status_msg").text(res)
            $("#adb_connecting_progress_bar").width('100%')
            await adb.sleep(1000)
            $("#adb_connecting_progress").hide('slow')
            $("#adb_is_connected").show('slow')
            $("#device_connected_msg").html(`Device is connected at <b>${(await adb.get_connected_device())}</b>`)
            await display_apps()
        }
        catch (e) {
            console.log(e)
            $("#progress_status_msg").text(e)
            $("#progress_status_msg").addClass('text-danger')
            $("#adb_not_connected").show('slow')
        }
    }
}

function chunk(arr, size) {
    var subArrayCount = arr.length / size;
    var res = [];
    for (var i = 0; i < subArrayCount; i++) {
        var from = size * i;
        var to = (size * (1 + i));
        var sliced = arr.slice(from, to);
        res.push(sliced);
    }
    return res;
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

async function launch(package) {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    $("#adb_connecting_progress").show('slow')
    $("#progress_status_msg").text("Launching " + package + "...")
    $("#adb_connecting_progress_bar").width('25%')
    await adb.launch_package(package)
    $("#progress_status_msg").text("Unlocking Device...")
    $("#adb_connecting_progress_bar").width('50%')
    await adb.unlock_device();
    $("#progress_status_msg").text("Unlocking Device...")
    $("#adb_connecting_progress_bar").width('75%')
    await adb.start_scrcpy();
    $("#progress_status_msg").text("Locking Device...")
    $("#adb_connecting_progress_bar").width('100%')
    await adb.power_button();
    await adb.sleep(1000);
    $("#adb_connecting_progress").hide('slow')
    $("#progress_status_msg").text("")
    $("#adb_connecting_progress_bar").width('0%')
}

async function display_apps() {
    var app_list = await adb.list_all_apps()
    app_list = chunk(app_list, 4)
    var tableBody = $("#apps_table_body")
    var tableData = app_list
    for (var j = 0; j < tableData.length; j++) {
        rowData = tableData[j]
        var row = document.createElement('tr');
        for (var i = 0; i < rowData.length; i++) {
            cellData = rowData[i]
            var cell = document.createElement('td');
            var app_details = await adb.get_icon_and_name(cellData)
            var img = document.createElement('img');
            img.src = app_details.image
            img.width = 125
            eval('img.onclick = async function () { await launch("' + cellData + '") }')
            cell.appendChild(img);
            cell.appendChild(document.createElement('br'))
            cell.appendChild(document.createTextNode(decodeHtml(app_details.name)));
            row.appendChild(cell);
        }

        tableBody.append(row);
    }
}