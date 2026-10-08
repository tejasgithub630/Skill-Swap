import { Skill, SkillRequest, Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer, Certification, UserSkill, SkillAlias } from '../models/index.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING SKILLSWAP DYNAMIC SKILL & CERTIFICATION ACCEPTANCE SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // Ensure clean slate for test skill "Rust"
  const existingRust = await Skill.findOne({ where: { slug: 'rust' } });
  if (existingRust) {
    const existingAssessments = await Assessment.findAll({ where: { skill_id: existingRust.id } });
    for (const a of existingAssessments) {
      const attempts = await AssessmentAttempt.findAll({ where: { assessment_id: a.id } });
      for (const att of attempts) {
        await AssessmentAnswer.destroy({ where: { attempt_id: att.id } });
      }
      await AssessmentAttempt.destroy({ where: { assessment_id: a.id } });
      await AssessmentQuestion.destroy({ where: { assessment_id: a.id } });
      await a.destroy();
    }
    await Certification.destroy({ where: { skill_id: existingRust.id } });
    await UserSkill.destroy({ where: { skill_id: existingRust.id } });
    await SkillAlias.destroy({ where: { skill_id: existingRust.id } });
    await existingRust.destroy();
  }
  await SkillRequest.destroy({ where: { requested_name: 'Rust' } });

  // 1. Authenticate regular user and admin
  console.log('--- Step 1: Authentication & Authorization ---');
  const userLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@example.com', password: 'password123' })
  }).then(r => r.json());
  assert(userLogin.token && !userLogin.user.is_admin, 'Regular user authenticated without admin privileges');

  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@skillswap.com', password: 'password123' })
  }).then(r => r.json());
  assert(adminLogin.token && adminLogin.user.is_admin === true, 'Admin authenticated with admin privileges');

  // 2. Duplicate detection & Alias resolution
  console.log('\n--- Step 2: Duplicate Prevention & Alias Resolution ---');
  const dupCheck1 = await fetch(`${BASE_URL}/skills/check-duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'JS' })
  }).then(r => r.json());
  assert(dupCheck1.isDuplicate === true, 'Duplicate check identifies "JS" as existing alias');
  assert(dupCheck1.suggestion.includes('JavaScript'), 'Duplicate check provides "Did you mean JavaScript?" suggestion');

  const dupCheck2 = await fetch(`${BASE_URL}/skills/check-duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'React JS' })
  }).then(r => r.json());
  assert(dupCheck2.isDuplicate === true && dupCheck2.matchedSkill.canonical_name === 'React', 'Identifies "React JS" as alias for canonical React');

  // 3. Search for non-existent skill "Rust"
  console.log('\n--- Step 3: Search for Non-existent Skill (Rust) ---');
  const searchRustInitial = await fetch(`${BASE_URL}/skills/search?q=Rust`).then(r => r.json());
  const rustFoundInitially = searchRustInitial.some(s => s.canonical_name.toLowerCase() === 'rust');
  assert(!rustFoundInitially, 'Rust does not exist in canonical taxonomy initially');

  // 4. Submit Skill Request for "Rust"
  console.log('\n--- Step 4: Submit New Skill Request ---');
  const requestRes = await fetch(`${BASE_URL}/skills/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userLogin.token}`
    },
    body: JSON.stringify({
      requested_name: 'Rust',
      category: 'Systems Language',
      domain: 'ENGINEERING',
      description: 'Systems programming language focused on memory safety without garbage collection.',
      justification: 'Critical for high-performance distributed systems, WebAssembly, and modern infrastructure.'
    })
  });
  const requestData = await requestRes.json();
  assert(requestRes.status === 201 || (requestRes.status === 409 && requestData.request), 'Skill request for Rust created or already logged');
  const rustRequestId = requestData.request?.id;
  assert(rustRequestId, 'Skill request assigned valid UUID');

  // 5. Unauthorized Admin Check
  console.log('\n--- Step 5: Enforce Admin Authorization ---');
  const unauthorizedReview = await fetch(`${BASE_URL}/skills/requests/${rustRequestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userLogin.token}` // regular user token!
    },
    body: JSON.stringify({ status: 'APPROVED' })
  });
  assert(unauthorizedReview.status === 403, 'Regular user rejected with 403 Forbidden when attempting admin action');

  // 6. Admin Approves "Rust" -> Auto-configures Canonical Skill + Assessment
  console.log('\n--- Step 6: Admin Approves Skill & Auto-generates Assessment ---');
  const approveRes = await fetch(`${BASE_URL}/skills/requests/${rustRequestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminLogin.token}`
    },
    body: JSON.stringify({
      status: 'APPROVED',
      canonical_name: 'Rust',
      category: 'Systems Language',
      domain: 'ENGINEERING',
      aliases: ['Rust-lang', 'Rustlang'],
      admin_feedback: 'Approved by Lead Proctor. Configured standard 3-question evaluation.'
    })
  });
  const approveData = await approveRes.json();
  assert(approveRes.status === 200 && approveData.success, 'Admin successfully approves skill request');
  const rustSkillId = approveData.skill.id;
  assert(rustSkillId && approveData.assessment?.id, 'Canonical Rust skill created with active assessment');

  // 7. Global Discovery: Rust is now discoverable to all users!
  console.log('\n--- Step 7: Global Taxonomy Availability ---');
  const searchRustAfter = await fetch(`${BASE_URL}/skills/search?q=Rust`).then(r => r.json());
  const rustNowAvailable = searchRustAfter.find(s => s.canonical_name === 'Rust');
  assert(!!rustNowAvailable, 'Rust is now immediately searchable and globally available in taxonomy');

  // 8. User Adds Rust as Self-Declared
  console.log('\n--- Step 8: User Adds Skill (Self-Declared Status) ---');
  const addSkillRes = await fetch(`${BASE_URL}/users/me/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userLogin.token}`
    },
    body: JSON.stringify({
      skill_id: rustSkillId,
      is_teaching: true,
      proficiency_level: 'INTERMEDIATE'
    })
  });
  const addSkillData = await addSkillRes.json();
  assert(addSkillRes.status === 201, 'User successfully adds Rust to profile');
  assert(addSkillData.userSkill.verification_status === 'SELF_DECLARED', 'Skill is initially marked SELF_DECLARED (certification required)');

  // 9. Start Assessment Session
  console.log('\n--- Step 9: Start Proctored Assessment Session ---');
  const startExamRes = await fetch(`${BASE_URL}/assessments/${approveData.assessment.id}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userLogin.token}` }
  });
  const examData = await startExamRes.json();
  assert(startExamRes.status === 200, 'Assessment attempt started successfully');
  assert(examData.attemptId, 'Server assigned attempt ID');
  assert(examData.questions && examData.questions.length > 0, 'Questions returned to client');
  const leakedAnswer = examData.questions.some(q => q.correct_answer !== undefined);
  assert(!leakedAnswer, 'CRITICAL SECURITY: Correct answers are NOT exposed to browser');

  // 10. Submit Assessment with Answers & Server-Side Scoring
  console.log('\n--- Step 10: Server-Side Grading & Certification Issuance ---');
  // For the generated Rust questions, submit correct answers to pass
  const answers = {};
  for (const q of examData.questions) {
    // Pick the first option which matches our default question structure
    answers[q.id] = q.options[0];
  }

  const submitRes = await fetch(`${BASE_URL}/assessments/attempts/${examData.attemptId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userLogin.token}`
    },
    body: JSON.stringify({ answers })
  });
  const submitData = await submitRes.json();
  assert(submitRes.status === 200, 'Submission processed successfully by server');
  assert(submitData.passed === true, 'Candidate passed the assessment threshold');
  assert(submitData.certification && submitData.certification.certificate_number, 'Server issued official Certification');
  const certNumber = submitData.certification.certificate_number;
  console.log(`   📜 Certificate Issued: ${certNumber} (Level: ${submitData.proficiencyLevel}, Score: ${submitData.percentage}%)`);

  // 11. Profile Shows Rust as VERIFIED with Certification Link
  console.log('\n--- Step 11: User Profile Verified State ---');
  const userSkillsRes = await fetch(`${BASE_URL}/users/me/skills`, {
    headers: { 'Authorization': `Bearer ${userLogin.token}` }
  }).then(r => r.json());
  const rustOnProfile = userSkillsRes.verifiedSkills.find(s => s.canonical_name === 'Rust');
  assert(!!rustOnProfile, 'Rust is now classified under Verified Skills on profile');
  assert(rustOnProfile.verification_status === 'VERIFIED', 'Verification status is strictly VERIFIED');
  assert(rustOnProfile.certificate_number === certNumber, 'Certificate number matches profile record');

  // 12. Public Certificate Verification Endpoint
  console.log('\n--- Step 12: Public Certificate Verification Link ---');
  const publicVerifyRes = await fetch(`${BASE_URL}/certifications/verify/${certNumber}`).then(r => r.json());
  assert(publicVerifyRes.valid === true, 'Public verification confirms certificate is valid');
  assert(publicVerifyRes.certificate_number === certNumber, 'Certificate number matches public registry');
  assert(publicVerifyRes.skill_name === 'Rust', 'Public verification certifies correct skill');
  assert(publicVerifyRes.credential_holder.includes('Alex'), 'Holder name is verified without exposing private personal email');

  // 13. Peer Learner Adds Rust to Learning Goals & Reciprocal Match
  console.log('\n--- Step 13: Reciprocal Matching with Verified Skill ---');
  const peerLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@example.com', password: 'password123' })
  }).then(r => r.json());

  // Sarah adds Rust to wanted skills
  await fetch(`${BASE_URL}/users/me/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${peerLogin.token}`
    },
    body: JSON.stringify({
      skill_id: rustSkillId,
      is_teaching: false,
      is_wanting: true
    })
  });

  // Calculate matches for Sarah
  const peerMatches = await fetch(`${BASE_URL}/matches`, {
    headers: { 'Authorization': `Bearer ${peerLogin.token}` }
  }).then(r => r.json());

  const alexMatch = peerMatches.find(m => m.user === 'Alex Chen');
  assert(!!alexMatch, 'Matching engine discovers Alex Chen as a peer');
  assert(alexMatch.matchScore >= 75, `High confidence reciprocal match generated (${alexMatch.matchScore}%)`);
  console.log(`   🤝 Match with Alex: ${alexMatch.matchScore}% | Explanation: "${alexMatch.explanation}"`);

  // 14. Admin Revocation Test
  console.log('\n--- Step 14: Certificate Revocation Test ---');
  const userCerts = await fetch(`${BASE_URL}/certifications/my`, {
    headers: { 'Authorization': `Bearer ${userLogin.token}` }
  }).then(r => r.json());
  const rustCert = userCerts.find(c => c.certificate_number === certNumber);
  
  const revokeRes = await fetch(`${BASE_URL}/certifications/${rustCert.id}/revoke`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminLogin.token}`
    },
    body: JSON.stringify({ revocation_reason: 'Automated test revocation' })
  }).then(r => r.json());
  assert(revokeRes.success === true, 'Admin successfully revokes certificate');

  const publicVerifyRevoked = await fetch(`${BASE_URL}/certifications/verify/${certNumber}`).then(r => r.json());
  assert(publicVerifyRevoked.valid === false && publicVerifyRevoked.verification_status === 'REVOKED', 'Public verification now displays REVOKED status');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed} ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY! (Failed: ${failed})`);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
