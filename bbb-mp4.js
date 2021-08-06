const puppeteer = require('puppeteer');
const child_process = require('child_process');
const Xvfb = require('xvfb');

// Generate randome display port number to avoide xvfb failure
var disp_num = Math.floor(Math.random() * (200 - 99) + 99);
var xvfb = new Xvfb({
    displayNum: disp_num,
    silent: true,
    xvfb_args: ["-screen", "0", "1280x800x24", "-ac", "-nolisten", "tcp", "-dpi", "96", "+extension", "RANDR"]
});
var width = 1280;
var height = 800;
var options = {
    headless: false,
    args: [
        '--disable-infobars',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--start-fullscreen',
        '--app=https://www.google.com/',
        `--window-size=${width},${height}`,
    ],
}
options.executablePath = "/usr/bin/google-chrome"
async function main() {
    let browser, page;
    try {
        xvfb.startSync()

        var url = process.argv[2];
        if (!url) {
            console.warn('URL undefined!');
            process.exit(1);
        }
        // Validate URL 
        var urlRegex = new RegExp('^https?:\\/\\/.*\\/playback\\/presentation\\/2\\.3\\/[a-z0-9]{40}-[0-9]{13}');
        if (!urlRegex.test(url)) {
            console.warn('Invalid recording URL for bbb 2.3!');
            console.warn(url)
            process.exit(1);
        }

        // Set exportname
        var exportname = new URL(url).pathname.split("/")[4]

        // set duration to 0 
        var duration = 0

        browser = await puppeteer.launch(options)
        const pages = await browser.pages()

        page = pages[0]

        page.on('console', msg => {
            var m = msg.text();
            console.log('PAGE LOG:', m) // uncomment if you need
        });

        await page._client.send('Emulation.clearDeviceMetricsOverride')
            // Catch URL unreachable error
        await page.goto(url, { waitUntil: 'networkidle2' }).catch(e => {
            console.error('Recording URL unreachable!');
            process.exit(2);
        })
        await page.setBypassCSP(true)

        // Check if recording exists (search "404" message)
        await page.waitForTimeout(5 * 1000)
        try {
            var loadMsg = await page.$eval('.error-code', el => el.textContent);
            console.log(loadMsg)
            if (loadMsg == "404") {
                console.warn("Recording not found!");
                process.exit(1);
            }
        } catch (err) {
            console.log("Recording found")
        }

        // Get recording duration
        const recDuration = await page.evaluate(() => {
            return document.getElementById("vjs_video_3_html5_api").duration
        });
        duration = recDuration


        console.log(duration)

        await page.waitForSelector('button[class=vjs-big-play-button]');
        await page.$eval('.bottom-content', element => element.style.display = "none");
        await page.$eval('.fullscreen-button', element => element.style.opacity = "0");
        await page.$eval('.right', element => element.style.opacity = "0");
        await page.$eval('.vjs-control-bar', element => element.style.opacity = "0");
        await page.click('button[class=vjs-big-play-button]', { waitUntil: 'domcontentloaded' });

        //  Start capturing screen with ffmpeg
        const ls = child_process.spawn('sh', ['ffmpeg-cmd.sh', ' ',
            `${duration}`, ' ',
            `${exportname}`, ' ',
            `${disp_num}`
        ], {
            shell: true
        });

        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

        await page.waitFor((duration * 1000))
    } catch (err) {
        console.log(err)
    } finally {
        page.close && await page.close()
        browser.close && await browser.close()
            // Stop xvfb after browser close
        xvfb.stopSync()
    }
}

main()