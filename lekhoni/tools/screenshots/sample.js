// Builds the sample Lekhoni document used for the manual's screenshots.
const sharp = require("sharp");

const BOX = {
  fontFamily: "'Noto Serif Bengali', serif", fontSize: 12, bold: false, italic: false, underline: false, strike: false,
  align: "left", color: "#1b1d22", lineHeight: 1.45, letterSpacing: 0, wordSpacing: 0, indentFirst: 0, indentLeft: 0,
  indentRight: 0, spaceBefore: 0, spaceAfter: 1.5, textCase: "none", dropCap: 0, olStyle: "bengali", ulStyle: "disc",
  rotation: 0, opacity: 1, locked: false, wrap: "none", wrapOffset: 3, link: null,
};
const text = (o) => Object.assign({ type: "text", columns: 1, columnGap: 5, inset: 2, valign: "top", frameFill: null,
  frameBorderWidth: 0, frameBorderColor: "#000000", ignoreWrap: false, hyphenate: false, next: null, text: "" }, BOX, o);
const shape = (o) => Object.assign({ type: "shape", fillColor: "#FFFFFF", strokeColor: "#000000", strokeWidth: 1, strokeDasharray: "none", dash: "solid" }, BOX, o);
const P = (s, st) => `<p${st ? ` style="${st}"` : ""}>${s}</p>`;

async function picture() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c98b"/><stop offset="1" stop-color="#fbe9d0"/></linearGradient></defs>
    <rect width="900" height="640" fill="url(#sky)"/>
    <circle cx="640" cy="230" r="80" fill="#e9874b"/>
    <path d="M0 400 Q 180 300 360 390 T 720 370 T 900 380 V640 H0Z" fill="#8fae72"/>
    <path d="M0 470 Q 220 400 450 470 T 900 450 V640 H0Z" fill="#5f8a55"/>
    <path d="M0 560 Q 300 500 600 560 T 900 540 V640 H0Z" fill="#3f6b45"/>
    <path d="M120 640 C 260 560 380 540 520 520" stroke="#d9c9a3" stroke-width="22" fill="none"/>
    <g fill="#2c4a33"><rect x="700" y="430" width="8" height="40"/><circle cx="704" cy="420" r="26"/><rect x="760" y="440" width="7" height="34"/><circle cx="763" cy="432" r="20"/></g>
    <g fill="#a6402d"><path d="M230 470 l40 -30 l40 30 z"/><rect x="240" y="470" width="60" height="38"/></g>
    <rect x="262" y="485" width="16" height="23" fill="#5a2a1d"/>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer();
  return "data:image/jpeg;base64," + buf.toString("base64");
}

