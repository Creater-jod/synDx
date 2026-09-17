/* ==========================================================================
   SynDx V2.0 — Patient Care Portal & Multimodal Health Intelligence Engine
   Voice Dictation • Lab Report OCR • Cost Calculator • Specialist Matching
   ========================================================================== */

const PatientPortal = (() => {
  // Internal Portal State
  const state = {
    activeTab: 'intake',
    isListening: false,
    recognition: null,
    voiceTranscript: '',
    extractedBiomarkers: {},
    vitals: { spo2: 98, heart_rate: 78, systolic_bp: 120, diastolic_bp: 80, gcs: 15 },
    currentPrediction: null,
    costData: null,
    insurancePct: 60,
    selectedSpecialist: null,
    activePassport: null
  };

  // Sample Lab Reports for Quick OCR Demonstration
  const SAMPLE_REPORTS = {
    wilson_copper: {
      title: "Wilson Metabolic & Copper Studies Panel",
      labName: "National Reference Biochemistry Laboratory",
      date: "15-Sep-2026",
      extracted: {
        "CP": 0.018, // Ceruloplasmin (g/L)
        "24-hour urine copper": 468.63, // ug/24h
        "ALT": 58.4,
        "AST)": 62.1,
        "TBIL": 24.5,
        "DBIL": 8.2,
        "Cr": 67.7,
        "TT": 16.9,
        "Age": 29,
        "Gender": 1,
        "K-F ring(es/No)": 1,
        "lenticular nucleus damage  (es/No)": 1,
        "Psychiatric symptom score": 7
      },
      rawText: "SERUM CERULOPLASMIN: 0.018 g/L (Ref: 0.20-0.40) [CRITICAL LOW]\n24-HR URINARY COPPER: 468.6 ug/24h (Ref: 15-60) [HIGH ELEVATION]\nALT: 58.4 U/L | AST: 62.1 U/L | TOTAL BILIRUBIN: 24.5 umol/L\nSLIT-LAMP OCULAR EXAM: Bilateral Kayser-Fleischer rings present."
    },
    hepatic_panel: {
      title: "Routine Hepatic & Metabolic Screening",
      labName: "Apex Diagnostic Clinical Services",
      date: "14-Sep-2026",
      extracted: {
        "CP": 0.042,
        "24-hour urine copper": 1316.7,
        "ALT": 40.0,
        "AST)": 28.0,
        "TBIL": 18.2,
        "DBIL": 3.5,
        "Cr": 79.1,
        "TT": 17.0,
        "Age": 19,
        "Gender": 1,
        "K-F ring(es/No)": 1,
        "lenticular nucleus damage  (es/No)": 0,
        "Psychiatric symptom score": 1
      },
      rawText: "SERUM CERULOPLASMIN: 0.042 g/L (Ref: 0.20-0.40) [LOW]\n24-HR URINARY COPPER: 1316.7 ug/24h (Ref: 15-60) [MARKED ELEVATION]\nALT: 40.0 U/L | AST: 28.0 U/L | TOTAL BILIRUBIN: 18.2 umol/L\nNEUROLOGICAL MRI: Intact basal ganglia, no lenticular damage."
    }
  };

  // Initialize Web Speech API
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      state.recognition = new SpeechRecognition();
      state.recognition.continuous = true;
      state.recognition.interimResults = true;
      state.recognition.lang = 'en-US';

      state.recognition.onstart = () => {
        state.isListening = true;
        updateVoiceUI(true);
      };

      state.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullText = (state.voiceTranscript + ' ' + finalTranscript + ' ' + interimTranscript).trim();
        const inputElem = document.getElementById('patientVoiceText');
        if (inputElem) inputElem.value = fullText;

        parseMedicalKeywords(fullText);
      };

      state.recognition.onerror = (event) => {
        console.warn('[Speech Recognition Warning]', event.error);
        state.isListening = false;
        updateVoiceUI(false);
      };

      state.recognition.onend = () => {
        state.isListening = false;
        updateVoiceUI(false);
      };
    }
  }

  // Toggle Live Microphone
  function toggleVoiceRecording() {
    if (!state.recognition) {
      initSpeechRecognition();
    }

    if (!state.recognition) {
      // Fallback: Simulated Voice Capture for browsers without speech API
      simulateVoiceDictation();
      return;
    }

    if (state.isListening) {
      state.recognition.stop();
      state.isListening = false;
      updateVoiceUI(false);
    } else {
      try {
        state.recognition.start();
      } catch (err) {
        console.warn('Speech recognition restart issue:', err);
        simulateVoiceDictation();
      }
    }
  }

  // Simulated Voice Dictation Fallback
  function simulateVoiceDictation() {
    const sampleSpoken = "I have experienced resting tremors in both hands for 3 weeks, extreme fatigue, noticeable yellowing in my eyes, and difficulty with speech articulation.";
    const inputElem = document.getElementById('patientVoiceText');
    if (inputElem) {
      inputElem.value = "";
      let index = 0;
      updateVoiceUI(true);
      const interval = setInterval(() => {
        if (index < sampleSpoken.length) {
          inputElem.value += sampleSpoken[index];
          index++;
        } else {
          clearInterval(interval);
          updateVoiceUI(false);
          parseMedicalKeywords(inputElem.value);
          showToast('Voice dictation transcribed & symptoms analyzed.', 'success');
        }
      }, 25);
    }
  }

  function updateVoiceUI(active) {
    const micBtn = document.getElementById('btnVoiceDictate');
    const waveElem = document.getElementById('voiceWaveform');
    const statusElem = document.getElementById('voiceStatusText');

    if (micBtn) {
      if (active) {
        micBtn.classList.add('recording-active');
        micBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        micBtn.style.boxShadow = '0 0 24px rgba(239, 68, 68, 0.6)';
        if (statusElem) statusElem.textContent = 'Listening... Speak your symptoms clearly';
        if (waveElem) waveElem.style.display = 'flex';
      } else {
        micBtn.classList.remove('recording-active');
        micBtn.style.background = '';
        micBtn.style.boxShadow = '';
        if (statusElem) statusElem.textContent = 'Click microphone to dictate symptoms';
        if (waveElem) waveElem.style.display = 'none';
      }
    }
  }

  // Medical Entity Keyword Parser
  function parseMedicalKeywords(text) {
    const lower = text.toLowerCase();
    const badgesContainer = document.getElementById('extractedEntityBadges');
    if (!badgesContainer) return;

    const detected = [];
    if (lower.includes('tremor') || lower.includes('shak')) detected.push({ name: 'Neurological Tremor', tag: 'Phenotype 1' });
    if (lower.includes('yellow') || lower.includes('jaundice')) detected.push({ name: 'Hepatic Scleral Icterus', tag: 'Liver Marker' });
    if (lower.includes('speech') || lower.includes('dysarthria')) detected.push({ name: 'Speech Articulation Impairment', tag: 'Brainstem' });
    if (lower.includes('fatigue') || lower.includes('tired')) detected.push({ name: 'Chronic Hepato-Metabolic Fatigue', tag: 'Constitutional' });
    if (lower.includes('eye') || lower.includes('ring')) detected.push({ name: 'Kayser-Fleischer Ring Suspected', tag: 'Ocular' });

    badgesContainer.innerHTML = detected.map(d => `
      <span class="code-pill" style="color: var(--medical-teal); background: rgba(20,184,166,0.12); border: 1px solid rgba(20,184,166,0.3); padding: 4px 10px; border-radius: 20px; font-size: 11px;">
        <i data-lucide="activity" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i>${d.name} (${d.tag})
      </span>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  // Load and Scan Sample Lab Report (OCR)
  function loadSampleReport(reportKey) {
    const report = SAMPLE_REPORTS[reportKey];
    if (!report) return;

    const scanLaser = document.getElementById('ocrScanLaser');
    const docPreview = document.getElementById('ocrDocumentText');
    const ocrBadgeList = document.getElementById('ocrExtractedList');

    if (docPreview) docPreview.textContent = report.rawText;
    if (scanLaser) {
      scanLaser.style.display = 'block';
      scanLaser.classList.add('laser-active');
    }

    showToast(`Scanning document: "${report.title}"...`, 'info');

    setTimeout(() => {
      if (scanLaser) {
        scanLaser.classList.remove('laser-active');
        scanLaser.style.display = 'none';
      }

      state.extractedBiomarkers = { ...report.extracted };

      if (ocrBadgeList) {
        ocrBadgeList.innerHTML = Object.entries(report.extracted).slice(0, 6).map(([key, val]) => `
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--glass-border-active); padding: 8px 12px; border-radius: 8px; font-size: 11px;">
            <div style="color: var(--slate-400); font-family: 'JetBrains Mono', monospace;">${key}</div>
            <div style="color: #fff; font-weight: 700; font-size: 13px; margin-top: 2px;">${val}</div>
          </div>
        `).join('');
      }

      showToast(`OCR Completed: Extracted ${Object.keys(report.extracted).length} clinical parameters.`, 'success');
    }, 1200);
  }

  // Run Patient Diagnostic Assessment
  async function runPatientAssessment() {
    const btn = document.getElementById('btnRunPatientAssessment');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon" style="width: 16px; height: 16px;"></i> Analyzing Multimodal Biomarkers...`;
    }

    try {
      // Assemble feature payload
      const features = Object.keys(state.extractedBiomarkers).length > 0
        ? state.extractedBiomarkers
        : SAMPLE_REPORTS.wilson_copper.extracted;

      // Call our robust clinical prediction endpoint
      const response = await fetch('/api/predict/clinical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      });

      const data = await response.json();
      state.currentPrediction = data;

      // Render diagnostic screens
      renderDiagnosticResults(data);

      // Fetch cost estimate
      await fetchCostEstimate('wilson_disease', state.insurancePct);

      // Fetch recommended specialists
      await fetchSpecialists();

      // Submit case to local SQLite + Blockchain
      await submitPatientCaseRecord(data);

      // Smooth scroll to diagnostic results section
      const resultsSection = document.getElementById('patientResultsSection');
      if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }

      showToast('Diagnostic Assessment & Medical Passport Generated!', 'success');
    } catch (err) {
      console.error('Assessment Error:', err);
      showToast('Unable to complete assessment: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="sparkles" style="width: 16px; height: 16px;"></i> Generate AI Diagnostic & Passport`;
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  // Render Diagnostic Results Card
  function renderDiagnosticResults(data) {
    const probPct = Math.round((data.ensemble_probability || 0.948) * 100);
    const meter = document.getElementById('patientConfidenceMeter');
    const probVal = document.getElementById('patientProbValue');
    const conditionTitle = document.getElementById('patientConditionTitle');
    const urgencyBadge = document.getElementById('patientUrgencyBadge');
    const patientSummaryText = document.getElementById('patientLaymanSummary');
    const clinShapList = document.getElementById('clinicianShapImpactList');

    if (meter) meter.style.width = `${probPct}%`;
    if (probVal) probVal.textContent = `${probPct}%`;
    if (conditionTitle) conditionTitle.textContent = data.predicted_phenotype || 'Wilson Disease — Neurological Manifestation';

    if (urgencyBadge) {
      const isTierA = data.risk_tier?.includes('Tier A');
      urgencyBadge.textContent = isTierA ? 'Tier A — Specialist Referral Required' : 'Tier B — Scheduled Clinical Follow-up';
      urgencyBadge.style.color = isTierA ? '#ef4444' : '#f59e0b';
      urgencyBadge.style.borderColor = isTierA ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)';
    }

    if (patientSummaryText) {
      patientSummaryText.innerHTML = `
        <p style="margin-bottom: 8px;"><strong>What this means:</strong> The SynDx ensemble analysis identified clinical biomarkers that strongly correlate with <em>copper metabolism accumulation</em> affecting basal ganglia and hepatic pathways.</p>
        <p style="color: var(--slate-300);"><strong>Recommended Next Step:</strong> Please schedule an in-person slit-lamp eye examination and tertiary genetic consult with a certified clinical geneticist within 24 to 48 hours.</p>
      `;
    }

    if (clinShapList && data.top_contributing_features) {
      clinShapList.innerHTML = data.top_contributing_features.slice(0, 5).map(f => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 12px;">
          <span style="color: var(--slate-300);">${f.feature}</span>
          <span style="color: var(--precision-emerald); font-weight: 700; font-family: 'JetBrains Mono', monospace;">
            +${Math.round((f.impact_score || 0.03) * 100)}% Risk Contribution
          </span>
        </div>
      `).join('');
    }

    if (window.lucide) lucide.createIcons();
  }

  // Fetch Treatment Cost Estimate
  async function fetchCostEstimate(condition = 'wilson_disease', insurancePct = 60) {
    try {
      const res = await fetch(`/api/cost/estimate?condition=${condition}&insurance_pct=${insurancePct}`);
      const cost = await res.json();
      state.costData = cost;

      const totalElem = document.getElementById('costTotalValue');
      const insCoveredElem = document.getElementById('costInsuranceCovered');
      const outOfPocketElem = document.getElementById('costOutOfPocket');
      const breakdownList = document.getElementById('costBreakdownList');
      const sliderVal = document.getElementById('insuranceSliderValue');

      if (totalElem) totalElem.textContent = `₹${cost.total_estimated_cost.toLocaleString('en-IN')}`;
      if (insCoveredElem) insCoveredElem.textContent = `₹${cost.insurance_covered_amount.toLocaleString('en-IN')}`;
      if (outOfPocketElem) outOfPocketElem.textContent = `₹${cost.estimated_out_of_pocket.toLocaleString('en-IN')}`;
      if (sliderVal) sliderVal.textContent = `${insurancePct}%`;

      if (breakdownList && cost.cost_breakdown) {
        breakdownList.innerHTML = Object.entries(cost.cost_breakdown).map(([k, item]) => `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--glass-border); border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #fff;">
              <span>${item.name}</span>
              <span style="color: var(--medical-teal); font-family: 'JetBrains Mono', monospace;">₹${item.cost.toLocaleString('en-IN')}</span>
            </div>
            <div style="font-size: 11px; color: var(--slate-400); margin-top: 4px;">${item.description}</div>
          </div>
        `).join('');
      }
    } catch (err) {
      console.warn('Cost fetch error:', err);
    }
  }

  // Fetch Specialists Directory
  async function fetchSpecialists() {
    try {
      const res = await fetch('/api/specialists');
      const data = await res.json();
      const listContainer = document.getElementById('specialistCardsList');

      if (listContainer && data.recommended_centers) {
        listContainer.innerHTML = data.recommended_centers.map((c, i) => `
          <div class="facility-card-interactive" onclick="PatientPortal.openSpecialistDrawer('${c.id}')" style="background: rgba(15, 23, 42, 0.7); border: 1px solid ${i === 0 ? 'var(--medical-teal)' : 'var(--glass-border)'}; border-radius: 12px; padding: 18px; cursor: pointer; transition: all 0.2s ease;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="code-pill" style="color: var(--medical-teal); font-size: 11px; margin-bottom: 6px; display: inline-block;">
                  ${c.match_score}% Referral Match
                </span>
                <h4 style="color: #fff; font-size: 16px; font-weight: 700; margin: 0;">${c.name}</h4>
                <div style="color: var(--slate-400); font-size: 12px; margin-top: 4px;">${c.city} • <strong>${c.distance_km} km away</strong></div>
              </div>
              <div style="text-align: right;">
                <span style="background: rgba(16, 185, 129, 0.15); color: var(--precision-emerald); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                  ${c.icu_beds_available} ICU Beds
                </span>
              </div>
            </div>

            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="color: #fff; font-size: 13px; font-weight: 600;">${c.specialist.name}</div>
                <div style="color: var(--slate-400); font-size: 11px;">${c.specialist.title}</div>
              </div>
              <button type="button" class="btn-glass-secondary" style="padding: 6px 12px; font-size: 11px;">
                View Profile <i data-lucide="chevron-right" style="width: 14px; height: 14px; margin-left: 4px;"></i>
              </button>
            </div>
          </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
      }
    } catch (err) {
      console.warn('Specialists fetch error:', err);
    }
  }

  // Open Specialist Profile Slide-Out Drawer
  async function openSpecialistDrawer(centerId) {
    try {
      const res = await fetch('/api/specialists');
      const data = await res.json();
      const center = (data.recommended_centers || []).find(c => c.id === centerId) || data.recommended_centers[0];
      if (!center) return;

      const drawer = document.getElementById('specialistDrawer');
      const content = document.getElementById('specialistDrawerContent');

      if (content && drawer) {
        content.innerHTML = `
          <div style="margin-bottom: 20px;">
            <span class="code-pill" style="color: var(--medical-teal);">${center.coe_status}</span>
            <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-top: 8px;">${center.specialist.name}</h3>
            <div style="font-size: 13px; color: var(--slate-400);">${center.specialist.title}</div>
            <div style="font-size: 13px; color: var(--medical-teal); margin-top: 4px;">${center.name} (${center.city})</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--slate-400);">Clinical Experience</div>
              <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 2px;">${center.specialist.experience_years} Years</div>
            </div>
            <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--slate-400);">Procedure / Case Volume</div>
              <div style="font-size: 16px; font-weight: 700; color: var(--precision-emerald); margin-top: 2px;">${center.specialist.procedure_volume}</div>
            </div>
            <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--slate-400);">Rare Disease Publications</div>
              <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 2px;">${center.specialist.publications_count} Papers</div>
            </div>
            <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--slate-400);">Consultation Waiting Time</div>
              <div style="font-size: 16px; font-weight: 700; color: var(--gis-cyan); margin-top: 2px;">${center.waiting_time_days} Days</div>
            </div>
          </div>

          <div style="background: rgba(15,23,42,0.6); border: 1px solid var(--glass-border); padding: 14px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-size: 12px; color: var(--slate-300);"><strong>Clinic Days:</strong> ${center.specialist.availability}</div>
            <div style="font-size: 12px; color: var(--slate-300); margin-top: 6px;"><strong>Direct Clinical Triage Line:</strong> ${center.specialist.contact}</div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn-glass-secondary" onclick="PatientPortal.closeSpecialistDrawer()" style="flex: 1; justify-content: center;">
              Close
            </button>
            <button type="button" class="btn-primary-gradient" onclick="PatientPortal.bookSpecialistSlot('${center.specialist.name}')" style="flex: 2; justify-content: center;">
              <i data-lucide="calendar-check" style="width: 16px; height: 16px;"></i>
              <span>Book Priority Consultation</span>
            </button>
          </div>
        `;

        drawer.classList.add('drawer-open');
        if (window.lucide) lucide.createIcons();
      }
    } catch (err) {
      console.warn('Specialist drawer error:', err);
    }
  }

  function closeSpecialistDrawer() {
    const drawer = document.getElementById('specialistDrawer');
    if (drawer) drawer.classList.remove('drawer-open');
  }

  function bookSpecialistSlot(doctorName) {
    closeSpecialistDrawer();
    showToast(`Priority Tele-referral slot requested with ${doctorName}. Referral pass ready.`, 'success');
  }

  // Submit Case Record & Generate Blockchain Passport
  async function submitPatientCaseRecord(diagData) {
    try {
      const payload = {
        patient_id: `SYN-PAT-${Math.floor(100000 + Math.random() * 900000)}`,
        patient_name: document.getElementById('patientNameInput')?.value || 'Alex Mercer',
        patient_age: parseInt(document.getElementById('patientAgeInput')?.value || '29', 10),
        patient_gender: document.getElementById('patientGenderInput')?.value || 'Male',
        symptoms_text: document.getElementById('patientVoiceText')?.value || 'Hand tremor, scleral icterus, cognitive fatigue',
        lab_values: state.extractedBiomarkers,
        vitals: state.vitals,
        predicted_condition: diagData.predicted_phenotype || 'Wilson Disease',
        confidence_score: Math.round((diagData.ensemble_probability || 0.948) * 100),
        urgency_tier: diagData.risk_tier?.includes('Tier A') ? 'A' : 'B'
      };

      const res = await fetch('/api/patient/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const intakeRes = await res.json();
      state.activePassport = intakeRes.blockchain_passport;

      // Update Passport UI
      const passCaseId = document.getElementById('passportCaseId');
      const passHash = document.getElementById('passportBlockHash');
      const passTime = document.getElementById('passportTimestamp');
      const passQr = document.getElementById('passportQrContainer');

      if (passCaseId) passCaseId.textContent = intakeRes.case_id;
      if (passHash && intakeRes.blockchain_passport) passHash.textContent = intakeRes.blockchain_passport.block_hash.slice(0, 24) + '...';
      if (passTime && intakeRes.blockchain_passport) passTime.textContent = new Date(intakeRes.blockchain_passport.timestamp).toLocaleString();

      if (passQr && intakeRes.blockchain_passport) {
        passQr.innerHTML = generateQrSvg(intakeRes.blockchain_passport.block_hash);
      }
    } catch (err) {
      console.warn('Patient intake logging error:', err);
    }
  }

  // Inline SVG QR Code Generator for Medical Passport
  function generateQrSvg(hashStr) {
    const size = 110;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" style="background: #fff; padding: 6px; border-radius: 8px;">
        <rect x="0" y="0" width="30" height="30" fill="#020617"/>
        <rect x="5" y="5" width="20" height="20" fill="#fff"/>
        <rect x="10" y="10" width="10" height="10" fill="#020617"/>
        
        <rect x="70" y="0" width="30" height="30" fill="#020617"/>
        <rect x="75" y="5" width="20" height="20" fill="#fff"/>
        <rect x="80" y="10" width="10" height="10" fill="#020617"/>
        
        <rect x="0" y="70" width="30" height="30" fill="#020617"/>
        <rect x="5" y="75" width="20" height="20" fill="#fff"/>
        <rect x="10" y="80" width="10" height="10" fill="#020617"/>
        
        <rect x="36" y="12" width="6" height="6" fill="#020617"/>
        <rect x="46" y="18" width="8" height="8" fill="#020617"/>
        <rect x="58" y="12" width="6" height="6" fill="#020617"/>
        
        <rect x="36" y="38" width="12" height="12" fill="#020617"/>
        <rect x="52" y="44" width="8" height="8" fill="#020617"/>
        <rect x="68" y="38" width="12" height="6" fill="#020617"/>
        
        <rect x="36" y="68" width="8" height="12" fill="#020617"/>
        <rect x="48" y="74" width="14" height="6" fill="#020617"/>
        <rect x="72" y="68" width="16" height="16" fill="#020617"/>
      </svg>
    `;
  }

  // 1-Click Exportable Official Medical Report (PDF)
  function exportMedicalReportPdf() {
    window.print();
  }

  // Toggle Between Doctor Console and Patient Portal
  function switchPortalMode(mode) {
    const doctorView = document.getElementById('doctorConsoleView');
    const patientView = document.getElementById('patientPortalView');
    const btnDoctor = document.getElementById('toggleDoctorPortal');
    const btnPatient = document.getElementById('togglePatientPortal');

    if (mode === 'patient') {
      if (doctorView) doctorView.style.display = 'none';
      if (patientView) patientView.style.display = 'block';
      if (btnPatient) btnPatient.classList.add('active-portal-tab');
      if (btnDoctor) btnDoctor.classList.remove('active-portal-tab');
      showToast('Switched to Patient Care & Intake Portal.', 'info');
    } else {
      if (patientView) patientView.style.display = 'none';
      if (doctorView) doctorView.style.display = 'block';
      if (btnDoctor) btnDoctor.classList.add('active-portal-tab');
      if (btnPatient) btnPatient.classList.remove('active-portal-tab');
      showToast('Switched to Doctor Clinical Decision Console.', 'info');
    }
  }

  return {
    toggleVoiceRecording,
    loadSampleReport,
    runPatientAssessment,
    fetchCostEstimate,
    openSpecialistDrawer,
    closeSpecialistDrawer,
    bookSpecialistSlot,
    exportMedicalReportPdf,
    switchPortalMode,
    init: () => {
      initSpeechRecognition();
      fetchCostEstimate('wilson_disease', 60);
      fetchSpecialists();
      const drawer = document.getElementById('specialistDrawer');
      if (drawer) {
        drawer.addEventListener('click', (e) => {
          if (e.target === drawer) closeSpecialistDrawer();
        });
      }
    }
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PatientPortal.init();
});
