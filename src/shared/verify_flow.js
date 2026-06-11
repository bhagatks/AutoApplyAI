import assert from 'assert';

// The configuration completeness validator
function isConfigComplete(config) {
  return !!(
    config &&
    config.customerId &&
    config.geminiApiKey &&
    config.outputDir &&
    config.candidateProfile &&
    config.candidateProfile.firstName &&
    config.candidateProfile.lastName &&
    config.candidateProfile.email &&
    config.candidateProfile.phone &&
    config.candidateProfile.resume
  );
}

// Flow state machine resolver
function resolveFlowState(currentUser, customerConfig) {
  if (!currentUser) {
    return 'SHOW_LOGIN';
  }
  if (!isConfigComplete(customerConfig)) {
    return 'SHOW_ONBOARDING';
  }
  return 'SHOW_DASHBOARD';
}

function runTests() {
  console.log("=== Running Flow & Onboarding Unit Tests ===");

  // Test 1: Generate customerId format correctly
  const firstName = "Bhagath ";
  const lastName = "Siddi  ";
  const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const customerId = `customer_${cleanFirst}_${cleanLast}`;
  assert.strictEqual(customerId, "customer_bhagath_siddi", "CustomerId construction failed!");
  console.log("✓ Test 1 Passed: customerId constructed correctly:", customerId);

  // Test 2: Incomplete config validation
  const incompleteConfig = {
    customerId: "customer_bhagath_siddi",
    geminiApiKey: "AIzaSyTest",
    outputDir: "/Users/bstar/Downloads/resume_backup/",
    candidateProfile: {
      firstName: "Bhagath",
      lastName: "Siddi",
      email: "bhagathsiddi@gmail.com",
      phone: "" // Missing phone
    }
  };
  assert.strictEqual(isConfigComplete(incompleteConfig), false, "Validator passed incomplete configuration!");
  console.log("✓ Test 2 Passed: Incomplete configuration rejected correctly.");

  // Test 3: Complete config validation
  const completeConfig = {
    customerId: "customer_bhagath_siddi",
    geminiApiKey: "AIzaSyTest",
    outputDir: "/Users/bstar/Downloads/resume_backup/",
    candidateProfile: {
      firstName: "Bhagath",
      lastName: "Siddi",
      email: "bhagathsiddi@gmail.com",
      phone: "555-555-5555",
      resume: "xxx.pdf"
    }
  };
  assert.strictEqual(isConfigComplete(completeConfig), true, "Validator failed to pass a complete configuration!");
  console.log("✓ Test 3 Passed: Complete configuration approved correctly.");

  // Test 4: Flow state resolution - Not logged in
  const stateNotLoggedIn = resolveFlowState(null, completeConfig);
  assert.strictEqual(stateNotLoggedIn, 'SHOW_LOGIN', "Auth check failed: Expected SHOW_LOGIN");
  console.log("✓ Test 4 Passed: Unauthenticated state redirects to Login.");

  // Test 5: Flow state resolution - Logged in, not onboarded
  const currentUserMock = { uid: "user123", email: "bhagathsiddi@gmail.com" };
  const stateOnboarding = resolveFlowState(currentUserMock, incompleteConfig);
  assert.strictEqual(stateOnboarding, 'SHOW_ONBOARDING', "Onboarding check failed: Expected SHOW_ONBOARDING");
  console.log("✓ Test 5 Passed: Authenticated but incomplete configuration blocks and shows Onboarding.");

  // Test 6: Flow state resolution - Fully onboarded
  const stateReady = resolveFlowState(currentUserMock, completeConfig);
  assert.strictEqual(stateReady, 'SHOW_DASHBOARD', "Dashboard check failed: Expected SHOW_DASHBOARD");
  console.log("✓ Test 6 Passed: Fully authenticated and onboarded state opens the Dashboard.");

  // Test 7: Web page auth/linking flow - Authentication successful, but configuration empty/incomplete
  // Even if authenticated via Google linking, the app must remain blocked on onboarding
  const linkedUserMock = { uid: "user_linked_abc", email: "linked_user@gmail.com" };
  const incompleteLinkedConfig = null; // No config stored yet
  const stateGateOnlinking = resolveFlowState(linkedUserMock, incompleteLinkedConfig);
  assert.strictEqual(stateGateOnlinking, 'SHOW_ONBOARDING', "Onboarding gate failed on authentication linking!");
  console.log("✓ Test 7 Passed: Web page redirect linking flow gates on Onboarding screen before dashboard access is permitted.");

  console.log("=== All Onboarding & Flow Unit Tests Passed Successfully ===");
}

runTests();

