import { spawn } from "child_process";
import { Writable } from "stream";
import { launch, Browser, Page } from "puppeteer";
// import pathToFfmpeg from "ffmpeg-static";

// Used to suppress build errors. Replace with package ffmpeg-static if we decide
// to run animation tests again.
const pathToFfmpeg: any = {};

const ffmpegArgs = (fps: number) => [
  "-y",
  "-f",
  "image2pipe",
  "-r",
  `${+fps}`,
  "-i",
  "-",
  "-c:v",
  "libx265",
  "-auto-alt-ref",
  "0",
  "-pix_fmt",
  "yuva420p",
  "-metadata:s:v:0",
  'alpha_mode="1"',
];

const write = (stream: Writable, buffer: Buffer) =>
  new Promise((resolve, reject) => {
    stream.write(buffer, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

interface Options {
  browser?: Browser;
  page?: Page;
  output?: string;
  fps?: number;
  frames?: number;
  prepare?: (browser: Browser, page: Page) => Promise<void>;
  render?: (browser: Browser, page: Page, frame: number) => Promise<void>;
  ffmpeg?: string;
  format?: string;
  pipeOutput?: boolean;
  logEachFrame?: boolean;
}

export const record = async function(options: Options): Promise<void> {
  const browser = options.browser || (await launch());
  const page = options.page || (await browser.newPage());

  if (options.prepare) {
    await options.prepare(browser, page);
  }

  const ffmpegPath = options.ffmpeg || pathToFfmpeg;
  const fps = options.fps || 60;
  const frames = options.frames || fps * 5;

  const outFile = options.output;

  const args = ffmpegArgs(fps);

  if (options.format) {
    args.push("-f", options.format || "matroska");
  } else if (!outFile) {
    args.push("-f", "matroska");
  }

  args.push(outFile || "-");

  const ffmpeg = spawn(ffmpegPath, args);

  if (options.pipeOutput) {
    ffmpeg.stdout.pipe(process.stdout);
    ffmpeg.stderr.pipe(process.stderr);
  }

  const closed = new Promise<void>((resolve, reject) => {
    ffmpeg.on("error", (e: Error) => {
      console.error(e);
      reject(e);
    });
    ffmpeg.on("exit", (code: number) => {
      console.log("ffmpeg exit:", code);
      resolve();
    });
  });

  for (let i = 1; i <= frames; i += 1) {
    if (options.logEachFrame) {
      console.log(`[puppeteer-recorder] rendering frame ${i} of ${frames}.`);
    }

    if (options.render) {
      await options.render(browser, page, i);
    }

    const screenshot = await page.screenshot({ omitBackground: true });
    await write(ffmpeg.stdin, screenshot);
  }

  ffmpeg.stdin.end();
  return closed;
};
