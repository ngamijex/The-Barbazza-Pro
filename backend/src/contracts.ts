import fs from "fs";
import path from "path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  TextRun,
  UnderlineType,
} from "docx";

export type ContractType = "recruitment" | "retention";

export type ContractInput = {
  type: ContractType;
  /** When true, fillable fields become dashed blanks for offline handwriting */
  blank?: boolean;
  contractDate: string; // YYYY-MM-DD
  workplace: string;
  commissionPercent: number;

  employerName: string;
  employerId: string;
  employerIdPlace: string;
  employerAddress: string;
  employerPhone: string;

  employeeName: string;
  employeeId: string;
  employeeIdPlace: string;
  employeeAddress: string;
  employeePhone: string;

  recruitmentAdvance?: number;
  recruitmentBonus?: number;
  recruitmentBonusAfterMonths?: number;
  monthlyDeduction?: number;

  retentionAmount?: number;
  commitmentMonths?: number;
};

const thinBorder = { style: BorderStyle.SINGLE, size: 6, color: "111111", space: 1 };
const artBorder = { style: BorderStyle.SINGLE, size: 12, color: "0A0A0A", space: 8 };

function logoBuffer(): Buffer {
  const candidates = [
    path.join(__dirname, "../assets/logo.png"),
    path.join(process.cwd(), "assets/logo.png"),
    path.join(process.cwd(), "backend/assets/logo.png"),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) return fs.readFileSync(file);
  }
  throw new Error("Contract logo not found (backend/assets/logo.png)");
}

function money(n: number) {
  return `${Math.round(n || 0).toLocaleString("en-US")} FRW`;
}

function formatDateParts(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return { d: "____", m: "____", y: "________" };
  return { d: m[3], m: m[2], y: m[1] };
}

function dash(len = 28) {
  return "_".repeat(len);
}

function field(blank: boolean | undefined, value: string, width = 28) {
  if (blank) return dash(width);
  return value || dash(width);
}

function fieldMoney(blank: boolean | undefined, value: number | undefined) {
  if (blank || value == null || Number.isNaN(value)) return `${dash(14)} FRW`;
  return money(value);
}

function fieldNum(blank: boolean | undefined, value: number | undefined, fallbackDash = 6) {
  if (blank || value == null || Number.isNaN(value)) return dash(fallbackDash);
  return String(value);
}

function dateLine(blank: boolean | undefined, iso: string) {
  if (blank) return `__ / __ / ______`;
  const p = formatDateParts(iso);
  return `${p.d} / ${p.m} / ${p.y}`;
}

function centerRuns(runs: TextRun[], opts?: { after?: number; before?: number }) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: opts?.after ?? 120, before: opts?.before ?? 0 },
    children: runs,
  });
}

function p(text: string, opts?: { bold?: boolean; center?: boolean; size?: number; after?: number; before?: number; italics?: boolean }) {
  return new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : AlignmentType.BOTH,
    spacing: { after: opts?.after ?? 140, before: opts?.before ?? 0, line: 276 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        italics: opts?.italics,
        size: opts?.size ?? 21,
        font: "Calibri",
        color: "111111",
      }),
    ],
  });
}

function ornament() {
  return centerRuns(
    [new TextRun({ text: "✂  ·  —  ·  The Barbazza  ·  —  ·  ✂", size: 16, color: "666666", font: "Calibri" })],
    { after: 200, before: 80 }
  );
}

function article(text: string) {
  return new Paragraph({
    spacing: { before: 280, after: 140 },
    border: { bottom: thinBorder },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        font: "Calibri",
        color: "0A0A0A",
        underline: { type: UnderlineType.SINGLE },
      }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    spacing: { after: 70, line: 276 },
    indent: { left: 420 },
    children: [new TextRun({ text: `•  ${text}`, size: 21, font: "Calibri", color: "111111" })],
  });
}

function blankLine(after = 120) {
  return new Paragraph({ spacing: { after }, children: [] });
}

