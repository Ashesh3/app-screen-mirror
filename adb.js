const exec = require('await-exec')
const isPortReachable = require('is-port-reachable');
const got = require('got');
const fs = require('fs');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addslashes(str) {
    return (str + '').replace(/[\\']/g, '"\'"')
}

async function exec_shell(command, sudo = false) {
    if (sudo)
        return await exec("adb shell \"su -c '" + addslashes(command) + "'\"")
    else
        return await exec("adb shell \"" + addslashes(command) + "\"")
}

async function power_button() {
    await exec_shell('input keyevent 26')
}

async function show_keypass() {
    await exec_shell('input swipe 600 600 0 0')
}

async function start_touch() {
    await exec_shell('sendevent /dev/input/event1 3 57 990')
}

async function send_cords(x, y) {
    await exec_shell('sendevent /dev/input/event1 3 53 ' + x);
    await exec_shell('sendevent /dev/input/event1 3 54 ' + y);
    await exec_shell('sendevent /dev/input/event1 3 58 1');
    await exec_shell('sendevent /dev/input/event1 1 330 50');
    await exec_shell('sendevent /dev/input/event1 0 0 0');
}

async function finish_touch() {
    await exec_shell('sendevent /dev/input/event1 3 57 4294967295');
    await exec_shell('sendevent /dev/input/event1 0 0 0');
}

async function launch_package(package) {
    await exec_shell('monkey -p ' + package + ' -v 1');
}

async function unlock_device() {
    //Enter Unlock code here or skip it
    //await power_button()
    //await show_keypass()
    //await start_touch()
    //await finish_touch();
}

async function adb_connect(ip) {
    return (await exec("adb connect " + ip)).stdout
}

async function start_scrcpy() {
    await exec("scrcpy")
}

async function get_adb_host() {
    for (var i = 0; i < 24; i++) {
        console.log(`Probing 192.168.1.${i * 10} - 192.168.1.${i * 10 + 9}`)
        for (var j = 0; j < 10; j++) {
            if (i == 0 && j < 2)
                continue
            var ip = `192.168.1.${i * 10 + j}`
            var res = await isPortReachable(5555, { host: ip, timeout: 500 });
            if (res) {
                console.log(`Device Found -> ${ip}`)
                return ip
            }
        }
        await sleep(1000);
    }
}

async function adb_is_connected() {
    var adb_devices = (await exec("adb devices")).stdout.trim()
    return !(adb_devices == "List of devices attached") && !(adb_devices.includes("offline"))
}

async function get_connected_device() {
    return (await exec("adb devices")).stdout.trim().split("\n")[1].split("device")[0].trim()
}

async function list_all_apps() {
    return (await exec_shell("pm list packages -3 | sed 's/^package://'", false)).stdout.split('\r\n').slice(0, -1);
}

async function get_icon_and_name(package_name) {
    if (!fs.existsSync('icon_name_cache.json'))
        fs.writeFileSync('icon_name_cache.json', '{}')
    var icon_cache = JSON.parse(fs.readFileSync("icon_name_cache.json"))
    if (!icon_cache[package_name]) {
        try {
            var res = await got('https://play.google.com/store/apps/details?id=' + package_name);
            var app_name = res.body.split('<title id="main-title">')[1].split('</title>')[0].split(' -')[0]
            var img_url = res.body.split('alt="Cover art"')[0].split('<img src="')[1].split('" ')[0]
        } catch (e) {
            app_name = package_name
            img_url = 'https://play-lh.googleusercontent.com/4Iwf8qJ5MIMgCnFfZYtY4j6xlR3ZW9vBY4oK5wEPSjdJDGWsPKij5YiUhfdGiVPC-NeV=s180-rw'
        }
        icon_cache[package_name] = {
            name: app_name,
            image: img_url
        }
        fs.writeFileSync('icon_name_cache.json', JSON.stringify(icon_cache))
        return {
            name: app_name,
            image: img_url
        }
    }
    else
        return icon_cache[package_name]


}

module.exports = {
    sleep,
    addslashes,
    exec_shell,
    power_button,
    show_keypass,
    start_touch,
    send_cords,
    finish_touch,
    launch_package,
    unlock_device,
    adb_connect,
    start_scrcpy,
    get_adb_host,
    adb_is_connected,
    get_connected_device,
    list_all_apps,
    get_icon_and_name
}