async function build() {
  const img = await picture();
  const story =
    P('<span class="lk-dc">গ্রা</span>মের পথ ধরে হাঁটলে চোখে পড়ে সবুজ ধানখেত, ছোট নদী আর মাটির ঘর। এই সাধারণ দৃশ্যের মধ্যেই লুকিয়ে আছে আমাদের ভাষা ও সংস্কৃতির শিকড়। লেখনী এমন একটি সরঞ্জাম, যা দিয়ে সেই গল্পগুলো সহজে ছাপার পাতায় তুলে আনা যায়।') +
    P('পত্রিকা, বই, পোস্টার কিংবা নিমন্ত্রণপত্র — সবকিছুই তৈরি করা যায় ব্রাউজারেই। কোনো কিছু ইনস্টল করতে হয় না, <b>ইন্টারনেট না থাকলেও কাজ চলে</b>।') +
    P('ফোনেটিক টাইপিং চালু থাকলে ইংরেজি অক্ষরে লিখলেই বাংলা বা অসমীয়া লেখা তৈরি হয়। যুক্তাক্ষর, রেফ, য-ফলা সবই নিজে থেকে বসে যায়।') +
    P('লেখা এক ফ্রেম থেকে আরেক ফ্রেমে, এমনকি পরের পাতাতেও গড়িয়ে যেতে পারে। ছবির চারপাশে লেখা ঘুরিয়ে দেওয়া যায়, টেবিল বসানো যায়, আর শেষে পিডিএফ বা ওয়ার্ড ফাইল হিসেবে সংরক্ষণ করা যায়।') +
    P('ছাপাখানায় পাঠানোর আগে পাতার মাপ, মার্জিন, ব্লিড আর ক্রপ মার্ক ঠিক করে নেওয়া যায় পেজ সেটআপ থেকে। প্রতিটি পাতায় শিরোনাম, পাদটীকা ও পৃষ্ঠাসংখ্যা বাংলা অঙ্কে নিজে থেকেই বসে।') +
    P('সবচেয়ে বড় কথা, কাজ হারানোর ভয় নেই। লেখনী প্রতিটি পরিবর্তন ব্রাউজারে নিজে থেকে রেখে দেয়, আর চাইলে পুরো প্রকল্প একটি ফাইলে ডিস্কে সংরক্ষণ করা যায়।') +
    P('নতুন লেখকদের জন্য পরামর্শ: আগে লেখাটি সম্পূর্ণ করুন, তারপর অনুচ্ছেদের শৈলী বেছে নিয়ে নকশায় মন দিন। এতে সময় বাঁচে, আর পুরো পত্রিকার চেহারা একরকম থাকে।');

  const cells = [["জেলা", "পাঠক", "পছন্দের বিভাগ"], ["কামরূপ", "১২০", "গল্প"], ["নদিয়া", "৯৫", "কবিতা"], ["কাছাড়", "৮০", "প্রবন্ধ"], ["ঢাকা", "১৪৫", "সম্পাদকীয়"]]
    .flatMap((row, r) => row.map((t, c) => ({ id: `c${r}_${c}`, row: r, col: c, text: t, bgColor: r === 0 ? "#2C6E67" : r % 2 ? "#FFFFFF" : "#EEF5F3",
      textColor: r === 0 ? "#FFFFFF" : "#1b1d22", bold: r === 0, align: c === 1 ? "right" : "left", valign: "middle", lineHeight: 1.3,
      letterSpacing: 0, wordSpacing: 0, indentLeft: 0, indentRight: 0, indentFirst: 0 })));

  return {
    title: "লেখনী পত্রিকা — কার্তিক সংখ্যা", lang: "bn", phonetic: true, pageW: 210, pageH: 297,
    margins: { top: 20, right: 18, bottom: 20, left: 18 }, gutter: { size: 0, mode: "alternate" }, columns: 2, columnGap: 6,
    guides: [], showMarginGuides: true, pageBg: "#FFFFFF", bleed: 0, cropMarks: false, hfFont: "'Noto Sans Bengali', sans-serif",
    header: { enabled: true, text: "লেখনী পত্রিকা · কার্তিক সংখ্যা", showOnFirst: false, align: "outside", size: 9, color: "#766B58", rule: true },
    footer: { enabled: false, text: "", showOnFirst: true, align: "center", size: 9, color: "#766B58", rule: false },
    pageNumber: { enabled: true, position: "bottom-outside", format: "Page {page}", style: "native", startAt: 1, size: 9, offset: 10 },
    customFonts: [],
    pages: [
      { id: "p1", boxes: [
        text({ id: "title", x: 18, y: 16, w: 174, h: 21, fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: 30, bold: true, align: "center", color: "#A6402D", lineHeight: 1.2, styleId: "st-h1", text: P("লেখনী পত্রিকা") }),
        text({ id: "sub", x: 18, y: 37, w: 174, h: 11.5, fontSize: 11, italic: true, align: "center", color: "#766B58", text: P("বাংলা ও অসমীয়া প্রকাশনার সহজ সঙ্গী") }),
        shape({ id: "rule", shapeType: "line", lineDir: "h", lineEnds: "none", x: 18, y: 49, w: 174, h: 3, strokeColor: "#A6402D", strokeWidth: 1.25 }),
        text({ id: "cap", x: 18, y: 114.5, w: 84, h: 10, fontSize: 8.5, italic: true, color: "#766B58", ignoreWrap: true, wrap: "box", wrapOffset: 2, text: P("ছবি: পাহাড়ের কোলে একটি গ্রাম") }),
        text({ id: "story1", x: 18, y: 54, w: 174, h: 112, align: "justify", dropCap: 3, indentFirst: 0, styleId: "st-body", text: story, next: "story2" }),
        { ...BOX, id: "pic", type: "image", x: 18, y: 54, w: 84, h: 60, imgSrc: img, imgFit: "cover", frameFill: null, frameBorderWidth: 0, frameBorderColor: "#000000", wrap: "box", wrapOffset: 4 },
        shape({ id: "qbg", shapeType: "rectangle", x: 30, y: 176, w: 150, h: 32, fillColor: "#F3E1D6", strokeColor: "#A6402D", strokeWidth: 0.75, radius: 4, wrap: "jump", wrapOffset: 2 }),
        text({ id: "quote", x: 36, y: 180, w: 138, h: 24, fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: 15, align: "center", valign: "middle", color: "#A6402D", italic: false, ignoreWrap: true, text: P("“ভাষা আমাদের পরিচয়, ছাপার অক্ষর তার স্থায়ী ঠিকানা।”") }),
        text({ id: "ed1", x: 18, y: 220, w: 174, h: 27, columns: 2, columnGap: 6, fontSize: 11, align: "justify",
          text: P("<b>সম্পাদকের কথা।</b> এই সংখ্যায় আমরা গ্রামের জীবন, নদীর গল্প আর নতুন কবিদের লেখা নিয়ে এসেছি। প্রতিটি লেখা পাঠকের পাঠানো, আমরা শুধু সাজিয়ে দিয়েছি।") +
            P("পত্রিকাটি পুরোটাই লেখনী দিয়ে তৈরি: শিরোনাম, ছবি, টেবিল, দুই কলামের লেখা আর পাতার নম্বর সবই এক জায়গায়। আপনার মতামত জানাতে ভুলবেন না।") }),
        shape({ id: "star", shapeType: "star", starPoints: 5, x: 174, y: 196, w: 14, h: 14, fillColor: "#E9874B", strokeColor: "#A6402D", strokeWidth: 0.5, rotation: 12 }),
      ] },
      { id: "p2", boxes: [
        text({ id: "story2", x: 18, y: 20, w: 84, h: 120, align: "justify", styleId: "st-body", text: "" }),
        text({ id: "h2", x: 108, y: 19, w: 84, h: 14, fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: 16, bold: true, color: "#2C6E67", styleId: "st-h2", text: P("পাঠক সমীক্ষা") }),
        { ...BOX, id: "tbl", type: "table", x: 108, y: 34, w: 84, h: 47, rows: 5, cols: 3, borderWidth: 1, borderColor: "#B9CFC9", cellPadding: 5, fontSize: 10.5,
          fontFamily: "'Noto Serif Bengali', serif", colWidths: [0.36, 0.24, 0.4], rowHeights: [0.2, 0.2, 0.2, 0.2, 0.2], cells },
        text({ id: "h3", x: 108, y: 88, w: 84, h: 14, fontFamily: "'Noto Sans Bengali', sans-serif", fontSize: 16, bold: true, color: "#2C6E67", text: P("এই সংখ্যায়") }),
        text({ id: "list", x: 108, y: 103, w: 84, h: 66, fontSize: 11.5, ulStyle: "square",
          text: "<ol><li>সম্পাদকীয়</li><li>গ্রামের গল্প</li><li>কবিতার পাতা</li><li>পাঠকের চিঠি</li></ol><ul><li>নতুন বইয়ের খবর</li><li>শব্দছক</li></ul>" }),
        shape({ id: "box2", shapeType: "rectangle", x: 18, y: 178, w: 174, h: 40, fillColor: "#EEF5F3", strokeColor: "#2C6E67", strokeWidth: 0.75, radius: 2 }),
        text({ id: "note", x: 24, y: 183, w: 162, h: 30, fontSize: 11, valign: "middle", ignoreWrap: true,
          text: P("<b>লেখা পাঠান:</b> আপনার গল্প, কবিতা বা ছবি পাঠাতে পারেন। নির্বাচিত লেখা পরের সংখ্যায় ছাপা হবে।") + P('ঠিকানা: <a href="mailto:lekhoni@example.com">lekhoni@example.com</a>') }),
      ] },
    ],
  };
}
module.exports = { build };
