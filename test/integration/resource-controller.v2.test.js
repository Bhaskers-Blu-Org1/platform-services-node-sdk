/* eslint-disable no-console */
/**
 * (C) Copyright IBM Corp. 2020.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

const ResourceControllerV2 = require('../../dist/resource-controller/v2');
const authHelper = require('../resources/auth-helper.js');
const { v4: uuidv4 } = require('uuid');

// testcase timeout value (40s).
const timeout = 60000;

// Location of our config file.
const configFile = 'resource_controller.env';

// Use authHelper to skip tests if our configFile is not available.
const describe = authHelper.prepareTests(configFile);

const testAccountId = 'bc2b2fca0af84354a916dc1de6eee42e';
const testResourceGroupGuid = '13aa3ee48c3b44ddb64c05c79f7ab8ef';
const testOrgGuid = 'd35d4f0e-5076-4c89-9361-2522894b6548';
const testSpaceGuid = '336ba5f3-f185-488e-ac8d-02195eebb2f3';
const testAppGuid = 'bf692181-1f0e-46be-9faf-eb0857f4d1d5';
const testRegionId1 = 'global';
const testPlanId1 = 'a10e4820-3685-11e9-b210-d663bd873d93';
const testRegionId2 = 'us-south';
const testPlanId2 = '2580b607-db64-4883-9793-445b694ed57b';

let service;
let testInstanceCrn;
let testInstanceGuid;
let testAliasCrn;
let testAliasGuid;
let testBindingCrn;
let testBindingGuid;
let testInstanceKeyCrn;
let testInstanceKeyGuid;
let testAliasKeyCrn;
let testAliasKeyGuid;
let aliasTargetCrn;
let bindTargetCrn;
let testReclaimInstanceCrn;
let testReclaimInstanceGuid;
let testReclamationId1;
let testReclamationId2;

describe('ResourceControllerV2_integration', () => {
  jest.setTimeout(timeout);

  test('should successfully complete initialization', done => {
    // Initialize the service client.
    service = ResourceControllerV2.newInstance();
    expect(service).not.toBeNull();
    done();
  });

  test('00 - Create A Resource Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test00-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkInstance1',
      target: testRegionId1,
      resourceGroup: testResourceGroupGuid,
      resourcePlanId: testPlanId1,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.createResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(201);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toBeDefined();
    expect(result.guid).toBeDefined();
    expect(result.crn).toBeDefined();
    expect(result.id).toEqual(result.crn);
    expect(result.name).toEqual('RcSdkInstance1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.resource_plan_id).toEqual(testPlanId1);
    expect(result.state).toEqual('active');
    expect(result.locked).toBeFalsy();
    expect(result.last_operation.type).toEqual('create');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    testInstanceCrn = result.id;
    testInstanceGuid = result.guid;

    done();
  });

  test('01 - Get A Resource Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test01-' + uuidv4(),
    };

    const params = {
      id: testInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testInstanceCrn);
    expect(result.guid).toEqual(testInstanceGuid);
    expect(result.crn).toEqual(testInstanceCrn);
    expect(result.name).toEqual('RcSdkInstance1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.resource_plan_id).toEqual(testPlanId1);
    expect(result.state).toEqual('active');
    expect(result.locked).toBeFalsy();
    expect(result.last_operation.type).toEqual('create');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    done();
  });

  test('02 - Update A Resource Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test02-' + uuidv4(),
    };

    const instanceParams = {
      'hello': 'bye',
    };

    const params = {
      id: testInstanceGuid,
      name: 'RcSdkInstanceUpdate1',
      parameters: instanceParams,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.updateResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testInstanceCrn);
    expect(result.name).toEqual('RcSdkInstanceUpdate1');
    expect(result.state).toEqual('active');
    expect(result.last_operation.type).toEqual('update');
    expect(result.last_operation.sub_type).toEqual('config');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    done();
  });

  test('03 - List Resource Instances With No Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test03-' + uuidv4(),
    };

    const params = {
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceInstances(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toBeGreaterThanOrEqual(1);
    expect(result.resources.length).toBeGreaterThanOrEqual(1);

    done();
  });

  test('04 - List Resource Instances With Guid Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test04-' + uuidv4(),
    };

    const params = {
      guid: testInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceInstances(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(1);
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].id).toEqual(testInstanceCrn);
    expect(result.resources[0].name).toEqual('RcSdkInstanceUpdate1');
    expect(result.resources[0].state).toEqual('active');
    expect(result.resources[0].last_operation.type).toEqual('update');
    expect(result.resources[0].last_operation.sub_type).toEqual('config');
    expect(result.resources[0].last_operation.async).toBeFalsy();
    expect(result.resources[0].last_operation.state).toEqual('succeeded');

    done();
  });

  test('05 - List Resource Instances With Name Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test05-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkInstance1',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceInstances(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(0);
    expect(result.resources).toHaveLength(0);

    done();
  });

  test('06 - Create A Resource Alias', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test06-' + uuidv4(),
    };

    const targetCrn = 'crn:v1:bluemix:public:bluemix:us-south:o/' + testOrgGuid + '::cf-space:' + testSpaceGuid;
    aliasTargetCrn = 'crn:v1:bluemix:public:cf:us-south:o/' + testOrgGuid + '::cf-space:' + testSpaceGuid;
    const params = {
      name: 'RcSdkAlias1',
      source: testInstanceGuid,
      target: targetCrn,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.createResourceAlias(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(201);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toBeDefined();
    expect(result.guid).toBeDefined();
    expect(result.crn).toBeDefined();
    expect(result.id).toEqual(result.crn);
    expect(result.name).toEqual('RcSdkAlias1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.target_crn).toEqual(aliasTargetCrn);
    expect(result.state).toEqual('active');
    expect(result.resource_instance_id).toEqual(testInstanceCrn);

    testAliasCrn = result.id;
    testAliasGuid = result.guid;

    done();
  });

  test('07 - Get A Resource Alias', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test07-' + uuidv4(),
    };

    const params = {
      id: testAliasGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceAlias(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testAliasCrn);
    expect(result.guid).toEqual(testAliasGuid);
    expect(result.crn).toEqual(testAliasCrn);
    expect(result.name).toEqual('RcSdkAlias1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.target_crn).toEqual(aliasTargetCrn);
    expect(result.state).toEqual('active');
    expect(result.resource_instance_id).toEqual(testInstanceCrn);

    done();
  });

  test('08 - Update A Resource Alias', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test08-' + uuidv4(),
    };

    const params = {
      id: testAliasGuid,
      name: 'RcSdkAliasUpdate1',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.updateResourceAlias(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testAliasCrn);
    expect(result.name).toEqual('RcSdkAliasUpdate1');
    expect(result.state).toEqual('active');

    done();
  });

  test('09 - List Resource Aliases With No Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test09-' + uuidv4(),
    };

    const params = {
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceAliases(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toBeGreaterThanOrEqual(1);
    expect(result.resources.length).toBeGreaterThanOrEqual(1);

    done();
  });

  test('10 - List Resource Aliases With Guid Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test10-' + uuidv4(),
    };

    const params = {
      guid: testAliasGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceAliases(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(1);
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].id).toEqual(testAliasCrn);
    expect(result.resources[0].name).toEqual('RcSdkAliasUpdate1');
    expect(result.resources[0].state).toEqual('active');
    expect(result.resources[0].account_id).toEqual(testAccountId);
    expect(result.resources[0].resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.resources[0].target_crn).toEqual(aliasTargetCrn);
    expect(result.resources[0].state).toEqual('active');
    expect(result.resources[0].resource_instance_id).toEqual(testInstanceCrn);

    done();
  });

  test('11 - List Resource Aliases With Name Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test11-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkAlias1',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceAliases(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(0);
    expect(result.resources).toHaveLength(0);

    done();
  });

  test('12 - Create A Resource Binding', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test12-' + uuidv4(),
    };

    const targetCrn = 'crn:v1:staging:public:bluemix:us-south:s/' + testSpaceGuid + '::cf-application:' + testAppGuid;
    bindTargetCrn = 'crn:v1:staging:public:cf:us-south:s/' + testSpaceGuid + '::cf-application:' + testAppGuid;
    const params = {
      name: 'RcSdkBinding1',
      source: testAliasGuid,
      target: targetCrn,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.createResourceBinding(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(201);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toBeDefined();
    expect(result.guid).toBeDefined();
    expect(result.crn).toBeDefined();
    expect(result.id).toEqual(result.crn);
    expect(result.name).toEqual('RcSdkBinding1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.source_crn).toEqual(testAliasCrn);
    expect(result.target_crn).toEqual(bindTargetCrn);
    expect(result.state).toEqual('active');

    testBindingCrn = result.id;
    testBindingGuid = result.guid;

    done();
  });

  test('13 - Get A Resource Binding', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test13-' + uuidv4(),
    };

    const params = {
      id: testBindingGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceBinding(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testBindingCrn);
    expect(result.guid).toEqual(testBindingGuid);
    expect(result.crn).toEqual(testBindingCrn);
    expect(result.name).toEqual('RcSdkBinding1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.source_crn).toEqual(testAliasCrn);
    expect(result.target_crn).toEqual(bindTargetCrn);
    expect(result.state).toEqual('active');

    done();
  });

  test('14 - Update A Resource Binding', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test14-' + uuidv4(),
    };

    const params = {
      id: testBindingGuid,
      name: 'RcSdkBindingUpdate1',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.updateResourceBinding(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testBindingCrn);
    expect(result.name).toEqual('RcSdkBindingUpdate1');
    expect(result.state).toEqual('active');

    done();
  });

  test('15 - List Resource Bindings With No Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test15-' + uuidv4(),
    };

    const params = {
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceBindings(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toBeGreaterThanOrEqual(1);
    expect(result.resources.length).toBeGreaterThanOrEqual(1);

    done();
  });

  test('16 - List Resource Bindings With Guid Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test16-' + uuidv4(),
    };

    const params = {
      guid: testBindingGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceBindings(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(1);
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].id).toEqual(testBindingCrn);
    expect(result.resources[0].name).toEqual('RcSdkBindingUpdate1');
    expect(result.resources[0].account_id).toEqual(testAccountId);
    expect(result.resources[0].resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.resources[0].source_crn).toEqual(testAliasCrn);
    expect(result.resources[0].target_crn).toEqual(bindTargetCrn);
    expect(result.resources[0].state).toEqual('active');

    done();
  });

  test('17 - List Resource Bindings With Name Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test17-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkBinding1',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceBindings(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(0);
    expect(result.resources).toHaveLength(0);

    done();
  });

  test('18 - Create A Resource Key For Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test18-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkKey1',
      source: testInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.createResourceKey(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(201);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toBeDefined();
    expect(result.guid).toBeDefined();
    expect(result.crn).toBeDefined();
    expect(result.id).toEqual(result.crn);
    expect(result.name).toEqual('RcSdkKey1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.source_crn).toEqual(testInstanceCrn);
    expect(result.state).toEqual('active');

    testInstanceKeyCrn = result.id;
    testInstanceKeyGuid = result.guid;

    done();
  });

  test('19 - Get A Resource Key', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test19-' + uuidv4(),
    };

    const params = {
      id: testInstanceKeyGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceKey(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testInstanceKeyCrn);
    expect(result.guid).toEqual(testInstanceKeyGuid);
    expect(result.crn).toEqual(testInstanceKeyCrn);
    expect(result.name).toEqual('RcSdkKey1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.source_crn).toEqual(testInstanceCrn);
    expect(result.state).toEqual('active');

    done();
  });

  test('20 - Update A Resource Key', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test20-' + uuidv4(),
    };

    const params = {
      id: testInstanceKeyGuid,
      name: 'RcSdkKeyUpdate1',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.updateResourceKey(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testInstanceKeyCrn);
    expect(result.name).toEqual('RcSdkKeyUpdate1');
    expect(result.state).toEqual('active');

    done();
  });

  test('21 - List Resource Keys With No Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test21-' + uuidv4(),
    };

    const params = {
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceKeys(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toBeGreaterThanOrEqual(1);
    expect(result.resources.length).toBeGreaterThanOrEqual(1);

    done();
  });

  test('22 - List Resource Keys With Guid Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test22-' + uuidv4(),
    };

    const params = {
      guid: testInstanceKeyGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceKeys(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(1);
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].id).toEqual(testInstanceKeyCrn);
    expect(result.resources[0].name).toEqual('RcSdkKeyUpdate1');
    expect(result.resources[0].account_id).toEqual(testAccountId);
    expect(result.resources[0].resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.resources[0].source_crn).toEqual(testInstanceCrn);
    expect(result.resources[0].state).toEqual('active');

    done();
  });

  test('23 - List Resource Keys With Name Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test23-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkKey1',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceKeys(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(0);
    expect(result.resources).toHaveLength(0);

    done();
  });

  test('24 - Create A Resource Key For Alias', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test24-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkKey2',
      source: testAliasGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.createResourceKey(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(201);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toBeDefined();
    expect(result.guid).toBeDefined();
    expect(result.crn).toBeDefined();
    expect(result.id).toEqual(result.crn);
    expect(result.name).toEqual('RcSdkKey2');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.source_crn).toEqual(testAliasCrn);
    expect(result.state).toEqual('active');

    testAliasKeyCrn = result.id;
    testAliasKeyGuid = result.guid;

    done();
  });

  test('25 - Get A Resource Key', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test25-' + uuidv4(),
    };

    const params = {
      id: testAliasKeyGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceKey(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testAliasKeyCrn);
    expect(result.guid).toEqual(testAliasKeyGuid);
    expect(result.crn).toEqual(testAliasKeyCrn);
    expect(result.name).toEqual('RcSdkKey2');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.source_crn).toEqual(testAliasCrn);
    expect(result.state).toEqual('active');

    done();
  });

  test('26 - Update A Resource Key', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test26-' + uuidv4(),
    };

    const params = {
      id: testAliasKeyGuid,
      name: 'RcSdkKeyUpdate2',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.updateResourceKey(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testAliasKeyCrn);
    expect(result.name).toEqual('RcSdkKeyUpdate2');
    expect(result.state).toEqual('active');

    done();
  });

  test('27 - List Resource Keys With No Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test27-' + uuidv4(),
    };

    const params = {
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceKeys(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toBeGreaterThanOrEqual(1);
    expect(result.resources.length).toBeGreaterThanOrEqual(1);

    done();
  });

  test('28 - List Resource Keys With Guid Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test28-' + uuidv4(),
    };

    const params = {
      guid: testAliasKeyGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceKeys(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(1);
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].id).toEqual(testAliasKeyCrn);
    expect(result.resources[0].name).toEqual('RcSdkKeyUpdate2');
    expect(result.resources[0].account_id).toEqual(testAccountId);
    expect(result.resources[0].resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.resources[0].source_crn).toEqual(testAliasCrn);
    expect(result.resources[0].state).toEqual('active');

    done();
  });

  test('29 - List Resource Keys With Name Filter', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test29-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkKey2',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listResourceKeys(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.rows_count).toEqual(0);
    expect(result.resources).toHaveLength(0);

    done();
  });

  test('30 - Delete A Resource Alias With Dependencies - Fail', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test30-' + uuidv4(),
    };

    const params = {
      id: testAliasGuid,
      headers: customHeader,
    };

    let rerr;
    try {
      await service.deleteResourceAlias(params);
      done();
    } catch (err) {
      rerr = err;
    }

    expect(rerr).toBeDefined();
    expect(rerr.status).toEqual(400);

    done();
  });

  test('31 - Delete A Resource Instance With Dependencies - Fail', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test31-' + uuidv4(),
    };

    const params = {
      id: testInstanceGuid,
      headers: customHeader,
    };

    let rerr;
    try {
      await service.deleteResourceInstance(params);
      done();
    } catch (err) {
      rerr = err;
    }

    expect(rerr).toBeDefined();
    expect(rerr.status).toEqual(400);
    done();
  });

  test('32 - Delete A Resource Binding', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test32-' + uuidv4(),
    };

    const params = {
      id: testBindingGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.deleteResourceBinding(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(204);

    done();
  });

  test('33 - Verify Resource Binding Was Deleted', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test33-' + uuidv4(),
    };

    const params = {
      id: testBindingGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceBinding(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testBindingCrn);
    expect(result.state).toEqual('removed');

    done();
  });

  test('34 - Delete Resource Keys', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test34-' + uuidv4(),
    };

    const params = {
      id: testInstanceKeyGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.deleteResourceKey(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(204);

    const customHeader2 = {
      'Transaction-Id': 'rc-sdk-node-test34-' + uuidv4(),
    };

    const params2 = {
      id: testAliasKeyGuid,
      headers: customHeader2,
    };

    let response2;
    try {
      response2 = await service.deleteResourceKey(params2);
    } catch (err) {
      done(err);
    }

    expect(response2).toBeDefined();
    expect(response2.status).toEqual(204);

    done();
  });

  test('35 - Verify Resource Keys Were Deleted', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test35-' + uuidv4(),
    };

    const params = {
      id: testInstanceKeyGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceKey(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testInstanceKeyCrn);
    expect(result.state).toEqual('removed');

    const customHeader2 = {
      'Transaction-Id': 'rc-sdk-node-test35-' + uuidv4(),
    };

    const params2 = {
      id: testAliasKeyGuid,
      headers: customHeader2,
    };

    let response2;
    try {
      response2 = await service.getResourceKey(params2);
    } catch (err) {
      done(err);
    }

    expect(response2).toBeDefined();
    expect(response2.status).toEqual(200);
    expect(response2.result).toBeDefined();

    const result2 = response2.result;
    expect(result2.id).toEqual(testAliasKeyCrn);
    expect(result2.state).toEqual('removed');

    done();
  });

  test('36 - Delete A Resource Alias', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test36-' + uuidv4(),
    };

    const params = {
      id: testAliasGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.deleteResourceAlias(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(204);

    done();
  });

  test('37 - Verify Resource Alias Was Deleted', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test37-' + uuidv4(),
    };

    const params = {
      id: testAliasGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceAlias(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testAliasCrn);
    expect(result.state).toEqual('removed');

    done();
  });

  test('38 - Lock A Resource Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test38-' + uuidv4(),
    };

    const params = {
      id: testInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.lockResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    // expect(result.id).toEqual(testInstanceCrn)
    expect(result.locked).toBeTruthy();
    expect(result.last_operation.type).toEqual('lock');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    done();
  });

  test('39 - Update A Locked Resource Instance - Fail', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test39-' + uuidv4(),
    };

    const params = {
      id: testInstanceGuid,
      name: 'RcSdkLockedInstanceUpdate1',
      headers: customHeader,
    };

    let rerr;
    try {
      await service.updateResourceInstance(params);
      done();
    } catch (err) {
      rerr = err;
    }

    expect(rerr).toBeDefined();
    expect(rerr.status).toEqual(400);
    done();
  });

  test('40 - Delete A Locked Resource Instance - Fail', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test40-' + uuidv4(),
    };

    const params = {
      id: testInstanceGuid,
      headers: customHeader,
    };

    let rerr;
    try {
      await service.deleteResourceInstance(params);
      done();
    } catch (err) {
      rerr = err;
    }

    expect(rerr).toBeDefined();
    expect(rerr.status).toEqual(400);
    done();
  });

  test('41 - Unlock A Resource Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test41-' + uuidv4(),
    };

    const params = {
      id: testInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.unlockResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    // expect(result.id).toEqual(testInstanceCrn)
    expect(result.locked).toBeFalsy();
    expect(result.last_operation.type).toEqual('unlock');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    done();
  });

  test('42 - Delete A Resource Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test42-' + uuidv4(),
    };

    const params = {
      id: testInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.deleteResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(204);

    done();
  });

  test('43 - Verify Resource Instance Was Deleted', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test43-' + uuidv4(),
    };

    const params = {
      id: testInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testInstanceCrn);
    expect(result.state).toEqual('removed');
    expect(result.last_operation.type).toEqual('delete');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    done();
  });

  test('44 - Create Resource Instance For Reclamation Enabled Plan', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test44-' + uuidv4(),
    };

    const params = {
      name: 'RcSdkReclaimInstance1',
      target: testRegionId2,
      resourceGroup: testResourceGroupGuid,
      resourcePlanId: testPlanId2,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.createResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(201);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toBeDefined();
    expect(result.guid).toBeDefined();
    expect(result.crn).toBeDefined();
    expect(result.id).toEqual(result.crn);
    expect(result.name).toEqual('RcSdkReclaimInstance1');
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.resource_plan_id).toEqual(testPlanId2);
    expect(result.state).toEqual('active');
    expect(result.locked).toBeFalsy();
    expect(result.last_operation.type).toEqual('create');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    testReclaimInstanceCrn = result.id;
    testReclaimInstanceGuid = result.guid;

    done();
  });

  test('45 - Schedule A Resource Instance For Reclamation', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test45-' + uuidv4(),
    };

    const params = {
      id: testReclaimInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.deleteResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(204);

    setTimeout(done, 20000);
  });

  test('46 - Verify The Resource Instance Is Pending Reclamation', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test46-' + uuidv4(),
    };

    const params = {
      id: testReclaimInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testReclaimInstanceCrn);
    expect(result.state).toEqual('pending_reclamation');
    expect(result.last_operation.type).toEqual('reclamation');
    expect(result.last_operation.sub_type).toEqual('pending');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    done();
  });

  test('47 - List Reclamations For Account Id', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test47-' + uuidv4(),
    };

    const params = {
      accountId: testAccountId,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listReclamations(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.resources.length).toBeGreaterThanOrEqual(1);

    let foundReclaim = false;
    let i = 0;
    result.resources.forEach(reclaim => {
      if (reclaim.resource_instance_id.toString() === testReclaimInstanceGuid) {
        expect(reclaim.resource_instance_id).toEqual(testReclaimInstanceGuid);
        expect(reclaim.account_id).toEqual(testAccountId);
        expect(reclaim.resource_group_id).toEqual(testResourceGroupGuid);
        expect(reclaim.state).toEqual('SCHEDULED');

        foundReclaim = true;
        testReclamationId1 = reclaim.id;
      }

      i++;

      if (i === result.resources.length) {
        expect(foundReclaim).toBeTruthy();
        done();
      }
    });
  });

  test('48 - Restore A Resource Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test48-' + uuidv4(),
    };

    const params = {
      id: testReclamationId1,
      actionName: 'restore',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.runReclamationAction(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testReclamationId1);
    expect(result.resource_instance_id).toEqual(testReclaimInstanceGuid);
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.state).toEqual('RESTORING');

    setTimeout(done, 20000);
  });

  test('49 - Verify The Resource Instance Is Restored', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test49-' + uuidv4(),
    };

    const params = {
      id: testReclaimInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testReclaimInstanceCrn);
    expect(result.state).toEqual('active');
    expect(result.last_operation.type).toEqual('reclamation');
    expect(result.last_operation.sub_type).toEqual('restore');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    done();
  });

  test('50 - Schedule A Resource Instance For Reclamation 2', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test50-' + uuidv4(),
    };

    const params = {
      id: testReclaimInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.deleteResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(204);

    setTimeout(done, 20000);
  });

  test('51 - List Reclamations For Account Id And Resource Instance Id', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test51-' + uuidv4(),
    };

    const params = {
      accountId: testAccountId,
      resourceInstanceId: testReclaimInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.listReclamations(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].resource_instance_id).toEqual(testReclaimInstanceGuid);
    expect(result.resources[0].account_id).toEqual(testAccountId);
    expect(result.resources[0].resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.resources[0].state).toEqual('SCHEDULED');

    testReclamationId2 = result.resources[0].id;
    done();
  });

  test('52 - Reclaim A Resource Instance', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test52-' + uuidv4(),
    };

    const params = {
      id: testReclamationId2,
      actionName: 'reclaim',
      headers: customHeader,
    };

    let response;
    try {
      response = await service.runReclamationAction(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testReclamationId2);
    expect(result.resource_instance_id).toEqual(testReclaimInstanceGuid);
    expect(result.account_id).toEqual(testAccountId);
    expect(result.resource_group_id).toEqual(testResourceGroupGuid);
    expect(result.state).toEqual('RECLAIMING');

    setTimeout(done, 20000);
  });

  test('53 - Verify The Resource Instance Is Reclaimed', async done => {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-node-test53-' + uuidv4(),
    };

    const params = {
      id: testReclaimInstanceGuid,
      headers: customHeader,
    };

    let response;
    try {
      response = await service.getResourceInstance(params);
    } catch (err) {
      done(err);
    }

    expect(response).toBeDefined();
    expect(response.status).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result;
    expect(result.id).toEqual(testReclaimInstanceCrn);
    expect(result.state).toEqual('removed');
    expect(result.last_operation.type).toEqual('reclamation');
    expect(result.last_operation.sub_type).toEqual('delete');
    expect(result.last_operation.async).toBeFalsy();
    expect(result.last_operation.state).toEqual('succeeded');

    done();
  });

  // cleanup resources
  afterAll(async done => {
    // delete keys to cleanup
    if (testAliasKeyGuid) {
      try {
        const customHeader = {
          'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
        };

        const params = {
          id: testAliasKeyGuid,
          headers: customHeader,
        };
        await service.deleteResourceKey(params);
        console.log('Successful cleanup of key ' + testAliasKeyGuid);
      } catch (err) {
        if (err && err.status === 410) {
          console.log('Key ' + testAliasKeyGuid + ' was already deleted by the tests.');
        } else {
          console.log('Error cleaning up key ' + testAliasKeyGuid + ': ', JSON.stringify(err));
        }
      }
    } else {
      console.log('Key for alias was not created. No cleanup needed.');
    }

    if (testInstanceKeyGuid) {
      try {
        const customHeader = {
          'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
        };

        const params = {
          id: testInstanceKeyGuid,
          headers: customHeader,
        };
        await service.deleteResourceKey(params);
        console.log('Successful cleanup of key ' + testInstanceKeyGuid);
      } catch (err) {
        if (err && err.status === 410) {
          console.log('Key ' + testInstanceKeyGuid + ' was already deleted by the tests.');
        } else {
          console.log('Error cleaning up key ' + testInstanceKeyGuid + ': ', JSON.stringify(err));
        }
      }
    } else {
      console.log('Key for instance was not created. No cleanup needed.');
    }

    // delete binding to cleanup
    if (testBindingGuid) {
      try {
        const customHeader = {
          'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
        };

        const params = {
          id: testBindingGuid,
          headers: customHeader,
        };

        await service.deleteResourceBinding(params);
        console.log('Successful cleanup of binding ' + testBindingGuid);
      } catch (err) {
        if (err && err.status === 410) {
          console.log('Binding ' + testBindingGuid + ' was already deleted by the tests.');
        } else {
          console.log('Error cleaning up binding ' + testBindingGuid + ': ', JSON.stringify(err));
        }
      }
    } else {
      console.log('Binding was not created. No cleanup needed.');
    }

    // delete alias to cleanup
    if (testAliasGuid) {
      try {
        const customHeader = {
          'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
        };

        const params = {
          id: testAliasGuid,
          headers: customHeader,
        };

        await service.deleteResourceAlias(params);
        console.log('Successful cleanup of alias ' + testAliasGuid);
      } catch (err) {
        if (err && err.status === 410) {
          console.log('Alias ' + testAliasGuid + ' was already deleted by the tests.');
        } else {
          console.log('Error cleaning up alias ' + testAliasGuid + ': ', JSON.stringify(err));
        }
      }
    } else {
      console.log('Alias was not created. No cleanup needed.');
    }

    // instance cleanup
    if (testInstanceGuid) {
      // get instance to cleanup to check if active and locked
      let response;
      try {
        response = await getResourceInstanceForCleanup(testInstanceGuid);
      } catch (err) {
        console.log('Error retrieving instance ' + testInstanceGuid + ' for cleanup: ', JSON.stringify(err));
      }

      // if active and locked, unlock instance to cleanup
      if (response && response.result && response.result.state === 'active' && response.result.locked) {
        try {
          const customHeader = {
            'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
          };

          const params = {
            id: testInstanceGuid,
            headers: customHeader,
          };
          await service.unlockResourceInstance(params);
        } catch (err) {
          console.log('Error unlocking instance ' + testInstanceGuid + ' for cleanup: ', JSON.stringify(err));
        }
      }

      // delete instance to cleanup
      try {
        await deleteResourceInstanceForCleanup(testInstanceGuid);
        console.log('Successful cleanup of instance ' + testInstanceGuid);
      } catch (err) {
        if (err && err.status === 410) {
          console.log('Instance ' + testInstanceGuid + ' was already deleted by the tests.');
        } else {
          console.log('Error cleaning up instance ' + testInstanceGuid + ': ', JSON.stringify(err));
        }
      }
    } else {
      console.log('Instance was not created. No cleanup needed.');
    }

    await cleanupReclamationInstance(done);
    done();
  }, 120000);
});

function getResourceInstanceForCleanup(instanceId) {
  const customHeader = {
    'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
  };

  const params = {
    id: instanceId,
    headers: customHeader,
  };

  return service.getResourceInstance(params);
}

function deleteResourceInstanceForCleanup(instanceId) {
  const customHeader = {
    'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
  };

  const params = {
    id: instanceId,
    headers: customHeader,
  };

  return service.deleteResourceInstance(params);
}

async function cleanupInstancePendingReclamation(done) {
  // if pending, get reclamation and run reclaim action
  let reclamationId;
  try {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
    };

    const params = {
      accountId: testAccountId,
      resourceInstanceId: testReclaimInstanceGuid,
      headers: customHeader,
    };
    const resp = await service.listReclamations(params);
    if (resp && resp.result && resp.result.resources && resp.result.resources.length === 1) {
      reclamationId = resp.result.resources[0].id;
    } else {
      console.log('Failed to retrieve reclamation to process to reclaim instance ' + testReclaimInstanceGuid);
      done();
    }
  } catch (err) {
    console.log('Error retrieving reclamation for instance ' + testReclaimInstanceGuid + ': ' + JSON.stringify(err));
    done(err);
  }

  try {
    const customHeader = {
      'Transaction-Id': 'rc-sdk-cleanup-' + uuidv4(),
    };

    const params = {
      id: reclamationId,
      actionName: 'reclaim',
      headers: customHeader,
    };
    await service.runReclamationAction(params);
    console.log('Successfully reclaimed instance ' + testReclaimInstanceGuid);
    done();
  } catch (err) {
    console.log('Error processing reclaim action for reclamation ' + reclamationId + ': ' + JSON.stringify(err));
    done(err);
  }
}

async function cleanupReclamationInstance(done) {
  if (testReclaimInstanceGuid) {
    let instanceState;
    try {
      const response = await getResourceInstanceForCleanup(testReclaimInstanceGuid);
      if (response && response.result) {
        instanceState = response.result.state;
      }
    } catch (err) {
      console.log('Error retrieving instance ' + testReclaimInstanceGuid + ' for cleanup: ', JSON.stringify(err));
    }

    if (instanceState && instanceState === 'removed') {
      console.log('Instance ' + testReclaimInstanceGuid + ' was already reclaimed by the tests.');
      done();
    } else if (instanceState && instanceState === 'pending_reclamation') {
      await cleanupInstancePendingReclamation(done);
      done();
    } else {
      try {
        await deleteResourceInstanceForCleanup(testReclaimInstanceGuid);
      } catch (err) {
        console.log('Error scheduling instance ' + testReclaimInstanceGuid + ' for reclamation: ', JSON.stringify(err));
        done(err);
      }

      await new Promise(resolve => setTimeout(resolve, 20000));
      await cleanupInstancePendingReclamation(done);
      done();
    }
  } else {
    console.log('Reclamation instance was not created. No cleanup needed.');
    done();
  }
}
