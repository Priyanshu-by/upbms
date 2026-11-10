function createSeedDatabase() {
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const signatories = [
    {
      id: "sig-gs",
      nameHi: "श्री आलोक कुमार वर्मा",
      nameEn: "Shri Alok Kumar Verma",
      designationHi: "प्रदेश महामंत्री",
      designationEn: "State General Secretary",
      signatureMode: "separate",
      signatureUrl: "/images/sig-gs.svg",
      combinedStampSigUrl: "/images/sig-gs-combined.svg"
    },
    {
      id: "sig-pres",
      nameHi: "श्री राजेन्द्र प्रसाद तिवारी",
      nameEn: "Shri Rajendra Prasad Tiwari",
      designationHi: "प्रदेश अध्यक्ष",
      designationEn: "State President",
      signatureMode: "separate",
      signatureUrl: "/images/sig-president.svg",
      combinedStampSigUrl: "/images/sig-pres-combined.svg"
    },
    {
      id: "sig-treasurer",
      nameHi: "श्री महेंद्र प्रताप सिंह",
      nameEn: "Shri Mahendra Pratap Singh",
      designationHi: "प्रदेश कोषाध्यक्ष",
      designationEn: "State Treasurer",
      signatureMode: "separate",
      signatureUrl: "/images/sig-treasurer.svg",
      combinedStampSigUrl: ""
    }
  ];

  const settings = {
    orgNameHi: "उत्तर प्रदेश बैंक मित्र संघ (UPBMS)",
    orgNameEn: "Uttar Pradesh Bank Mitra Sangh (UPBMS)",
    regNumber: "UP-REG-LKO-2024-8841",
    establishedYear: "2024",
    headOfficeHi: "प्रांतीय कार्यालय: 12-B, हजरतगंज, लखनऊ, उत्तर प्रदेश - 226001",
    headOfficeEn: "State Head Office: 12-B, Hazratganj, Lucknow, UP - 226001",
    helplinePrimary: "9450011223",
    helpline: "9450011223",
    whatsappNumber: "919450011223",
    email: "contact@upbms.org",
    adminPin: "1234",
    sealImageUrl: "/images/official-seal.svg",
    sealLabelHi: "आधिकारिक संघ मुहर",
    sealLabelEn: "Official Seal",
    themePreset: "navy_saffron",
    enableGrievanceModule: true,
    bankAccountName: "UP BANK MITRA SANGH",
    bankAccountNumber: "50100482910482",
    bankIfsc: "HDFC0001234",
    bankBranch: "Hazratganj, Lucknow",
    upiId: "upbms@upi",
    upiPayeeName: "UP Bank Mitra Sangh",
    membershipFeeGeneral: 500,
    membershipFeeDistrictOfficer: 1100,
    membershipFeeCore: 2100,
    defaultSignatoryId: "sig-gs",
    defaultSignatoryIds: ["sig-gs", "sig-pres"],
    signatories,
    socialLinks: {
      whatsappChannel: "https://whatsapp.com/channel/upbms",
      whatsappGroup: "https://chat.whatsapp.com/upbms",
      facebook: "https://facebook.com/upbms",
      instagram: "https://instagram.com/upbms",
      youtube: "https://youtube.com/@upbms",
      twitter: "https://twitter.com/upbms",
      telegram: "https://t.me/upbms"
    },
    socialStrip: [
      { id: "whatsappChannel", icon: "whatsapp", labelHi: "WA", labelEn: "WA", url: "https://whatsapp.com/channel/upbms", visible: true, order: 1 },
      { id: "whatsappGroup", icon: "whatsapp", labelHi: "ग्रुप", labelEn: "Group", url: "https://chat.whatsapp.com/upbms", visible: true, order: 2 },
      { id: "facebook", icon: "facebook", labelHi: "FB", labelEn: "FB", url: "https://facebook.com/upbms", visible: true, order: 3 },
      { id: "instagram", icon: "instagram", labelHi: "Insta", labelEn: "Insta", url: "https://instagram.com/upbms", visible: true, order: 4 },
      { id: "youtube", icon: "youtube", labelHi: "YT", labelEn: "YT", url: "https://youtube.com/@upbms", visible: true, order: 5 },
      { id: "twitter", icon: "twitter", labelHi: "X", labelEn: "X", url: "https://twitter.com/upbms", visible: true, order: 6 },
      { id: "telegram", icon: "telegram", labelHi: "TG", labelEn: "TG", url: "https://t.me/upbms", visible: true, order: 7 }
    ],
    headerButtons: {
      adminLabelHi: "एडमिन पैनल",
      adminLabelEn: "Admin Panel"
    },
    sectionTexts: {
      homeCircularsEyebrowHi: "नवीनतम आदेश",
      homeCircularsEyebrowEn: "Latest Orders",
      homeCircularsTitleHi: "महत्वपूर्ण परिपत्र व शासनादेश",
      homeCircularsTitleEn: "Important Circulars & Orders",
      homeCircularsSubHi: "संगठन एवं बैंकिंग क्षेत्र से जुड़े महत्वपूर्ण परिपत्र",
      homeCircularsSubEn: "Important circulars related to banking & association",
      homePortalsEyebrowHi: "त्वरित सेवाएं",
      homePortalsEyebrowEn: "Quick Services",
      homePortalsTitleHi: "बैंक मित्र उपयोगी वेब पोर्टल",
      homePortalsTitleEn: "Useful Bank Mitra Portals",
      homePortalsSubHi: "विभिन्न बैंकों एवं कंपनियों के अधिकृत पोर्टल लिंक",
      homePortalsSubEn: "Authorized portal links of banks and BC companies",
      homeDemandsEyebrowHi: "हमारा संघर्ष",
      homeDemandsEyebrowEn: "Our Struggle",
      homeDemandsTitleHi: "बैंक मित्रों की प्रमुख मांगें",
      homeDemandsTitleEn: "Key Demands of Bank Mitras",
      homeDemandsSubHi: "न्याय, सुरक्षा एवं सम्मान हेतु शासन को प्रेषित मांग पत्र",
      homeDemandsSubEn: "Memorandum submitted for justice, security and dignity",
      homeMembersEyebrowHi: "संगठन परिवार",
      homeMembersEyebrowEn: "Association Family",
      homeMembersTitleHi: "हमारे सक्रिय बैंक मित्र साथी",
      homeMembersTitleEn: "Our Active Bank Mitra Members",
      homeNewsEyebrowHi: "ताज़ा समाचार",
      homeNewsEyebrowEn: "Latest News",
      homeNewsTitleHi: "संगठनात्मक गतिविधियां एवं प्रेस विज्ञप्ति",
      homeNewsTitleEn: "Association Activities & Press Releases"
    },
    campaignBlock: {
      badgeHi: "एकता ही शक्ति है",
      badgeEn: "Unity is Strength",
      titleHi: "उत्तर प्रदेश बैंक मित्र संघ (UPBMS)",
      titleEn: "Uttar Pradesh Bank Mitra Sangh",
      subtitleHi: "प्रदेश के समस्त 75 जनपदों में कार्यरत बैंक मित्रों/CSP संचालकों के अधिकारों, आर्थिक सुरक्षा एवं सम्मान हेतु समर्पित आधिकारिक संगठन।",
      subtitleEn: "Dedicated official organization for the rights, financial security and dignity of Bank Mitras across all 75 districts of Uttar Pradesh.",
      btn1Hi: "सदस्यता लें",
      btn1En: "Join Association",
      btn1Route: "join",
      btn2Hi: "विस्तृत परिचय",
      btn2En: "About Association",
      btn3Hi: "शिकायत दर्ज करें",
      btn3En: "File Grievance",
      btn3Route: "grievance"
    },
    statCards: [
      { icon: "👥", valueHi: "5,000+", valueEn: "5,000+", labelHi: "सक्रिय बैंक मित्र", labelEn: "Active Bank Mitras" },
      { icon: "🏛️", valueHi: "75", valueEn: "75", labelHi: "जनपद कवरेज", labelEn: "Districts Covered" },
      { icon: "🏦", valueHi: "28+", valueEn: "28+", labelHi: "संबद्ध बैंक", labelEn: "Affiliated Banks" },
      { icon: "🤝", valueHi: "100%", valueEn: "100%", labelHi: "कल्याण समर्पण", labelEn: "Welfare Dedication" }
    ],
    navItems: [
      { id: "home", labelHi: "मुख्य पृष्ठ", labelEn: "Home", order: 1, visible: true },
      { id: "about", labelHi: "परिचय", labelEn: "About", order: 2, visible: true },
      { id: "members", labelHi: "सदस्य सूची", labelEn: "Members", order: 3, visible: true },
      { id: "circulars", labelHi: "परिपत्र", labelEn: "Circulars", order: 4, visible: true },
      { id: "documents", labelHi: "दस्तावेज़", labelEn: "Documents", order: 5, visible: true },
      { id: "portals", labelHi: "पोर्टल लिंक", labelEn: "Portals", order: 6, visible: true },
      { id: "grievance", labelHi: "शिकायत निवारण", labelEn: "Grievance", order: 7, visible: true },
      { id: "join", labelHi: "सदस्यता लें", labelEn: "Join Us", order: 8, visible: true }
    ],
    tickerNoticesHi: [
      "उत्तर प्रदेश बैंक मित्र संघ के आधिकारिक पोर्टल में आपका स्वागत है।",
      "समस्त बैंक मित्र साथी अपनी सदस्यता नवीनीकृत कराएं।",
      "बिना नोटिस KO कोड ब्लॉक किए जाने पर तुरंत शिकायत दर्ज कराएं।"
    ],
    tickerNoticesEn: [
      "Welcome to the official portal of UP Bank Mitra Sangh.",
      "All Bank Mitra members are requested to renew their membership.",
      "Report unauthorized KO code blocks on our grievance cell immediately."
    ],
    aboutVisionMission: {
      aboutTitleHi: "बैंक मित्रों के अधिकारों एवं कल्याण का सशक्त मंच",
      aboutTitleEn: "Empowering Bank Mitras across Uttar Pradesh",
      aboutBodyHi: "उत्तर प्रदेश बैंक मित्र संघ प्रदेश के 75 जनपदों में वित्तीय समावेशन को अंतिम व्यक्ति तक पहुंचाने वाले समर्पित बैंक मित्रों (CSP/किओस्क संचालकों) का पंजीकृत एवं अधिकृत संगठन है। हमारा उद्देश्य बैंक मित्रों को सुरक्षित कार्य वातावरण, सम्मानजनक पारिश्रमिक एवं सामाजिक सुरक्षा दिलाना है।",
      aboutBodyEn: "Uttar Pradesh Bank Mitra Sangh is a registered association representing Customer Service Point (CSP) operators across 75 districts of UP who deliver banking services to the grassroots.",
      visionTitleHi: "हमारा दृष्टिकोण (Vision)",
      visionTitleEn: "Our Vision",
      visionBodyHi: "प्रत्येक बैंक मित्र को न्यूनतम निश्चित मानदेय, स्वास्थ्य एवं दुर्घटना बीमा, ईपीएफ सुविधा तथा पारदर्शी कमीशन प्रणाली सुनिश्चित कराना।",
      visionBodyEn: "To ensure minimum fixed honorarium, comprehensive health and accident insurance, and transparent commission structure for every Bank Mitra.",
      missionTitleHi: "हमारा संकल्प (Mission)",
      missionTitleEn: "Our Mission",
      missionPointsHi: [
        "धारा 194N के अंतर्गत टीडीएस कटौती की समस्या का पूर्ण समाधान कराना",
        "बिना कारण बताओ नोटिस केओ कोड बंद करने की मनमानी पर रोक लगाना",
        "किओस्क संचालकों को बैंक कर्मचारी की भांति सुरक्षा एवं विधिक संरक्षण दिलाना",
        "प्रत्येक जनपद में सक्रिय सहायता प्रकोष्ठ एवं शिकायत निवारण व्यवस्था स्थापित करना"
      ],
      missionPointsEn: [
        "Permanent resolution of unfair TDS deduction under Section 194N",
        "Immediate curb on arbitrary termination of KO codes without show-cause notice",
        "Legal protection and workplace security for all CSP operators",
        "Active district helpdesk and fast-track grievance redressal cell in every district"
      ],
      certSectionTitleHi: "संघीय पंजीयन एवं मान्यता",
      certSectionTitleEn: "Registration & Accreditation",
      certSectionSubHi: "संगठन के वैधानिक पंजीयन एवं सम्मान प्रमाण-पत्र",
      certSectionSubEn: "Official legal certificates and recognitions",
      coreSectionTitleHi: "प्रदेश मुख्य कार्यकारिणी",
      coreSectionTitleEn: "State Core Executive Committee",
      coreSectionSubHi: "संगठन का प्रांतीय नेतृत्व",
      coreSectionSubEn: "State-level leadership of UPBMS"
    },
    termsAndConditions: {
      titleHi: "सदस्यता नियम एवं शर्तें",
      titleEn: "Membership Terms & Conditions",
      contentHi: "1. आवेदक उत्तर प्रदेश में किसी अधिकृत बैंक अथवा बीसी कंपनी का कार्यरत बैंक मित्र / CSP संचालक होना चाहिए।\n2. सदस्य संगठन की नियमावली एवं अनुशासन का पूर्ण पालन करेगा।\n3. सदस्यता शुल्क अहस्तांतरणीय है एवं संगठन के कल्याण कोष में जमा होता है।\n4. किसी भी अनुशासनहीनता अथवा संगठन विरोधी गतिविधि पर सदस्यता निरस्त की जा सकती है।",
      contentEn: "1. The applicant must be an active Bank Mitra / CSP operator in UP.\n2. Members shall abide by the constitution and rules of the association.\n3. Membership fees are non-refundable and contribute to the welfare fund.\n4. Any anti-organizational activity may result in termination of membership.",
      checkboxLabelHi: "मैं उत्तर प्रदेश बैंक मित्र संघ के समस्त नियमों एवं शर्तों से पूर्णतः सहमत हूँ।",
      checkboxLabelEn: "I agree to all rules, terms and conditions of UPBMS."
    },
    letterTemplateText: {
      idBackRulesHi: "1. यह पहचान पत्र केवल संगठनात्मक पहचान हेतु मान्य है।\n2. खो जाने पर तुरंत प्रांतीय कार्यालय को सूचित करें।\n3. ऊपर दिए गए क्यूआर कोड से ऑनलाइन सत्यापन करें।",
      idBackRulesEn: "1. Valid for organizational identification only.\n2. Inform State Office immediately if lost.\n3. Scan QR code above for online verification."
    },
    templateBackgrounds: {
      letter: {},
      idcard: { frontBgColor: "#ffffff", backBgColor: "#ffffff", headerColor: "#0a2252", bgOpacity: 0.15 },
      receipt: {}
    }
  };

  const meta = {
    districts: [
      "लखनऊ (Lucknow)",
      "कानपुर नगर (Kanpur Nagar)",
      "वाराणसी (Varanasi)",
      "प्रयागराज (Prayagraj)",
      "गोरखपुर (Gorakhpur)",
      "आगरा (Agra)",
      "मेरठ (Meerut)",
      "बरेली (Bareilly)",
      "अलीगढ़ (Aligarh)",
      "मुरादाबाद (Moradabad)",
      "अयोध्या (Ayodhya)",
      "झांसी (Jhansi)",
      "सहारनपुर (Saharanpur)",
      "आजमगढ़ (Azamgarh)",
      "बस्ती (Basti)",
      "मिर्जापुर (Mirzapur)",
      "बांदा (Banda)",
      "गौतम बुद्ध नगर (Noida/GB Nagar)",
      "गाजियाबाद (Ghaziabad)",
      "मथुरा (Mathura)"
    ],
    banks: [
      "State Bank of India (SBI)",
      "Punjab National Bank (PNB)",
      "Bank of Baroda (BOB)",
      "Union Bank of India (UBI)",
      "Canara Bank",
      "Central Bank of India",
      "Indian Bank",
      "Aryavart Bank",
      "Baroda UP Bank",
      "Prathama UP Gramin Bank",
      "HDFC Bank",
      "ICICI Bank",
      "Axis Bank"
    ],
    bcCompanies: [
      "CSC e-Governance Services India Ltd.",
      "Vakrangee Ltd.",
      "FIA Technology Services",
      "Oxigen Services",
      "PayPoint India",
      "Integra Micro Systems",
      "Alankit Ltd.",
      "Sanjivani Vikas Foundation",
      "Direct Bank BC"
    ]
  };

  const slides = [
    {
      id: "slide-1",
      order: 1,
      titleHi: "उत्तर प्रदेश बैंक मित्र संघ",
      titleEn: "UP Bank Mitra Sangh",
      subtitleHi: "समस्त बैंक मित्रों के हक, सम्मान और सुरक्षा की आवाज़",
      subtitleEn: "Voice of rights, dignity & security for all Bank Mitras",
      imageUrl: "/images/hero-banner-1.jpg"
    },
    {
      id: "slide-2",
      order: 2,
      titleHi: "75 जनपदों का सशक्त संगठन",
      titleEn: "Strong Network Across 75 Districts",
      subtitleHi: "वित्तीय समावेशन के सच्चे योद्धाओं का अधिकृत मंच",
      subtitleEn: "Official platform of true financial inclusion warriors",
      imageUrl: "/images/hero-banner-2.jpg"
    }
  ];

  const certificates = [
    {
      id: "cert-1",
      titleHi: "संस्था पंजीकरण प्रमाण-पत्र",
      titleEn: "Registration Certificate",
      issuerHi: "उत्तर प्रदेश शासन",
      issuerEn: "Govt of Uttar Pradesh",
      date: "2024-04-14",
      fileUrl: "/images/cert-registration.svg",
      fileType: "svg",
      requiresMemberLogin: false
    },
    {
      id: "cert-2",
      titleHi: "वित्तीय समावेशन उत्कृष्ट सेवा सम्मान",
      titleEn: "Excellence in Financial Inclusion",
      issuerHi: "राज्य स्तरीय बैंकर्स समिति (SLBC)",
      issuerEn: "SLBC Uttar Pradesh",
      date: "2025-01-26",
      fileUrl: "/images/cert-appreciation.svg",
      fileType: "svg",
      requiresMemberLogin: false
    }
  ];

  const demands = [
    {
      id: "dem-1",
      number: 1,
      titleHi: "न्यूनतम निश्चित मानदेय",
      titleEn: "Minimum Fixed Honorarium",
      descHi: "सभी कार्यरत बैंक मित्रों को ₹15,000 प्रति माह न्यूनतम निश्चित मानदेय दिया जाए।",
      descEn: "Fixed minimum honorarium of ₹15,000 per month for all active CSPs.",
      statusHi: "प्रक्रियाधीन",
      statusEn: "In Process",
      status: "in_progress"
    },
    {
      id: "dem-2",
      number: 2,
      titleHi: "बिना नोटिस KO कोड बंदी पर रोक",
      titleEn: "No Termination Without Notice",
      descHi: "बिना 30 दिन के अग्रिम कारण बताओ नोटिस के किसी भी CSP का कोड ब्लॉक न किया जाए।",
      descEn: "Ban on sudden blocking of KO codes without a mandatory 30-day show-cause notice.",
      statusHi: "स्वीकृत",
      statusEn: "Accepted",
      status: "approved"
    },
    {
      id: "dem-3",
      number: 3,
      titleHi: "स्वास्थ्य एवं दुर्घटना बीमा",
      titleEn: "Health & Accidental Insurance",
      descHi: "कार्य के दौरान नकद निकासी/परिवहन में सुरक्षा तथा ₹10 लाख का दुर्घटना बीमा मिले।",
      descEn: "Workplace transit cash security and ₹10 lakh accidental insurance coverage.",
      statusHi: "प्रक्रियाधीन",
      statusEn: "In Process",
      status: "in_progress"
    },
    {
      id: "dem-4",
      number: 4,
      titleHi: "पारदर्शी कमीशन संरचना",
      titleEn: "Transparent Commission Structure",
      descHi: "प्रत्येक माह 5 तारीख तक स्पष्ट कमीशन स्लिप एवं टीडीएस विवरण उपलब्ध कराया जाए।",
      descEn: "Clear monthly commission breakdown and TDS statement by 5th of every month.",
      statusHi: "सहमति बनी",
      statusEn: "Agreed",
      status: "in_progress"
    }
  ];

  const members = [
    {
      id: "mem-1",
      memberCode: "UPBMS-CORE-001",
      nameHi: "श्री राजेन्द्र प्रसाद तिवारी",
      nameEn: "Shri Rajendra Prasad Tiwari",
      fatherName: "स्व. पं. उमाकांत तिवारी",
      fatherNameEn: "Late Pt. Umakant Tiwari",
      isCoreMember: true,
      memberCategory: "Core Committee (प्रदेश मुख्य कार्यकारिणी)",
      designationHi: "प्रदेश अध्यक्ष",
      designationEn: "State President",
      displayOrder: 1,
      district: "लखनऊ (Lucknow)",
      block: "हजरतगंज",
      blockEn: "Hazratganj",
      bankName: "State Bank of India (SBI)",
      bcCompany: "CSC e-Governance Services India Ltd.",
      koCode: "KO1001",
      mobile: "9450011223",
      whatsapp: "9450011223",
      email: "president@upbms.org",
      bloodGroup: "O+",
      photoUrl: "/images/leader-president.jpg",
      messageHi: "समस्त बैंक मित्रों के हक और सम्मान की लड़ाई में संघ सदैव आपके साथ है।",
      messageEn: "The association stands with every Bank Mitra for dignity and justice.",
      password: "123456",
      signatoryId: "sig-pres",
      letterSignatoryIds: ["sig-pres", "sig-gs"],
      status: "active",
      joinedDate: "2024-04-14",
      validUntil: nextYear,
      feePaid: 2100
    },
    {
      id: "mem-2",
      memberCode: "UPBMS-CORE-002",
      nameHi: "श्री आलोक कुमार वर्मा",
      nameEn: "Shri Alok Kumar Verma",
      fatherName: "श्री रामसनेही वर्मा",
      fatherNameEn: "Shri Ramsanehi Verma",
      isCoreMember: true,
      memberCategory: "Core Committee (प्रदेश मुख्य कार्यकारिणी)",
      designationHi: "प्रदेश महामंत्री",
      designationEn: "State General Secretary",
      displayOrder: 2,
      district: "कानपुर नगर (Kanpur Nagar)",
      block: "कल्याणपुर",
      blockEn: "Kalyanpur",
      bankName: "Bank of Baroda (BOB)",
      bcCompany: "Vakrangee Ltd.",
      koCode: "KO1002",
      mobile: "9450011224",
      whatsapp: "9450011224",
      email: "secretary@upbms.org",
      bloodGroup: "B+",
      photoUrl: "/images/leader-secretary.jpg",
      messageHi: "संगठन की शक्ति अनुशासन और बैंक मित्रों की एकजुटता में है।",
      messageEn: "Our power lies in discipline and the solidarity of Bank Mitras.",
      password: "123456",
      signatoryId: "sig-gs",
      letterSignatoryIds: ["sig-pres", "sig-gs"],
      status: "active",
      joinedDate: "2024-04-14",
      validUntil: nextYear,
      feePaid: 2100
    },
    {
      id: "mem-3",
      memberCode: "UPBMS-CORE-003",
      nameHi: "श्री महेंद्र प्रताप सिंह",
      nameEn: "Shri Mahendra Pratap Singh",
      fatherName: "श्री समर बहादुर सिंह",
      fatherNameEn: "Shri Samar Bahadur Singh",
      isCoreMember: true,
      memberCategory: "Core Committee (प्रदेश मुख्य कार्यकारिणी)",
      designationHi: "प्रदेश कोषाध्यक्ष",
      designationEn: "State Treasurer",
      displayOrder: 3,
      district: "वाराणसी (Varanasi)",
      block: "पिंडरा",
      blockEn: "Pindra",
      bankName: "Punjab National Bank (PNB)",
      bcCompany: "FIA Technology Services",
      koCode: "KO1003",
      mobile: "9450011225",
      whatsapp: "9450011225",
      email: "treasurer@upbms.org",
      bloodGroup: "A+",
      photoUrl: "/images/leader-treasurer.jpg",
      messageHi: "कल्याण कोष का एक-एक रुपया बैंक मित्रों के हित में समर्पित है।",
      messageEn: "Every penny of the welfare fund is dedicated to Bank Mitras.",
      password: "123456",
      signatoryId: "sig-treasurer",
      letterSignatoryIds: ["sig-pres", "sig-gs"],
      status: "active",
      joinedDate: "2024-04-14",
      validUntil: nextYear,
      feePaid: 2100
    },
    {
      id: "mem-4",
      memberCode: "UPBMS-CORE-004",
      nameHi: "श्रीमती सुनीता देवी",
      nameEn: "Smt. Sunita Devi",
      fatherName: "श्री बृजकिशोर",
      fatherNameEn: "Shri Brij Kishore",
      isCoreMember: true,
      memberCategory: "Core Committee (प्रदेश मुख्य कार्यकारिणी)",
      designationHi: "प्रदेश महिला प्रकोष्ठ प्रमुख",
      designationEn: "Head, State Women Wing",
      displayOrder: 4,
      district: "प्रयागराज (Prayagraj)",
      block: "सोरांव",
      blockEn: "Soraon",
      bankName: "Union Bank of India (UBI)",
      bcCompany: "CSC e-Governance Services India Ltd.",
      koCode: "KO1004",
      mobile: "9450011226",
      whatsapp: "9450011226",
      email: "womenwing@upbms.org",
      bloodGroup: "AB+",
      photoUrl: "/images/leader-women-head.jpg",
      messageHi: "महिला बैंक मित्रों की सुरक्षा और आत्मनिर्भरता हमारी प्राथमिकता है।",
      messageEn: "Safety and self-reliance of female Bank Mitras is our top priority.",
      password: "123456",
      signatoryId: "sig-gs",
      letterSignatoryIds: ["sig-pres", "sig-gs"],
      status: "active",
      joinedDate: "2024-04-14",
      validUntil: nextYear,
      feePaid: 2100
    },
    {
      id: "mem-5",
      memberCode: "UPBMS-2026-1001",
      nameHi: "श्री अमित कुमार मौर्य",
      nameEn: "Shri Amit Kumar Maurya",
      fatherName: "श्री राधे श्याम मौर्य",
      fatherNameEn: "Shri Radhey Shyam Maurya",
      isCoreMember: false,
      memberCategory: "General Member (सक्रिय सदस्य)",
      designationHi: "सक्रिय बैंक मित्र सदस्य",
      designationEn: "Active Bank Mitra Member",
      displayOrder: 10,
      district: "अयोध्या (Ayodhya)",
      block: "मिल्कीपुर",
      blockEn: "Milkipur",
      bankName: "Baroda UP Bank",
      bcCompany: "PayPoint India",
      koCode: "KO2011",
      mobile: "9450011227",
      whatsapp: "9450011227",
      email: "amit.maurya@example.com",
      bloodGroup: "O+",
      photoUrl: "",
      messageHi: "संघ से जुड़कर हमें सुरक्षा और पहचान मिली है।",
      messageEn: "Joining UPBMS gave us security and recognition.",
      password: "123456",
      signatoryId: "sig-gs",
      letterSignatoryIds: ["sig-gs"],
      status: "active",
      joinedDate: "2025-01-15",
      validUntil: nextYear,
      feePaid: 500
    },
    {
      id: "mem-6",
      memberCode: "UPBMS-2026-1002",
      nameHi: "श्री राहुल कुमार सिंह",
      nameEn: "Shri Rahul Kumar Singh",
      fatherName: "श्री देवेंद्र प्रताप सिंह",
      fatherNameEn: "Shri Devendra Pratap Singh",
      isCoreMember: false,
      memberCategory: "General Member (सक्रिय सदस्य)",
      designationHi: "सक्रिय बैंक मित्र सदस्य",
      designationEn: "Active Bank Mitra Member",
      displayOrder: 11,
      district: "गोरखपुर (Gorakhpur)",
      block: "कैम्पियरगंज",
      blockEn: "Campierganj",
      bankName: "State Bank of India (SBI)",
      bcCompany: "CSC e-Governance Services India Ltd.",
      koCode: "KO2012",
      mobile: "9450011228",
      whatsapp: "9450011228",
      email: "rahul.singh@example.com",
      bloodGroup: "B+",
      photoUrl: "",
      messageHi: "वित्तीय समावेशन की रीढ़ हैं उत्तर प्रदेश के बैंक मित्र।",
      messageEn: "Bank Mitras are the backbone of financial inclusion in UP.",
      password: "123456",
      signatoryId: "sig-gs",
      letterSignatoryIds: ["sig-gs"],
      status: "active",
      joinedDate: "2025-02-10",
      validUntil: nextYear,
      feePaid: 500
    }
  ];

  const circulars = [
    {
      id: "cir-1",
      titleHi: "राज्य स्तरीय बैंकिंग परिपत्र: बैंक मित्र सुरक्षा एवं टीडीएस कटौती निषेध",
      titleEn: "SLBC Circular Notice: Bank Mitra Security & Section 194N TDS Guidance",
      issuerHi: "राज्य स्तरीय बैंकर्स समिति (SLBC UP)",
      issuerEn: "SLBC Uttar Pradesh",
      date: "2026-10-18",
      fileUrl: "/images/circular-sample.svg",
      fileType: "svg",
      requiresMemberLogin: false
    }
  ];

  const externalLinks = [
    {
      id: "ext-1",
      titleHi: "सीएससी डिजिटल सेवा पोर्टल",
      titleEn: "CSC Digital Seva Portal",
      url: "https://digitalseva.csc.gov.in",
      imageUrl: "/images/portal-csc.jpg",
      order: 1,
      active: true
    },
    {
      id: "ext-2",
      titleHi: "प्रधानमंत्री जन धन योजना (PMJDY)",
      titleEn: "PMJDY Official Portal",
      url: "https://pmjdy.gov.in",
      imageUrl: "/images/portal-pmjdy.jpg",
      order: 2,
      active: true
    },
    {
      id: "ext-3",
      titleHi: "भारतीय रिज़र्व बैंक (RBI)",
      titleEn: "Reserve Bank of India",
      url: "https://rbi.org.in",
      imageUrl: "/images/portal-rbi.jpg",
      order: 3,
      active: true
    },
    {
      id: "ext-4",
      titleHi: "राज्य स्तरीय बैंकर्स समिति (SLBC UP)",
      titleEn: "SLBC Uttar Pradesh",
      url: "https://slbcup.com",
      imageUrl: "/images/portal-slbc.svg",
      order: 4,
      active: true
    },
    {
      id: "ext-5",
      titleHi: "आईआईबीएफ बीसी प्रमाणीकरण",
      titleEn: "IIBF BC Certification Portal",
      url: "https://iibf.org.in",
      imageUrl: "/images/portal-iibf.svg",
      order: 5,
      active: true
    },
    {
      id: "ext-6",
      titleHi: "राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल",
      titleEn: "National Cyber Crime Portal",
      url: "https://cybercrime.gov.in",
      imageUrl: "/images/portal-cyber.svg",
      order: 6,
      active: true
    }
  ];

  const documents = [
    {
      id: "doc-1",
      category: "memorandum",
      categoryHi: "मांग पत्र / ज्ञापन",
      categoryEn: "Memorandum",
      titleHi: "शासन एवं एसएलबीसी को प्रेषित 4-सूत्रीय मांग पत्र",
      titleEn: "4-Point Memorandum Submitted to Govt & SLBC",
      summaryHi: "बैंक मित्रों के निश्चित मानदेय, बीमा एवं टीडीएस समाधान हेतु प्रेषित मांग पत्र।",
      summaryEn: "Memorandum for fixed honorarium, accidental insurance and TDS exemption.",
      contentHi: "उत्तर प्रदेश बैंक मित्र संघ द्वारा प्रदेश के समस्त बैंक मित्रों के कल्याण, न्यूनतम ₹15,000 मानदेय, बिना नोटिस कोड ब्लॉक पर रोक, एवं ₹10 लाख दुर्घटना बीमा हेतु प्रस्तुत ज्ञापन।",
      contentEn: "Official memorandum presented by UPBMS demanding minimum honorarium of ₹15,000, protection against arbitrary termination and ₹10 lakh accidental insurance.",
      signatoryIds: ["sig-pres", "sig-gs"]
    },
    {
      id: "doc-2",
      category: "constitution",
      categoryHi: "संविधान व नियमावली",
      categoryEn: "Constitution & Rules",
      titleHi: "उत्तर प्रदेश बैंक मित्र संघ नियमावली एवं आचार संहिता",
      titleEn: "UPBMS Constitution & Code of Conduct",
      summaryHi: "संघ के सदस्यों के अधिकार, कर्तव्य एवं संगठनात्मक व्यवस्था।",
      summaryEn: "Rights, responsibilities and organizational structure for all members.",
      contentHi: "संगठन के समस्त सदस्यों हेतु अनिवार्य नियम, सदस्यता नवीनीकरण प्रक्रिया, एवं वित्तीय समावेशन सेवा गुणवत्ता मानक।",
      contentEn: "Mandatory rules, membership renewal process and service quality standards for all members.",
      signatoryIds: ["sig-pres", "sig-gs"]
    }
  ];

  const payments = [
    {
      id: "pay-1",
      receiptNo: "UPBMS-RCP-2026-1001",
      paymentCategory: "membership",
      memberId: "mem-1",
      memberCode: "UPBMS-CORE-001",
      payerName: "श्री राजेन्द्र प्रसाद तिवारी",
      payerNameEn: "Shri Rajendra Prasad Tiwari",
      mobile: "9450011223",
      district: "लखनऊ (Lucknow)",
      purposeHi: "प्रदेश मुख्य कार्यकारिणी सदस्यता शुल्क",
      purposeEn: "State Core Committee Membership Fee",
      purpose: "प्रदेश मुख्य कार्यकारिणी सदस्यता शुल्क",
      amount: 2100,
      mode: "UPI",
      utrNumber: "UPI202404149901",
      signatoryIds: ["sig-gs", "sig-treasurer"],
      status: "verified",
      date: "2024-04-14"
    },
    {
      id: "pay-2",
      receiptNo: "UPBMS-RCP-2026-1002",
      paymentCategory: "membership",
      memberId: "mem-2",
      memberCode: "UPBMS-CORE-002",
      payerName: "श्री आलोक कुमार वर्मा",
      payerNameEn: "Shri Alok Kumar Verma",
      mobile: "9450011224",
      district: "कानपुर नगर (Kanpur Nagar)",
      purposeHi: "प्रदेश मुख्य कार्यकारिणी सदस्यता शुल्क",
      purposeEn: "State Core Committee Membership Fee",
      purpose: "प्रदेश मुख्य कार्यकारिणी सदस्यता शुल्क",
      amount: 2100,
      mode: "UPI",
      utrNumber: "UPI202404149902",
      signatoryIds: ["sig-gs", "sig-treasurer"],
      status: "verified",
      date: "2024-04-14"
    },
    {
      id: "pay-3",
      receiptNo: "UPBMS-RCP-2026-1003",
      paymentCategory: "donation",
      memberId: "mem-1",
      memberCode: "UPBMS-CORE-001",
      payerName: "श्री राजेन्द्र प्रसाद तिवारी",
      payerNameEn: "Shri Rajendra Prasad Tiwari",
      mobile: "9450011223",
      district: "लखनऊ (Lucknow)",
      purposeHi: "बैंक मित्र संघर्ष एवं कल्याण कोष सहयोग राशि",
      purposeEn: "Bank Mitra Struggle & Welfare Fund Contribution",
      purpose: "बैंक मित्र संघर्ष एवं कल्याण कोष सहयोग राशि",
      amount: 1100,
      mode: "UPI",
      utrNumber: "UPI202601018801",
      signatoryIds: ["sig-gs", "sig-treasurer"],
      status: "verified",
      date: "2026-01-01"
    }
  ];

  const grievances = [
    {
      id: "grv-1",
      ticketNo: "GRV-2026-101",
      applicantName: "श्री सुरेश कुमार",
      applicantNameEn: "Shri Suresh Kumar",
      memberCode: "UPBMS-2026-1005",
      mobile: "9876543210",
      district: "गोरखपुर (Gorakhpur)",
      bankName: "State Bank of India (SBI)",
      bcCompany: "CSC e-Governance Services India Ltd.",
      koCode: "KO8872",
      issueType: "बिना नोटिस केओ कोड ब्लॉक",
      issueTypeEn: "KO Code Blocked Without Notice",
      subject: "शाखा प्रबंधक द्वारा बिना पूर्व सूचना केओ कोड ब्लॉक किया गया",
      subjectEn: "KO code blocked by branch manager without prior notice",
      description: "गत 3 वर्षों से निरंतर उत्कृष्ट कार्य करने के बावजूद बिना किसी नोटिस के 15 दिन से कोड बंद है। कृपया हस्तक्षेप कर कोड बहाल कराएं।",
      descriptionEn: "Despite 3 years of active service, code blocked without any notice. Requesting prompt intervention.",
      status: "resolved",
      adminRemark: "शाखा प्रबंधक एवं बीसी कंपनी राज्य समन्वयक से वार्ता कर कोड पुनः सक्रिय करा दिया गया है।",
      adminRemarkEn: "Code has been restored after liaison with Branch Manager and State BC coordinator.",
      createdAt: "2026-02-01"
    }
  ];

  const news = [
    {
      id: "news-1",
      category: "convention",
      categoryHi: "प्रांतीय महासम्मेलन",
      categoryEn: "State Convention",
      titleHi: "लखनऊ में आयोजित हुआ बैंक मित्र प्रांतीय अधिवेशन 2026",
      titleEn: "UP Bank Mitra State Convention 2026 Held in Lucknow",
      summaryHi: "प्रदेश के 75 जनपदों से पधारे 1500+ बैंक मित्रों ने उठाई निश्चित मानदेय एवं सुरक्षा की मांग।",
      summaryEn: "Over 1500 Bank Mitras from 75 districts gathered to demand minimum honorarium and security.",
      imageUrl: "/images/hero-banner-1.jpg",
      date: "2026-02-15"
    },
    {
      id: "news-2",
      category: "delegation",
      categoryHi: "शासन स्तर वार्ता",
      categoryEn: "Govt Level Talks",
      titleHi: "एसएलबीसी समन्वयक एवं वित्त विभाग के साथ संघ की सकारात्मक बैठक",
      titleEn: "Positive Dialogue Between UPBMS Delegation & SLBC Officials",
      summaryHi: "धारा 194N टीडीएस कटौती निवारण एवं मानदेय पर शासन स्तर से शीघ्र आदेश जारी करने का आश्वासन।",
      summaryEn: "Assurance given by officials on resolving Section 194N TDS deductions and honorarium guidelines.",
      imageUrl: "/images/hero-banner-2.jpg",
      date: "2026-02-28"
    }
  ];

  return {
    settings,
    meta,
    slides,
    certificates,
    demands,
    members,
    circulars,
    externalLinks,
    documents,
    payments,
    grievances,
    news,
    accessLogs: []
  };
}

module.exports = { createSeedDatabase };
