import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDisplayName} from '../lib/auth/profile.ts';
test('profile name validation matches database limits and preserves international names',()=>{
 assert.deepEqual(validateDisplayName('  विक्रम सिंह  '),{name:'विक्रम सिंह',error:null});
 for(const name of ['', '  ', 'a'.repeat(101), 'A\u0000B', 'A\nB', null]) assert.ok(validateDisplayName(name).error);
 assert.equal(validateDisplayName('😀'.repeat(100)).error,null);
});