function sigBlock(role: string, name: string) {
  return [
    p(role, { bold: true, after: 80 }),
    p(`Izina: ${name}`, { after: 80 }),
    p("Umukono: ________________________________", { after: 60 }),
    p("Itariki: ____ / ____ / ________", { after: 200 }),
  ];
}

function recruitmentArticle8(input: ContractInput) {
  const blank = input.blank;
  const advance = fieldMoney(blank, input.recruitmentAdvance);
  const bonus = fieldMoney(blank, input.recruitmentBonus);
  const after = fieldNum(blank, input.recruitmentBonusAfterMonths, 4);
  const monthly = fieldMoney(blank, input.monthlyDeduction);
  return [
    article("INGINGO YA 8: AMAFARANGA YA RECRUTEMENT (RECRUITMENT MONEY)"),
    p(
      `8.1. Umukozi atangira akazi afite amafaranga ya recrutement y’agaciro ka ${advance}. ` +
        `Izindi ${bonus} azahabwa nyuma y’amezi ${after} yo kwerekana ko ari umukozi wizewe.`
    ),
    p(`8.2. Aya mafaranga akatwa ku mushahara buri kwezi ku gaciro ka ${monthly} buri kwezi kugeza aho ashyira.`),
    p(
      "8.3. Niba Umukozi ahagaritse akazi cyangwa agenda gukorera ahandi, agomba kwishyura icyo asigareye cyose ku buryo bwihuse, nta kwirengagiza."
    ),
    p("8.4. Iyo amafaranga ya recrutement yishyuwe yose, Umukozi ntakomeza gukatirwa kuri yo."),
  ];
}

function retentionArticle8(input: ContractInput) {
  const blank = input.blank;
  const amount = fieldMoney(blank, input.retentionAmount);
  const months = fieldNum(blank, input.commitmentMonths, 4);
  const clawback =
    blank || input.retentionAmount == null
      ? `${dash(14)} FRW  (×2)`
      : `${money((input.retentionAmount || 0) * 2)}  (×2)`;
  return [
    article("INGINGO YA 8: INKUNGA Y’AKAZI N’IGIHE CY’AKAZI (WORK SUPPORT & COMMITMENT)"),
    p(
      `8.1. Umukoresha aha Umukozi inkunga y’agaciro ka ${amount} kugira ngo atangire kandi akomeze akazi muri The Barbazza Barbershop.`
    ),
    p(
      "8.2. Aya mafaranga ntabwo akatwa buri kwezi. Umukozi ntabwo yishyura inkunga nk’idini cyangwa ideni rya buri kwezi."
    ),
    p(
      `8.3. Mu guhabwa iyi nkunga, Umukozi yiyemeje gukorera The Barbazza Barbershop mu gihe kingana na amezi ${months} uhereye umunsi amasezerano ashyiriweho umukono.`
    ),
    p(
      `8.4. Niba Umukozi ahagaritse akazi cyangwa agenda gukorera ahandi mbere y’uko icyo gihe cyuzura, ` +
        `agomba kwishyura The Barbazza Barbershop amafaranga angana n’inkunga yahawe inshuro ebyiri (${clawback}), ` +
        `nk’inyungu / indishyi z’igihombo bitewe no kurangiza amasezerano mbere y’igihe.`
    ),
    p(
      `8.5. Iyo Umukozi arangije icyo gihe cyose cy’amezi ${months} nk’uko byemejwe, ntabwo asabwa kwishyura iyi nkunga.`
    ),
  ];
}

