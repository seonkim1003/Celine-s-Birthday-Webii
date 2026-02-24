(function () {
  var config = window.BIRTHDAY_CONFIG || {};
  var intro = config.intro || {};
  var phases = Array.isArray(config.phases) ? config.phases.slice(0, 3) : [];
  var conclusion = config.conclusion || {};

  var screens = {
    intro: document.getElementById("intro-screen"),
    transition: document.getElementById("transition-screen"),
    scene: document.getElementById("scene-screen"),
    memory: document.getElementById("memory-screen"),
    suspense: document.getElementById("suspense-screen"),
    conclusion: document.getElementById("conclusion-screen")
  };

  var introTitle = document.getElementById("intro-title");
  var introDate = document.getElementById("intro-date");
  var introSubtitle = document.getElementById("intro-subtitle");
  var introNameplate = document.getElementById("intro-nameplate");
  var introPortrait = document.getElementById("intro-portrait");
  var startBtn = document.getElementById("start-btn");

  var transitionTitle = document.getElementById("transition-title");
  var transitionText = document.getElementById("transition-text");
  var transitionScreen = document.getElementById("transition-screen");
  var transitionCanvas = document.getElementById("transition-canvas");

  var sceneProgress = document.getElementById("scene-progress");
  var sceneTitle = document.getElementById("scene-title");
  var sceneObjective = document.getElementById("scene-objective");
  var scenePrompt = document.getElementById("scene-prompt");
  var sceneCanvas = document.getElementById("scene-canvas");
  var openMemoryBtn = document.getElementById("open-memory-btn");

  var memoryLabel = document.getElementById("memory-label");
  var memoryTitle = document.getElementById("memory-title");
  var memoryText = document.getElementById("memory-text");
  var memoryNote = document.getElementById("memory-note");
  var memoryMediaWrap = document.getElementById("memory-media-wrap");
  var nextSceneBtn = document.getElementById("next-scene-btn");
  var scenePrevBtn = document.getElementById("scene-prev-btn");
  var memoryPrevBtn = document.getElementById("memory-prev-btn");
  var memoryCanvas = document.getElementById("memory-canvas");

  var conclusionTitle = document.getElementById("conclusion-title");
  var conclusionMessage = document.getElementById("conclusion-message");
  var conclusionNote = document.getElementById("conclusion-note");
  var replayBtn = document.getElementById("replay-btn");
  var conclusionCanvas = document.getElementById("conclusion-canvas");
  var suspenseCanvas = document.getElementById("suspense-canvas");
  var conclusionGallery = document.getElementById("conclusion-gallery");
  var galleryTrack = document.getElementById("gallery-track");

  // ─── Rich-UI extra refs ───────────────────────────────────────────────────
  var previewNames = [0, 1, 2].map(function (i) { return document.getElementById("preview-name-" + i); });
  var previewTags  = [0, 1, 2].map(function (i) { return document.getElementById("preview-tag-" + i); });
  var timelineNodes = [0, 1, 2].map(function (i) { return document.getElementById("timeline-" + i); });
  var transitionSceneNum = document.getElementById("transition-scene-num");
  var transitionDots = [0, 1, 2].map(function (i) { return document.getElementById("tdot-" + i); });
  var memoryChips  = document.getElementById("memory-chips");
  var conclusionRecap = document.getElementById("conclusion-recap");

  // ─── Timing constants ────────────────────────────────────────────────────
  var TRANSITION_MS = 1150;
  var WALK_ANIM_MS = 3600;
  var TALK_MS = 2200;
  var LETTER_HAND_MS = 1600;
  var LETTER_OPEN_MS = 5000;
  var DPR = window.devicePixelRatio || 1;

  // ─── Per-scene descriptors ────────────────────────────────────────────────
  var SCENE_BUBBLE = [
    "we are here to share the gospel",
    "Come eat with us!",
    "I'm always here!!"
  ];

  var SCENE_METER = [
    "Celine and Isaac reached the person and are talking",
    "Isaac is back at the table \u2014 good food, even better company!",
    "They went their separate ways \u2014 but stayed close, text by text"
  ];

  var SCENE_OBJECTIVE = [
    "Watch Celine and Isaac walk to the person, then start talking.",
    "Watch Celine find Isaac at the car, invite him, and bring him back to eat with the group.",
    "Watch Celine and Isaac part ways and head home \u2014 then stay connected through their phones."
  ];

  var SCENE_PROMPT = [
    "Watch the animation, then tap the letter to unlock your memory.",
    "Watch the animation, then tap the menu card to unlock your memory.",
    "Watch the animation, then tap the message to unlock your memory."
  ];

  var SCENE_TRANSITION_TEXT = [
    "This was during the field after BEST training. Celine and Isaac were paired to go to the field together \u2014 Isaac decided to run, and Celine followed him.",
    "After worship, Isaac always sat in the car \u2014 alone. One day, Celine refused to let that be the end of the story.",
    "Late nights. Long messages. A friend who was always there \u2014 no matter the hour."
  ];

  var REVEAL_ARRIVE_TEXT = [
    "A letter is being handed over\u2026",
    "A menu appears at the table\u2026",
    "A message lights up\u2026"
  ];

  // ─── State ────────────────────────────────────────────────────────────────
  var currentIndex = 0;
  var transitionToken = 0;
  var transitionEffectsRaf = 0;
  var transitionEffectsToken = 0;
  var sceneAnimToken = 0;
  var sceneRaf = 0;
  var sceneProgressValue = 0;
  var sceneTalkingActive = false;
  var sceneTalkFrame = 0;
  var sceneTalkElapsed = 0;
  var sceneLetterHandT = 0;
  var sceneLetterOpenT = 0;
  var memoryEffectsRaf = 0;
  var memoryEffectsToken = 0;
  var conclusionRaf = 0;
  var conclusionToken = 0;
  var suspenseRaf = 0;
  var suspenseToken = 0;
  var sceneCanvasTapHandler = null;

  // ─── Scene image cache (preloaded for smooth canvas drawing) ──────────────
  var sceneImages = phases.map(function (phase) {
    if (!phase.imageUrl) return null;
    var img = new Image();
    img.src = phase.imageUrl;
    return img;
  });

  // ─── Screen helpers ───────────────────────────────────────────────────────
  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle("active", key === name);
    });
  }

  // ─── Canvas setup ─────────────────────────────────────────────────────────
  function fitCanvas() {
    var rect = sceneCanvas.getBoundingClientRect();
    var w = Math.max(1, Math.floor(rect.width));
    var h = Math.max(1, Math.floor(rect.height));
    sceneCanvas.width = Math.floor(w * DPR);
    sceneCanvas.height = Math.floor(h * DPR);
    var ctx = sceneCanvas.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return { ctx: ctx, w: w, h: h };
  }

  // ─── Low-level pixel drawing ──────────────────────────────────────────────
  function px(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function drawTree(ctx, x, y, s) {
    px(ctx, x + 4 * s, y + 10 * s, 4 * s, 10 * s, "#6f4a2f");
    px(ctx, x, y + 2 * s, 12 * s, 10 * s, "#4f9a5f");
    px(ctx, x + 2 * s, y, 8 * s, 4 * s, "#59b36d");
  }

  function drawPixelPerson(ctx, x, feetY, s, palette, frame, ponytail, isTalking) {
    var y = Math.round(feetY - 17 * s);
    var walkFrame = frame ? 1 : 0;

    // Head and hair
    px(ctx, x + 2 * s, y, 4 * s, 4 * s, palette.skin);
    px(ctx, x + 1 * s, y - 1 * s, 6 * s, 2 * s, palette.hair);
    if (ponytail) px(ctx, x + 6 * s, y, 2 * s, 3 * s, palette.hair);

    // Eyes (clearly below hair)
    px(ctx, x + 3 * s, y + 2 * s, 1 * s, 2 * s, "#101010");
    px(ctx, x + 5 * s, y + 2 * s, 1 * s, 2 * s, "#101010");

    px(ctx, x + 1 * s, y + 4 * s, 6 * s, 6 * s, palette.shirt);

    var leftArmY = isTalking ? y + (frame ? 3 : 5) * s : y + (5 + walkFrame) * s;
    var rightArmY = isTalking ? y + (frame ? 5 : 3) * s : y + (6 - walkFrame) * s;
    px(ctx, x, leftArmY, 2 * s, 5 * s, palette.skin);
    px(ctx, x + 6 * s, rightArmY, 2 * s, 5 * s, palette.skin);

    var leftLegH = isTalking ? 6 : (frame ? 5 : 6);
    var rightLegH = isTalking ? 6 : (frame ? 6 : 5);
    px(ctx, x + 2 * s, y + 10 * s, 2 * s, leftLegH * s, palette.pants);
    px(ctx, x + 4 * s, y + 10 * s, 2 * s, rightLegH * s, palette.pants);
    px(ctx, x + 2 * s, y + 15 * s, 2 * s, 2 * s, palette.shoe);
    px(ctx, x + 4 * s, y + 15 * s, 2 * s, 2 * s, palette.shoe);
  }

  function drawNpc(ctx, x, feetY, s) {
    var npcPalette = { skin: "#f0c49c", hair: "#30251f", shirt: "#7aa1ff", pants: "#3f4b67", shoe: "#1f1f1f" };
    drawPixelPerson(ctx, x, feetY, s, npcPalette, 0, false, false);
  }

  function drawSpeechBubble(ctx, sceneW, anchorX, anchorY, text) {
    ctx.save();
    ctx.font = "bold 11px Arial, sans-serif";
    var textW = Math.ceil(ctx.measureText(text).width);
    var bubbleW = textW + 16;
    var bubbleH = 24;
    var bubbleX = Math.max(6, Math.min(Math.round(anchorX - bubbleW / 2), sceneW - bubbleW - 6));
    var bubbleY = Math.max(6, anchorY - bubbleH);
    var tailX = Math.round(anchorX - 4);
    var tailY = bubbleY + bubbleH;

    px(ctx, bubbleX, bubbleY, bubbleW, bubbleH, "#ffffff");
    px(ctx, bubbleX, bubbleY, bubbleW, 2, "#1f1f1f");
    px(ctx, bubbleX, bubbleY + bubbleH - 2, bubbleW, 2, "#1f1f1f");
    px(ctx, bubbleX, bubbleY, 2, bubbleH, "#1f1f1f");
    px(ctx, bubbleX + bubbleW - 2, bubbleY, 2, bubbleH, "#1f1f1f");

    px(ctx, tailX, tailY, 8, 2, "#1f1f1f");
    px(ctx, tailX + 2, tailY + 2, 4, 2, "#1f1f1f");
    px(ctx, tailX + 3, tailY + 4, 2, 2, "#1f1f1f");
    px(ctx, tailX + 2, tailY, 4, 2, "#ffffff");
    px(ctx, tailX + 3, tailY + 2, 2, 2, "#ffffff");

    ctx.fillStyle = "#101010";
    ctx.fillText(text, bubbleX + 8, bubbleY + 16);
    ctx.restore();
  }

  function drawNameLabel(ctx, sceneW, centerX, topY, name) {
    ctx.save();
    ctx.font = "bold 10px Arial, sans-serif";
    var textW = Math.ceil(ctx.measureText(name).width);
    var labelX = Math.max(2, Math.min(Math.round(centerX - textW / 2), sceneW - textW - 2));
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(labelX - 3, topY - 12, textW + 6, 13);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, labelX, topY - 2);
    ctx.restore();
  }

  // ─── Scene-specific prop helpers ─────────────────────────────────────────
  function drawMenuProp(ctx, cx, cy) {
    var mw = 64, mh = 48;
    var mx = cx - Math.floor(mw / 2);
    var my = cy - Math.floor(mh / 2);
    px(ctx, mx, my, mw, mh, "#c8900a");
    px(ctx, mx + 2, my + 2, mw - 4, mh - 4, "#fff8e0");
    px(ctx, cx - 1, my + 2, 2, mh - 4, "#a07020");
    for (var li = 0; li < 4; li++) {
      px(ctx, mx + 5, my + 10 + li * 8, Math.floor(mw / 2) - 10, 2, "#d4b878");
      px(ctx, cx + 4, my + 10 + li * 8, Math.floor(mw / 2) - 10, 2, "#d4b878");
    }
    ctx.save();
    ctx.font = "bold 8px Arial, sans-serif";
    ctx.fillStyle = "#8b5010";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("MENU", cx, my + 3);
    ctx.restore();
  }

  function drawPhoneProp(ctx, cx, cy, frame) {
    var pw = 34, ph = 56;
    var bx = cx - Math.floor(pw / 2);
    var by = cy - Math.floor(ph / 2);
    var baseA = ctx.globalAlpha;
    px(ctx, bx, by, pw, ph, "#2a2a4a");
    px(ctx, bx + 3, by + 8, pw - 6, ph - 16, "#111130");
    px(ctx, bx + 4, by + 9, pw - 8, ph - 18, "#1e2a5e");
    px(ctx, bx + 5, by + 12, 16, 7, "#334488");
    px(ctx, bx + 10, by + 22, 14, 7, "#5588cc");
    px(ctx, bx + 5, by + 32, 18, 7, "#334488");
    ctx.globalAlpha = baseA * (0.5 + 0.5 * (frame % 2));
    px(ctx, bx + pw - 9, by + 10, 6, 6, "#ff4488");
    ctx.globalAlpha = baseA;
    px(ctx, cx - 8, by + ph - 5, 16, 2, "#3a3a5a");
  }

  // ─── Letter overlay — rich in-scene panel reveal ─────────────────────────
  function drawLetterOverlay(ctx, w, h, handT, openT, sceneIdx, waitForTap, tapElapsed) {
    if (handT <= 0) return;
    waitForTap = waitForTap === true;
    tapElapsed = tapElapsed || 0;

    var phase = phases[sceneIdx] || {};
    var memText = phase.memory || SCENE_TRANSITION_TEXT[sceneIdx] || "";
    var noteText = phase.note || "";
    var titleText = (phase.title || ("Scene " + (sceneIdx + 1))).replace(/^Scene \d+:\s*/, "");
    var img = sceneImages[sceneIdx] || null;

    // Per-scene themes: parchment (letter) / warm cream (menu) / cool blue (phone)
    var THEMES = [
      { panelBg: "#fffef0", hdrBg: "rgba(200,160,64,0.14)", hdrFg: "#7a4a30", border: "#8B5E3C", noteBg: "rgba(255,123,175,0.10)", noteBar: "#ff7bb3", noteFg: "#7a4a5a", tapBg: "#c8a040", icon: "\u2709 " },
      { panelBg: "#fff9ec", hdrBg: "rgba(160,100,30,0.14)", hdrFg: "#6a3c1a", border: "#7a4a1a", noteBg: "rgba(255,165,60,0.10)", noteBar: "#e07020", noteFg: "#6a3c1a", tapBg: "#b88030", icon: "\u2756 " },
      { panelBg: "#f4f8ff", hdrBg: "rgba(78,113,217,0.12)", hdrFg: "#2a4a8a", border: "#6B4423", noteBg: "rgba(78,113,217,0.10)", noteBar: "#4e71d9", noteFg: "#2a4a8a", tapBg: "#4e71d9", icon: "\u25BA " }
    ];
    var theme = THEMES[sceneIdx] || THEMES[0];

    var alpha = Math.min(1, handT * 2.5);

    // ── Scene-specific prop position ──────────────────────────────────────
    var propCX, propCY;
    if (sceneIdx === 1) {
      // Menu card rises from bottom-center (table area)
      var ease1 = handT < 0.5 ? 2 * handT * handT : -1 + (4 - 2 * handT) * handT;
      propCX = Math.floor(w * 0.50);
      propCY = Math.floor(h * 0.85 + (h * 0.42 - h * 0.85) * Math.min(1, ease1 * 1.2));
    } else if (sceneIdx === 2) {
      // Phone slides in from right
      var ease2 = handT < 0.5 ? 2 * handT * handT : -1 + (4 - 2 * handT) * handT;
      propCX = Math.floor(w * 0.82 + (w * 0.50 - w * 0.82) * Math.min(1, ease2 * 1.2));
      propCY = Math.floor(h * 0.44);
    } else {
      // Envelope slides from right (NPC position)
      var ease0 = handT < 0.5 ? 2 * handT * handT : -1 + (4 - 2 * handT) * handT;
      propCX = Math.floor(w * 0.75 + (w * 0.50 - w * 0.75) * Math.min(1, ease0 * 1.2));
      propCY = Math.floor(h * 0.50);
    }

    // Panel expansion timing
    var panelT    = openT >= 0.28 ? Math.min(1, (openT - 0.28) / 0.24) : 0;
    var contentT  = openT >= 0.50 ? Math.min(1, (openT - 0.50) / 0.36) : 0;
    var noteRevT  = openT >= 0.78 ? Math.min(1, (openT - 0.78) / 0.22) : 0;

    // ── Full-screen memory panel ──────────────────────────────────────────
    if (panelT > 0) {
      var panelX = 8;
      var panelY = 6;
      var panelW = w - 16;
      var panelH = h - 12;

      var isSmall = h < 480;
      var tapBarH = isSmall ? 20 : 26;
      var noteH   = isSmall ? 32 : 42;
      var noteTopY  = panelY + panelH - tapBarH - noteH;
      var bodyTopY  = panelY + (isSmall ? 36 : 42);
      var bodyH     = noteTopY - bodyTopY - 4;

      ctx.save();
      ctx.globalAlpha = alpha * panelT;

      // Shadow
      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = theme.panelBg;
      roundRect(ctx, panelX, panelY, panelW, panelH, 10);
      ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.shadowColor = "transparent";

      // Header strip (height 28px)
      ctx.fillStyle = theme.hdrBg;
      ctx.fillRect(panelX + 2, panelY + 2, panelW - 4, 28);
      ctx.font = "bold 13px Arial, sans-serif";
      ctx.fillStyle = theme.hdrFg;
      ctx.textBaseline = "middle";
      ctx.fillText(theme.icon + titleText, panelX + 12, panelY + 16);
      ctx.textBaseline = "alphabetic";

      // Divider under header
      ctx.globalAlpha = alpha * panelT * 0.40;
      ctx.fillStyle = theme.border;
      ctx.fillRect(panelX + 10, panelY + 31, panelW - 20, 1);
      ctx.globalAlpha = alpha * panelT;

      // ── Photo (right column; smaller on narrow/short screens so text fits) ──
      var photoPct = isSmall ? 0.28 : 0.40;
      var photoMax = isSmall ? 100 : 240;
      var photoW = Math.min(Math.floor(panelW * photoPct), photoMax);
      var photoH = Math.min(Math.floor(photoW * 0.76), bodyH - 8);
      var photoX = panelX + panelW - photoW - 12;
      var photoY = bodyTopY + Math.max(0, Math.floor((bodyH - photoH) / 2));

      if (contentT > 0) {
        var photoA = Math.min(1, contentT * 2.2);
        ctx.globalAlpha = alpha * panelT * photoA;
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          roundRect(ctx, photoX, photoY, photoW, photoH, 6);
          ctx.clip();
          // Fill background so letterbox/pillarbox gaps match the panel
          ctx.fillStyle = theme.panelBg;
          ctx.fillRect(photoX, photoY, photoW, photoH);
          // Contain-fit: preserve natural aspect ratio, center within container
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          var natW = img.naturalWidth;
          var natH = img.naturalHeight;
          var fitScale = Math.min(photoW / natW, photoH / natH);
          var fitW = Math.floor(natW * fitScale);
          var fitH = Math.floor(natH * fitScale);
          var fitX = photoX + Math.floor((photoW - fitW) / 2);
          var fitY = photoY + Math.floor((photoH - fitH) / 2);
          ctx.drawImage(img, fitX, fitY, fitW, fitH);
          ctx.restore();
          ctx.imageSmoothingEnabled = false;
          ctx.globalAlpha = alpha * panelT * photoA;
        } else {
          ctx.fillStyle = "#e8d8b0";
          ctx.fillRect(photoX, photoY, photoW, photoH);
          ctx.globalAlpha = alpha * panelT * photoA * 0.6;
          ctx.font = "11px Arial, sans-serif";
          ctx.fillStyle = "#9a8060";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("photo", photoX + photoW / 2, photoY + photoH / 2);
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
        }
        ctx.globalAlpha = alpha * panelT;
      }

      // ── Memory text (left column) ─────────────────────────────────────
      var textX  = panelX + 12;
      var textW  = photoX - textX - 12;

      if (contentT > 0 && memText) {
        var charsToShow = Math.ceil(memText.length * Math.min(1, contentT * 1.6));
        var displayText = memText.slice(0, charsToShow);
        ctx.globalAlpha = alpha * panelT;
        ctx.font = isSmall ? "11px Arial, sans-serif" : "13px Arial, sans-serif";
        ctx.fillStyle = "#3a2b34";
        var words = displayText.split(" ");
        var wline = "";
        var lineH = isSmall ? 14 : 18;
        var lineY = bodyTopY + (isSmall ? 12 : 18);
        for (var wi = 0; wi < words.length; wi++) {
          var tl = wline + words[wi] + " ";
          if (ctx.measureText(tl).width > textW && wline !== "") {
            ctx.fillText(wline.trim(), textX, lineY);
            wline = words[wi] + " ";
            lineY += lineH;
            if (lineY > bodyTopY + bodyH) break;
          } else {
            wline = tl;
          }
        }
        if (wline && lineY <= bodyTopY + bodyH) {
          ctx.fillText(wline.trim(), textX, lineY);
        }
      }

      // ── Note strip ────────────────────────────────────────────────────
      if (noteRevT > 0 && noteText) {
        ctx.globalAlpha = alpha * panelT * noteRevT;
        ctx.fillStyle = theme.noteBg;
        ctx.fillRect(panelX + 2, noteTopY, panelW - 4, noteH);
        ctx.fillStyle = theme.noteBar;
        ctx.fillRect(panelX + 10, noteTopY + 5, 3, noteH - 10);
        ctx.font = "italic 12px Arial, sans-serif";
        ctx.fillStyle = theme.noteFg;
        var noteMaxW = panelW - 34;
        var noteWords = noteText.split(" ");
        var nline = "";
        var nlineY = noteTopY + 16;
        var nlinesDone = 0;
        for (var nwi = 0; nwi < noteWords.length; nwi++) {
          var ntl = nline + noteWords[nwi] + " ";
          if (ctx.measureText(ntl).width > noteMaxW && nline !== "") {
            ctx.fillText(nline.trim(), panelX + 18, nlineY);
            nline = noteWords[nwi] + " ";
            nlineY += 15;
            nlinesDone++;
            if (nlinesDone >= 2) break;
          } else {
            nline = ntl;
          }
        }
        if (nline && nlinesDone < 2) {
          ctx.fillText(nline.trim(), panelX + 18, nlineY);
        }
      }

      // ── Tap-to-continue bar ───────────────────────────────────────────
      if (waitForTap) {
        var tapFadeIn = Math.min(1, tapElapsed / 600);
        var tapPulse  = 0.55 + 0.45 * Math.sin(tapElapsed / 500);
        ctx.globalAlpha = alpha * panelT * tapFadeIn * tapPulse;
        ctx.fillStyle = theme.tapBg;
        ctx.fillRect(panelX + 2, noteTopY + noteH, panelW - 4, tapBarH);
        ctx.font = "bold 11px Arial, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Tap to continue \u2193", panelX + panelW / 2, noteTopY + noteH + tapBarH / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      }

      ctx.restore();
      return;
    }

    // ── Small prop (handT phase and early openT before panel expands) ─────
    ctx.save();
    ctx.globalAlpha = alpha;
    if (sceneIdx === 1) {
      drawMenuProp(ctx, propCX, propCY);
    } else if (sceneIdx === 2) {
      var phoneFr = Math.floor(tapElapsed / 300) % 2;
      drawPhoneProp(ctx, propCX, propCY, phoneFr);
    } else {
      // Envelope
      var envW = 56, envH = 38;
      var ex = propCX - Math.floor(envW / 2);
      var ey = propCY - Math.floor(envH / 2);
      px(ctx, ex, ey + 12, envW, envH - 12, "#fffde8");
      px(ctx, ex, ey + 12, envW, 2, "#c8a040");
      px(ctx, ex, ey + 12, 2, envH - 12, "#c8a040");
      px(ctx, ex + envW - 2, ey + 12, 2, envH - 12, "#c8a040");
      px(ctx, ex, ey + envH - 2, envW, 2, "#c8a040");
      if (openT < 0.22) {
        for (var ri = 0; ri < 13; ri++) {
          var rw = Math.max(2, envW - ri * 2);
          px(ctx, ex + ri, ey + ri, rw, 2, ri < 2 ? "#c8a040" : "#e8c860");
        }
        px(ctx, propCX - 5, ey + 14, 10, 9, "#cc3355");
        ctx.font = "bold 8px Arial, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("\u2665", propCX - 4, ey + 22);
      } else {
        var scrollFrac = Math.min(1, (openT - 0.22) / 0.06);
        if (scrollFrac > 0) {
          var paperH = Math.floor(scrollFrac * 22);
          px(ctx, ex + 4, ey + 12 - paperH, envW - 8, paperH, "#fffff0");
        }
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // ─── Mini person for transition canvas ───────────────────────────────────
  function drawMiniPerson(ctx, x, feetY, s, shirtColor, hairColor, frame, ponytail) {
    var bob = frame ? 0 : s;
    var y = feetY - 9 * s - bob;
    ctx.fillStyle = "#ffd1b8";
    ctx.fillRect(x + s, y, 3 * s, 3 * s);
    ctx.fillStyle = hairColor;
    ctx.fillRect(x, y - s, 5 * s, s);
    if (ponytail) ctx.fillRect(x + 4 * s, y, s, 2 * s);
    ctx.fillStyle = "#101010";
    ctx.fillRect(x + s, y + s, s, s);
    ctx.fillRect(x + 3 * s, y + s, s, s);
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x + s, y + 3 * s, 3 * s, 3 * s);
    ctx.fillStyle = "#2f3c5a";
    ctx.fillRect(x + s, y + 6 * s, s, (frame ? 3 : 2) * s);
    ctx.fillRect(x + 2 * s, y + 6 * s, s, (frame ? 2 : 3) * s);
  }

  // ─── Scene 1: Park evangelism ─────────────────────────────────────────────
  function drawScene1Frame(ctx, w, h, t, isTalking, talkFrame) {
    var horizon = Math.floor(h * 0.58);
    var floorTop = Math.floor(h * 0.7);
    var floorY = floorTop + 2;

    px(ctx, 0, 0, w, horizon, "#cdeeff");
    px(ctx, 0, horizon, w, h - horizon, "#95cd7e");
    px(ctx, 0, floorTop, w, Math.floor(h * 0.18), "#d7b487");
    px(ctx, 0, floorTop + Math.floor(h * 0.18), w, h - floorTop - Math.floor(h * 0.18), "#7ebc66");

    drawTree(ctx, Math.floor(w * 0.07), Math.floor(h * 0.43), 3);
    drawTree(ctx, Math.floor(w * 0.23), Math.floor(h * 0.46), 2);
    drawTree(ctx, Math.floor(w * 0.74), Math.floor(h * 0.44), 3);

    var startX = Math.floor(w * 0.08);
    var endX = Math.floor(w * 0.53);
    var duoBaseX = Math.floor(startX + (endX - startX) * t);
    var npcX = Math.floor(w * 0.68);
    var frame = isTalking ? talkFrame : Math.floor(t * 24) % 2;

    var celinePalette = { skin: "#ffd1b8", hair: "#3a2a22", shirt: "#ff92be", pants: "#4f7cc9", shoe: "#2a2a2a" };
    var isaacPalette = { skin: "#f2c9a2", hair: "#2f241f", shirt: "#4e71d9", pants: "#2f3c5a", shoe: "#1f1f1f" };

    var spriteH = 17 * 3;
    var headTop = floorY - spriteH;

    drawPixelPerson(ctx, duoBaseX, floorY, 3, celinePalette, frame, true, isTalking);
    drawPixelPerson(ctx, duoBaseX + 30, floorY, 3, isaacPalette, frame ^ 1, false, isTalking);
    drawNpc(ctx, npcX, floorY, 3);

    drawNameLabel(ctx, w, duoBaseX + 12, headTop - 4, "Celine");
    drawNameLabel(ctx, w, duoBaseX + 42, headTop - 4, "Isaac");

    if (isTalking) {
      drawSpeechBubble(ctx, w, duoBaseX + 16, floorY - spriteH - 36, SCENE_BUBBLE[0]);
    }
  }

  // ─── Scene 2: Celine finds Isaac at the car, invites him, they eat together ──
  function drawScene2Frame(ctx, w, h, t, isTalking, talkFrame) {
    var floorTop = Math.floor(h * 0.68);
    var floorY = floorTop + 2;
    var frame = isTalking ? talkFrame : Math.floor(t * 24) % 2;
    var midX = Math.floor(w * 0.42); // divider: outdoor left / indoor right

    // ── Background ──────────────────────────────────────────────────────────
    // Outdoor left: parking area
    px(ctx, 0, 0, midX, Math.floor(h * 0.56), "#b8d8f0");
    px(ctx, 0, Math.floor(h * 0.56), midX, h - Math.floor(h * 0.56), "#c0bca0");
    // Clouds
    px(ctx, Math.floor(w * 0.06), Math.floor(h * 0.10), 24, 6, "#ffffff");
    px(ctx, Math.floor(w * 0.08), Math.floor(h * 0.08), 16, 6, "#ffffff");
    px(ctx, Math.floor(w * 0.20), Math.floor(h * 0.15), 20, 5, "#efefef");

    // Indoor right: cafeteria
    px(ctx, midX, 0, w - midX, Math.floor(h * 0.08), "#aa7722");
    px(ctx, midX, Math.floor(h * 0.08), w - midX, Math.floor(h * 0.60), "#ffe8c0");
    px(ctx, midX, floorTop, w - midX, Math.floor(h * 0.18), "#c8a070");
    px(ctx, midX, floorTop + Math.floor(h * 0.18), w - midX, h - floorTop - Math.floor(h * 0.18), "#9a7048");

    // Sunlit window on right wall
    var winX = Math.floor(w * 0.82), winY = Math.floor(h * 0.12);
    var winW = Math.floor(w * 0.10), winH = Math.floor(h * 0.20);
    px(ctx, winX, winY, winW, winH, "#fff0c0");
    px(ctx, winX, winY, winW, 3, "#886622");
    px(ctx, winX, winY, 3, winH, "#886622");
    px(ctx, winX + winW - 3, winY, 3, winH, "#886622");
    px(ctx, winX, winY + winH - 3, winW, 3, "#886622");

    // Doorway arch between outdoor and indoor
    px(ctx, midX - 3, 0, 6, floorTop, "#8b6030");

    // ── Pixel car (left/outdoor) ────────────────────────────────────────────
    var carX = Math.floor(w * 0.04);
    var carY = floorY - 28;
    px(ctx, carX, carY + 10, 56, 18, "#4a6fa8");
    px(ctx, carX + 8, carY + 2, 40, 10, "#3a5f98");
    px(ctx, carX + 10, carY + 4, 13, 6, "#9bc8e8");
    px(ctx, carX + 33, carY + 4, 13, 6, "#9bc8e8");
    px(ctx, carX + 4, carY + 24, 12, 6, "#1a1a1a");
    px(ctx, carX + 40, carY + 24, 12, 6, "#1a1a1a");
    px(ctx, carX + 28, carY + 10, 2, 18, "#3a5078");
    px(ctx, carX + 48, carY + 12, 6, 4, "#fffaaa");

    // ── Group table (right/indoor) ───────────────────────────────────────────
    var tableX = Math.floor(w * 0.60);
    var tableW = Math.floor(w * 0.30);
    var tableTop = floorY - 14;

    var gPal1 = { skin: "#f5c498", hair: "#1a1010", shirt: "#ff7744", pants: "#3a5a38", shoe: "#1a1010" };
    var gPal2 = { skin: "#d49268", hair: "#3a2010", shirt: "#44aa55", pants: "#223344", shoe: "#1a1010" };
    var gPal3 = { skin: "#ffe0c0", hair: "#2a1a10", shirt: "#cc44ff", pants: "#334466", shoe: "#1a1010" };

    drawPixelPerson(ctx, tableX + Math.floor(tableW * 0.05), floorY, 2, gPal1, frame, false, false);
    drawPixelPerson(ctx, tableX + Math.floor(tableW * 0.38), floorY, 2, gPal2, frame ^ 1, true, false);
    drawPixelPerson(ctx, tableX + Math.floor(tableW * 0.68), floorY, 2, gPal3, frame, false, false);

    // Table surface over NPCs (depth)
    px(ctx, tableX - 4, tableTop, tableW + 8, 8, "#8b5e2a");
    px(ctx, tableX - 4, tableTop + 8, tableW + 8, 4, "#6a4420");
    px(ctx, tableX + 8, tableTop + 12, 8, 18, "#7a5028");
    px(ctx, tableX + tableW - 16, tableTop + 12, 8, 18, "#7a5028");
    // Food on table
    px(ctx, tableX + 10, tableTop - 3, 8, 5, "#ff9944");
    px(ctx, tableX + 26, tableTop - 3, 8, 5, "#88cc44");
    px(ctx, tableX + 44, tableTop - 3, 8, 5, "#cc4444");

    var celinePalette = { skin: "#ffd1b8", hair: "#3a2a22", shirt: "#ff92be", pants: "#4f7cc9", shoe: "#2a2a2a" };
    var isaacPalette = { skin: "#f2c9a2", hair: "#2f241f", shirt: "#4e71d9", pants: "#2f3c5a", shoe: "#1f1f1f" };
    var spriteH = 17 * 3;
    var headTop = floorY - spriteH;

    // Key X positions
    var celineTableX = tableX - 34;
    var isaacCarX = carX + 34;

    // ── Phases ────────────────────────────────────────────────────────────────
    // A (0.00–0.22): Celine eating at table; Isaac alone at car
    // B (0.22–0.52): Celine walks from table toward car
    // C (0.52–0.68): Celine reaches Isaac; invites him ("Come eat with us!")
    // D (0.68–1.00): Both walk back to the table together
    // isTalking: Both seated at table with group

    if (!isTalking && t < 0.22) {
      drawPixelPerson(ctx, celineTableX, floorY, 3, celinePalette, frame, true, false);
      drawNameLabel(ctx, w, celineTableX + 12, headTop - 4, "Celine");
      drawPixelPerson(ctx, isaacCarX, floorY, 3, isaacPalette, 0, false, false);
      drawNameLabel(ctx, w, isaacCarX + 12, headTop - 4, "Isaac");
    } else if (!isTalking && t < 0.52) {
      var pt = (t - 0.22) / 0.30;
      var cX = Math.floor(celineTableX + (isaacCarX - 28 - celineTableX) * pt);
      drawPixelPerson(ctx, cX, floorY, 3, celinePalette, frame, true, false);
      drawNameLabel(ctx, w, cX + 12, headTop - 4, "Celine");
      drawPixelPerson(ctx, isaacCarX, floorY, 3, isaacPalette, 0, false, false);
      drawNameLabel(ctx, w, isaacCarX + 12, headTop - 4, "Isaac");
    } else if (!isTalking && t < 0.68) {
      var cX = isaacCarX - 28;
      drawPixelPerson(ctx, cX, floorY, 3, celinePalette, frame, true, false);
      drawNameLabel(ctx, w, cX + 12, headTop - 4, "Celine");
      drawPixelPerson(ctx, isaacCarX, floorY, 3, isaacPalette, frame ^ 1, false, false);
      drawNameLabel(ctx, w, isaacCarX + 12, headTop - 4, "Isaac");
      drawSpeechBubble(ctx, w, cX + 16, floorY - spriteH - 36, SCENE_BUBBLE[1]);
    } else if (!isTalking) {
      var pt = (t - 0.68) / 0.32;
      var dX = Math.floor((isaacCarX - 28) + (celineTableX - (isaacCarX - 28)) * pt);
      drawPixelPerson(ctx, dX, floorY, 3, celinePalette, frame, true, false);
      drawPixelPerson(ctx, dX + 28, floorY, 3, isaacPalette, frame ^ 1, false, false);
      drawNameLabel(ctx, w, dX + 12, headTop - 4, "Celine");
      drawNameLabel(ctx, w, dX + 40, headTop - 4, "Isaac");
    } else {
      drawPixelPerson(ctx, celineTableX, floorY, 3, celinePalette, talkFrame, true, true);
      drawPixelPerson(ctx, celineTableX + 28, floorY, 3, isaacPalette, talkFrame ^ 1, false, true);
      drawNameLabel(ctx, w, celineTableX + 12, headTop - 4, "Celine");
      drawNameLabel(ctx, w, celineTableX + 40, headTop - 4, "Isaac");
      drawSpeechBubble(ctx, w, celineTableX + 26, floorY - spriteH - 36, "Let\u2019s eat!");
    }
  }

  // ─── Scene 3: Parting ways, separate homes, late-night texting ───────────
  function drawScene3Frame(ctx, w, h, t, isTalking, talkFrame) {
    var floorTop = Math.floor(h * 0.68);
    var floorY = floorTop + 2;
    var frame = isTalking ? talkFrame : Math.floor(t * 24) % 2;

    // ── Night sky ────────────────────────────────────────────────────────────
    px(ctx, 0, 0, w, h, "#0d0d2b");
    px(ctx, 0, floorTop, w, Math.floor(h * 0.18), "#161628");
    px(ctx, 0, floorTop + Math.floor(h * 0.18), w, h - floorTop - Math.floor(h * 0.18), "#0a0a1e");

    // Crescent moon (top right)
    var mx = Math.floor(w * 0.84);
    var my = Math.floor(h * 0.07);
    var mc = "#fff8d0";
    px(ctx, mx + 4, my, 8, 2, mc);
    px(ctx, mx + 2, my + 2, 12, 4, mc);
    px(ctx, mx, my + 6, 16, 4, mc);
    px(ctx, mx + 2, my + 10, 12, 4, mc);
    px(ctx, mx + 4, my + 14, 8, 2, mc);
    px(ctx, mx + 7, my + 2, 9, 12, "#0d0d2b");

    // Twinkling stars
    var starPositions = [
      [0.05, 0.08], [0.15, 0.05], [0.25, 0.12], [0.38, 0.06],
      [0.48, 0.14], [0.10, 0.20], [0.30, 0.18], [0.55, 0.10],
      [0.18, 0.30], [0.42, 0.24], [0.62, 0.16], [0.72, 0.08],
      [0.60, 0.28], [0.20, 0.10]
    ];
    starPositions.forEach(function (sd, i) {
      ctx.globalAlpha = (i % 2 === frame % 2) ? 1 : 0.35;
      ctx.fillStyle = "#fffbd0";
      ctx.fillRect(Math.floor(sd[0] * w), Math.floor(sd[1] * h), 2, 2);
    });
    ctx.globalAlpha = 1;

    // ── Pixel houses ────────────────────────────────────────────────────────
    // Celine's house (left)
    var lhX = Math.floor(w * 0.03);
    var lhY = floorTop - 52;
    px(ctx, lhX, lhY + 16, 40, 38, "#2e2e4a");
    px(ctx, lhX - 4, lhY + 12, 48, 6, "#3a2e1e");
    px(ctx, lhX + 2, lhY + 4, 36, 10, "#3a2e1e");
    px(ctx, lhX + 8, lhY - 2, 24, 8, "#3a2e1e");
    px(ctx, lhX + 14, lhY - 8, 12, 8, "#3a2e1e");
    var lWinAlpha = t > 0.65 ? (isTalking ? 0.95 : 0.72) : 0.28;
    ctx.globalAlpha = lWinAlpha;
    px(ctx, lhX + 6, lhY + 22, 10, 10, "#ffe8a0");
    px(ctx, lhX + 22, lhY + 22, 10, 10, "#ffe8a0");
    ctx.globalAlpha = 1;
    px(ctx, lhX + 15, lhY + 36, 10, 18, "#4a3020");
    drawNameLabel(ctx, w, lhX + 20, lhY - 14, "Celine\u2019s");

    // Isaac's house (right)
    var rhX = Math.floor(w * 0.78);
    var rhY = floorTop - 52;
    px(ctx, rhX, rhY + 16, 40, 38, "#2e2e4a");
    px(ctx, rhX - 4, rhY + 12, 48, 6, "#3a2e1e");
    px(ctx, rhX + 2, rhY + 4, 36, 10, "#3a2e1e");
    px(ctx, rhX + 8, rhY - 2, 24, 8, "#3a2e1e");
    px(ctx, rhX + 14, rhY - 8, 12, 8, "#3a2e1e");
    var rWinAlpha = t > 0.65 ? (isTalking ? 0.95 : 0.72) : 0.28;
    ctx.globalAlpha = rWinAlpha;
    px(ctx, rhX + 6, rhY + 22, 10, 10, "#ffe8a0");
    px(ctx, rhX + 22, rhY + 22, 10, 10, "#ffe8a0");
    ctx.globalAlpha = 1;
    px(ctx, rhX + 15, rhY + 36, 10, 18, "#4a3020");
    drawNameLabel(ctx, w, rhX + 20, rhY - 14, "Isaac\u2019s");

    var celinePalette = { skin: "#ffd1b8", hair: "#3a2a22", shirt: "#ff92be", pants: "#4f7cc9", shoe: "#2a2a2a" };
    var isaacPalette = { skin: "#f2c9a2", hair: "#2f241f", shirt: "#4e71d9", pants: "#2f3c5a", shoe: "#1f1f1f" };
    var spriteH = 17 * 3;
    var headTop = floorY - spriteH;

    var centerX = Math.floor(w * 0.44);
    var celineHomeX = Math.floor(w * 0.10);
    var isaacHomeX = Math.floor(w * 0.80);

    // ── Phases ────────────────────────────────────────────────────────────────
    // A (0.00–0.28): Together at center — just said goodbye
    // B (0.28–0.70): Parting — Celine walks left, Isaac walks right
    // C (0.70–1.00): Each at their own home, phones out
    // isTalking: Phones glowing; Celine's bubble lights up

    if (!isTalking && t < 0.28) {
      var pt = t / 0.28;
      var cX = Math.floor(centerX - pt * 8);
      var iX = cX + 30;
      drawPixelPerson(ctx, cX, floorY, 3, celinePalette, frame, true, false);
      drawPixelPerson(ctx, iX, floorY, 3, isaacPalette, frame ^ 1, false, false);
      drawNameLabel(ctx, w, cX + 12, headTop - 4, "Celine");
      drawNameLabel(ctx, w, iX + 12, headTop - 4, "Isaac");
    } else if (!isTalking && t < 0.70) {
      var pt = (t - 0.28) / 0.42;
      var cStartX = centerX - 8;
      var iStartX = centerX + 22;
      var cX = Math.floor(cStartX + (celineHomeX - cStartX) * pt);
      var iX = Math.floor(iStartX + (isaacHomeX - iStartX) * pt);
      drawPixelPerson(ctx, cX, floorY, 3, celinePalette, frame, true, false);
      drawPixelPerson(ctx, iX, floorY, 3, isaacPalette, frame ^ 1, false, false);
      drawNameLabel(ctx, w, cX + 12, headTop - 4, "Celine");
      drawNameLabel(ctx, w, iX + 12, headTop - 4, "Isaac");
    } else {
      // Celine at her house
      drawPixelPerson(ctx, celineHomeX, floorY, 3, celinePalette, isTalking ? talkFrame : frame, true, false);
      drawNameLabel(ctx, w, celineHomeX + 12, headTop - 4, "Celine");
      var cPhoneX = celineHomeX + 8;
      var cPhoneY = floorY - spriteH - 14;
      px(ctx, cPhoneX, cPhoneY, 8, 12, "#2a2a4a");
      px(ctx, cPhoneX + 1, cPhoneY + 1, 6, 8, "#88aaff");
      px(ctx, cPhoneX + 3, cPhoneY + 10, 2, 2, "#aaaacc");

      // Isaac at his house
      drawPixelPerson(ctx, isaacHomeX, floorY, 3, isaacPalette, isTalking ? talkFrame ^ 1 : frame ^ 1, false, false);
      drawNameLabel(ctx, w, isaacHomeX + 12, headTop - 4, "Isaac");
      var iPhoneX = isaacHomeX + 8;
      var iPhoneY = floorY - spriteH - 14;
      px(ctx, iPhoneX, iPhoneY, 8, 12, "#2a2a4a");
      px(ctx, iPhoneX + 1, iPhoneY + 1, 6, 8, "#88aaff");
      px(ctx, iPhoneX + 3, iPhoneY + 10, 2, 2, "#aaaacc");

      if (isTalking) {
        var growT = Math.min(1, sceneTalkElapsed / TALK_MS);
        var bubbleScale = 0.55 + 0.45 * growT;
        var bubbleAnchorX = isaacHomeX + 16;
        var bubbleAnchorY = floorY - spriteH - 44;
        ctx.save();
        ctx.translate(bubbleAnchorX, bubbleAnchorY);
        ctx.scale(bubbleScale, bubbleScale);
        ctx.translate(-bubbleAnchorX, -bubbleAnchorY);
        drawSpeechBubble(ctx, w, bubbleAnchorX, bubbleAnchorY, "Thank you");
        ctx.restore();
        drawSpeechBubble(ctx, w, celineHomeX + 16, floorY - spriteH - 44, SCENE_BUBBLE[2]);
      }
    }
  }

  // ─── Scene frame dispatcher ───────────────────────────────────────────────
  function drawSceneFrame(ctx, w, h, t, isTalking, talkFrame) {
    if (currentIndex === 1) return drawScene2Frame(ctx, w, h, t, isTalking, talkFrame);
    if (currentIndex === 2) return drawScene3Frame(ctx, w, h, t, isTalking, talkFrame);
    drawScene1Frame(ctx, w, h, t, isTalking, talkFrame);
  }

  // ─── Transition effects (per-scene themed) ────────────────────────────────
  function startTransitionEffects() {
    transitionEffectsToken += 1;
    var token = transitionEffectsToken;
    var sceneIdx = currentIndex;
    var panel = transitionScreen.querySelector(".transition-panel");
    panel.classList.add("transition-panel--effects");

    var allColors = [
      ["#ff9ed0", "#ffcaec", "#ffd700", "#c9f0ff", "#b5ffc9"],
      ["#ff7744", "#ffdd44", "#44bb66", "#cc44ff", "#ffaadd"],
      ["#fffbd0", "#c8c8ff", "#ff88aa", "#8888ff", "#ddeeff"]
    ];
    var sparkleColors = allColors[sceneIdx] || allColors[0];

    var sparkles = Array.from({ length: 24 }, function () {
      return {
        x: Math.random(),
        y: sceneIdx === 1 ? Math.random() * 0.25 : Math.random() * 0.55 + 0.04,
        phase: Math.random() * Math.PI * 2,
        speed: 0.7 + Math.random() * 1.8,
        size: 2 + Math.floor(Math.random() * 3),
        color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
        dy: sceneIdx === 1 ? 0.0005 + Math.random() * 0.0005
          : sceneIdx === 2 ? -0.0003 - Math.random() * 0.0003
          : 0
      };
    });

    var startTime = performance.now();

    function tick(now) {
      if (token !== transitionEffectsToken) return;
      var rect = panel.getBoundingClientRect();
      var w = Math.max(1, Math.floor(rect.width));
      var h = Math.max(1, Math.floor(rect.height));
      var dpr = window.devicePixelRatio || 1;
      if (transitionCanvas.width !== Math.floor(w * dpr) || transitionCanvas.height !== Math.floor(h * dpr)) {
        transitionCanvas.width = Math.floor(w * dpr);
        transitionCanvas.height = Math.floor(h * dpr);
      }
      var ctx = transitionCanvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var t = (now - startTime) / 1000;

      sparkles.forEach(function (sp) {
        sp.y += sp.dy;
        if (sp.y > 1.1) sp.y = -0.1;
        if (sp.y < -0.1) sp.y = 1.1;
        var alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(sp.phase + t * sp.speed));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = sp.color;
        ctx.fillRect(Math.floor(sp.x * w), Math.floor(sp.y * h), sp.size, sp.size);
      });
      ctx.globalAlpha = 1;

      // Scene 2: mini table + fading group members at right
      if (sceneIdx === 1) {
        var tbX = Math.floor(w * 0.72);
        var tbY = Math.floor(h * 0.75);
        ctx.fillStyle = "#8b5e2a";
        ctx.fillRect(tbX, tbY - 6, Math.floor(w * 0.18), 4);
        var grpAlpha = Math.min(1, t / 1.5);
        ctx.globalAlpha = grpAlpha;
        drawMiniPerson(ctx, tbX + 2, tbY, 1, "#ff7744", "#1a1010", Math.floor(t * 3) % 2, false);
        drawMiniPerson(ctx, tbX + 14, tbY, 1, "#44aa55", "#3a2010", (Math.floor(t * 3) % 2) ^ 1, true);
        ctx.globalAlpha = 1;
      }

      // Scene 3: crescent moon (top right)
      if (sceneIdx === 2) {
        var mnx = Math.floor(w * 0.86), mny = Math.floor(h * 0.09);
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = "#fff8d0";
        ctx.fillRect(mnx + 3, mny, 5, 2);
        ctx.fillRect(mnx + 1, mny + 2, 9, 4);
        ctx.fillRect(mnx, mny + 6, 11, 4);
        ctx.fillRect(mnx + 1, mny + 10, 9, 4);
        ctx.fillRect(mnx + 3, mny + 14, 5, 2);
        ctx.fillStyle = "rgba(255,243,249,0.95)";
        ctx.fillRect(mnx + 6, mny + 2, 6, 12);
        ctx.globalAlpha = 1;
      }

      var s = 2;
      var duoX = Math.floor(w * 0.5) - 2 * s - 8 * s;
      var duoY = Math.floor(h * 0.88);
      var walkFrame = Math.floor(t * 3) % 2;
      drawMiniPerson(ctx, duoX, duoY, s, "#ff92be", "#3a2a22", walkFrame, true);
      drawMiniPerson(ctx, duoX + 14 * s, duoY, s, "#4e71d9", "#2f241f", walkFrame ^ 1, false);

      transitionEffectsRaf = requestAnimationFrame(tick);
    }

    transitionEffectsRaf = requestAnimationFrame(tick);
  }

  function stopTransitionEffects() {
    transitionEffectsToken += 1;
    if (transitionEffectsRaf) {
      cancelAnimationFrame(transitionEffectsRaf);
      transitionEffectsRaf = 0;
    }
    var panel = transitionScreen.querySelector(".transition-panel");
    panel.classList.remove("transition-panel--effects");
    var ctx = transitionCanvas.getContext("2d");
    ctx.clearRect(0, 0, transitionCanvas.width, transitionCanvas.height);
  }

  // ─── Memory screen effects (per-scene) ───────────────────────────────────
  function stopMemoryEffects() {
    memoryEffectsToken += 1;
    if (memoryEffectsRaf) {
      cancelAnimationFrame(memoryEffectsRaf);
      memoryEffectsRaf = 0;
    }
    if (memoryCanvas) {
      memoryCanvas.classList.remove("active");
      var ctx = memoryCanvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, memoryCanvas.width, memoryCanvas.height);
    }
  }

  function startMemoryEffects() {
    stopMemoryEffects();
    if (!memoryCanvas) return;
    memoryEffectsToken += 1;
    var token = memoryEffectsToken;
    var idx = currentIndex;

    memoryCanvas.classList.add("active");

    var allColors = [
      ["#ffd700", "#fffbe6", "#fff5cc", "#ffeea0"],
      ["#ff7744", "#ffdd44", "#44bb66", "#cc44ff", "#44aaff"],
      ["#fffbd0", "#c8c8ff", "#ddeeff", "#ff88aa"]
    ];
    var particleColors = allColors[idx] || allColors[0];

    var particles = Array.from({ length: 20 }, function () {
      return {
        x: Math.random(),
        y: idx === 1 ? Math.random() * 0.4 : 0.5 + Math.random() * 0.5,
        dx: (Math.random() - 0.5) * 0.0003,
        dy: idx === 1
          ? 0.0005 + Math.random() * 0.0007
          : -0.0004 - Math.random() * 0.0005,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        size: 3 + Math.floor(Math.random() * 3),
        color: particleColors[Math.floor(Math.random() * particleColors.length)]
      };
    });

    var startTime = performance.now();

    function tick(now) {
      if (token !== memoryEffectsToken) return;
      var panel = memoryCanvas.parentElement;
      var rect = panel ? panel.getBoundingClientRect() : null;
      if (!rect || rect.width === 0) {
        memoryEffectsRaf = requestAnimationFrame(tick);
        return;
      }
      var w = Math.floor(rect.width);
      var h = Math.floor(rect.height);
      var dpr = window.devicePixelRatio || 1;
      if (memoryCanvas.width !== Math.floor(w * dpr)) {
        memoryCanvas.width = Math.floor(w * dpr);
        memoryCanvas.height = Math.floor(h * dpr);
      }
      var ctx = memoryCanvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var elapsed = (now - startTime) / 1000;

      particles.forEach(function (p) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;

        var alpha = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(p.phase + elapsed * p.speed));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        var px2 = Math.floor(p.x * w);
        var py2 = Math.floor(p.y * h);

        ctx.fillRect(px2, py2, p.size, p.size);
        ctx.globalAlpha = 1;
      });

      memoryEffectsRaf = requestAnimationFrame(tick);
    }

    memoryEffectsRaf = requestAnimationFrame(tick);
  }

  // ─── Transition screen ────────────────────────────────────────────────────
  function showTransition(title, text, done, duration, withEffects) {
    var ms = (typeof duration === "number") ? duration : TRANSITION_MS;
    transitionTitle.textContent = title;
    transitionText.textContent = text;
    transitionToken += 1;
    var token = transitionToken;

    // Update the large background scene number + progress dots
    var sceneNumStr = (currentIndex + 1 < 10 ? "0" : "") + (currentIndex + 1);
    if (transitionSceneNum) transitionSceneNum.textContent = sceneNumStr;
    transitionDots.forEach(function (dot, i) {
      if (!dot) return;
      dot.classList.toggle("tdot--done", i < currentIndex);
      dot.classList.toggle("tdot--active", i === currentIndex);
    });

    var panel = transitionScreen.querySelector(".transition-panel");
    panel.style.animationDuration = ms + "ms";

    if (withEffects) {
      startTransitionEffects();
    } else {
      stopTransitionEffects();
    }

    showScreen("transition");
    window.setTimeout(function () {
      if (token !== transitionToken) return;
      stopTransitionEffects();
      done();
    }, ms);
  }

  // ─── Intro setup ──────────────────────────────────────────────────────────
  function setupIntro() {
    introTitle.textContent = intro.title || "Happy Birthday Celine";
    introDate.textContent = intro.dateText || "February 24, 2010";
    introSubtitle.textContent = intro.subtitle || "A surprise game with three memories we can replay together.";
    introNameplate.textContent = intro.nameplate || "Dear Celine Myoung";
    startBtn.textContent = intro.buttonText || "Start Game";
    if (intro.portraitUrl) introPortrait.src = intro.portraitUrl;

    // Populate intro preview strip from config phases
    phases.forEach(function (phase, i) {
      if (previewNames[i]) {
        previewNames[i].textContent = (phase.title || "Scene " + (i + 1)).replace(/^Scene \d+:\s*/, "");
      }
      if (previewTags[i]) {
        previewTags[i].textContent = phase.tag || "";
        previewTags[i].style.display = phase.tag ? "" : "none";
      }
    });
  }

  // ─── Tap-to-continue listener management ─────────────────────────────────
  function cleanupTapListener() {
    if (sceneCanvasTapHandler) {
      sceneCanvas.removeEventListener("click", sceneCanvasTapHandler);
      sceneCanvas.removeEventListener("touchend", sceneCanvasTapHandler);
      sceneCanvasTapHandler = null;
      sceneCanvas.style.cursor = "";
    }
  }

  function registerTapListener(callback) {
    cleanupTapListener();
    sceneCanvas.style.cursor = "pointer";
    function handler(e) {
      e.preventDefault();
      cleanupTapListener();
      callback();
    }
    sceneCanvasTapHandler = handler;
    sceneCanvas.addEventListener("click", handler);
    sceneCanvas.addEventListener("touchend", handler, { passive: false });
  }

  // ─── Scene animation ──────────────────────────────────────────────────────
  function stopSceneAnimation() {
    sceneAnimToken += 1;
    if (sceneRaf) {
      cancelAnimationFrame(sceneRaf);
      sceneRaf = 0;
    }
    cleanupTapListener();
  }

  function playSceneAnimation(onDone) {
    stopSceneAnimation();
    sceneAnimToken += 1;
    var token = sceneAnimToken;
    var start = performance.now();
    var sceneIdx = currentIndex;
    var walkMs = (sceneIdx === 0) ? WALK_ANIM_MS : Math.round(WALK_ANIM_MS * 1.3);
    var walkEnd = start + walkMs;
    var talkEnd = walkEnd + TALK_MS;
    var handEnd = talkEnd + LETTER_HAND_MS;
    var openEnd = handEnd + LETTER_OPEN_MS;
    var unlockCalled = false;
    var tapRegistered = false;

    openMemoryBtn.disabled = true;
    sceneProgressValue = 0;
    sceneTalkingActive = false;
    sceneTalkFrame = 0;
    sceneTalkElapsed = 0;
    sceneLetterHandT = 0;
    sceneLetterOpenT = 0;

    var first = fitCanvas();
    drawSceneFrame(first.ctx, first.w, first.h, 0, false, 0);

    function tick(now) {
      if (token !== sceneAnimToken) return;
      var fitted = fitCanvas();
      var talkElapsed = Math.max(0, now - walkEnd);
      var talkFr = Math.floor(talkElapsed / 260) % 2;

      if (now < walkEnd) {
        var t = Math.min((now - start) / walkMs, 1);
        sceneProgressValue = t;
        sceneTalkingActive = false;
        drawSceneFrame(fitted.ctx, fitted.w, fitted.h, t, false, 0);
      } else if (now < talkEnd) {
        sceneTalkFrame = talkFr;
        sceneTalkElapsed = talkElapsed;
        sceneTalkingActive = true;
        sceneProgressValue = 1;
        drawSceneFrame(fitted.ctx, fitted.w, fitted.h, 1, true, talkFr);
      } else if (now < handEnd) {
        var handT = (now - talkEnd) / LETTER_HAND_MS;
        sceneLetterHandT = handT;
        sceneLetterOpenT = 0;
        sceneTalkFrame = talkFr;
        sceneTalkElapsed = TALK_MS;
        sceneTalkingActive = true;
        drawSceneFrame(fitted.ctx, fitted.w, fitted.h, 1, true, talkFr);
        drawLetterOverlay(fitted.ctx, fitted.w, fitted.h, handT, 0, sceneIdx, false, 0);
      } else if (now < openEnd) {
        var openT = (now - handEnd) / LETTER_OPEN_MS;
        sceneLetterHandT = 1;
        sceneLetterOpenT = openT;
        sceneTalkFrame = talkFr;
        sceneTalkElapsed = TALK_MS;
        sceneTalkingActive = true;
        drawSceneFrame(fitted.ctx, fitted.w, fitted.h, 1, true, talkFr);
        drawLetterOverlay(fitted.ctx, fitted.w, fitted.h, 1, openT, sceneIdx, false, 0);
      } else {
        // Wait-for-tap phase: panel stays open, pulse "Tap to continue"
        var tapElapsed = now - openEnd;
        sceneLetterHandT = 1;
        sceneLetterOpenT = 1;
        sceneTalkFrame = talkFr;
        sceneTalkElapsed = TALK_MS;
        sceneTalkingActive = true;
        drawSceneFrame(fitted.ctx, fitted.w, fitted.h, 1, true, talkFr);
        drawLetterOverlay(fitted.ctx, fitted.w, fitted.h, 1, 1, sceneIdx, true, tapElapsed);
        if (!tapRegistered) {
          tapRegistered = true;
          registerTapListener(function () {
            if (token !== sceneAnimToken) return;
            if (!unlockCalled) {
              unlockCalled = true;
              openMemoryBtn.disabled = false;
              onDone();
            }
          });
        }
      }

      sceneRaf = requestAnimationFrame(tick);
    }

    sceneRaf = requestAnimationFrame(tick);
  }

  // ─── Render functions ─────────────────────────────────────────────────────
  function renderScene() {
    stopMemoryEffects();
    var phase = phases[currentIndex];
    if (!phase) return;

    sceneProgress.textContent = "Scene " + (currentIndex + 1) + " / " + phases.length;
    sceneTitle.textContent = phase.title || "Scene";
    sceneObjective.textContent = "";
    scenePrompt.textContent = SCENE_PROMPT[currentIndex] || SCENE_PROMPT[0];

    // Update timeline nodes
    timelineNodes.forEach(function (node, i) {
      if (!node) return;
      node.classList.toggle("timeline-node--done", i < currentIndex);
      node.classList.toggle("timeline-node--active", i === currentIndex);
    });

    scenePrevBtn.disabled = currentIndex <= 0;
    showScreen("scene");
    playSceneAnimation(function () {});
  }

  function makeMediaEl(phase) {
    if (phase.videoUrl) {
      var video = document.createElement("video");
      video.className = "memory-media";
      video.controls = true;
      video.src = phase.videoUrl;
      return video;
    }

    if (phase.imageUrl) {
      var img = document.createElement("img");
      img.className = "memory-media";
      img.src = phase.imageUrl;
      img.alt = phase.mediaAlt || phase.title || "Memory media";
      img.loading = "lazy";
      return img;
    }

    return null;
  }

  function renderMemoryCard() {
    var phase = phases[currentIndex];
    if (!phase) return;

    memoryLabel.textContent = "Memory " + (currentIndex + 1);
    memoryTitle.textContent = phase.title || "Memory";
    memoryText.textContent = (phase.personalLetter != null && String(phase.personalLetter).trim() !== "" ? phase.personalLetter : phase.memory) || "Add your memory text in config.js";
    var hasNote = phase.note && String(phase.note).trim();
    memoryNote.textContent = hasNote ? phase.note : "";
    memoryNote.style.display = hasNote ? "" : "none";

    memoryMediaWrap.innerHTML = "";
    var media = makeMediaEl(phase);
    if (media) {
      memoryMediaWrap.appendChild(media);
    } else {
      var empty = document.createElement("p");
      empty.className = "memory-media-empty";
      empty.innerHTML = "Add image or video in <code>config.js</code>";
      memoryMediaWrap.appendChild(empty);
    }

    nextSceneBtn.textContent = currentIndex === phases.length - 1 ? "Go To Final Level" : "Next Scene";
    memoryPrevBtn.disabled = currentIndex <= 0;

    // Populate memory chips
    if (memoryChips) {
      memoryChips.innerHTML = "";
      var sceneChip = document.createElement("span");
      sceneChip.className = "memory-chip";
      sceneChip.textContent = "Scene " + (currentIndex + 1) + " of " + phases.length;
      memoryChips.appendChild(sceneChip);
      if (phase.tag) {
        var tagChip = document.createElement("span");
        tagChip.className = "memory-chip memory-chip--accent";
        tagChip.textContent = phase.tag;
        memoryChips.appendChild(tagChip);
      }
    }

    showScreen("memory");
    startMemoryEffects();
  }

  // ─── Conclusion animation ────────────────────────────────────────────────
  function drawConclusionFrame(ctx, w, h, elapsed) {
    var PHASE_A_MS = 5500;  // birthday party
    var PHASE_B_MS = 5000;  // backpack money reveal
    var CYCLE = PHASE_A_MS + PHASE_B_MS;
    var cycleT = elapsed % CYCLE;
    var frame = Math.floor(elapsed / 260) % 2;
    var floorTop = Math.floor(h * 0.68);
    var floorY = floorTop + 2;

    var celinePalette = { skin: "#ffd1b8", hair: "#3a2a22", shirt: "#ff92be", pants: "#4f7cc9", shoe: "#2a2a2a" };
    var spriteH = 17 * 3;

    if (cycleT < PHASE_A_MS) {
      // ── Phase A: Birthday party ────────────────────────────────────────────
      var pt = cycleT / PHASE_A_MS; // 0→1 across the phase

      // Warm party room background
      px(ctx, 0, 0, w, Math.floor(h * 0.08), "#cc6622");
      px(ctx, 0, Math.floor(h * 0.08), w, Math.floor(h * 0.60), "#fff0d8");
      px(ctx, 0, floorTop, w, Math.floor(h * 0.18), "#e0c090");
      px(ctx, 0, floorTop + Math.floor(h * 0.18), w, h - floorTop - Math.floor(h * 0.18), "#c8a060");

      // Bunting / banner across ceiling
      var btY = Math.floor(h * 0.10);
      for (var bi = 0; bi < 7; bi++) {
        var bx = Math.floor(w * (0.06 + bi * 0.135));
        var bColors = ["#ff6688", "#ffdd44", "#44ccff", "#ff9922", "#cc44ff", "#66ee66", "#ff6688"];
        px(ctx, bx, btY, 14, 14, bColors[bi % bColors.length]);
        px(ctx, bx, btY + 14, 2, 8, "#888844");
      }
      // String connecting buntings
      ctx.save();
      ctx.strokeStyle = "#cc8844";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.floor(w * 0.06), btY + 7);
      ctx.lineTo(Math.floor(w * 0.94), btY + 7);
      ctx.stroke();
      ctx.restore();

      // Party table with cake
      var tblX = Math.floor(w * 0.28);
      var tblW = Math.floor(w * 0.44);
      var tblTop = floorY - 16;
      // Table surface
      px(ctx, tblX, tblTop, tblW, 8, "#8b5e2a");
      px(ctx, tblX, tblTop + 8, tblW, 4, "#6a4420");
      px(ctx, tblX + 10, tblTop + 12, 8, 20, "#7a5028");
      px(ctx, tblX + tblW - 18, tblTop + 12, 8, 20, "#7a5028");

      // Birthday cake (center of table)
      var ckX = Math.floor(w * 0.44);
      var ckY = tblTop - 28;
      px(ctx, ckX, ckY + 14, 28, 16, "#ff92be");  // cake base
      px(ctx, ckX + 2, ckY + 8, 24, 8, "#ffccdd"); // tier 2
      px(ctx, ckX + 4, ckY + 4, 20, 6, "#ff92be"); // tier 3
      // Frosting drips
      px(ctx, ckX + 2, ckY + 8, 4, 4, "#ffffff");
      px(ctx, ckX + 10, ckY + 7, 4, 5, "#ffffff");
      px(ctx, ckX + 18, ckY + 8, 4, 4, "#ffffff");
      // Candles
      var candleXs = [ckX + 6, ckX + 12, ckX + 18];
      candleXs.forEach(function (cx) {
        px(ctx, cx, ckY - 2, 3, 7, "#ffffaa");
        // Flame flicker
        var flameColor = frame === 0 ? "#ffaa22" : "#ffcc44";
        px(ctx, cx, ckY - 5, 3, 4, flameColor);
      });
      // "Happy Bday" text above cake
      ctx.save();
      ctx.font = "bold 10px Arial, sans-serif";
      ctx.fillStyle = "#cc3366";
      ctx.fillText("Happy Bday!", ckX - 6, ckY - 10);
      ctx.restore();

      // Food on table
      px(ctx, tblX + 14, tblTop - 3, 8, 5, "#ff9944");
      px(ctx, tblX + tblW - 22, tblTop - 3, 8, 5, "#88cc44");

      // Group of friends around the table (behind it)
      var gPal1 = { skin: "#f5c498", hair: "#1a1010", shirt: "#ff7744", pants: "#3a5a38", shoe: "#1a1010" };
      var gPal2 = { skin: "#d49268", hair: "#3a2010", shirt: "#44aa55", pants: "#223344", shoe: "#1a1010" };
      var gPal3 = { skin: "#ffe0c0", hair: "#2a1a10", shirt: "#cc44ff", pants: "#334466", shoe: "#1a1010" };
      var gPal4 = { skin: "#f2c9a2", hair: "#2f241f", shirt: "#4e71d9", pants: "#2f3c5a", shoe: "#1f1f1f" };
      drawPixelPerson(ctx, tblX - 2, floorY, 2, gPal1, frame, false, false);
      drawPixelPerson(ctx, tblX + Math.floor(tblW * 0.18), floorY, 2, gPal2, frame ^ 1, true, false);
      drawPixelPerson(ctx, tblX + Math.floor(tblW * 0.60), floorY, 2, gPal3, frame, false, false);
      drawPixelPerson(ctx, tblX + tblW + 4, floorY, 2, gPal4, frame ^ 1, false, false);

      // Celine at center-front, facing the cake
      var celineX = Math.floor(w * 0.42);
      drawPixelPerson(ctx, celineX, floorY, 3, celinePalette, frame, true, true);
      drawNameLabel(ctx, w, celineX + 12, floorY - spriteH - 4, "Celine");
      drawSpeechBubble(ctx, w, celineX + 16, floorY - spriteH - 36,
        frame === 0 ? "Thank you all!" : "This is amazing!");

      // Confetti floating down
      var confColors = ["#ff6688", "#ffdd44", "#44ccff", "#ff9922", "#cc44ff", "#66ee66"];
      for (var ci = 0; ci < 18; ci++) {
        var cfx = (((ci * 137 + Math.floor(elapsed / 80)) % w) + w) % w;
        var cfy = (Math.floor(elapsed / 30 + ci * 23)) % (h - 10);
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = confColors[ci % confColors.length];
        ctx.fillRect(Math.floor(cfx), Math.floor(cfy), 4, 4);
      }
      ctx.globalAlpha = 1;

    } else {
      // ── Phase B: Backpack money reveal ────────────────────────────────────
      var pt = (cycleT - PHASE_A_MS) / PHASE_B_MS; // 0→1 across the phase

      // Outdoor/neutral daylight background (outside, just left the party)
      px(ctx, 0, 0, w, Math.floor(h * 0.56), "#c8e8ff");
      px(ctx, 0, Math.floor(h * 0.56), w, h - Math.floor(h * 0.56), "#a8c878");
      px(ctx, 0, floorTop, w, Math.floor(h * 0.18), "#d4b878");
      px(ctx, 0, floorTop + Math.floor(h * 0.18), w, h - floorTop - Math.floor(h * 0.18), "#8ab860");
      // Clouds
      px(ctx, Math.floor(w * 0.10), Math.floor(h * 0.10), 28, 7, "#ffffff");
      px(ctx, Math.floor(w * 0.12), Math.floor(h * 0.08), 18, 7, "#ffffff");
      px(ctx, Math.floor(w * 0.60), Math.floor(h * 0.12), 22, 6, "#f0f0f0");

      // Celine standing, crouched looking in backpack
      var celineX = Math.floor(w * 0.36);
      drawPixelPerson(ctx, celineX, floorY, 3, celinePalette, frame, true, true);
      drawNameLabel(ctx, w, celineX + 12, floorY - spriteH - 4, "Celine");

      // Pixel backpack on the ground beside her
      var bpX = celineX + 36;
      var bpY = floorY - 28;
      px(ctx, bpX, bpY, 24, 28, "#5566cc");        // main body
      px(ctx, bpX + 2, bpY - 6, 20, 8, "#4455bb"); // top flap
      px(ctx, bpX + 4, bpY + 4, 16, 10, "#6677dd"); // front pocket
      px(ctx, bpX + 6, bpY + 6, 12, 6, "#5566cc");  // pocket inset
      // Straps
      px(ctx, bpX + 2, bpY + 14, 4, 12, "#4455bb");
      px(ctx, bpX + 18, bpY + 14, 4, 12, "#4455bb");

      // Money/bills spilling out (animated using pt)
      var moneyVisible = pt > 0.25;
      if (moneyVisible) {
        var moneyAlpha = Math.min(1, (pt - 0.25) / 0.20);
        ctx.globalAlpha = moneyAlpha;
        // Bill 1
        px(ctx, bpX - 10, bpY + 2, 18, 9, "#66bb44");
        px(ctx, bpX - 9, bpY + 3, 16, 7, "#55aa33");
        px(ctx, bpX - 6, bpY + 4, 10, 5, "#77cc55");
        // Bill 2 (slightly offset)
        px(ctx, bpX - 6, bpY - 6, 18, 9, "#66bb44");
        px(ctx, bpX - 5, bpY - 5, 16, 7, "#55aa33");
        // Bill 3
        px(ctx, bpX + 2, bpY - 12, 18, 9, "#66bb44");
        px(ctx, bpX + 3, bpY - 11, 16, 7, "#55aa33");
        // Dollar sign marks on bills
        ctx.save();
        ctx.font = "bold 7px Arial, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("$", bpX - 3, bpY + 9);
        ctx.fillText("$", bpX + 1, bpY - 1);
        ctx.fillText("$", bpX + 9, bpY - 7);
        ctx.restore();
        ctx.globalAlpha = 1;

        // Sparkles around the money
        var sparkXs = [bpX - 14, bpX, bpX + 14, bpX - 8, bpX + 20];
        var sparkYs = [bpY - 4, bpY - 14, bpY - 8, bpY + 10, bpY + 2];
        sparkXs.forEach(function (sx, si) {
          ctx.globalAlpha = 0.5 + 0.5 * (Math.sin(elapsed / 200 + si * 1.3) * 0.5 + 0.5);
          ctx.fillStyle = "#ffd700";
          ctx.fillRect(sx, sparkYs[si], 4, 4);
          ctx.fillRect(sx + 2, sparkYs[si] - 2, 2, 2);
        });
        ctx.globalAlpha = 1;
      }

      // Speech bubble changes at midpoint
      var bubbleText = pt < 0.25
        ? "What\u2019s in here...?"
        : (frame === 0 ? "Money?!!" : "No way!!");
      drawSpeechBubble(ctx, w, celineX + 16, floorY - spriteH - 36, bubbleText);
    }
  }

  function stopConclusionAnimation() {
    conclusionToken += 1;
    if (conclusionRaf) {
      cancelAnimationFrame(conclusionRaf);
      conclusionRaf = 0;
    }
    if (conclusionCanvas) {
      conclusionCanvas.classList.remove("active");
      var ctx = conclusionCanvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, conclusionCanvas.width, conclusionCanvas.height);
    }
  }

  function startConclusionAnimation() {
    stopConclusionAnimation();
    if (!conclusionCanvas) return;
    conclusionToken += 1;
    var token = conclusionToken;
    var startTime = performance.now();

    conclusionCanvas.classList.add("active");

    function tick(now) {
      if (token !== conclusionToken) return;
      var panel = conclusionCanvas.parentElement;
      var rect = panel ? panel.getBoundingClientRect() : null;
      if (!rect || rect.width === 0) {
        conclusionRaf = requestAnimationFrame(tick);
        return;
      }
      var w = Math.floor(rect.width);
      var h = conclusionCanvas.offsetHeight || 240;
      var dpr = window.devicePixelRatio || 1;
      if (conclusionCanvas.width !== Math.floor(w * dpr) || conclusionCanvas.height !== Math.floor(h * dpr)) {
        conclusionCanvas.width = Math.floor(w * dpr);
        conclusionCanvas.height = Math.floor(h * dpr);
      }
      var ctx = conclusionCanvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);
      drawConclusionFrame(ctx, w, h, now - startTime);
      conclusionRaf = requestAnimationFrame(tick);
    }

    conclusionRaf = requestAnimationFrame(tick);
  }

  // ─── Present suspense animation ──────────────────────────────────────────
  function drawPresentFrame(ctx, w, h, elapsed) {
    var s = 4;
    var boxW = 20 * s, boxH = 16 * s;
    var lidW = 22 * s, lidH = 5 * s;
    var cx = Math.floor(w / 2);
    var cy = Math.floor(h * 0.54);

    var SHAKE_END = 2800;
    var OPEN_END  = 4300;

    // Word sequence phase: black screen with centered words only
    var WORD_BEAT_MS = 1100;
    var WORDS = ["For.", "My.", "Favorite.", "Disciple.", "Celine Myoung", ":D"];
    if (elapsed >= OPEN_END) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      var wordElapsed = elapsed - OPEN_END;
      var wordIdx = Math.min(WORDS.length - 1, Math.floor(wordElapsed / WORD_BEAT_MS));
      var beatProgress = wordElapsed - wordIdx * WORD_BEAT_MS;
      ctx.save();
      ctx.globalAlpha = Math.min(1, beatProgress / 180);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 58px Arial, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(WORDS[wordIdx], Math.floor(w / 2), Math.floor(h / 2));
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }

    // Background
    ctx.fillStyle = "#0d0020";
    ctx.fillRect(0, 0, w, h);

    // Twinkling stars
    var bgStars = [[0.08,0.10],[0.22,0.06],[0.40,0.14],[0.58,0.08],[0.76,0.12],[0.90,0.06],
                   [0.14,0.28],[0.50,0.20],[0.92,0.22],[0.32,0.17],[0.66,0.30],[0.82,0.24]];
    bgStars.forEach(function (sd, i) {
      ctx.globalAlpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(elapsed / 380 + i * 1.4));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(Math.floor(sd[0] * w), Math.floor(sd[1] * h), 2, 2);
    });
    ctx.globalAlpha = 1;

    // Shake
    var shakeX = 0;
    if (elapsed < SHAKE_END) {
      var shakeProgress = elapsed / SHAKE_END;
      var shakeAmt = Math.pow(shakeProgress, 1.3) * 10;
      shakeX = Math.round(shakeAmt * Math.sin(elapsed / 68));
    }

    // Open phase (0→1)
    var openT = elapsed > SHAKE_END ? Math.min(1, (elapsed - SHAKE_END) / (OPEN_END - SHAKE_END)) : 0;

    var bx = cx - Math.floor(boxW / 2) + shakeX;
    var by = cy - Math.floor(boxH / 2);

    // Box body
    ctx.fillStyle = "#e83c6c";
    ctx.fillRect(bx, by, boxW, boxH);
    // Shadow sides
    ctx.fillStyle = "#c02050";
    ctx.fillRect(bx, by + boxH - s, boxW, s);
    ctx.fillRect(bx + boxW - s, by, s, boxH);
    // Ribbon vertical
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(bx + Math.floor(boxW / 2) - s, by, 2 * s, boxH);
    // Ribbon horizontal
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(bx, by + Math.floor(boxH / 2) - s, boxW, 2 * s);
    // Center highlight
    ctx.fillStyle = "#ffe878";
    ctx.fillRect(bx + Math.floor(boxW / 2) - Math.floor(s / 2), by + Math.floor(boxH / 2) - Math.floor(s / 2), s, s);

    // Lid (flies upward and tilts when opening)
    var lidOffsetY = Math.round(openT * -100);
    var lidRotate  = openT * 0.55;
    var lidCX = cx + shakeX;
    var lidCY = by - Math.floor(lidH / 2) + s + lidOffsetY;
    ctx.save();
    ctx.translate(lidCX, lidCY);
    ctx.rotate(-lidRotate);
    ctx.fillStyle = "#c83060";
    ctx.fillRect(-Math.floor(lidW / 2), -Math.floor(lidH / 2), lidW, lidH);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(-s, -Math.floor(lidH / 2), 2 * s, lidH);
    ctx.fillStyle = "#a02050";
    ctx.fillRect(-Math.floor(lidW / 2), Math.floor(lidH / 2) - s, lidW, s);
    ctx.restore();

    // Bow (fades out as lid lifts)
    var bowAlpha = openT < 0.35 ? 1 - openT / 0.35 : 0;
    if (bowAlpha > 0) {
      ctx.globalAlpha = bowAlpha;
      var bowCX = cx + shakeX;
      var bowY  = by - lidH + lidOffsetY - s;
      ctx.fillStyle = "#ff6699";
      ctx.fillRect(bowCX - 4 * s, bowY - 3 * s, 3 * s, 3 * s);
      ctx.fillRect(bowCX - 3 * s, bowY - 4 * s, 2 * s, 2 * s);
      ctx.fillRect(bowCX + s,     bowY - 3 * s, 3 * s, 3 * s);
      ctx.fillRect(bowCX + s,     bowY - 4 * s, 2 * s, 2 * s);
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(bowCX - s, bowY - 3 * s, 2 * s, 3 * s);
      ctx.globalAlpha = 1;
    }

    // Confetti burst
    if (openT > 0) {
      var confColors = ["#ff6688", "#ffdd44", "#44ccff", "#ff9922", "#cc44ff", "#66ee66", "#ff92be"];
      var burstT = Math.min(1, openT * 1.4);
      for (var ci = 0; ci < 30; ci++) {
        var angle = (ci / 30) * Math.PI * 2 + openT * 0.4;
        var dist  = burstT * (55 + (ci % 7) * 20);
        var px2   = cx + Math.cos(angle) * dist + shakeX;
        var py2   = (by + Math.floor(boxH / 2)) + Math.sin(angle) * dist * 0.65 - burstT * 18;
        ctx.globalAlpha = Math.max(0, 0.9 - burstT * 0.25);
        ctx.fillStyle = confColors[ci % confColors.length];
        ctx.fillRect(Math.round(px2), Math.round(py2), 5, 5);
      }
      ctx.globalAlpha = 1;
    }

    // Text label
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = Math.min(1, elapsed / 700);
    if (openT > 0.6) {
      ctx.font = "bold 17px Arial, sans-serif";
      ctx.fillStyle = "#ffd700";
      ctx.fillText("Final Level Unlocked!", cx, by - lidH - 32 + lidOffsetY);
      ctx.font = "13px Arial, sans-serif";
      ctx.fillStyle = "#ffaad0";
      ctx.fillText("Get ready\u2026", cx, by - lidH - 12 + lidOffsetY);
    } else {
      ctx.font = "bold 14px Arial, sans-serif";
      ctx.fillStyle = "#ffc0de";
      ctx.fillText("A special surprise awaits\u2026", cx, by - lidH - 26);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function stopSuspenseAnimation() {
    suspenseToken += 1;
    if (suspenseRaf) {
      cancelAnimationFrame(suspenseRaf);
      suspenseRaf = 0;
    }
    if (suspenseCanvas) {
      var ctx = suspenseCanvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, suspenseCanvas.width, suspenseCanvas.height);
    }
  }

  var SUSPENSE_TOTAL_MS = 12000;

  function startSuspenseAnimation(onDone) {
    stopSuspenseAnimation();
    if (!suspenseCanvas) { onDone(); return; }
    suspenseToken += 1;
    var token = suspenseToken;
    var startTime = performance.now();

    function tick(now) {
      if (token !== suspenseToken) return;
      var panel = suspenseCanvas.parentElement;
      var rect  = panel ? panel.getBoundingClientRect() : null;
      if (!rect || rect.width === 0) {
        suspenseRaf = requestAnimationFrame(tick);
        return;
      }
      var w   = Math.floor(rect.width);
      var h   = Math.max(300, suspenseCanvas.offsetHeight || 300);
      var dpr = window.devicePixelRatio || 1;
      if (suspenseCanvas.width  !== Math.floor(w * dpr) ||
          suspenseCanvas.height !== Math.floor(h * dpr)) {
        suspenseCanvas.width  = Math.floor(w * dpr);
        suspenseCanvas.height = Math.floor(h * dpr);
      }
      var ctx = suspenseCanvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);

      var elapsed = now - startTime;
      drawPresentFrame(ctx, w, h, elapsed);

      if (elapsed >= SUSPENSE_TOTAL_MS) {
        stopSuspenseAnimation();
        onDone();
        return;
      }
      suspenseRaf = requestAnimationFrame(tick);
    }

    suspenseRaf = requestAnimationFrame(tick);
  }

  function renderSuspense() {
    stopMemoryEffects();
    stopSceneAnimation();
    showScreen("suspense");
    startSuspenseAnimation(function () {
      renderConclusion();
    });
  }

  function renderConclusion() {
    stopMemoryEffects();
    conclusionTitle.textContent = conclusion.title || "Happy Birthday Celine";
    conclusionMessage.textContent = conclusion.message || "Thank you for every memory we\u2019ve made together.";
    var hasConclusionNote = conclusion.note && String(conclusion.note).trim();
    conclusionNote.textContent = hasConclusionNote ? conclusion.note : "";
    conclusionNote.style.display = hasConclusionNote ? "" : "none";
    replayBtn.textContent = conclusion.replayButtonText || "Play Again";

    // Build recap grid
    if (conclusionRecap) {
      conclusionRecap.innerHTML = "";
      phases.forEach(function (phase, i) {
        var card = document.createElement("div");
        card.className = "recap-card";
        var snippet = (phase.memory || "").slice(0, 90);
        if (phase.memory && phase.memory.length > 90) snippet += "\u2026";
        card.innerHTML =
          "<span class=\"recap-num\">0" + (i + 1) + "</span>" +
          "<p class=\"recap-title\">" + (phase.title || "Memory " + (i + 1)) + "</p>" +
          "<p class=\"recap-snippet\">" + snippet + "</p>";
        conclusionRecap.appendChild(card);
      });
    }

    // Build rotating photo gallery
    var galleryImages = conclusion.galleryImages || [];
    if (conclusionGallery && galleryTrack) {
      if (galleryImages.length > 0) {
        conclusionGallery.style.display = "";
        galleryTrack.innerHTML = "";
        // Render images twice so the CSS loop animation is seamless
        [galleryImages, galleryImages].forEach(function (set, setIdx) {
          set.forEach(function (url, i) {
            var img = document.createElement("img");
            img.className = "gallery-photo";
            img.src = url;
            img.alt = "Memory photo " + (i + 1);
            img.loading = "lazy";
            img.setAttribute("aria-hidden", setIdx === 1 ? "true" : "false");
            galleryTrack.appendChild(img);
          });
        });
      } else {
        conclusionGallery.style.display = "none";
      }
    }

    showScreen("conclusion");
    startConclusionAnimation();
  }

  // ─── Navigation handlers ──────────────────────────────────────────────────
  function onStart() {
    if (!phases.length) {
      alert("No scenes found. Add 3 scene objects in BIRTHDAY_CONFIG.phases.");
      return;
    }
    currentIndex = 0;
    renderScene();
  }

  function onOpenMemory() {
    if (openMemoryBtn.disabled) return;
    stopSceneAnimation();
    renderMemoryCard();
  }

  function onNextScene() {
    stopMemoryEffects();
    if (currentIndex < phases.length - 1) {
      stopSceneAnimation();
      currentIndex += 1;
      renderScene();
      return;
    }
    stopSceneAnimation();
    renderSuspense();
  }

  function onPrevScene() {
    if (currentIndex <= 0) return;
    stopSceneAnimation();
    currentIndex -= 1;
    renderScene();
  }

  function onPrevMemory() {
    if (currentIndex <= 0) return;
    stopMemoryEffects();
    stopSceneAnimation();
    currentIndex -= 1;
    renderMemoryCard();
  }

  function onReplay() {
    stopMemoryEffects();
    stopConclusionAnimation();
    stopSuspenseAnimation();
    stopSceneAnimation();
    currentIndex = 0;
    showScreen("intro");
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  function boot() {
    setupIntro();
    startBtn.addEventListener("click", onStart);
    openMemoryBtn.addEventListener("click", onOpenMemory);
    nextSceneBtn.addEventListener("click", onNextScene);
    replayBtn.addEventListener("click", onReplay);
    scenePrevBtn.addEventListener("click", onPrevScene);
    memoryPrevBtn.addEventListener("click", onPrevMemory);
    window.addEventListener("resize", function () {
      if (screens.scene.classList.contains("active")) {
        var fitted = fitCanvas();
        drawSceneFrame(fitted.ctx, fitted.w, fitted.h, sceneProgressValue, sceneTalkingActive, sceneTalkFrame);
        if (sceneLetterHandT > 0) {
          drawLetterOverlay(fitted.ctx, fitted.w, fitted.h, sceneLetterHandT, sceneLetterOpenT, currentIndex, false, 0);
        }
      }
    });
  }

  boot();
})();
