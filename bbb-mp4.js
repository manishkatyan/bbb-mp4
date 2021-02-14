const puppeteer = require('puppeteer');
const Xvfb      = require('xvfb');
const fs = require('fs');
const os = require('os');
const homedir = os.homedir();
const platform = os.platform();
const { mp4_dir, webm_dir} = require('./env');
const spawn = require('child_process').spawn;

//Required to find the latest file (downloaded webm) in a directory
const glob = require('glob');

var xvfb        = new Xvfb({
    silent: false,
    xvfb_args: ["-screen", "0", "1280x800x24", "-ac", "-nolisten", "tcp", "-dpi", "96", "+extension", "RANDR"]
});
var width       = 1280;
var height      = 720;
var options     = {
  headless: false,
  args: [
    '--enable-usermedia-screen-capturing',
    '--allow-http-screen-capture',
    '--auto-select-desktop-capture-source=bbb-mp4',
    '--load-extension=' + __dirname,
    '--disable-extensions-except=' + __dirname,
    '--disable-infobars',
    '--no-sandbox',
    '--shm-size=1gb',
    '--disable-dev-shm-usage',
    '--start-fullscreen',
    '--app=https://www.google.com/',
    `--window-size=${width},${height}`,
  ],
}

if(platform == "linux"){
    options.executablePath = "/usr/bin/google-chrome"
}else if(platform == "darwin"){
    options.executablePath = "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
}

async function main() {
    let browser, page;

    try{
        if(platform == "linux"){
            xvfb.startSync()
        }

        var url = process.argv[2];
        if(!url){
            console.warn('URL undefined!');
            process.exit(1);
        }
        // Verify if recording URL has the correct format
        var urlRegex = new RegExp('^https?:\\/\\/.*\\/playback\\/presentation\\/2\\.0\\/playback.html\\?meetingId=[a-z0-9]{40}-[0-9]{13}');
        if(!urlRegex.test(url)){
            console.warn('Invalid recording URL!');
            process.exit(1);
        }

        var exportname = url.split("=")[1] + '.webm';
	var meetingId = url.split("=")[1];
        var duration = 0

        browser = await puppeteer.launch(options)
        const pages = await browser.pages()

        page = pages[0]

        page.on('console', msg => {
            var m = msg.text();
            console.log('PAGE LOG:', m) // uncomment if you need
        });

        await page._client.send('Emulation.clearDeviceMetricsOverride')

	//Set the download location of webm recordings.
	await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: webm_dir + meetingId})

        // Catch URL unreachable error
        await page.goto(url, {waitUntil: 'networkidle2'}).catch(e => {
            console.error('Recording URL unreachable!');
            process.exit(2);
        })
        await page.setBypassCSP(true)

        // Check if recording exists (search "Recording not found" message)
        var loadMsg = await page.evaluate(() => {
            return document.getElementById("load-msg").textContent;
        });
        if(loadMsg == "Recording not found"){
            console.warn("Recording not found!");
            process.exit(1);
        }

        // Get recording duration
        var recDuration = await page.evaluate(() => {
            return document.getElementById("video").duration;
        });
        // If duration was set to 0 or is greater than recDuration, use recDuration value
        if(duration == 0 || duration > recDuration){
            duration = recDuration;
        }

        await page.waitForSelector('button[class=acorn-play-button]');
        await page.$eval('#navbar', element => element.style.display = "none");
        await page.$eval('#copyright', element => element.style.display = "none");
        await page.$eval('.acorn-controls', element => element.style.opacity = "0");
        await page.click('button[class=acorn-play-button]', {waitUntil: 'domcontentloaded'});

        await page.evaluate((x) => {
            console.log("REC_START");
            window.postMessage({type: 'REC_START'}, '*')
        })

        // Perform any actions that have to be captured in the exported video
        await page.waitFor((duration * 1000))

        await page.evaluate(filename=>{
            window.postMessage({type: 'SET_EXPORT_PATH', filename: filename}, '*')
            window.postMessage({type: 'REC_STOP'}, '*')
        }, exportname)

        // Wait for download of webm to complete
        await page.waitForSelector('html.downloadComplete', {timeout: 0})

	console.log("DownloadPath: " + webm_dir + meetingId);


        convertAndCopy(exportname)

    }catch(err) {
        console.log(err)
    } finally {
        page.close && await page.close()
        browser.close && await browser.close()

        if(platform == "linux"){
            xvfb.stopSync()
        }
    }
}

main()

function convertAndCopy(filename){

    var copyFromPath = webm_dir;
    var onlyfileName = filename.split(".webm")
    var mp4File = onlyfileName[0] + ".mp4"
    var copyTo = mp4_dir + mp4File;

    var copyFrom = glob.sync(webm_dir + onlyfileName[0] + '/*webm').map(name => ({name, ctime: fs.statSync(name).ctime})).sort((a, b) => b.ctime - a.ctime)[0].name;

    if(!fs.existsSync(mp4_dir)){
        fs.mkdirSync(mp4_dir);
    }

    console.log(copyTo);
    console.log(copyFrom);

    const ls = spawn('ffmpeg',
        [   '-nostdin',
            '-i "' + copyFrom + '"',
            '-c:v ',
            'copy',
            '"'+ copyTo +'"'
        ],
        {
            shell: true
        }

    );

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if(code == 0)
        {
            console.log("Convertion done to here: " + copyTo)
            //fs.unlinkSync(copyFrom);
	    fs.rmdirSync(webm + onlyfileName[0], { recursive: true });
            console.log('successfully deleted ' + webm + onlyfileName[0]);
        }

    });

}