function coverPage(input: ContractInput, logo: Buffer) {
  const date = dateLine(input.blank, input.contractDate);
  const typeNote =
    input.type === "retention"
      ? "Ubwoko B: Inkunga + igihe cy’akazi (nta kwishyura buri kwezi · kuva mbere y’igihe = ×2)"
      : "Ubwoko A: Amafaranga ya recrutement akatwa buri kwezi";

  return [
    blankLine(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new ImageRun({
          type: "png",
          data: logo,
          transformation: { width: 150, height: 150 },
          altText: { title: "Barbazza", description: "The Barbazza Barbershop logo", name: "logo" },
        }),
      ],
    }),
    centerRuns(
      [new TextRun({ text: "The Barbazza Barbershop", bold: true, size: 36, font: "Georgia", color: "0A0A0A" })],
      { after: 60 }
    ),
    centerRuns(
      [new TextRun({ text: "Professional Grooming & Styling Services", size: 18, italics: true, font: "Georgia", color: "444444" })],
      { after: 320 }
    ),
    ornament(),
    blankLine(400),
    centerRuns(
      [new TextRun({ text: "THE BARBAZZA BARBERSHOP", bold: true, size: 30, font: "Calibri", color: "0A0A0A" })],
      { after: 120 }
    ),
    centerRuns(
      [new TextRun({ text: "AMASEZERANO Y'AKAZI", bold: true, size: 34, font: "Georgia", color: "0A0A0A" })],
      { after: 80 }
    ),
    centerRuns(
      [new TextRun({ text: "(EMPLOYMENT CONTRACT)", bold: true, size: 22, font: "Calibri", color: "222222" })],
      { after: 280 }
    ),
    centerRuns(
      [new TextRun({ text: "Hagati y’Umukoresha n’Umukozi", size: 22, font: "Calibri", color: "222222" })],
      { after: 100 }
    ),
    centerRuns([new TextRun({ text: "Kigali – Rwanda", size: 22, font: "Calibri", color: "222222" })], { after: 220 }),
    centerRuns(
      [new TextRun({ text: `Ku wa:  ${date}`, bold: true, size: 24, font: "Calibri", color: "0A0A0A" })],
      { after: 160 }
    ),
    centerRuns([new TextRun({ text: typeNote, size: 16, italics: true, font: "Calibri", color: "555555" })], { after: 80 }),
    blankLine(600),
    ornament(),
    blankLine(200),
    centerRuns(
      [new TextRun({ text: "Document confidentiel · Amasezerano y’akazi · The Barbazza", size: 14, color: "888888", font: "Calibri" })],
      { after: 40 }
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function docHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { bottom: artBorder },
        spacing: { after: 120 },
        children: [
          new TextRun({ text: "THE BARBAZZA BARBERSHOP", bold: true, size: 16, font: "Georgia", color: "0A0A0A" }),
          new TextRun({ text: "   ·   ", size: 16, color: "999999" }),
          new TextRun({ text: "Amasezerano y’akazi", size: 15, italics: true, font: "Calibri", color: "555555" }),
        ],
      }),
    ],
  });
}

function docFooter() {
  return new Footer({
    children: [
      new Paragraph({
        border: { top: artBorder },
        spacing: { before: 80 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "✂  The Barbazza  ·  Professional Grooming & Styling  ·  Kigali, Rwanda  ✂", size: 14, color: "666666", font: "Calibri" }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40 },
        children: [
          new TextRun({ text: "Paji ", size: 14, color: "666666", font: "Calibri" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 14, color: "666666", font: "Calibri" }),
          new TextRun({ text: " / ", size: 14, color: "666666", font: "Calibri" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: "666666", font: "Calibri" }),
          new TextRun({ text: "   ·   Confidential employment contract", size: 14, color: "888888", font: "Calibri" }),
        ],
      }),
    ],
  });
}

