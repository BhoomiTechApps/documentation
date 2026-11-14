// Sample material for the OCR Studio manual: two book pages (clean, and crooked + faded)
// and a phone photo of a page taken at an angle.
const { chromium } = require("playwright");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const OUT = process.env.SAMPLES || require("path").join(__dirname, "samples");

const page = (head, paras, num) => `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#fffdf6}
  .p{width:1100px;height:1560px;box-sizing:border-box;padding:110px 120px;font-family:'Noto Serif Bengali';color:#1d1a16;position:relative}
  .rh{font-size:24px;text-align:center;color:#444;border-bottom:1px solid #777;padding-bottom:10px;margin-bottom:46px}
  h1{font-size:44px;text-align:center;margin:0 0 34px}
  p{font-size:31px;line-height:1.72;text-align:justify;margin:0 0 22px;text-indent:52px}
  .n{position:absolute;bottom:80px;left:0;right:0;text-align:center;font-size:26px}
</style></head><body><div class="p"><div class="rh">${head}</div>${paras}<div class="n">${num}</div></div></body></html>`;

const P1 = `<h1>নদীর ধারে একটি গ্রাম</h1>
<p>পাহাড়ের কোলে ছোট একটি নদী বয়ে চলেছে। নদীর ধারে আমাদের গ্রাম, চারদিকে ধানের খেত আর বাঁশের ঝাড়। ভোরবেলা পাখির ডাকে গ্রামের ঘুম ভাঙে।</p>
<p>গ্রামের মানুষ সহজ সরল। সকালে তারা খেতে যায়, দুপুরে গাছের ছায়ায় বসে গল্প করে। সন্ধ্যায় উঠোনে বসে বুড়ো দাদু পুরোনো দিনের কথা শোনান।</p>
<p>দাদু বলেন, আগে এই নদীতে নৌকা চলত। দূরের হাট থেকে নৌকায় করে লবণ, কাপড় আর বই আসত। গ্রামের ছেলেমেয়েরা নদীর ঘাটে দাঁড়িয়ে নৌকার অপেক্ষা করত।</p>
<p>সেই সব গল্প কোথাও লেখা নেই। দাদুর মুখে মুখে সেগুলো বেঁচে আছে। তাই আমরা ঠিক করেছি, গ্রামের সব গল্প লিখে রাখব, যাতে পরের প্রজন্ম সেগুলো পড়তে পারে।</p>`;
const P2 = `<p>বর্ষাকালে নদী ফুলে ওঠে। তখন খেতের আল ডুবে যায়, পথঘাট কাদায় ভরে থাকে। ছেলেরা কলাগাছের ভেলা বানিয়ে জলে ভাসে, আর মায়েরা উঠোনে বসে কাঁথা সেলাই করেন।</p>
<p>শীতকালে আবার অন্য রূপ। ভোরে কুয়াশায় চারদিক ঢাকা থাকে, খেজুর গাছ থেকে রস নামানো হয়। সেই রস জ্বাল দিয়ে গুড় তৈরি হয়, আর ঘরে ঘরে পিঠার গন্ধ ছড়িয়ে পড়ে।</p>
<p>বসন্তে গ্রামের মেলা বসে। দূর দূর থেকে লোক আসে, নাগরদোলা ঘোরে, মাটির পুতুল আর বাঁশির দোকান সাজানো হয়। মেলার শেষ দিনে যাত্রাপালা হয়, সারা রাত ধরে গান আর অভিনয় চলে।</p>
<p>এইভাবে ঋতুর সঙ্গে সঙ্গে গ্রামের জীবন বদলায়। কিন্তু মানুষের ভালোবাসা আর একে অপরের পাশে দাঁড়ানোর অভ্যাস কখনো বদলায় না।</p>`;
const P3 = `<h1>দাদুর গল্প</h1>
<p>এক সময় এই গ্রামে একজন বিখ্যাত কবি থাকতেন। তিনি নদীর ধারে বসে গান লিখতেন। তাঁর গান আজও গ্রামের মানুষ গায়, যদিও অনেকেই তাঁর নাম জানে না।</p>
<p>দাদু বলেন, কবির খাতাগুলো একটি পুরোনো কাঠের বাক্সে রাখা ছিল। বন্যার সময় সেই বাক্স ভেসে যায়। শুধু কয়েকটি পাতা রক্ষা পেয়েছিল।</p>
<p>সেই পাতাগুলো এখন গ্রামের পাঠাগারে আছে। আমরা সেগুলো ছবি তুলে কম্পিউটারে লিখে রাখছি।</p>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 1560 } });
  const render = async (html, file) => { await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300); await p.screenshot({ path: file }); };
  await render(page("গ্রামবাংলার কথা", P1, "১"), OUT + "/raw1.png");
  await render(page("গ্রামবাংলার কথা", P2, "২"), OUT + "/raw2.png");
  await render(page("গ্রামবাংলার কথা", P3, "৩৭"), OUT + "/raw3.png");

  // Page 1: a clean scan, slightly warm paper.
  await sharp(OUT + "/raw1.png").modulate({ brightness: 0.99 }).tint({ r: 255, g: 250, b: 238 }).jpeg({ quality: 88 }).toFile(OUT + "/page1.jpg");
  // A crooked scan with clear print (for Deskew).
  await sharp(OUT + "/raw2.png").tint({ r: 255, g: 250, b: 238 }).rotate(2.4, { background: "#fdf9ee" }).jpeg({ quality: 85 }).toFile(OUT + "/page2-crooked.jpg");
  // Page 2: crooked, faded print on yellowed, uneven paper.
  const faded = await sharp(OUT + "/raw2.png").linear(0.42, 150).tint({ r: 238, g: 214, b: 160 }).rotate(2.4, { background: "#f2e3bd" }).toBuffer();
  const meta = await sharp(faded).metadata();
  const shade = Buffer.from(`<svg width="${meta.width}" height="${meta.height}"><defs><radialGradient id="g" cx="0.15" cy="0.2" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#6b4a12" stop-opacity="0.32"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
  await sharp(faded).composite([{ input: shade }]).jpeg({ quality: 80 }).toFile(OUT + "/page2.jpg");

  // Page 3: a phone photo of a page on a table, at an angle, with a shadow.
  const b64 = fs.readFileSync(OUT + "/raw3.png").toString("base64");
  await p.setViewportSize({ width: 1400, height: 1700 });
  await p.setContent(`<body style="margin:0;background:linear-gradient(160deg,#6d4b33,#3e2a1c);width:1400px;height:1700px;overflow:hidden;perspective:1800px">
    <img src="data:image/png;base64,${b64}" style="position:absolute;left:170px;top:120px;width:1040px;transform:rotateX(16deg) rotateZ(-4deg) rotateY(-7deg);transform-origin:50% 60%;box-shadow:0 30px 60px rgba(0,0,0,.55);filter:brightness(.93) sepia(.12)">
    <div style="position:absolute;inset:0;background:linear-gradient(115deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.28) 75%)"></div></body>`);
  await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + "/raw-photo.png" });
  await sharp(OUT + "/raw-photo.png").jpeg({ quality: 85 }).toFile(OUT + "/photo.jpg");
  await b.close();

  // A two-page "scanned book" PDF.
  const pdf = await PDFDocument.create();
  for (const f of ["page1.jpg", "page2.jpg"]) {
    const img = await pdf.embedJpg(fs.readFileSync(OUT + "/" + f));
    const pg = pdf.addPage([img.width * 0.48, img.height * 0.48]);
    pg.drawImage(img, { x: 0, y: 0, width: pg.getWidth(), height: pg.getHeight() });
  }
  fs.writeFileSync(OUT + "/gramer-katha.pdf", await pdf.save());
  console.log("ok");
})();
