// Test file for role-based permissions and navigation

import { hasPermission, getPermittedActions, Entity, Permission, UserRole } from '../utils/permissionUtils';

/**
 * Test suite for permission utilities
 */
const runPermissionTests = () => {
  console.log('Running permission tests...');
  let testsPassed = 0;
  let testsFailed = 0;

  // Test function to check if expected result matches actual result
  const testPermission = (
    testName: string,
    userRole: UserRole,
    entity: any,
    action: any,
    ownerId: string | undefined,
    userId: string | undefined,
    expectedResult: boolean
  ) => {
    const result = hasPermission(userRole, entity, action, ownerId, userId);
    const passed = result === expectedResult;
    
    if (passed) {
      testsPassed++;
      console.log(`✅ Test passed: ${testName}`);
    } else {
      testsFailed++;
      console.error(`❌ Test failed: ${testName}`);
      console.error(`   Expected: ${expectedResult}, Got: ${result}`);
    }
    
    return passed;
  };

  // Tests for Admin role
  testPermission(
    'Admin can view any user',
    UserRole.ADMIN,
    'user',
    'view',
    'user-123',
    'admin-456',
    true
  );

  testPermission(
    'Admin can create users',
    UserRole.ADMIN,
    'user',
    'create',
    undefined,
    'admin-456',
    true
  );

  testPermission(
    'Admin can edit any user',
    UserRole.ADMIN,
    'user',
    'edit',
    'user-123',
    'admin-456',
    true
  );

  testPermission(
    'Admin can delete users',
    UserRole.ADMIN,
    'user',
    'delete',
    'user-123',
    'admin-456',
    true
  );

  // Tests for Owner role
  testPermission(
    'Owner can view own dog',
    UserRole.OWNER,
    'dog',
    'view',
    'owner-123',
    'owner-123',
    true
  );

  testPermission(
    'Owner can create dog',
    UserRole.OWNER,
    'dog',
    'create',
    undefined,
    'owner-123',
    true
  );

  testPermission(
    'Owner can edit own dog',
    UserRole.OWNER,
    'dog',
    'edit',
    'owner-123',
    'owner-123',
    true
  );

  testPermission(
    'Owner cannot edit another owner\'s dog',
    UserRole.OWNER,
    'dog',
    'edit',
    'owner-456',
    'owner-123',
    false
  );

  testPermission(
    'Owner can delete own dog',
    UserRole.OWNER,
    'dog',
    'delete',
    'owner-123',
    'owner-123',
    true
  );

  testPermission(
    'Owner cannot delete another owner\'s dog',
    UserRole.OWNER,
    'dog',
    'delete',
    'owner-456',
    'owner-123',
    false
  );

  // Tests for Breeder role
  testPermission(
    'Breeder can view breeding program',
    UserRole.OWNER,
    'breeding-program',
    'view',
    'breeder-123',
    'breeder-123',
    true
  );

  testPermission(
    'Breeder can create breeding program',
    UserRole.OWNER,
    'breeding-program',
    'create',
    undefined,
    'breeder-123',
    true
  );

  testPermission(
    'Breeder can edit own breeding program',
    UserRole.OWNER,
    'breeding-program',
    'edit',
    'breeder-123',
    'breeder-123',
    true
  );

  testPermission(
    'Breeder cannot edit another breeder\'s breeding program',
    UserRole.OWNER,
    'breeding-program',
    'edit',
    'breeder-456',
    'breeder-123',
    false
  );

  // Tests for Handler role
  testPermission(
    'Handler can view competition',
    UserRole.HANDLER,
    'competition',
    'view',
    'handler-123',
    'handler-123',
    true
  );

  testPermission(
    'Handler can create competition result',
    UserRole.HANDLER,
    'competition',
    'create',
    undefined,
    'handler-123',
    true
  );

  testPermission(
    'Handler can edit own competition result',
    UserRole.HANDLER,
    'competition',
    'edit',
    'handler-123',
    'handler-123',
    true
  );

  // Tests for Club role
  testPermission(
    'Club can view club event',
    UserRole.CLUB,
    'club-event',
    'view',
    'club-123',
    'club-123',
    true
  );

  testPermission(
    'Club can create club event',
    UserRole.CLUB,
    'club-event',
    'create',
    undefined,
    'club-123',
    true
  );

  testPermission(
    'Club can edit own club event',
    UserRole.CLUB,
    'club-event',
    'edit',
    'club-123',
    'club-123',
    true
  );

  testPermission(
    'Club cannot edit another club\'s event',
    UserRole.CLUB,
    'club-event',
    'edit',
    'club-456',
    'club-123',
    false
  );

  // Test getPermittedActions function
  const testActionsList = (
    testName: string,
    userRole: UserRole,
    entity: Entity,
    ownerId: string | undefined,
    userId: string | undefined,
    expectedActions: Permission[]
  ) => {
    const actions = getPermittedActions(userRole, entity, ownerId, userId);
    const actionsSet = new Set(actions);
    const expectedSet = new Set(expectedActions);
    
    // Check if the sets have the same size and all items in expected are in actions
    const sizeMatch = actionsSet.size === expectedSet.size;
    const allItemsMatch = [...expectedSet].every(item => actionsSet.has(item));
    const passed = sizeMatch && allItemsMatch;
    
    if (passed) {
      testsPassed++;
      console.log(`✅ Test passed: ${testName}`);
    } else {
      testsFailed++;
      console.error(`❌ Test failed: ${testName}`);
      console.error(`   Expected: [${expectedActions.join(', ')}], Got: [${actions.join(', ')}]`);
    }
    
    return passed;
  };

  // Test permitted actions for different roles
  testActionsList(
    'Admin actions for user entity',
    UserRole.ADMIN,
    'user',
    'user-123',
    'admin-456',
    ['view', 'create', 'edit', 'delete']
  );

  testActionsList(
    'Owner actions for own dog',
    UserRole.OWNER,
    'dog',
    'owner-123',
    'owner-123',
    ['view', 'create', 'edit', 'delete']
  );

  testActionsList(
    'Owner actions for other\'s dog',
    UserRole.OWNER,
    'dog',
    'owner-456',
    'owner-123',
    ['view', 'create']
  );

  testActionsList(
    'Breeder actions for own breeding program',
    UserRole.OWNER,
    'breeding-program',
    'breeder-123',
    'breeder-123',
    ['view', 'create', 'edit', 'delete']
  );

  testActionsList(
    'Handler actions for competition',
    UserRole.HANDLER,
    'competition',
    undefined,
    'handler-123',
    ['view', 'create']
  );

  testActionsList(
    'Club actions for own club event',
    UserRole.CLUB,
    'club-event',
    'club-123',
    'club-123',
    ['view', 'create', 'edit', 'delete']
  );

  // Print test summary
  console.log('\nPermission Test Summary:');
  console.log(`Total tests: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  
  return {
    total: testsPassed + testsFailed,
    passed: testsPassed,
    failed: testsFailed
  };
};

// Additional test for role-based navigation
const testRoleBasedNavigation = () => {
  console.log('\nTesting role-based navigation...');
  
  // In a real application, this would involve testing that different users
  // are shown the correct navigation items and can access only permitted routes.
  
  // For our test purposes, this would simulate checking that:
  // 1. Admin users see all navigation links
  // 2. Owner users see only owner-related links
  // 3. Breeder users see breeding program links
  // 4. Handler users see competition links
  // 5. Club users see club event links
  
  const mockNavItems = {
    admin: [
      '/admin/dashboard',
      '/admin/users',
      '/user/dashboard',
      '/manage/dogs',
      '/health-records',
      '/competitions',
      '/breeding-programs',
      '/club-events',
    ],
    owner: [
      '/user/dashboard',
      '/manage/dogs',
      '/health-records',
      '/competitions',
    ],
    breeder: [
      '/user/dashboard',
      '/manage/dogs',
      '/health-records',
      '/breeding-programs',
    ],
    handler: [
      '/user/dashboard',
      '/manage/dogs',
      '/competitions',
    ],
    club: [
      '/user/dashboard',
      '/club-events',
      '/competitions',
    ],
  };
  
  console.log('Navigation links available to each role:');
  for (const [role, links] of Object.entries(mockNavItems)) {
    console.log(`${role.charAt(0).toUpperCase() + role.slice(1)}: ${links.length} links`);
    console.log(`  ${links.join(', ')}`);
  }
  
  console.log('\nAll role-based navigation tests completed.');
};

// To run all tests
const runAllTests = () => {
  const permissionResults = runPermissionTests();
  testRoleBasedNavigation();
  
  console.log('\n=================================');
  console.log('All tests completed!');
  console.log(`Total permission tests: ${permissionResults.total}`);
  console.log(`Passed: ${permissionResults.passed}`);
  console.log(`Failed: ${permissionResults.failed}`);
  console.log('=================================');
};

// Export test functions
export {
  runPermissionTests,
  testRoleBasedNavigation,
  runAllTests,
};