export async function buildEmploymentContract(input: ContractInput): Promise<Buffer> {
  const blank = !!input.blank;
  const logo = logoBuffer();
  const dateLabel = dateLine(blank, input.contractDate);
  const article8 = input.type === "retention" ? retentionArticle8(input) : recruitmentArticle8(input);

  const employerName = field(blank, input.employerName, 32);
  const employerId = field(blank, input.employerId, 24);
  const employerIdPlace = field(blank, input.employerIdPlace, 24);
  const employerAddress = field(blank, input.employerAddress, 40);
  const employerPhone = field(blank, input.employerPhone, 20);

  const employeeName = field(blank, input.employeeName, 32);
  const employeeId = field(blank, input.employeeId, 24);
  const employeeIdPlace = field(blank, input.employeeIdPlace, 24);
  const employeeAddress = field(blank, input.employeeAddress, 40);
  const employeePhone = field(blank, input.employeePhone, 20);
  const workplace = field(blank, input.workplace, 36);
  const commission = fieldNum(blank, input.commissionPercent, 4);

  const children = [
    ...coverPage(input, logo),

    ornament(),
    article("IRIBURIRO (PREAMBLE)"),
    p(
      "Aya masezerano y’akazi akozwe ku bushake, mu bwumvikane busesuye kandi butagijwemo igitutu n’impande zombi, " +
        "agamije gushyiraho no kugenga umubano w’akazi hagati y’Umukoresha n’Umukozi, hakurikijwe amategeko y’umurimo " +
        "akurikizwa muri Repubulika y’u Rwanda, amahame y’imyitwarire myiza mu kazi, n’amabwiriza y’imikorere ya The Barbazza Barbershop."
    ),
    p(
      "Aya masezerano agamije kurinda inyungu z’impande zombi, guteza imbere ubunyamwuga, umusaruro, umutekano w’akazi, n’iterambere rya Barbazza Barbershop."
    ),

    article("INGINGO YA 1: IMPANDE ZIRI MURI AMASEZERANO"),
    p("1.1 Umukoresha", { bold: true }),
    bullet(`Izina: ${employerName}`),
    bullet(`Indangamuntu (ID): ${employerId}`),
    bullet(`Aho yatangiwe ID: ${employerIdPlace}`),
    bullet(`Aderesi: ${employerAddress}`),
    bullet(`Telefoni: ${employerPhone}`),
    p("Aha yitwa \"UMUKORESHA\"."),
    blankLine(80),
    p("1.2 Umukozi", { bold: true }),
    bullet(`Izina: ${employeeName}`),
    bullet(`Indangamuntu (ID): ${employeeId}`),
    bullet(`Aho yatangiwe ID: ${employeeIdPlace}`),
    bullet(`Aderesi: ${employeeAddress}`),
    bullet(`Telefoni: ${employeePhone}`),
    p("Aha yitwa \"UMUKOZI\"."),
    p("Umukoresha n’Umukozi bose hamwe bitwa \"IMPANDE ZOMBI\"."),

    article("INGINGO YA 2: ICYEREKEZO CY’AMASEZERANO"),
    p("Aya masezerano agamije:"),
    bullet("Gushyiraho akazi Umukozi azakorera muri The Barbazza Barbershop"),
    bullet("Kugaragaza inshingano, uburenganzira n’ibyo buri ruhande rwiyemeje"),
    bullet("Kugenga umushahara, amasaha y’akazi, ikiruhuko, n’ibihano"),
    bullet("Kurinda izina, umutungo, n’iterambere rya Barbazza Barbershop"),

    article("INGINGO YA 3: UBWO KO N’IMITERERE Y’AKAZI"),
    p("3.1. Umukozi yemeye gukora akazi ko gutunganya imisatsi y’abagabo (kogosha)."),
    p("3.2. Akazi kagomba gukorwa mu buryo bw’umwuga, isuku, icyubahiro, no kubaha abakiriya."),
    p("3.3. Umukozi agomba gukurikiza amabwiriza yose ajyanye n’imikorere ya Barbazza Barbershop."),

    article("INGINGO YA 4: AHO AKAZI GAKORERWA"),
    p(
      `Akazi kazakorerwa muri The Barbazza Barbershop, iherereye ${workplace}, ` +
        "keretse Umukoresha ategetse ahandi hafitanye isano n’akazi."
    ),

    article("INGINGO YA 5: AMASAHA Y’AKAZI"),
    p("5.1. Umukozi agomba kuba ari ku kazi mu masaha yose yemejwe, yaba afite abakiriya cyangwa adafite."),
    p("5.2. Amasaha y’akazi ni: Gutangira Saa moya (07:00 za mu gitondo); Kurangiza Saa tanu z’ijoro (23:00)."),
    p(
      "5.3. Muri ayo masaha harimo isaha imwe (1) yo gufata amafunguro ya sasita, igenwa n’Umukoresha bitewe n’uko akazi kameze."
    ),
    p("5.4. Umukozi ntiyemerewe kuva cyangwa kutaba ku kazi mu masaha y’akazi atabitiye uruhushya rwemewe."),
    p(
      "5.5. Iyo Umukozi atagaragaye aho akazi gakorerwa adafite uruhushya, afatwa nk’uwasibye akazi kandi arabihanirwa."
    ),

    article("INGINGO YA 6: IMPUZANKANO N’IMYITWARIRE"),
    p("6.1. Abakozi bose bagomba kwambara impuzankano (uniform) ya Barbazza Barbershop mu masaha yose y’akazi."),
    p("6.2. Impuzankano igomba kuba isukuye, imeze neza, kandi igaragaza isura nziza ya Barbazza."),

    article("INGINGO YA 7: UMUSHARA N’UBURYO BWO GUHEMBWA"),
    p(`7.1. Umukozi ahembwa commission ya ${commission}% y’amafaranga yose yinjiye binyuze ku akazi ye mu kwezi.`),
    p("7.2. Umushahara ubarwa buri kwezi hashingiwe ku akazi gukozwe."),
    p("7.3. Nta mushahara uhagaritswe; kwishyurwa gushingiye ku umusaruro."),
    p("7.4. Umukoresha afite uburenganzira bwo kugenzura no kwemeza inyandiko z’amafaranga yinjiye."),

    ...article8,

    article("INGINGO YA 9: IKIRUHUKO CYA BURI CYUMWERU"),
    p("9.1. Umukozi afite uburenganzira ku munsi umwe wo kuruhuka buri cyumweru."),
    p("9.2. Uwo munsi ugena mu bwumvikane n’Umukoresha hashingiwe ku bikenewe n’akazi."),
    p(
      "9.3. Iyo Umukozi asibye umunsi adafite uruhushya, akatirwa agaciro kangana n’umusaruro w’umunsi wapimwe wa Barbazza Barbershop."
    ),

    article("INGINGO YA 10: IKIRUHUKO NGARUKAMWAKA (ANNUAL LEAVE)"),
    p("10.1. Umukozi afite iminsi 10 y’ikiruhuko ngarukamwaka."),
    p("10.2. Iyo minsi ishobora gufatwa mu bihe bitandukanye."),
    p("10.3. Umukozi agomba gusaba ikiruhuko byibuze iminsi itatu (3) mbere."),
    p("10.4. Ikiruhuko gitangwa hashingiwe ku gahunda y’akazi n’ibikenewe n’ubucuruzi."),

    article("INGINGO YA 11: INSHINGANO Z’UMUKOZI"),
    p("Umukozi yiyemeje:"),
    bullet("Gukora akazi neza kandi ku gihe"),
    bullet("Kubahiriza amasaha y’akazi n’amabwiriza"),
    bullet("Kubungabunga ibikoresho bya Barbazza"),
    bullet("Kutagira ibikorwa byangiza umutungo cyangwa izina rya Barbazza"),
    bullet("Kudakorera indi salon mu masaha y’akazi"),

    article("INGINGO YA 12: INSHINGANO Z’UMUKORESHA"),
    p("Umukoresha yiyemeje:"),
    bullet("Gutanga akazi n’ibikoresho bikenewe"),
    bullet("Guhemba Umukozi ku gihe"),
    bullet("Gutanga akazi mu buryo butarimo ivangura"),
    bullet("Kurinda umutekano n’icyubahiro by’Umukozi"),
    bullet("Gutanga ubufasha bwose mu gihe Umukozi yahuye n’ikibazo harimo uburwayi n’ibindi"),

    article("INGINGO YA 13: IBIHANO N’IMYITWARIRE MIBI"),
    p(
      "13.1. Umukozi ushaka guteza akajagari, kutubahiriza amasaha, gusiba akazi, cyangwa gutesha agaciro Barbazza ashobora:"
    ),
    bullet("Guhabwa umuburo"),
    bullet("Gukatwa umushahara"),
    bullet("Guhagarikwa by’agateganyo"),
    bullet("Guseswa kwamasezerano"),

    article("INGINGO YA 14 / 18: KUBUZWA IKIYOBYABWENGE MU MASAHA Y’AKAZI"),
    p(
      "Mu masaha yose y’akazi, Umukozi abujijwe burundu gutata, gukoresha, gutunda cyangwa kugaragara akoresheje ikiyobyabwenge icyo ari cyo cyose, harimo ariko bitagarukiye kuri: inzoga; ibiyobyabwenge bitemewe n’amategeko; ibindi byose bishobora guhindura imitekerereze cyangwa imikorere."
    ),
    p(
      "Iyo imyitwarire yatewe n’ubusindagizi igize abakiriya, umutekano cyangwa izina rya Barbazza, Umukoresha afite uburenganzira bwo guhagarika cyangwa gusesa amasezerano ako kanya."
    ),

    article("INGINGO YA 19: IMICUNGIRE Y’AMAFARANGA Y’ABAKIRIYA"),
    p("19.1. Umukozi abujijwe kwakira amafaranga y’abakiriya ku konti ye bwite, yaba cash cyangwa mobile money."),
    p("19.2. Amafaranga yose y’abakiriya agomba kwinjira mu buryo bemewe na Barbazza Barbershop."),
    p(
      "19.3. Kwakira amafaranga y’abakiriya ku giti cye bifata nk’ikosa rikomeye (faute grave) rishobora gukurikirana n’ibihano bikomeye harimo gusesa amasezerano."
    ),

    article("INGINGO YA 20: KUBUNGABUNGA NO KURINDA IBIKORESHO BY’AKAZI"),
    p(
      "20.1–20.3. Umukozi agomba kurinda no kubungabunga ibikoresho byose bya Barbazza. Iyo byangiritse bitewe n’ubwirengagize, ashobora kwishyura gusana cyangwa gusimbura, bishobora gukatwa ku mushahara."
    ),

    article("INGINGO YA 21: IMYITWARIRE IFATWA NK’IKOSA RIKOMEYE (FAUTE GRAVE)"),
    p("Bifatwa nk’ikosa rikomeye, mubindi:"),
    bullet("Gukoresha ibiyobyabwenge mu masaha y’akazi"),
    bullet("Kwakira amafaranga y’abakiriya ku giti cye"),
    bullet("Kwangiza ibikoresho ku bushake"),
    bullet("Kwiba amafaranga cyangwa umutungo"),
    bullet("Kwangiza izina rya Barbazza imbere y’abakiriya"),

    article("INGINGO YA 22: CCTV, KUGENZURA NO GUKURIKIRANA IMIKORERE"),
    p(
      "22.1–22.4. Umukozi yemera ko Barbazza ikoresha CCTV ku mutekano, kugenzura imikorere, kurinda amafaranga, no kurwanya imyitwarire mibi. Kameras ziri mu nzira z’akazi, abakiriya n’ububiko; si mu nzira zihariye nk’ubwiherero. Guhangana na CCTV bifata nk’ikosa rikomeye."
    ),

    article("INGINGO YA 23: KUTAHANGANA N’UMUKORESHA (NON-COMPETE)"),
    p("23.1. Mu gihe aya masezerano akiriho, Umukozi ntiyemerewe gukora cyangwa gufasha indi salon yo kogosha."),
    p(
      "23.2. Nyuma yo gusoza amasezerano, Umukozi yemera kutafungura cyangwa gukorera salon iri mu ntera ya km 3–5 uvuye aho Barbazza ikorera, mu gihe cy’amezi 12."
    ),
    p("23.3–23.4. Iyi ngingo irinda abakiriya n’ubucuruzi. Kutayubahiriza bishobora gukurikirana n’indishyi z’igihombo."),

    article("INGINGO YA 24: KUBIKA AMASIRAME N’AMAKURU Y’AKAZI"),
    p(
      "Amakuru y’abakiriya, amafaranga, imikorere n’amabanga y’ubucuruzi ni ibanga. Gusangiza ayo makuru bifata nk’ikosa rikomeye."
    ),

    article("INGINGO YA 25: EMPLOYEE CODE OF CONDUCT"),
    p("Umukozi yemera gukurikiza Code of Conduct ya The Barbazza Barbershop, harimo:"),
    bullet("Imyitwarire rusange: inyangamugayo, icyubahiro, kudashinyagura cyangwa guhohotera"),
    bullet("Impuzankano n’isuku"),
    bullet("Imyitwarire ku bakiriya"),
    bullet("Imyitwarire ku mafaranga"),
    bullet("Imyitwarire ku kazi (nta busindagizi, kubahiriza amasaha)"),

    article("INGINGO YA 26: UBURYO BWO GUHANA (DISCIPLINARY PROCEDURE)"),
    p(
      "Umukoresha ashobora gutanga umuburo wo mu magambo, umuburo wanditse, gukatwa ku mushahara, guhagarikwa by’agateganyo, cyangwa gusesa amasezerano, bitewe n’uburemere bw’ikosa."
    ),

    article("INGINGO YA 27–28: KUGENZURA, KWEMERA NO GUSOBANUKIRWA"),
    p(
      "Umukoresha ashobora kuvugurura Code of Conduct n’amabwiriza. Umukozi yemeza ko yasomye kandi yumvise aya masezerano yose."
    ),

    article("INGINGO YA 29: GUSESA AMASEZERANO"),
    p("29.1. Amasezerano ashobora guseswa n’uruhande urwo ari rwose hakoreshejwe itangazo."),
    p("29.2. Mu gihe cy’ikosa rikomeye, Umukoresha ashobora gusesa amasezerano ako kanya."),

    article("INGINGO YA 30–32: AMAKIMBIRANE, ITEGEKO N’ITANGIRA"),
    p("Amakimbirane akemurwa mu bwumvikane cyangwa n’inzego zibifitiye ububasha mu Rwanda."),
    p("Aya masezerano agenwa n’amategeko y’umurimo ya Repubulika y’u Rwanda."),
    p("Aya masezerano atangira ku munsi ashyiriweho umukono."),

    blankLine(160),
    ornament(),
    p(`Bikorewe i Kigali, ku wa ${dateLabel}.`, { bold: true, center: true }),
    blankLine(200),
    ...sigBlock("UMUKORESHA", employerName),
    ...sigBlock("UMUKOZI", employeeName),
    blankLine(120),
    ornament(),
    p("Umwanya w’umukono w’umunyamabanga / noteri (niba bibaye ngombwa)", {
      center: true,
      italics: true,
      size: 18,
    }),
    p("_______________________________________________", { center: true }),
  ];

  // Force page break after cover: first content article starts new page
  // coverPage already inserts a break run; ensure body starts cleanly
  const doc = new Document({
    creator: "The Barbazza Barbershop",
    title: `Amasezerano y'akazi — ${blank ? "Template" : input.employeeName || "Umukozi"}`,
    description: blank ? "Blank fill-in template" : "Filled employment contract",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 792, bottom: 864, left: 792 },
          },
        },
        headers: { default: docHeader() },
        footers: { default: docFooter() },
        children,
      },
    ],
  });

  const out = await Packer.toBuffer(doc);
  return Buffer.from(out);
}

export function contractFilename(input: ContractInput) {
  const kind = input.type === "retention" ? "retention" : "recruitment";
  if (input.blank) return `Barbazza_Amasezerano_${kind}_TEMPLATE_blank.docx`;
  const safe = (input.employeeName || "umukozi").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_");
  return `Barbazza_Amasezerano_${kind}_${safe || "umukozi"}.docx`;
}
